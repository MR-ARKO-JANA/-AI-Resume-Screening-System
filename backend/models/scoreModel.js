// Score Model - PostgreSQL / Neon Data Access with EdTech Support
const { query } = require('../config/db');

const safeJsonParse = (val, fallback = null) => {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'object') return val;
    try {
        return JSON.parse(val);
    } catch (e) {
        return fallback;
    }
};

class Score {
    constructor(data = {}) {
        this.id = data.id || null;
        this._id = data.id || null;
        this.userId = data.userId || data.user_id || null;
        this.resumeId = data.resumeId !== undefined ? data.resumeId : (data.resume_id || null);
        this.jobId = data.jobId !== undefined ? data.jobId : (data.job_id || null);
        this.matchScore = Number(data.matchScore !== undefined ? data.matchScore : (data.match_score || 0));
        this.status = data.status || 'Pending';
        this.aiAnalysis = data.aiAnalysis || data.ai_analysis || '';
        this.aiConfidence = Number(data.aiConfidence !== undefined ? data.aiConfidence : (data.ai_confidence || 0));
        this.experience = data.experience || 'Fresher';
        this.skills = safeJsonParse(data.skills, []);
        this.scoringBreakdown = safeJsonParse(data.scoringBreakdown || data.scoring_breakdown, {});
        this.candidateName = data.candidateName || data.candidate_name || '';
        this.githubUrl = data.githubUrl || data.github_url || '';
        this.linkedinUrl = data.linkedinUrl || data.linkedin_url || '';
        this.linkedinData = safeJsonParse(data.linkedinData || data.linkedin_data, null);
        this.githubData = safeJsonParse(data.githubData || data.github_data, null);
        this.education = safeJsonParse(data.education, []);
        this.projects = safeJsonParse(data.projects, []);
        this.targetRole = data.targetRole || data.target_role || 'Frontend Developer';
        this.matchedSkills = safeJsonParse(data.matchedSkills || data.matched_skills, []);
        this.missingSkills = safeJsonParse(data.missingSkills || data.missing_skills, []);
        this.atsScore = Number(data.atsScore !== undefined ? data.atsScore : (data.ats_score || 75));
        this.atsBreakdown = safeJsonParse(data.atsBreakdown || data.ats_breakdown, null);
        this.learningRoadmap = safeJsonParse(data.learningRoadmap || data.learning_roadmap, null);
        this.resumeImprovements = safeJsonParse(data.resumeImprovements || data.resume_improvements, null);
        this.mockQuestions = safeJsonParse(data.mockQuestions || data.mock_questions, null);
        this.createdDate = data.createdDate || data.created_date || new Date();
    }

    static fromRow(row, populatedResume = null, populatedJob = null) {
        if (!row) return null;
        const score = new Score({
            id: row.id,
            user_id: row.user_id,
            resume_id: populatedResume || row.resume_id,
            job_id: populatedJob || row.job_id,
            match_score: row.match_score,
            status: row.status,
            ai_analysis: row.ai_analysis,
            ai_confidence: row.ai_confidence,
            experience: row.experience,
            skills: row.skills,
            scoring_breakdown: row.scoring_breakdown,
            candidate_name: row.candidate_name,
            github_url: row.github_url,
            linkedin_url: row.linkedin_url,
            linkedin_data: row.linkedin_data,
            github_data: row.github_data,
            education: row.education,
            projects: row.projects,
            target_role: row.target_role,
            matched_skills: row.matched_skills,
            missing_skills: row.missing_skills,
            ats_score: row.ats_score,
            ats_breakdown: row.ats_breakdown,
            learning_roadmap: row.learning_roadmap,
            resume_improvements: row.resume_improvements,
            mock_questions: row.mock_questions,
            created_date: row.created_date
        });
        return score;
    }

    markModified(field) {
        // Compatibility method with Mongoose
        return this;
    }

