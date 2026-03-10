const mongoose = require('mongoose');

const userschema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true, required: true },
    password: String,
    company: { type: String, default: "" },
    jobTitle: { type: String, default: "" }
});

module.exports = mongoose.model("userdata", userschema);