const express = require('express');
const {
    createCampaign,
    getCampaigns,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    getUserCampaigns,
    getCampaignStats
} = require('../controllers/campaignController');
const { userMiddleware, adminMiddleware, optionalAuthMiddleware, ngoMiddleware, companyMiddleware } = require('../middleware/auth');
const {
    validateCampaignCreation,
    validateCampaignUpdate,
    validatePagination,
    validateObjectId,
    validateSearch
} = require('../middleware/validation');
const {
    campaignCreateActivityLogger,
    campaignUpdateActivityLogger,
    campaignDeleteActivityLogger
} = require('../middleware/activityLogger');
const { campaignFilesUpload } = require('../middleware/uploadMiddleware');
const { campaignCreationLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes - get all campaigns
router.get('/',
    validatePagination,
    validateSearch,
    optionalAuthMiddleware,
    getCampaigns
);

// Get user's campaigns (protected route - specific path before /:id)
router.get('/user/my-campaigns',
    userMiddleware,
    validatePagination,
    getUserCampaigns
);

// Get campaign statistics (protected route - specific path before /:id)
router.get('/:id/stats',
    validateObjectId('id'),
    optionalAuthMiddleware,
    getCampaignStats
);

// Get campaign by ID (must come after more specific routes)
router.get('/:id',
    validateObjectId('id'),
    optionalAuthMiddleware,
    getCampaignById
);

// Protected routes for campaign management
router.use(userMiddleware);

// Create campaign
router.post('/',
    campaignCreationLimiter,
    campaignFilesUpload,
    validateCampaignCreation,
    campaignCreateActivityLogger,
    createCampaign
);

// Update campaign
router.patch('/:id',
    validateObjectId('id'),
    campaignFilesUpload,
    validateCampaignUpdate,
    campaignUpdateActivityLogger,
    updateCampaign
);

// Delete campaign
router.delete('/:id',
    validateObjectId('id'),
    campaignDeleteActivityLogger,
    deleteCampaign
);

module.exports = router;