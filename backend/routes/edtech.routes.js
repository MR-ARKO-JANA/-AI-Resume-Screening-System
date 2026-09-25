// EdTech Routes - Roles, Roadmaps, Milestones, and Demo Presets

const express = require('express');
const router = express.Router();
const edtechController = require('../controllers/edtech.controller');

router.get('/api/edtech/roles', edtechController.getTargetRoles);
router.get('/api/edtech/demos', edtechController.getDemoPresets);
router.post('/api/edtech/demo/:demoId', edtechController.runDemoEvaluation);
router.get('/api/edtech/roadmap/latest', edtechController.getStudentRoadmap);
router.post('/api/edtech/roadmap/milestone', edtechController.toggleMilestone);

module.exports = router;
