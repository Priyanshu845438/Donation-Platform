const express = require('express');
const {
    getAnalytics,
    getUserManagement,
    getCampaignManagement,
    updateUserStatus,
    updateCampaignStatus
} = require('../../controllers/admin/dashboardController');
const { validatePagination, validateObjectId } = require('../../middleware/validation');
const { adminActionActivityLogger } = require('../../middleware/activityLogger');
const { authMiddleware } = require('../../middleware/auth');

const router = express.Router();

// Dashboard analytics
router.get('/analytics', getAnalytics);

// Apply admin middleware to all routes
router.use(authMiddleware(['admin']));

// User management
router.get('/users', validatePagination, getUserManagement);
router.patch('/users/:userId/status', 
    validateObjectId('userId'),
    adminActionActivityLogger('UPDATE_USER_STATUS', 'Admin updated user status'),
    updateUserStatus
);

// Campaign management
router.get('/campaigns', validatePagination, getCampaignManagement);
router.patch('/campaigns/:campaignId/status',
    validateObjectId('campaignId'), 
    adminActionActivityLogger('UPDATE_CAMPAIGN_STATUS', 'Admin updated campaign status'),
    updateCampaignStatus
);

module.exports = router;
