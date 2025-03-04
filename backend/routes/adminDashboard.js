const express = require('express');
const router = express.Router();
const adminDashboardController = require('../controllers/adminDashboardController');

// Admin Dashboard Analytics Route
router.get('/dashboard', adminDashboardController.getAnalytics);

module.exports = router;
