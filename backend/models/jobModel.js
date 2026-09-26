// Job Model - PostgreSQL / Neon Data Access
const { query } = require('../config/db');

class Job {
    constructor(data = {}) {
        this.id = data.id || null;
        this._id = data.id || null;
        this.userId = data.userId || data.user_id || null;
        this.jobTitle = data.jobTitle || data.job_title || '';
        this.jobDescription = data.jobDescription || data.job_description || '';
        this.company = data.company || 'Unknown Company';
        this.location = data.location || 'India';
        this.source = data.source || 'Manual';
        this.sourceUrl = data.sourceUrl || data.source_url || '';
        this.salary = data.salary || 'Not Specified';
        this.experience = data.experience || 'Not Specified';
        this.skillsRequired = Array.isArray(data.skillsRequired) ? data.skillsRequired : (data.skills_required || []);
        this.isExternal = data.isExternal !== undefined ? data.isExternal : (data.is_external || false);
        this.externalId = data.externalId || data.external_id || null;
        this.createdDate = data.createdDate || data.created_date || new Date();
    }

    static fromRow(row) {
        if (!row) return null;
        return new Job({
            id: row.id,
            userId: row.user_id,
            jobTitle: row.job_title,
            jobDescription: row.job_description,
            company: row.company,
            location: row.location,
            source: row.source,
            sourceUrl: row.source_url,
            salary: row.salary,
            experience: row.experience,
            skillsRequired: typeof row.skills_required === 'string' ? JSON.parse(row.skills_required) : (row.skills_required || []),
            isExternal: row.is_external,
            externalId: row.external_id,
            createdDate: row.created_date
        });
    }

    async save() {
        if (this.id) {
            const sql = `
                UPDATE jobs
                SET user_id = $1, job_title = $2, job_description = $3, company = $4,
                    location = $5, source = $6, source_url = $7, salary = $8,
                    experience = $9, skills_required = $10, is_external = $11, external_id = $12
                WHERE id = $13
                RETURNING *
            `;
            const params = [
                this.userId,
                this.jobTitle,
                this.jobDescription,
                this.company,
                this.location,
                this.source,
                this.sourceUrl,
                this.salary,
                this.experience,
                JSON.stringify(this.skillsRequired || []),
                this.isExternal,
                this.externalId,
                this.id
            ];
            const res = await query(sql, params);
            if (res.rows.length > 0) {
                Object.assign(this, Job.fromRow(res.rows[0]));
            }
            return this;
        } else {
            const sql = `
                INSERT INTO jobs (
                    user_id, job_title, job_description, company, location,
                    source, source_url, salary, experience, skills_required,
                    is_external, external_id, created_date
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                RETURNING *
            `;
            const params = [
                this.userId,
                this.jobTitle,
                this.jobDescription,
                this.company,
                this.location,
                this.source,
                this.sourceUrl,
                this.salary,
                this.experience,
                JSON.stringify(this.skillsRequired || []),
                this.isExternal,
                this.externalId,
                this.createdDate || new Date()
            ];
            const res = await query(sql, params);
            if (res.rows.length > 0) {
                Object.assign(this, Job.fromRow(res.rows[0]));
            }
            return this;
        }
    }

    static async countDocuments(conditions = {}) {
        let sql = 'SELECT COUNT(*) as count FROM jobs';
        const params = [];
        const clauses = [];

        if (conditions.isExternal !== undefined) {
            params.push(conditions.isExternal);
            clauses.push(`is_external = $${params.length}`);
        }
        if (conditions.userId) {
            params.push(conditions.userId);
            clauses.push(`user_id = $${params.length}`);
        }

        if (clauses.length > 0) {
            sql += ' WHERE ' + clauses.join(' AND ');
        }

        const res = await query(sql, params);
        return parseInt(res.rows[0]?.count || 0, 10);
    }

    static async insertMany(jobsArray = []) {
        const results = [];
        for (const j of jobsArray) {
            const job = new Job(j);
            await job.save();
            results.push(job);
        }
        return results;
    }

    static async findById(id) {
        if (!id) return null;
        const res = await query('SELECT * FROM jobs WHERE id = $1', [id]);
        if (res.rows.length === 0) return null;
        return Job.fromRow(res.rows[0]);
    }

    static find(conditions = {}) {
        let sortClause = 'ORDER BY created_date DESC';
        let limitClause = '';

        const executeQuery = async () => {
            let sql = 'SELECT * FROM jobs';
            const params = [];
            const clauses = [];

            if (conditions.source && conditions.source !== 'All') {
                params.push(conditions.source);
                clauses.push(`source = $${params.length}`);
            }

            if (conditions.userId) {
                params.push(conditions.userId);
                clauses.push(`user_id = $${params.length}`);
            }

            if (conditions.location) {
                let locPattern = '';
                if (conditions.location instanceof RegExp) {
                    locPattern = conditions.location.source;
                } else {
                    locPattern = conditions.location;
                }
                params.push(`%${locPattern}%`);
                clauses.push(`location ILIKE $${params.length}`);
            }

            if (conditions.$or && Array.isArray(conditions.$or)) {
                const orClauses = [];
                for (const orCond of conditions.$or) {
                    if (orCond.jobTitle) {
                        const pattern = orCond.jobTitle instanceof RegExp ? orCond.jobTitle.source : orCond.jobTitle;
                        params.push(`%${pattern}%`);
                        orClauses.push(`job_title ILIKE $${params.length}`);
                    } else if (orCond.company) {
                        const pattern = orCond.company instanceof RegExp ? orCond.company.source : orCond.company;
                        params.push(`%${pattern}%`);
                        orClauses.push(`company ILIKE $${params.length}`);
                    } else if (orCond.jobDescription) {
                        const pattern = orCond.jobDescription instanceof RegExp ? orCond.jobDescription.source : orCond.jobDescription;
                        params.push(`%${pattern}%`);
                        orClauses.push(`job_description ILIKE $${params.length}`);
                    } else if (orCond.skillsRequired) {
                        const pattern = orCond.skillsRequired.$in && orCond.skillsRequired.$in[0] instanceof RegExp ?
                            orCond.skillsRequired.$in[0].source : (orCond.skillsRequired.$in ? orCond.skillsRequired.$in[0] : '');
                        if (pattern) {
                            params.push(`%${pattern}%`);
                            orClauses.push(`skills_required::text ILIKE $${params.length}`);
                        }
                    }
                }
                if (orClauses.length > 0) {
                    clauses.push(`(${orClauses.join(' OR ')})`);
                }
            }

            if (clauses.length > 0) {
                sql += ' WHERE ' + clauses.join(' AND ');
            }

            sql += ' ' + sortClause + ' ' + limitClause;

            const res = await query(sql, params);
            return res.rows.map(row => Job.fromRow(row));
        };

        const promise = executeQuery();

        promise.sort = function(sortObj) {
            if (sortObj && sortObj.createdDate !== undefined) {
                sortClause = sortObj.createdDate === -1 ? 'ORDER BY created_date DESC' : 'ORDER BY created_date ASC';
            }
            return promise;
        };

        promise.limit = function(num) {
            limitClause = `LIMIT ${num}`;
            return promise;
        };

        return promise;
    }

    static async deleteMany(conditions = {}) {
        let sql = 'DELETE FROM jobs';
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

module.exports = Job;
