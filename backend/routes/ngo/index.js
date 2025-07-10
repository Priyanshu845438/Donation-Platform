const express = require('express');
const { ngoMiddleware } = require('../../middleware/auth');
const dashboardRoutes = require('./dashboard');

const router = express.Router();

// Apply NGO middleware to all routes
router.use(ngoMiddleware);

// Dashboard routes
router.use('/dashboard', dashboardRoutes);

module.exports = router;