    async save() {
        const rawResumeId = (this.resumeId && typeof this.resumeId === 'object') ? this.resumeId.id || this.resumeId._id : this.resumeId;
        const rawJobId = (this.jobId && typeof this.jobId === 'object') ? this.jobId.id || this.jobId._id : this.jobId;

        if (this.id) {
            const sql = `
                UPDATE scores
                SET user_id = $1, resume_id = $2, job_id = $3, match_score = $4,
                    status = $5, ai_analysis = $6, ai_confidence = $7, experience = $8,
                    skills = $9, scoring_breakdown = $10, candidate_name = $11, github_url = $12,
                    linkedin_url = $13, linkedin_data = $14, github_data = $15, education = $16,
                    projects = $17, target_role = $18, matched_skills = $19, missing_skills = $20,
                    ats_score = $21, ats_breakdown = $22, learning_roadmap = $23,
                    resume_improvements = $24, mock_questions = $25
                WHERE id = $26
                RETURNING *
            `;
            const params = [
                this.userId,
                rawResumeId,
                rawJobId,
                this.matchScore,
                this.status,
                this.aiAnalysis,
                this.aiConfidence,
                this.experience,
                JSON.stringify(this.skills || []),
                JSON.stringify(this.scoringBreakdown || {}),
                this.candidateName,
                this.githubUrl,
                this.linkedinUrl,
                JSON.stringify(this.linkedinData || null),
                JSON.stringify(this.githubData || null),
                JSON.stringify(this.education || []),
                JSON.stringify(this.projects || []),
                this.targetRole,
                JSON.stringify(this.matchedSkills || []),
                JSON.stringify(this.missingSkills || []),
                this.atsScore,
                JSON.stringify(this.atsBreakdown || null),
                JSON.stringify(this.learningRoadmap || null),
                JSON.stringify(this.resumeImprovements || null),
                JSON.stringify(this.mockQuestions || null),
                this.id
            ];
            const res = await query(sql, params);
            if (res.rows.length > 0) {
                const s = Score.fromRow(res.rows[0]);
                Object.assign(this, s);
            }
            return this;
        } else {
            const sql = `
                INSERT INTO scores (
                    user_id, resume_id, job_id, match_score, status,
                    ai_analysis, ai_confidence, experience, skills, scoring_breakdown,
                    candidate_name, github_url, linkedin_url, linkedin_data, github_data,
                    education, projects, target_role, matched_skills, missing_skills,
                    ats_score, ats_breakdown, learning_roadmap, resume_improvements, mock_questions,
                    created_date
                )
                VALUES (
                    $1, $2, $3, $4, $5,
                    $6, $7, $8, $9, $10,
                    $11, $12, $13, $14, $15,
                    $16, $17, $18, $19, $20,
                    $21, $22, $23, $24, $25,
                    $26
                )
                RETURNING *
            `;
            const params = [
                this.userId,
                rawResumeId,
                rawJobId,
                this.matchScore,
                this.status,
                this.aiAnalysis,
                this.aiConfidence,
                this.experience,
                JSON.stringify(this.skills || []),
                JSON.stringify(this.scoringBreakdown || {}),
                this.candidateName,
                this.githubUrl,
                this.linkedinUrl,
                JSON.stringify(this.linkedinData || null),
                JSON.stringify(this.githubData || null),
                JSON.stringify(this.education || []),
                JSON.stringify(this.projects || []),
                this.targetRole,
                JSON.stringify(this.matchedSkills || []),
                JSON.stringify(this.missingSkills || []),
                this.atsScore,
                JSON.stringify(this.atsBreakdown || null),
                JSON.stringify(this.learningRoadmap || null),
                JSON.stringify(this.resumeImprovements || null),
                JSON.stringify(this.mockQuestions || null),
                this.createdDate || new Date()
            ];
            const res = await query(sql, params);
            if (res.rows.length > 0) {
                const s = Score.fromRow(res.rows[0]);
                Object.assign(this, s);
            }
            return this;
        }
    }

