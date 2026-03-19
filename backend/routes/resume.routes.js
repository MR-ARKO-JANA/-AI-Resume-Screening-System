const express = require('express');
const router = express.Router();
const multerconfig = require('../config/multer');
const resumeController = require('../controllers/resume.controller');

router.post('/resumedata', multerconfig.array("doc", 10), resumeController.uploadResumes);
router.post('/createjob', resumeController.createJob);
router.get('/getlatestresult', resumeController.getLatestResult);
router.get('/export-csv', resumeController.exportCSV);

module.exports = router;
