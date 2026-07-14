// Database Configuration - MongoDB connection setup

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/ai_resume_screening';

        // Debug: log which URI source is being used (without revealing the full string)
        if (process.env.MONGODB_URI) {
            console.log('Using MONGODB_URI from environment (starts with:', process.env.MONGODB_URI.substring(0, 20) + '...)');
        } else if (process.env.MONGO_URI) {
            console.log('Using MONGO_URI from environment (starts with:', process.env.MONGO_URI.substring(0, 20) + '...)');
        } else {
            console.log('WARNING: No MONGODB_URI or MONGO_URI found in environment! Falling back to localhost.');
            console.log('Available env keys:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('mongo')));
        }

        await mongoose.connect(mongoURI);

        console.log('MongoDB connected successfully');
    } catch (err) {
        console.error('MongoDB connection error:', err.message);
        process.exit(1);
    }
}

module.exports = connectDB;