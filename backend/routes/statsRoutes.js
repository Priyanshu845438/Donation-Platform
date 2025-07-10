const express = require('express');
const {
    getGlobalStats,
    getDonationStats,
    getCampaignStats,
    getUserStats
} = require('../controllers/statsController');
const { adminMiddleware, optionalAuthMiddleware } = require('../middleware/auth');

const router = express.Router();

// Public stats (basic overview)
router.get('/global', optionalAuthMiddleware, getGlobalStats);

// Detailed stats (admin only)
router.use(adminMiddleware);

router.get('/donations', getDonationStats);
router.get('/campaigns', getCampaignStats);
router.get('/users', getUserStats);

module.exports = router;
