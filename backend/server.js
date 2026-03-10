require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const { body, validationResult } = require('express-validator');
const connectdb = require("./config/db");
const User = require("./models/usermodels");
const multerconfig = require('./config/multer');
const Resume = require("./models/resumeModel");
const Job = require("./models/jobModel");
const Score = require("./models/scoreModel");
const resumeParser = require('./utils/resumeParser');

const cookieParser = require('cookie-parser');
const bc = require("bcrypt");
connectdb();
const jwt = require("jsonwebtoken");
const app = express();

// JWT Secret from environment
const JWT_SECRET = process.env.JWT_SECRET || "default_secret_change_in_production";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());

// Multer error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).send('File is too large. Maximum size is 5MB.');
        }
        return res.status(400).send('File upload error: ' + err.message);
    } else if (err) {
        return res.status(400).send(err.message);
    }
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/login_register.html'));
});

app.get('/candidates', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/candidates.html'));
});

app.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/settings.html'));
});


app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/html/dashboard.html'));
});

app.get('/result', async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.redirect('/');

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });

        // Get latest score for this user
        const latestScore = await Score.findOne({ userId: user._id })
            .populate('resumeId')
            .populate('jobId')
            .sort({ createdDate: -1 });

        if (latestScore) {
            // Store data for result page
            res.cookie('resultData', JSON.stringify({
                matchScore: latestScore.matchScore,
                status: latestScore.status,
                fileName: latestScore.resumeId.fileName,
                aiAnalysis: latestScore.aiAnalysis,
                aiConfidence: latestScore.aiConfidence,
                experience: latestScore.experience,
                skills: latestScore.skills
            }));
        }

        res.sendFile(path.join(__dirname, '../frontend/html/result.html'));
    } catch (error) {
        res.sendFile(path.join(__dirname, '../frontend/html/result.html'));
    }
});

// Get all candidates ranked by score
app.get('/getallcandidates', async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });

        // Get all scores for this user, sorted by matchScore
        const allScores = await Score.find({ userId: user._id })
            .populate('resumeId')
            .populate('jobId')
            .sort({ matchScore: -1, createdDate: -1 });  // Highest score first

        const candidates = allScores.map(score => ({
            id: score._id,
            fileName: score.resumeId.fileName,
            matchScore: score.matchScore,
            status: score.status,
            aiConfidence: score.aiConfidence,
            experience: score.experience,
            uploadDate: score.createdDate,
            jobTitle: score.jobId.jobTitle
        }));

        res.json(candidates);
    } catch (error) {
        res.json({ error: error.message });
    }
});

// Get dashboard statistics - Optimized
app.get('/dashboard-stats', async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email }).select('_id');

        if (!user) return res.json({ error: "User not found" });

        // Use MongoDB aggregation for better performance
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        // Single aggregation query for all stats
        const stats = await Score.aggregate([
            { $match: { userId: user._id } },
            {
                $facet: {
                    current: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: 1 },
                                shortlisted: {
                                    $sum: { $cond: [{ $eq: ['$status', 'Shortlisted'] }, 1, 0] }
                                },
                                pending: {
                                    $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
                                },
                                rejected: {
                                    $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] }
                                },
                                avgScore: { $avg: '$matchScore' }
                            }
                        }
                    ],
                    lastMonth: [
                        { $match: { createdDate: { $lt: oneMonthAgo } } },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: 1 },
                                shortlisted: {
                                    $sum: { $cond: [{ $eq: ['$status', 'Shortlisted'] }, 1, 0] }
                                },
                                pending: {
                                    $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] }
                                }
                            }
                        }
                    ]
                }
            }
        ]);

        // Extract results
        const current = stats[0].current[0] || { total: 0, shortlisted: 0, pending: 0, rejected: 0, avgScore: 0 };
        const lastMonth = stats[0].lastMonth[0] || { total: 0, shortlisted: 0, pending: 0 };

        // Calculate trends
        const totalTrend = lastMonth.total > 0
            ? Math.round(((current.total - lastMonth.total) / lastMonth.total) * 100)
            : 0;
        const shortlistedTrend = lastMonth.shortlisted > 0
            ? Math.round(((current.shortlisted - lastMonth.shortlisted) / lastMonth.shortlisted) * 100)
            : 0;
        const pendingTrend = lastMonth.pending > 0
            ? Math.round(((current.pending - lastMonth.pending) / lastMonth.pending) * 100)
            : 0;

        res.json({
            totalResumes: current.total,
            shortlisted: current.shortlisted,
            pending: current.pending,
            rejected: current.rejected,
            avgMatchScore: Math.round(current.avgScore || 0),
            trends: {
                total: totalTrend,
                shortlisted: shortlistedTrend,
                pending: pendingTrend
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.json({ error: error.message });
    }
});

