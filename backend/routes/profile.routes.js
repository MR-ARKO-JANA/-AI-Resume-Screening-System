const express = require('express');
const router = express.Router();
const profileController = require('../controllers/profile.controller');

router.post('/api/profile/github', profileController.getGitHubProfile);
router.post('/api/profile/linkedin-analyze', profileController.analyzeLinkedIn);

module.exports = router;
