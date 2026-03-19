const jwt = require('jsonwebtoken');
const path = require('path');
const User = require('../models/usermodels');
const Score = require('../models/scoreModel');
const Resume = require('../models/resumeModel');
const Job = require('../models/jobModel');
const resumeParser = require('../utils/resumeParser');
const { exportToCSV } = require('../utils/exportCSV');

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_change_in_production";

exports.uploadResumes = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).send("No files uploaded. Please select PDF or DOC files.");
        }

        if (!req.body.jobDesc || req.body.jobDesc.trim() === '') {
            return res.status(400).send("Job description is required");
        }

        let token = req.cookies.token;
        if (!token) return res.status(401).redirect('/');

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });

        if (!user) return res.status(404).send("User not found");

        const processedResults = [];

        const newJob = new Job({
            userId: user._id,
            jobTitle: req.files.length > 1 ? `Batch [${req.files.length} Resumes]` : (req.files[0].originalname.split('.')[0] + " Screening"),
            jobDescription: req.body.jobDesc
        });
        await newJob.save();

        for (const file of req.files) {
            let resumeText = '';
            try {
                const ext = path.extname(file.originalname).toLowerCase();
                if (ext === '.pdf') {
                    resumeText = await resumeParser.parsePDF(file.path);
                } else {
                    console.warn(`Word document detected: ${file.originalname}. PDF-Parse might fail or return junk.`);
                    resumeText = await resumeParser.parsePDF(file.path);
                }

                if (!resumeText || resumeText.trim() === '') continue;
            } catch (error) {
                console.error(`Resume parsing error for ${file.originalname}:`, error);
                continue;
            }

            const scoringDetails = resumeParser.getTransparentScoring(resumeText, req.body.jobDesc);
            const matchScore = scoringDetails.totalScore;
            const skillDetails = resumeParser.getSkillMatchDetails(resumeText, req.body.jobDesc);

            const aiAnalysis = await resumeParser.generateAnalysis(
                matchScore,
                scoringDetails.matchedSkills,
                scoringDetails.missingSkills,
                resumeText,
                req.body.jobDesc
            );

            const status = matchScore >= 75 ? "Shortlisted" : matchScore >= 50 ? "Pending" : "Rejected";
            const aiConfidence = Math.min(matchScore + Math.floor(Math.random() * 10), 95);

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
                }
            });

            await newScore.save();
            processedResults.push(newScore);
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
        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });

        const latestScore = await Score.findOne({ userId: user._id })
            .populate('resumeId')
            .populate('jobId')
            .sort({ createdDate: -1 });

        if (!latestScore) return res.json({ error: "No results found" });

        res.json({
            matchScore: latestScore.matchScore,
            status: latestScore.status,
            fileName: latestScore.resumeId.fileName,
            filePath: latestScore.resumeId.filePath,
            aiAnalysis: latestScore.aiAnalysis,
            aiConfidence: latestScore.aiConfidence,
            experience: latestScore.experience,
            skills: latestScore.skills,
            scoringBreakdown: latestScore.scoringBreakdown,
            explanation: latestScore.scoringBreakdown?.explanation
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

        const allScores = await Score.find({ userId: user._id })
            .populate('resumeId')
            .populate('jobId')
            .sort({ matchScore: -1 });

        const candidates = allScores.map(score => ({
            fileName: score.resumeId.fileName,
            matchScore: score.matchScore,
            status: score.status,
            experience: score.experience,
            aiConfidence: score.aiConfidence,
            uploadDate: score.createdDate,
            jobTitle: score.jobId.jobTitle
        }));

        const csv = exportToCSV(candidates);
        res.header('Content-Type', 'text/csv');
        res.attachment('candidates-export.csv');
        res.send(csv);
    } catch (error) {
        res.status(500).send("Error exporting data: " + error.message);
    }
};
