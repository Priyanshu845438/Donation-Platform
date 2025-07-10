const express = require('express');
const { adminMiddleware } = require('../../middleware/auth');
const dashboardRoutes = require('./dashboard');

const router = express.Router();

// Apply admin middleware to all routes
router.use(adminMiddleware);

// Dashboard routes
router.use('/dashboard', dashboardRoutes);

module.exports = router;
