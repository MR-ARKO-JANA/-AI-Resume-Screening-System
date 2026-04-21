const mongoose = require('mongoose');

const scoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userdata',
        required: true
    },
    resumeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Resume',
        required: true
    },
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    matchScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    status: {
        type: String,
        enum: ['Shortlisted', 'Rejected', 'Pending'],
        default: 'Pending'
    },
    aiAnalysis: {
        type: String
    },
    aiConfidence: {
        type: Number,
        min: 0,
        max: 100
    },
    experience: {
        type: String
    },
    skills: [{
        name: String,
        percentage: Number
    }],
    scoringBreakdown: {
        type: Object
    },
    candidateName: {
        type: String,
        default: ''
    },
    githubUrl: {
        type: String,
        default: ''
    },
    linkedinUrl: {
        type: String,
        default: ''
    },
    linkedinData: {
        fullName: String,
        headline: String,
        currentRole: String,
        location: String,
        summary: String,
        workExperience: [{
            title: String,
            company: String,
            duration: String,
            description: String
        }],
        certifications: [{
            name: String,
            issuer: String,
            date: String
        }],
        education: [{
            degree: String,
            school: String,
            year: String
        }],
        skills: [String],
        keyHighlights: [String]
    },
    githubData: {
        type: Object,
        default: null
    },

    createdDate: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model('Score', scoreSchema);
