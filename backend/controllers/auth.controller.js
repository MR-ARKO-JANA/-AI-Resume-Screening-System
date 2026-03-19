const jwt = require('jsonwebtoken');
const bc = require('bcrypt');
const User = require('../models/usermodels');
const Score = require('../models/scoreModel');
const Resume = require('../models/resumeModel');
const Job = require('../models/jobModel');

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_change_in_production";

exports.login = async (req, res) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) return res.send("Email and password are required");

        let idenuser = await User.findOne({ email: email });
        if (!idenuser) return res.send("User not found");

        bc.compare(password, idenuser.password, (err, result) => {
            if (err) return res.send("Something went wrong");
            if (result) {
                let token = jwt.sign({ email: idenuser.email }, JWT_SECRET);
                res.cookie("token", token);
                res.redirect('/dashboard');
            } else {
                res.send("Incorrect password");
            }
        });
    } catch (error) {
        res.send("Something went wrong: " + error.message);
    }
};

exports.register = async (req, res) => {
    try {
        let { name, email, password } = req.body;

        if (!name || !email || !password) return res.send("All fields are required");

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return res.send("Invalid email format");

        let existingUser = await User.findOne({ email: email });
        if (existingUser) return res.send("User already exists");

        bc.genSalt(10, (err, salt) => {
            if (err) return res.send("Error salt");
            bc.hash(password, salt, async (err, hash) => {
                if (err) return res.send("Hash error");
                try {
                    const datafild = new User({ name, email, password: hash });
                    await datafild.save();
                    let token = jwt.sign({ email }, JWT_SECRET);
                    res.cookie("token", token);
                    res.redirect('/dashboard');
                } catch (error) {
                    res.send("Database error: " + error.message);
                }
            });
        });
    } catch (error) {
        res.send("Server error: " + error.message);
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/');
};

exports.getUserProfile = async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });

        if (!user) return res.json({ error: "User not found" });

        res.json({
            name: user.name,
            email: user.email,
            company: user.company || "",
            jobTitle: user.jobTitle || ""
        });
    } catch (error) {
        res.json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let { name, company, jobTitle } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            { email: decoded.email },
            { name, company, jobTitle },
            { new: true }
        );

        if (!updatedUser) return res.json({ error: "User not found" });

        res.json({ success: true, user: updatedUser });
    } catch (error) {
        res.json({ error: error.message });
    }
};

exports.changePassword = async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let { currentPassword, newPassword } = req.body;

        let user = await User.findOne({ email: decoded.email });
        if (!user) return res.json({ error: "User not found" });

        const isMatch = await bc.compare(currentPassword, user.password);
        if (!isMatch) return res.json({ error: "Incorrect current password" });

        const salt = await bc.genSalt(10);
        const hash = await bc.hash(newPassword, salt);

        user.password = hash;
        await user.save();

        res.json({ success: true });
    } catch (error) {
        res.json({ error: error.message });
    }
};

exports.deleteAllData = async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });

        await Score.deleteMany({ userId: user._id });
        await Resume.deleteMany({ userId: user._id });
        await Job.deleteMany({ userId: user._id });

        res.json({ success: true });
    } catch (error) {
        res.json({ error: error.message });
    }
};

exports.deleteAccount = async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });

        await Score.deleteMany({ userId: user._id });
        await Resume.deleteMany({ userId: user._id });
        await Job.deleteMany({ userId: user._id });
        await User.deleteOne({ _id: user._id });

        res.clearCookie('token');
        res.json({ success: true });
    } catch (error) {
        res.json({ error: error.message });
    }
};
