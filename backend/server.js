require('dotenv').config();
const express = require('express');
const path = require('path');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");

const connectdb = require("./config/db");
const User = require("./models/usermodels");
const Score = require("./models/scoreModel");

// Import newly extracted routes
const authRoutes = require('./routes/auth.routes');
const resumeRoutes = require('./routes/resume.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const profileRoutes = require('./routes/profile.routes');

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_change_in_production";

connectdb();
const app = express();

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

// =======================
// Frontend View Routes
// =======================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/login_register.html')));
app.get('/candidates', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/candidates.html')));
app.get('/settings', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/settings.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/dashboard.html')));
app.get('/profile-lookup', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/profile-lookup.html')));

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

// =======================
// API Routes
// =======================
app.use('/', authRoutes);
app.use('/', resumeRoutes);
app.use('/', dashboardRoutes);
app.use('/', profileRoutes);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;