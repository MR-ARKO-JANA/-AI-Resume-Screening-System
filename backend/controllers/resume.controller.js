// Resume Controller - Enhanced with EdTech Roadmap, DOCX, and Skill Gap Processing

const jwt = require('jsonwebtoken');
const path = require('path');
const User = require('../models/usermodels');
const Score = require('../models/scoreModel');
const Resume = require('../models/resumeModel');
const Job = require('../models/jobModel');
const resumeParser = require('../utils/resumeParser');
const { exportToCSV } = require('../utils/exportCSV');
const {
    ROLE_CATALOG,
    generateLearningRoadmap,
    generateResumeImprovements,
    calculateATSScore,
    generateMockQuestions
} = require('../utils/edtechRoadmap');

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_change_in_production";

exports.uploadResumes = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send("No files uploaded. Please select PDF or DOC/DOCX files.");
        }

        const targetRoleKey = req.body.targetRoleKey || 'frontend-developer';
        const roleInfo = ROLE_CATALOG[targetRoleKey] || { title: req.body.jobTitle || 'Target Role', requiredSkills: [] };

        let jobDescriptionText = req.body.jobDesc;
        if (!jobDescriptionText || jobDescriptionText.trim() === '') {
            if (roleInfo.requiredSkills && roleInfo.requiredSkills.length > 0) {
                jobDescriptionText = `${roleInfo.title} Requirement: Proficiency in ${roleInfo.requiredSkills.join(', ')}. Experience building and shipping production applications.`;
            } else {
                return res.status(400).send("Job description or target role is required");
            }
        }

        let token = req.cookies.token;
        if (!token) return res.status(401).redirect('/');

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });
        if (!user) return res.status(404).send("User not found");

        const newJob = new Job({
            userId: user._id,
            jobTitle: req.body.jobTitle || (roleInfo.title ? `${roleInfo.title} Target Role` : (req.files.length > 1 ? `Batch [${req.files.length} Resumes]` : (req.files[0].originalname.split('.')[0] + " Analysis"))),
            jobDescription: jobDescriptionText
        });
        await newJob.save();

        for (const file of req.files) {
            let resumeText = '';
            try {
                resumeText = await resumeParser.parseResumeFile(file.path);
                if (!resumeText || resumeText.trim() === '') continue;
            } catch (error) {
                console.error(`Resume parsing error for ${file.originalname}:`, error);
                continue;
            }

            const scoringDetails = resumeParser.getTransparentScoring(resumeText, jobDescriptionText);
            const matchScore = scoringDetails.totalScore;
            const skillDetails = resumeParser.getSkillMatchDetails(resumeText, jobDescriptionText);

            const aiAnalysis = await resumeParser.generateAnalysis(
                matchScore,
                scoringDetails.matchedSkills,
                scoringDetails.missingSkills,
                resumeText,
                jobDescriptionText
            );

            const status = matchScore >= 75 ? "Shortlisted" : matchScore >= 50 ? "Pending" : "Rejected";
            const aiConfidence = Math.min(80 + Math.round(matchScore * 0.15), 98);

            const experienceKeywords = ['year', 'years', 'experience', 'senior', 'lead', 'manager'];
            const hasExperience = experienceKeywords.some(keyword =>
                resumeText.toLowerCase().includes(keyword)
            );
            const experience = hasExperience ? "Experienced" : "Fresher";

            const newResume = new Resume({
                userId: user._id,
                fileName: file.originalname,
                filePath: file.path
            });
            await newResume.save();

            // Extract candidate education and projects
            let extractedEducation = resumeParser.extractEducation(resumeText);
            let extractedProjects = resumeParser.extractProjects(resumeText);

            // Auto-extract candidate profile details
            let candidateName = '';
            let githubUrl = '';
            let linkedinUrl = '';
            let linkedinData = null;

            try {
                const { extractProfileFromResume } = require('../utils/geminiService');
                let extractedProfile = await extractProfileFromResume(resumeText);
                if (extractedProfile) {
                    linkedinData = extractedProfile;
                    candidateName = extractedProfile.fullName || '';
                    githubUrl = extractedProfile.githubUrl || '';
                    linkedinUrl = extractedProfile.linkedinUrl || '';
                    if (extractedProfile.education && extractedProfile.education.length > 0) {
                        extractedEducation = extractedProfile.education.map(e => ({
                            degree: e.degree || '',
                            school: e.school || '',
                            year: e.year || '',
                            gpa: ''
                        }));
                    }
                }
            } catch (profileErr) {
                console.error("Error parsing profile on upload:", profileErr);
            }

            // EdTech Enhancements
            const atsDiagnostics = calculateATSScore(resumeText);
            const learningRoadmap = generateLearningRoadmap(scoringDetails.missingSkills, targetRoleKey, 6);
            const resumeImprovements = generateResumeImprovements(resumeText, targetRoleKey, scoringDetails.missingSkills);
            const mockQuestions = generateMockQuestions(targetRoleKey, scoringDetails.missingSkills);

            const newScore = new Score({
                userId: user._id,
                resumeId: newResume._id,
                jobId: newJob._id,
                matchScore,
                status,
                aiAnalysis,
                aiConfidence,
                experience,
                skills: skillDetails,
                scoringBreakdown: {
                    ...scoringDetails.breakdown,
                    explanation: scoringDetails.explanation
                },
                candidateName: candidateName || file.originalname.split('.')[0].replace(/[_-]/g, ' '),
                githubUrl,
                linkedinUrl,
                linkedinData,
                education: extractedEducation,
                projects: extractedProjects,
                targetRole: roleInfo.title,
                matchedSkills: scoringDetails.matchedSkills,
                missingSkills: scoringDetails.missingSkills,
                atsScore: atsDiagnostics.atsScore,
                atsBreakdown: atsDiagnostics,
                learningRoadmap: learningRoadmap,
                resumeImprovements: resumeImprovements,
                mockQuestions: mockQuestions
            });

            await newScore.save();
        }

        if (req.files.length > 1) {
            res.redirect('/candidates');
        } else {
            res.redirect('/result');
        }

    } catch (error) {
        console.error("Resume upload error:", error);
        res.status(500).send("Error processing resumes: " + error.message);
    }
};