    static async findById(id) {
        if (!id) return null;
        return Score.findOne({ id }).populate('resumeId').populate('jobId');
    }

    static findOne(conditions = {}) {
        let populateResume = false;
        let populateJob = false;
        let sortClause = 'ORDER BY s.created_date DESC';

        const runQuery = async () => {
            let sql = `
                SELECT s.*,
                       r.id as r_id, r.file_name as r_file_name, r.file_path as r_file_path, r.upload_date as r_upload_date,
                       j.id as j_id, j.job_title as j_job_title, j.company as j_company, j.job_description as j_job_description
                FROM scores s
                LEFT JOIN resumes r ON s.resume_id = r.id
                LEFT JOIN jobs j ON s.job_id = j.id
            `;
            const params = [];
            const clauses = [];

            if (conditions._id || conditions.id) {
                params.push(conditions._id || conditions.id);
                clauses.push(`s.id = $${params.length}`);
            }
            if (conditions.userId || conditions.user_id) {
                params.push(conditions.userId || conditions.user_id);
                clauses.push(`s.user_id = $${params.length}`);
            }
            if (conditions.status) {
                params.push(conditions.status);
                clauses.push(`s.status = $${params.length}`);
            }

            if (clauses.length > 0) {
                sql += ' WHERE ' + clauses.join(' AND ');
            }

            sql += ' ' + sortClause + ' LIMIT 1';

            const res = await query(sql, params);
            if (res.rows.length === 0) return null;

            const row = res.rows[0];
            const populatedResume = (populateResume && row.r_id) ? {
                id: row.r_id,
                _id: row.r_id,
                fileName: row.r_file_name,
                filePath: row.r_file_path,
                uploadDate: row.r_upload_date
            } : row.resume_id;

            const populatedJob = (populateJob && row.j_id) ? {
                id: row.j_id,
                _id: row.j_id,
                jobTitle: row.j_job_title,
                company: row.j_company,
                jobDescription: row.j_job_description
            } : row.job_id;

            return Score.fromRow(row, populatedResume, populatedJob);
        };

        const promise = {
            then(resolve, reject) {
                return runQuery().then(resolve, reject);
            },
            populate(field) {
                if (field === 'resumeId') populateResume = true;
                if (field === 'jobId') populateJob = true;
                return this;
            },
            sort(sortObj) {
                if (sortObj) {
                    if (sortObj.createdDate !== undefined) {
                        sortClause = sortObj.createdDate === -1 ? 'ORDER BY s.created_date DESC' : 'ORDER BY s.created_date ASC';
                    } else if (sortObj.matchScore !== undefined) {
                        sortClause = sortObj.matchScore === -1 ? 'ORDER BY s.match_score DESC, s.created_date DESC' : 'ORDER BY s.match_score ASC';
                    }
                }
                return this;
            }
        };

        return promise;
    }

