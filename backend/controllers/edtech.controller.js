// EdTech Controller - Handles target roles, roadmaps, milestone tracking, and demo evaluations

const jwt = require('jsonwebtoken');
const Score = require('../models/scoreModel');
const Resume = require('../models/resumeModel');
const Job = require('../models/jobModel');
const User = require('../models/usermodels');
const {
    ROLE_CATALOG,
    DEMO_PRESETS,
    generateLearningRoadmap,
    generateResumeImprovements,
    calculateATSScore,
    generateMockQuestions
} = require('../utils/edtechRoadmap');
const resumeParser = require('../utils/resumeParser');

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_change_in_production";

// Get available target roles catalog
exports.getTargetRoles = async (req, res) => {
    try {
        const roles = Object.keys(ROLE_CATALOG).map(key => ({
            id: key,
            title: ROLE_CATALOG[key].title,
            category: ROLE_CATALOG[key].category,
            description: ROLE_CATALOG[key].description,
            requiredSkills: ROLE_CATALOG[key].requiredSkills
        }));
        res.json({ success: true, roles });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get pre-configured demo presets (3 resumes & 3 roles)
exports.getDemoPresets = async (req, res) => {
    try {
        res.json({
            success: true,
            demos: DEMO_PRESETS.map(d => ({
                id: d.id,
                candidateName: d.candidateName,
                headline: d.headline,
                targetRoleId: d.targetRoleId,
                targetRoleTitle: d.targetRoleTitle,
                resumeFileName: d.resumeFileName,
                summary: d.summary
            }))
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Run instant 1-click evaluation on a demo profile
exports.runDemoEvaluation = async (req, res) => {
    try {
        const demoId = req.params.demoId || 'demo-frontend-fresher';
        const demo = DEMO_PRESETS.find(d => d.id === demoId) || DEMO_PRESETS[0];

        let user = null;
        let token = req.cookies.token;
        if (token) {
            try {
                let decoded = jwt.verify(token, JWT_SECRET);
                user = await User.findOne({ email: decoded.email });
            } catch (e) {}
        }
        if (!user) {
            // Fallback: find or create a demo user
            user = await User.findOne({ email: 'demo@student.edu' });
            if (!user) {
                user = new User({ name: 'Demo Student', email: 'demo@student.edu', password: 'demo' });
                await user.save();
            }
        }

        const roleInfo = ROLE_CATALOG[demo.targetRoleId] || ROLE_CATALOG['frontend-developer'];
        const jobDesc = `${roleInfo.title} Requirement: Must have proficiency in ${roleInfo.requiredSkills.join(', ')}.`;

        const scoringDetails = resumeParser.getTransparentScoring(demo.resumeText, jobDesc);
        const matchScore = scoringDetails.totalScore;
        const skillDetails = resumeParser.getSkillMatchDetails(demo.resumeText, jobDesc);

        const aiAnalysis = await resumeParser.generateAnalysis(
            matchScore,
            scoringDetails.matchedSkills,
            scoringDetails.missingSkills,
            demo.resumeText,
            jobDesc
        );

        const atsDiagnostics = calculateATSScore(demo.resumeText);
        const learningRoadmap = generateLearningRoadmap(scoringDetails.missingSkills, demo.targetRoleId, 6);
        const resumeImprovements = generateResumeImprovements(demo.resumeText, demo.targetRoleId, scoringDetails.missingSkills);
        const mockQuestions = generateMockQuestions(demo.targetRoleId, scoringDetails.missingSkills);

        const newJob = new Job({
            userId: user._id,
            jobTitle: roleInfo.title + ' (EdTech Demo)',
            jobDescription: jobDesc,
            skillsRequired: roleInfo.requiredSkills
        });
        await newJob.save();

        const newResume = new Resume({
            userId: user._id,
            fileName: demo.resumeFileName,
            filePath: 'uploads/' + demo.resumeFileName
        });
        await newResume.save();

        const extractedEducation = resumeParser.extractEducation(demo.resumeText);
        const extractedProjects = resumeParser.extractProjects(demo.resumeText);

        const newScore = new Score({
            userId: user._id,
            resumeId: newResume._id,
            jobId: newJob._id,
            matchScore: matchScore,
            status: matchScore >= 75 ? 'Shortlisted' : matchScore >= 50 ? 'Pending' : 'Rejected',
            aiAnalysis: aiAnalysis,
            aiConfidence: Math.min(85 + Math.round(matchScore * 0.12), 98),
            experience: 'Fresher / Student',
            skills: skillDetails,
            education: extractedEducation,
            projects: extractedProjects,
            scoringBreakdown: {
                ...scoringDetails.breakdown,
                explanation: scoringDetails.explanation
            },
            candidateName: demo.candidateName,
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

        res.json({
            success: true,
            scoreId: newScore._id,
            result: {
                scoreId: newScore._id,
                matchScore: newScore.matchScore,
                status: newScore.status,
                fileName: demo.resumeFileName,
                candidateName: demo.candidateName,
                targetRole: roleInfo.title,
                aiAnalysis: newScore.aiAnalysis,
                aiConfidence: newScore.aiConfidence,
                skills: newScore.skills,
                education: newScore.education,
                projects: newScore.projects,
                matchedSkills: scoringDetails.matchedSkills,
                missingSkills: scoringDetails.missingSkills,
                scoringBreakdown: newScore.scoringBreakdown,
                atsScore: newScore.atsScore,
                atsBreakdown: newScore.atsBreakdown,
                learningRoadmap: newScore.learningRoadmap,
                resumeImprovements: newScore.resumeImprovements,
                mockQuestions: newScore.mockQuestions
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Toggle milestone completion in student roadmap
exports.toggleMilestone = async (req, res) => {
    try {
        const { scoreId, milestoneId } = req.body;
        if (!scoreId || !milestoneId) {
            return res.status(400).json({ error: 'scoreId and milestoneId are required' });
        }

        const score = await Score.findById(scoreId);
        if (!score || !score.learningRoadmap || !score.learningRoadmap.roadmap) {
            return res.status(404).json({ error: 'Score or roadmap not found' });
        }

        let updated = false;
        let milestoneStatus = false;

        score.learningRoadmap.roadmap.forEach(week => {
            if (week.milestones) {
                week.milestones.forEach(m => {
                    if (m.id === milestoneId) {
                        m.completed = !m.completed;
                        milestoneStatus = m.completed;
                        updated = true;
                    }
                });
            }
        });

        if (updated) {
            score.markModified('learningRoadmap');
            await score.save();
        }

        res.json({
            success: true,
            milestoneId: milestoneId,
            completed: milestoneStatus,
            message: 'Milestone updated successfully'
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get rich EdTech learning roadmap & details for active score
exports.getStudentRoadmap = async (req, res) => {
    try {
        let token = req.cookies.token;
        let query = {};
        if (token) {
            try {
                let decoded = jwt.verify(token, JWT_SECRET);
                let user = await User.findOne({ email: decoded.email });
                if (user) query.userId = user._id;
            } catch (e) {}
        }

        const latestScore = await Score.findOne(query)
            .populate('resumeId')
            .populate('jobId')
            .sort({ createdDate: -1 });

        if (!latestScore) {
            return res.json({ error: 'No analysis found. Upload a resume or test a demo preset.' });
        }

        res.json({
            success: true,
            scoreId: latestScore._id,
            fileName: (latestScore.resumeId && latestScore.resumeId.fileName) ? latestScore.resumeId.fileName : 'Resume.pdf',
            candidateName: latestScore.candidateName || 'Student Candidate',
            targetRole: latestScore.targetRole || 'Software Engineer',
            matchScore: latestScore.matchScore,
            status: latestScore.status,
            aiAnalysis: latestScore.aiAnalysis,
            skills: latestScore.skills,
            education: latestScore.education || [],
            projects: latestScore.projects || [],
            matchedSkills: latestScore.matchedSkills || [],
            missingSkills: latestScore.missingSkills || [],
            atsScore: latestScore.atsScore || 75,
            atsBreakdown: latestScore.atsBreakdown,
            learningRoadmap: latestScore.learningRoadmap,
            resumeImprovements: latestScore.resumeImprovements,
            mockQuestions: latestScore.mockQuestions
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
