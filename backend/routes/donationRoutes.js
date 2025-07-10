const express = require('express');
const {
    createDonation,
    getDonationById,
    getUserDonations,
    getCampaignDonations,
    getAllDonations,
    updateDonationStatus,
    getDonationStats
} = require('../controllers/donationController');
const { userMiddleware, adminMiddleware, optionalAuthMiddleware } = require('../middleware/auth');
const {
    validateDonationCreation,
    validatePagination,
    validateObjectId
} = require('../middleware/validation');
const { donationActivityLogger } = require('../middleware/activityLogger');
const { donationLimiter } = require('../middleware/rateLimiter');

// Create donation (can be done by anyone, authenticated or not)
router.post('/',
    donationLimiter,
    validateDonationCreation,
    optionalAuthMiddleware,
    donationActivityLogger,
    createDonation
);

// Get donation statistics (admin only) - Must come before /:id route
router.get('/stats/overview',
    adminMiddleware,
    getDonationStats
);

// Get user's donations (protected)
router.get('/user/my-donations',
    userMiddleware,
    validatePagination,
    getUserDonations
);

// Get campaign donations (campaign owner only)
router.get('/campaign/:campaignId',
    userMiddleware,
    validateObjectId('campaignId'),
    validatePagination,
    getCampaignDonations
);

// Get all donations (admin only)
router.get('/admin/all',
    adminMiddleware,
    validatePagination,
    getAllDonations
);

// Get donation by ID
router.get('/:id',
    validateObjectId('id'),
    optionalAuthMiddleware,
    getDonationById
);

// Update donation status (admin only)
router.patch('/:id/status',
    adminMiddleware,
    validateObjectId('id'),
    updateDonationStatus
);

module.exports = router;
const router = express.Router();
const donationController = require('../controllers/donationController');
const authMiddleware = require('../middleware/auth');

// Get all donations (admin only)
router.get('/', authMiddleware, donationController.getAllDonations);

// Get donation by ID
router.get('/:id', authMiddleware, donationController.getDonationById);

// Create donation
router.post('/', authMiddleware, donationController.createDonation);

// Update donation status (admin/ngo only)
router.patch('/:id/status', authMiddleware, donationController.updateDonationStatus);

module.exports = router;
