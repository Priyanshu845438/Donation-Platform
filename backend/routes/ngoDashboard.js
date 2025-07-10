const express = require('express');
const router = express.Router();
const { ngoMiddleware } = require('../middleware/auth');
const ngoController = require('../controllers/ngoController');

// NGO Dashboard
router.get('/dashboard', ngoMiddleware, ngoController.getNGODashboard);

// NGO Profile Management
router.get('/profile', ngoMiddleware, ngoController.getNGOProfile);
router.patch('/profile', ngoMiddleware, ngoController.updateNGOProfile);

// NGO Logo Upload
router.post('/upload-logo', ngoMiddleware, ngoController.uploadNGOLogo);

// NGO Donations
router.get('/donations/history', ngoMiddleware, ngoController.getNGODonations);

module.exports = router;