// Help Message Model - Mongoose schema for contact support submissions
const mongoose = require('mongoose');

const helpMessageSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    createdDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("HelpMessage", helpMessageSchema);
