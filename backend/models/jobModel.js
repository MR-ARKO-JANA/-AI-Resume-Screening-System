const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userdata',
        required: false
    },
    jobTitle: {
        type: String,
        required: true
    },
    jobDescription: {
        type: String,
        required: true
    },
    company: {
        type: String,
        default: 'Unknown Company'
    },
    location: {
        type: String,
        default: 'India'
    },
    source: {
        type: String,
        enum: ['Naukri', 'Indeed', 'Unstop', 'Manual'],
        default: 'Manual'
    },
    sourceUrl: {
        type: String,
        default: ''
    },
    salary: {
        type: String,
        default: 'Not Specified'
    },
    experience: {
        type: String,
        default: 'Not Specified'
    },
    skillsRequired: {
        type: [String],
        default: []
    },
    isExternal: {
        type: Boolean,
        default: false
    },
    externalId: {
        type: String,
        unique: true,
        sparse: true
    },
    createdDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Job', jobSchema);
