const jwt = require('jsonwebtoken');
const User = require('../models/usermodels');
const Score = require('../models/scoreModel');

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_change_in_production";

exports.getAllCandidates = async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });

        const allScores = await Score.find({ userId: user._id })
            .populate('resumeId')
            .populate('jobId')
            .sort({ matchScore: -1, createdDate: -1 });

        const candidates = allScores.map(score => ({
            id: score._id,
            fileName: score.resumeId.fileName,
            matchScore: score.matchScore,
            status: score.status,
            aiConfidence: score.aiConfidence,
            experience: score.experience,
            uploadDate: score.createdDate,
            jobTitle: score.jobId.jobTitle
        }));

        res.json(candidates);
    } catch (error) {
        res.json({ error: error.message });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email }).select('_id');

        if (!user) return res.json({ error: "User not found" });

        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const stats = await Score.aggregate([
            { $match: { userId: user._id } },
            {
                $facet: {
                    current: [
                        {
                            $group: {
                                _id: null,
                                total: { $sum: 1 },
                                shortlisted: { $sum: { $cond: [{ $eq: ['$status', 'Shortlisted'] }, 1, 0] } },
                                pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } },
                                rejected: { $sum: { $cond: [{ $eq: ['$status', 'Rejected'] }, 1, 0] } },
                                avgScore: { $avg: '$matchScore' }
                            }
                        }
                    ],
                    lastMonth: [
                        { $match: { createdDate: { $lt: oneMonthAgo } } },
                        {
                            $group: {
                                _id: null,
                                total: { $sum: 1 },
                                shortlisted: { $sum: { $cond: [{ $eq: ['$status', 'Shortlisted'] }, 1, 0] } },
                                pending: { $sum: { $cond: [{ $eq: ['$status', 'Pending'] }, 1, 0] } }
                            }
                        }
                    ]
                }
            }
        ]);

        const current = stats[0].current[0] || { total: 0, shortlisted: 0, pending: 0, rejected: 0, avgScore: 0 };
        const lastMonth = stats[0].lastMonth[0] || { total: 0, shortlisted: 0, pending: 0 };

        const totalTrend = lastMonth.total > 0 ? Math.round(((current.total - lastMonth.total) / lastMonth.total) * 100) : 0;
        const shortlistedTrend = lastMonth.shortlisted > 0 ? Math.round(((current.shortlisted - lastMonth.shortlisted) / lastMonth.shortlisted) * 100) : 0;
        const pendingTrend = lastMonth.pending > 0 ? Math.round(((current.pending - lastMonth.pending) / lastMonth.pending) * 100) : 0;

        res.json({
            totalResumes: current.total,
            shortlisted: current.shortlisted,
            pending: current.pending,
            rejected: current.rejected,
            avgMatchScore: Math.round(current.avgScore || 0),
            trends: {
                total: totalTrend,
                shortlisted: shortlistedTrend,
                pending: pendingTrend
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.json({ error: error.message });
    }
};

exports.getCandidatesByStatus = async (req, res) => {
    try {
        let token = req.cookies.token;
        if (!token) return res.json({ error: "Not logged in" });

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });

        const status = req.params.status;

        const scores = await Score.find({ userId: user._id, status: status })
            .populate('resumeId')
            .populate('jobId')
            .sort({ matchScore: -1 });

        const candidates = scores.map(score => ({
            id: score._id,
            fileName: score.resumeId.fileName,
            matchScore: score.matchScore,
            status: score.status,
            uploadDate: score.createdDate
        }));

        res.json(candidates);
    } catch (error) {
        res.json({ error: error.message });
    }
};
