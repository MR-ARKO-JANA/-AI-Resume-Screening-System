// Resume Routes - Upload and screening endpoints

const express = require('express');
const router = express.Router();
const multerconfig = require('../config/multer');
const resumeController = require('../controllers/resume.controller');

router.post('/api/resumedata', multerconfig.array("doc", 10), resumeController.uploadResumes);
router.post('/api/createjob', resumeController.createJob);
router.get('/api/getlatestresult', resumeController.getLatestResult);
router.get('/api/export-csv', resumeController.exportCSV);

module.exports = router;
