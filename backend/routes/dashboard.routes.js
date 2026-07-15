// Dashboard Routes - Stats and analytics endpoints

const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');

router.get('/api/getallcandidates', dashboardController.getAllCandidates);
router.get('/api/dashboard-stats', dashboardController.getDashboardStats);
router.get('/api/getcandidates/:status', dashboardController.getCandidatesByStatus);

module.exports = router;
