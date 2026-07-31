// Database Configuration - MongoDB connection setup

const mongoose = require('mongoose');

const connectDB = async () => {
    const primaryURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai_resume_screening';
    try {
        await mongoose.connect(primaryURI);
        console.log('MongoDB connected successfully to primary URI');
    } catch (err) {
        console.error('MongoDB primary connection error:', err.message);

        // Fallback to local MongoDB if primary connection fails in development/test mode
        if (process.env.NODE_ENV !== 'production' && primaryURI !== 'mongodb://127.0.0.1:27017/ai_resume_screening') {
            try {
                console.log('Attempting fallback connection to local MongoDB (mongodb://127.0.0.1:27017/ai_resume_screening)...');
                await mongoose.connect('mongodb://127.0.0.1:27017/ai_resume_screening');
                console.log('Connected to local MongoDB successfully');
                return;
            } catch (fallbackErr) {
                console.error('Local MongoDB fallback failed:', fallbackErr.message);
            }
        }
        process.exit(1);
    }
};

module.exports = connectDB;