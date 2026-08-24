// Auth Middleware - Centralized JWT verification
// Verifies token from cookies and attaches user to req.user

const jwt = require('jsonwebtoken');
const User = require('../models/usermodels');

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_change_in_production";

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (!token) {
            // Check if the request expects JSON
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(401).json({ error: "Not logged in" });
            }
            return res.redirect('/');
        }

        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            res.clearCookie('token');
            if (req.headers.accept && req.headers.accept.includes('application/json')) {
                return res.status(401).json({ error: "User not found. Please login again." });
            }
            return res.redirect('/');
        }

        req.user = user;
        next();
    } catch (error) {
        res.clearCookie('token');
        if (req.headers.accept && req.headers.accept.includes('application/json')) {
            return res.status(401).json({ error: "Invalid or expired token. Please login again." });
        }
        return res.redirect('/');
    }
};

module.exports = authMiddleware;
