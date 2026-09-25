// Score Model - Mongoose schema with EdTech Career & Learning Roadmap additions

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
        type: Object,
        default: null
    },
    githubData: {
        type: Object,
        default: null
    },
    education: [{
        degree: String,
        school: String,
        year: String,
        gpa: String
    }],
    projects: [{
        title: String,
        techStack: [String],
        description: String
    }],

    // EdTech & Career Roadmap Additions
    targetRole: {
        type: String,
        default: 'Frontend Developer'
    },
    matchedSkills: {
        type: [String],
        default: []
    },
    missingSkills: {
        type: [String],
        default: []
    },
    atsScore: {
        type: Number,
        default: 75
    },
    atsBreakdown: {
        type: Object,
        default: null
    },
    learningRoadmap: {
        targetRole: String,
        totalWeeks: Number,
        estimatedHoursPerWeek: String,
        roadmap: [{
            week: Number,
            title: String,
            goal: String,
            skillsFocus: [String],
            topics: [String],
            freeResources: [{
                name: String,
                type: { type: String },
                url: String
            }],
            milestones: [{
                id: String,
                task: String,
                completed: {
                    type: Boolean,
                    default: false
                }
            }]
        }],
        suggestedProjects: [{
            title: String,
            difficulty: String,
            skillsUsed: [String],
            description: String
        }]
    },
    resumeImprovements: {
        targetRole: String,
        keywordsToAdd: [String],
        formattingTips: [String],
        impactStatements: [{
            category: String,
            original: String,
            improved: String,
            reason: String
        }]
    },
    mockQuestions: {
        targetRole: String,
        questions: [{
            type: { type: String },
            question: String,
            keyFocusPoints: [String]
        }]
    },

    createdDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Score', scoreSchema);
