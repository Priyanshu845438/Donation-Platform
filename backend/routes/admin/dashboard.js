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
const { adminMiddleware } = require('../../middleware/auth');

const router = express.Router();

// Apply admin middleware to all routes
router.use(adminMiddleware);

// Dashboard analytics
router.get('/analytics', getAnalytics);

// User management
router.get('/users', validatePagination, getUserManagement);
router.patch('/users/:userId/status', 
    validateObjectId('userId'),
    adminActionActivityLogger('UPDATE_USER_STATUS', 'Admin updated user status'),
    updateUserStatus
);

// Individual user operations
const { getUserById, updateUserProfile, deleteUser } = require('../../controllers/admin/dashboardController');

router.get('/users/:userId', validateObjectId('userId'), getUserById);
router.patch('/users/:userId', 
    validateObjectId('userId'),
    adminActionActivityLogger('UPDATE_USER_PROFILE', 'Admin updated user profile'),
    updateUserProfile
);
router.delete('/users/:userId', 
    validateObjectId('userId'),
    adminActionActivityLogger('DELETE_USER', 'Admin deleted user'),
    deleteUser
);

// Campaign management
router.get('/campaigns', validatePagination, getCampaignManagement);
router.get('/campaigns/:campaignId', validateObjectId('campaignId'), getCampaignManagement);
router.patch('/campaigns/:campaignId', 
    validateObjectId('campaignId'),
    adminActionActivityLogger('UPDATE_CAMPAIGN', 'Admin updated campaign'),
    updateCampaignStatus
);
router.patch('/campaigns/:campaignId/status',
    validateObjectId('campaignId'), 
    adminActionActivityLogger('UPDATE_CAMPAIGN_STATUS', 'Admin updated campaign status'),
    updateCampaignStatus
);
router.delete('/campaigns/:campaignId', 
    validateObjectId('campaignId'),
    adminActionActivityLogger('DELETE_CAMPAIGN', 'Admin deleted campaign'),
    updateCampaignStatus
);

module.exports = router;