exports.createJob = async (req, res) => {
    try {
        let { jobTitle, jobDescription } = req.body;
        if (!jobTitle || !jobDescription) return res.send("All fields are required");

        let token = req.cookies.token;
        if (!token) return res.send("Please login first");

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });

        const newJob = new Job({
            userId: user._id,
            jobTitle,
            jobDescription
        });

        await newJob.save();
        res.send("Job created successfully");
    } catch (error) {
        res.send("Error: " + error.message);
    }
};

exports.getLatestResult = async (req, res) => {
    try {
        let query = {};
        let token = req.cookies.token;

        if (req.query.id) {
            query._id = req.query.id;
        } else if (token) {
            try {
                let decoded = jwt.verify(token, JWT_SECRET);
                let user = await User.findOne({ email: decoded.email });
                if (user) query.userId = user._id;
            } catch (e) {}
        }

        let latestScore = await Score.findOne(query)
            .populate('resumeId')
            .populate('jobId')
            .sort({ createdDate: -1 });

        // Fallback: if no user score found, try finding any latest score (useful for demo viewing)
        if (!latestScore) {
            latestScore = await Score.findOne()
                .populate('resumeId')
                .populate('jobId')
                .sort({ createdDate: -1 });
        }

        if (!latestScore) return res.json({ error: "No results found" });

        res.json({
            scoreId: latestScore._id,
            matchScore: latestScore.matchScore,
            status: latestScore.status,
            fileName: (latestScore.resumeId && latestScore.resumeId.fileName) ? latestScore.resumeId.fileName : 'Resume.pdf',
            filePath: (latestScore.resumeId && latestScore.resumeId.filePath) ? latestScore.resumeId.filePath : '',
            candidateName: latestScore.candidateName || 'Student Candidate',
            targetRole: latestScore.targetRole || 'Target Role',
            aiAnalysis: latestScore.aiAnalysis,
            aiConfidence: latestScore.aiConfidence,
            experience: latestScore.experience,
            skills: latestScore.skills,
            education: latestScore.education || [],
            projects: latestScore.projects || [],
            matchedSkills: latestScore.matchedSkills || [],
            missingSkills: latestScore.missingSkills || [],
            scoringBreakdown: latestScore.scoringBreakdown,
            explanation: latestScore.scoringBreakdown?.explanation,
            atsScore: latestScore.atsScore || 75,
            atsBreakdown: latestScore.atsBreakdown,
            learningRoadmap: latestScore.learningRoadmap,
            resumeImprovements: latestScore.resumeImprovements,
            mockQuestions: latestScore.mockQuestions
        });
    } catch (error) {
        res.json({ error: error.message });
    }
};

exports.exportCSV = async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });
        if (!user) return res.json({ error: "User not found" });

        const allScores = await Score.find({ userId: user._id })
            .populate('resumeId')
            .populate('jobId')
            .sort({ matchScore: -1 });

        const candidates = allScores.map(score => ({
            fileName: (score.resumeId && score.resumeId.fileName) ? score.resumeId.fileName : 'Resume.pdf',
            matchScore: score.matchScore,
            status: score.status,
            experience: score.experience,
            aiConfidence: score.aiConfidence,
            uploadDate: score.createdDate,
            jobTitle: (score.jobId && score.jobId.jobTitle) ? score.jobId.jobTitle : 'General Application'
        }));

        const csv = exportToCSV(candidates);
        res.header('Content-Type', 'text/csv');
        res.attachment('candidates-export.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).send("Error exporting data: " + error.message);
    }
};