    static find(conditions = {}) {
        let populateResume = false;
        let populateJob = false;
        let sortClause = 'ORDER BY s.created_date DESC';

        const runQuery = async () => {
            let sql = `
                SELECT s.*,
                       r.id as r_id, r.file_name as r_file_name, r.file_path as r_file_path, r.upload_date as r_upload_date,
                       j.id as j_id, j.job_title as j_job_title, j.company as j_company, j.job_description as j_job_description
                FROM scores s
                LEFT JOIN resumes r ON s.resume_id = r.id
                LEFT JOIN jobs j ON s.job_id = j.id
            `;
            const params = [];
            const clauses = [];

            if (conditions.userId || conditions.user_id) {
                params.push(conditions.userId || conditions.user_id);
                clauses.push(`s.user_id = $${params.length}`);
            }
            if (conditions.status) {
                params.push(conditions.status);
                clauses.push(`s.status = $${params.length}`);
            }

            if (clauses.length > 0) {
                sql += ' WHERE ' + clauses.join(' AND ');
            }

            sql += ' ' + sortClause;

            const res = await query(sql, params);
            return res.rows.map(row => {
                const populatedResume = (populateResume && row.r_id) ? {
                    id: row.r_id,
                    _id: row.r_id,
                    fileName: row.r_file_name,
                    filePath: row.r_file_path,
                    uploadDate: row.r_upload_date
                } : row.resume_id;

                const populatedJob = (populateJob && row.j_id) ? {
                    id: row.j_id,
                    _id: row.j_id,
                    jobTitle: row.j_job_title,
                    company: row.j_company,
                    jobDescription: row.j_job_description
                } : row.job_id;

                return Score.fromRow(row, populatedResume, populatedJob);
            });
        };

        const promise = {
            then(resolve, reject) {
                return runQuery().then(resolve, reject);
            },
            populate(field) {
                if (field === 'resumeId') populateResume = true;
                if (field === 'jobId') populateJob = true;
                return this;
            },
            sort(sortObj) {
                if (sortObj) {
                    if (sortObj.matchScore !== undefined && sortObj.createdDate !== undefined) {
                        sortClause = 'ORDER BY s.match_score DESC, s.created_date DESC';
                    } else if (sortObj.matchScore !== undefined) {
                        sortClause = sortObj.matchScore === -1 ? 'ORDER BY s.match_score DESC' : 'ORDER BY s.match_score ASC';
                    } else if (sortObj.createdDate !== undefined) {
                        sortClause = sortObj.createdDate === -1 ? 'ORDER BY s.created_date DESC' : 'ORDER BY s.created_date ASC';
                    }
                }
                return this;
            }
        };

        return promise;
    }

    static async aggregate(pipeline = []) {
        // Handles dashboard stats aggregation directly via SQL
        // Extract userId if present
        let userId = null;
        for (const stage of pipeline) {
            if (stage.$match && stage.$match.userId) {
                userId = stage.$match.userId;
            }
        }

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const totalSql = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'Shortlisted') as shortlisted,
                COUNT(*) FILTER (WHERE status = 'Pending') as pending,
                COUNT(*) FILTER (WHERE status = 'Rejected') as rejected,
                COALESCE(AVG(match_score), 0) as avg_score
            FROM scores
            WHERE ($1::int IS NULL OR user_id = $1::int)
        `;

        const lastMonthSql = `
            SELECT 
                COUNT(*) as total,
                COUNT(*) FILTER (WHERE status = 'Shortlisted') as shortlisted,
                COUNT(*) FILTER (WHERE status = 'Pending') as pending
            FROM scores
            WHERE ($1::int IS NULL OR user_id = $1::int)
              AND created_date < $2
        `;

        const [currRes, lastRes] = await Promise.all([
            query(totalSql, [userId]),
            query(lastMonthSql, [userId, oneMonthAgo])
        ]);

        const currRow = currRes.rows[0] || {};
        const lastRow = lastRes.rows[0] || {};

        return [{
            current: [{
                total: parseInt(currRow.total || 0, 10),
                shortlisted: parseInt(currRow.shortlisted || 0, 10),
                pending: parseInt(currRow.pending || 0, 10),
                rejected: parseInt(currRow.rejected || 0, 10),
                avgScore: parseFloat(currRow.avg_score || 0)
            }],
            lastMonth: [{
                total: parseInt(lastRow.total || 0, 10),
                shortlisted: parseInt(lastRow.shortlisted || 0, 10),
                pending: parseInt(lastRow.pending || 0, 10)
            }]
        }];
    }

    static async deleteMany(conditions = {}) {
        let sql = 'DELETE FROM scores';
        const params = [];
        const clauses = [];

        if (conditions.userId || conditions.user_id) {
            params.push(conditions.userId || conditions.user_id);
            clauses.push(`user_id = $${params.length}`);
        }

        if (clauses.length > 0) {
            sql += ' WHERE ' + clauses.join(' AND ');
            const res = await query(sql, params);
            return { deletedCount: res.rowCount };
        }
        return { deletedCount: 0 };
    }
}

module.exports = Score;
