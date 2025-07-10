const express = require('express');
const {
    getCompanyProfile,
    updateCompanyProfile,
    getCompanyDashboard,
    getCompanyDonations,
    getCompanies,
    getCompanyById,
    uploadCompanyLogo
} = require('../controllers/companyController');
const { companyMiddleware, optionalAuthMiddleware } = require('../middleware/auth');
const { validateCompanyProfile, validatePagination, validateObjectId, validateSearch } = require('../middleware/validation');
const { profileUpdateActivityLogger, fileUploadActivityLogger } = require('../middleware/activityLogger');
const { companyLogoUpload } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.get('/',
    validatePagination,
    validateSearch,
    getCompanies
);

router.get('/:id',
    validateObjectId('id'),
    getCompanyById
);

// Protected routes - Company only
router.use(companyMiddleware);

// Company profile
router.get('/profile/me', getCompanyProfile);

router.patch('/profile/me',
    validateCompanyProfile,
    profileUpdateActivityLogger,
    updateCompanyProfile
);

// Company dashboard
router.get('/dashboard/analytics', getCompanyDashboard);

// Company donations
router.get('/donations/history',
    validatePagination,
    getCompanyDonations
);

// Upload company logo
router.post('/profile/logo',
    uploadLimiter,
    companyLogoUpload,
    fileUploadActivityLogger,
    uploadCompanyLogo
);

module.exports = router;