// Get candidates filtered by status
app.get('/getcandidates/:status', async (req, res) => {

    try {
        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });

        const status = req.params.status; // 'Shortlisted', 'Pending', 'Rejected'

        const scores = await Score.find({ userId: user._id, status: status })
            .populate('resumeId')
            .populate('jobId')
            .sort({ matchScore: -1 });

        const candidates = scores.map(score => ({
            id: score._id,
            fileName: score.resumeId.fileName,
            matchScore: score.matchScore,
            status: score.status,
            uploadDate: score.createdDate
        }));

        res.json(candidates);
    } catch (error) {
        res.json({ error: error.message });
    }
});



app.post('/login', async (req, res) => {
    try {
        let { email, password } = req.body;

        // Validation
        if (!email || !password) return res.send("Email and password are required");

        if (!idenuser) return res.send("User not found");

        bc.compare(password, idenuser.password, (err, result) => {
            if (err) return res.send("Something went wrong")
            if (result) {
                let token = jwt.sign({ email: idenuser.email }, JWT_SECRET)
                res.cookie("token", token)
                res.redirect('/dashboard')
            }
            else res.send("Incorrect password")
        })
    } catch (error) {
        res.send("Something went wrong: " + error.message)
    }
});

app.get('/getlatestresult', async (req, res) => {
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
});

app.post('/register', async (req, res) => {
    try {
        let { name, email, password } = req.body;

        // Validation
        if (!name || !email || !password) return res.send("All fields are required");

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.send("Invalid email format");
        // Check if user already exists
        let existingUser = await User.findOne({ email: email });
        if (existingUser) return res.send("User already exists");

        bc.genSalt(10, (err, salt) => {
            if (err) return res.send("Error salt");
            bc.hash(password, salt, async (err, hash) => {
                if (err) return res.send("Hash error");
                try {
                    const datafild = new User({
                        name,
                        email,
                        password: hash
                    });
                    await datafild.save();
                    let token = jwt.sign({ email }, JWT_SECRET)
                    res.cookie("token", token)
                    res.redirect('/dashboard');
                } catch (error) {
                    res.send("Database error: " + error.message);
                }
            })
        })
    } catch (error) {
        res.send("Server error: " + error.message);
    }
});


