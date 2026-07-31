// Database Configuration - MongoDB connection setup

const mongoose = require('mongoose');

const connectDB = async () => {
    const primaryURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_resume_screening';
    const options = {
        serverSelectionTimeoutMS: 5000 // Fast fail in 5 seconds if MongoDB cannot be reached
    };

    try {
        await mongoose.connect(primaryURI, options);
        console.log('MongoDB connected successfully to primary URI');
    } catch (err) {
        console.error('MongoDB primary connection error:', err.message);

        // Fallback to local MongoDB if primary connection fails in development/test mode
        if (process.env.NODE_ENV !== 'production' && primaryURI !== 'mongodb://127.0.0.1:27017/ai_resume_screening') {
            try {
                console.log('Attempting fallback connection to local MongoDB (mongodb://127.0.0.1:27017/ai_resume_screening)...');
                await mongoose.connect('mongodb://127.0.0.1:27017/ai_resume_screening', options);
                console.log('Connected to local MongoDB successfully');
                return;
            } catch (fallbackErr) {
                console.error('Local MongoDB fallback failed:', fallbackErr.message);
            }
        }
        console.error('CRITICAL: Database connection failed. Please ensure MONGODB_URI is set correctly in Render environment variables and 0.0.0.0/0 is whitelisted on MongoDB Atlas.');
    }
};

module.exports = connectDB;