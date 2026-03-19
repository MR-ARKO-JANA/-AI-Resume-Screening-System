const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

router.get('/getallcandidates', dashboardController.getAllCandidates);
router.get('/dashboard-stats', dashboardController.getDashboardStats);
router.get('/getcandidates/:status', dashboardController.getCandidatesByStatus);

module.exports = router;
