const express = require('express');
const {
    getNGOAnalytics,
    getNGOCampaigns,
    getNGODonations,
    updateNGOProfile
} = require('../../controllers/ngo/dashboardController');
const { validatePagination, validateNGOProfile } = require('../../middleware/validation');
const { profileUpdateActivityLogger } = require('../../middleware/activityLogger');

const router = express.Router();

// NGO dashboard analytics
router.get('/analytics', getNGOAnalytics);

// NGO campaigns
router.get('/campaigns', validatePagination, getNGOCampaigns);

// NGO donations
router.get('/donations', validatePagination, getNGODonations);

// Update NGO profile
router.patch('/profile',
    validateNGOProfile,
    profileUpdateActivityLogger,
    updateNGOProfile
);

module.exports = router;
