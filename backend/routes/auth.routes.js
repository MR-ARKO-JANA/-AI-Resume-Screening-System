const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/logout', authController.logout);

// API settings routes
router.get('/api/user-profile', authController.getUserProfile);
router.post('/api/update-profile', authController.updateProfile);
router.post('/api/change-password', authController.changePassword);
router.post('/api/delete-all-data', authController.deleteAllData);
router.post('/api/delete-account', authController.deleteAccount);

module.exports = router;
