// AI Resume Screening System - Main Server Entry Point
// Copyright 2024 AI Recruiter

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
const jobRoutes = require('./routes/job.routes');

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_change_in_production";

connectdb();
const app = express();

const securityHeaders = require('./middleware/securityHeaders');
const requestLogger = require('./middleware/requestLogger');

app.use(express.json());
app.use(securityHeaders);
app.use(requestLogger);
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../frontend-react/dist')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());

// Multer error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File is too large. Maximum size is 5MB.' });
        }
        return res.status(400).json({ error: 'File upload error: ' + err.message });
    } else if (err) {
        return res.status(400).json({ error: err.message });
    }
    next();
});

// =======================
// Frontend View Routes (Removed - Now handled by React SPA)
// =======================
// React frontend handles all client-side routing via react-router-dom


// Health check endpoint for Cloud Run and monitoring
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        version: require('../package.json').version || '1.0.0'
    });
});

// =======================
// API Routes
// =======================
app.use('/', authRoutes);
app.use('/', resumeRoutes);
app.use('/', dashboardRoutes);
app.use('/', profileRoutes);
app.use('/', jobRoutes);

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}


// SPA catch-all - serves React app for all non-API routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend-react/dist/index.html'));
});
module.exports = app;



// End of views and routes
