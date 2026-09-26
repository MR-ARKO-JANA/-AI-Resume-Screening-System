require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const express = require('express');
const path = require('path');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const jwt = require("jsonwebtoken");

const { connectDB, isDBConnected } = require("./config/db");
const User = require("./models/usermodels");
const Score = require("./models/scoreModel");

const authRoutes = require('./routes/auth.routes');
const resumeRoutes = require('./routes/resume.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const profileRoutes = require('./routes/profile.routes');
const jobRoutes = require('./routes/job.routes');
const edtechRoutes = require('./routes/edtech.routes');

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_change_in_production";

connectDB();
const app = express();

const securityHeaders = require('./middleware/securityHeaders');
const requestLogger = require('./middleware/requestLogger');

const rateLimit = require('express-rate-limit');

app.use(express.json());
app.use(securityHeaders);
app.use(requestLogger);
app.use(express.urlencoded({ extended: true }));

// Rate limiting for auth endpoints (prevent brute-force)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // max 10 login/register attempts per 15 min
    message: 'Too many attempts. Please try again after 15 minutes.',
    standardHeaders: true,
    legacyHeaders: false
});

// General API rate limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/login', authLimiter);
app.use('/register', authLimiter);
app.use('/api/', apiLimiter);

// Database connection status check middleware for data operations
app.use((req, res, next) => {
    const isDataRoute = req.method !== 'GET' || req.path.startsWith('/api') || req.path === '/result';
    if (!isDBConnected() && isDataRoute && req.path !== '/api/health') {
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(503).json({
                error: "Database connection unavailable. Please verify DATABASE_URL environment variable with your Neon PostgreSQL connection string."
            });
        } else {
            return res.status(503).send(`
                <div style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background-color: #0f172a; color: #f8fafc; min-height: 100vh;">
                    <div style="max-width: 600px; margin: 0 auto; background: #1e293b; padding: 40px; border-radius: 12px; border: 1px solid #334155; box-shadow: 0 10px 25px rgba(0,0,0,0.5);">
                        <h2 style="color: #ef4444; margin-top: 0;">Neon PostgreSQL Connection Required</h2>
                        <p style="color: #cbd5e1; font-size: 16px;">The server cannot process login or database operations because <strong>DATABASE_URL</strong> is not connected.</p>
                        <hr style="border-color: #334155; margin: 20px 0;" />
                        <h4 style="color: #38bdf8; text-align: left; margin-bottom: 8px;">Action Required:</h4>
                        <ol style="text-align: left; color: #94a3b8; line-height: 1.8;">
                            <li>Create a free database on <strong><a href="https://neon.tech" target="_blank" style="color: #38bdf8;">Neon.tech</a></strong>.</li>
                            <li>Copy your connection string (e.g. <code>postgresql://neondb_owner:...@ep-xyz.neon.tech/neondb?sslmode=require</code>).</li>
                            <li>Add <code>DATABASE_URL</code> to your <code>.env</code> file or hosting environment variables.</li>
                            <li>Restart the server. Tables are auto-created on first run!</li>
                        </ol>
                        <a href="/" style="display: inline-block; margin-top: 20px; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Return to Home</a>
                    </div>
                </div>
            `);
        }
    }
    next();
});
app.use(express.static(path.join(__dirname, '../frontend')));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser());

// =======================//
// Frontend View Routes //
// =======================//
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/login_register.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/login_register.html')));
app.get('/register', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/login_register.html')));
app.get('/candidates', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/candidates.html')));
app.get('/settings', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/settings.html')));
app.get('/dashboard', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/dashboard.html')));
app.get('/profile-lookup', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/profile-lookup.html')));
app.get('/jobs', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/jobs.html')));
app.get('/templates', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/templates.html')));
app.get('/help', (req, res) => res.sendFile(path.join(__dirname, '../frontend/html/help.html')));
app.get('/result', async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.redirect('/');

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });

        let targetScore = null;

        // If a specific score ID is provided (e.g. from demo), load that score
        const scoreId = req.query.id;
        if (scoreId) {
            targetScore = await Score.findById(scoreId);
        }

        // Fallback: load the latest score for this user
        if (!targetScore) {
            targetScore = await Score.findOne({ userId: user._id })
                .populate('resumeId')
                .populate('jobId')
                .sort({ createdDate: -1 });
        }

        if (targetScore) {
            res.cookie('resultData', JSON.stringify({
                matchScore: targetScore.matchScore,
                status: targetScore.status,
                fileName: (targetScore.resumeId && targetScore.resumeId.fileName) ? targetScore.resumeId.fileName : "Resume.pdf",
                aiAnalysis: targetScore.aiAnalysis,
                aiConfidence: targetScore.aiConfidence,
                experience: targetScore.experience,
                skills: targetScore.skills
            }), { maxAge: 60000, httpOnly: false });
        }

        res.sendFile(path.join(__dirname, '../frontend/html/result.html'));
    } catch (error) {
        res.sendFile(path.join(__dirname, '../frontend/html/result.html'));
    }
});


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
app.use('/', edtechRoutes);

// Multer error handling middleware (must be AFTER routes to catch multer errors)
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

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}


// 404 handler - must be after all other routes
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../frontend/html/404.html'));
});
module.exports = app;

