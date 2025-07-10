const express = require('express');
const router = express.Router();
const { authenticateToken, requireRole } = require('../middleware/auth');
const ngoController = require('../controllers/ngoController');

// NGO Dashboard
router.get('/dashboard', authenticateToken, requireRole(['ngo']), ngoController.getNGODashboard);

// NGO Profile Management
router.get('/profile', authenticateToken, requireRole(['ngo']), ngoController.getNGOProfile);
router.patch('/profile', authenticateToken, requireRole(['ngo']), ngoController.updateNGOProfile);

// NGO Logo Upload
router.post('/upload-logo', authenticateToken, requireRole(['ngo']), ngoController.uploadNGOLogo);

// NGO Donations
router.get('/donations/history', authenticateToken, requireRole(['ngo']), ngoController.getNGODonations);

module.exports = router;