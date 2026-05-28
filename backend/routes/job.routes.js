const express = require('express');
const router = express.Router();
const multerconfig = require('../config/multer');
const jobController = require('../controllers/job.controller');

router.get('/api/jobs', jobController.getJobs);
router.post('/api/jobs/sync', jobController.syncJobs);
router.post('/api/jobs/apply/:jobId', multerconfig.single("doc"), jobController.applyToJob);

module.exports = router;