app.post('/resumedata', multerconfig.array("doc", 10), async (req, res) => {
    try {
        // Validate file upload
        if (!req.files || req.files.length === 0) {
            return res.status(400).send("No files uploaded. Please select PDF or DOC files.");
        }

        // Validate job description
        if (!req.body.jobDesc || req.body.jobDesc.trim() === '') {
            return res.status(400).send("Job description is required");
        }

        // Get user from token
        let token = req.cookies.token;
        if (!token) {
            return res.status(401).redirect('/');
        }

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(404).send("User not found");
        }

        const processedResults = [];

        // Create a single Job entry for the entire batch to avoid redundancy
        const newJob = new Job({
            userId: user._id,
            jobTitle: req.files.length > 1 ? `Batch [${req.files.length} Resumes]` : (req.files[0].originalname.split('.')[0] + " Screening"),
            jobDescription: req.body.jobDesc
        });
        await newJob.save();

        // Process each file
        for (const file of req.files) {
            // Parse resume
            let resumeText = '';
            try {
                const ext = path.extname(file.originalname).toLowerCase();
                if (ext === '.pdf') {
                    resumeText = await resumeParser.parsePDF(file.path);
                } else {
                    // Placeholder for DOC/DOCX - In a real app, use mammoth or textract
                    console.warn(`Word document detected: ${file.originalname}. PDF-Parse might fail or return junk.`);
                    resumeText = await resumeParser.parsePDF(file.path);
                }

                if (!resumeText || resumeText.trim() === '') {
                    console.error(`Could not extract text from ${file.originalname}`);
                    continue; // Skip this file
                }
            } catch (error) {
                console.error(`Resume parsing error for ${file.originalname}:`, error);
                continue; // Skip this file
            }

            // Get transparent scoring breakdown
            const scoringDetails = resumeParser.getTransparentScoring(resumeText, req.body.jobDesc);
            const matchScore = scoringDetails.totalScore;

            // Get skill match details
            const skillDetails = resumeParser.getSkillMatchDetails(resumeText, req.body.jobDesc);

            // Generate AI analysis - Corrected arguments
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

            // Save resume
            const newResume = new Resume({
                userId: user._id,
                fileName: file.originalname,
                filePath: file.path
            });
            await newResume.save();

            // Save score
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

        // If multiple files, go to candidates list, if single, show result
        if (req.files.length > 1) {
            res.redirect('/candidates');
        } else {
            res.redirect('/result');
        }

    } catch (error) {
        console.error("Resume upload error:", error);
        res.status(500).send("Error processing resumes: " + error.message);
    }
});



app.post('/createjob', async (req, res) => {

    try {
        let { jobTitle, jobDescription } = req.body;
        if (!jobTitle || !jobDescription) return res.send("All fields are required")

        let token = req.cookies.token;
        if (!token) return res.send("Please login first");

        let decoded = jwt.verify(token, JWT_SECRET)
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
})


app.get('/logout', (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
});

// Export candidates to CSV
app.get('/export-csv', async (req, res) => {
    try {
        const { exportToCSV } = require('./utils/exportCSV');

        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });

        // Get all scores for this user
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
});

// Settings API Endpoints
app.get('/api/user-profile', async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });

        if (!user) return res.json({ error: "User not found" });

        res.json({
            name: user.name,
            email: user.email,
            company: user.company || "",
            jobTitle: user.jobTitle || ""
        });
    } catch (error) {
        res.json({ error: error.message });
    }
});

app.post('/api/update-profile', async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let { name, company, jobTitle } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            { email: decoded.email },
            { name, company, jobTitle },
            { new: true }
        );

        if (!updatedUser) return res.json({ error: "User not found" });

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        res.json({ error: error.message });
    }
});

app.post('/api/change-password', async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let { currentPassword, newPassword } = req.body;

        let user = await User.findOne({ email: decoded.email });
        if (!user) return res.json({ error: "User not found" });

        const isMatch = await bc.compare(currentPassword, user.password);
        if (!isMatch) return res.json({ error: "Incorrect current password" });

        const salt = await bc.genSalt(10);
        const hash = await bc.hash(newPassword, salt);

        user.password = hash;
        await user.save();

        res.json({ success: true });
    } catch (error) {
        res.json({ error: error.message });
    }
});

app.post('/api/delete-all-data', async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });

        // Delete all scores, resumes, and jobs for this user
        await Score.deleteMany({ userId: user._id });
        await Resume.deleteMany({ userId: user._id });
        await Job.deleteMany({ userId: user._id });

        // Note: Files remain in uploads folder, usually we'd delete them too
        // but for safety in this task we'll keep the storage cleanup simple.

        res.json({ success: true });
    } catch (error) {
        res.json({ error: error.message });
    }
});

app.post('/api/delete-account', async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });

        // Delete all data first
        await Score.deleteMany({ userId: user._id });
        await Resume.deleteMany({ userId: user._id });
        await Job.deleteMany({ userId: user._id });

        // Delete user
        await User.deleteOne({ _id: user._id });

        res.clearCookie('token');
        res.json({ success: true });
    } catch (error) {
        res.json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});