const { body, param, query, validationResult } = require('express-validator');
const logger = require('../utils/logger');

/**
 * Handle validation errors
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        logger.warn('Validation errors:', errors.array());
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

/**
 * User registration validation
 */
const validateRegistration = [
    body('fullName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Full name must be between 2 and 100 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Full name can only contain letters and spaces'),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    body('phoneNumber')
        .matches(/^[0-9+\-\s()]{10,15}$/)
        .withMessage('Please provide a valid phone number (10-15 digits)'),
    
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    body('role')
        .custom((value) => {
            const allowedRoles = process.env.NODE_ENV === 'development' 
                ? ['user', 'company', 'ngo', 'admin'] 
                : ['user', 'company', 'ngo'];
            if (!allowedRoles.includes(value)) {
                throw new Error(`Role must be either ${allowedRoles.join(', ')}`);
            }
            return true;
        }),
    
    handleValidationErrors
];

/**
 * User login validation
 */
const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required'),
    
    handleValidationErrors
];

/**
 * Password change validation
 */
const validatePasswordChange = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),
    
    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .withMessage('New password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
    
    handleValidationErrors
];

/**
 * Campaign creation validation
 */
const validateCampaignCreation = [
    body('title')
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('Title must be between 10 and 200 characters'),
    
    body('description')
        .trim()
        .isLength({ min: 50, max: 5000 })
        .withMessage('Description must be between 50 and 5000 characters'),
    
    body('goalAmount')
        .isNumeric()
        .isFloat({ min: 1 })
        .withMessage('Goal amount must be a positive number'),
    
    body('category')
        .isIn(['education', 'healthcare', 'environment', 'poverty', 'disaster-relief', 'animal-welfare', 'other'])
        .withMessage('Invalid category'),
    
    body('endDate')
        .isISO8601()
        .toDate()
        .withMessage('End date must be a valid date')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('End date must be in the future');
            }
            return true;
        }),
    
    body('tags')
        .optional()
        .isArray()
        .withMessage('Tags must be an array'),
    
    handleValidationErrors
];

/**
 * Campaign update validation
 */
const validateCampaignUpdate = [
    body('title')
        .optional()
        .trim()
        .isLength({ min: 10, max: 200 })
        .withMessage('Title must be between 10 and 200 characters'),
    
    body('description')
        .optional()
        .trim()
        .isLength({ min: 50, max: 5000 })
        .withMessage('Description must be between 50 and 5000 characters'),
    
    body('goalAmount')
        .optional()
        .isNumeric()
        .isFloat({ min: 1 })
        .withMessage('Goal amount must be a positive number'),
    
    body('category')
        .optional()
        .isIn(['education', 'healthcare', 'environment', 'poverty', 'disaster-relief', 'animal-welfare', 'other'])
        .withMessage('Invalid category'),
    
    body('endDate')
        .optional()
        .isISO8601()
        .toDate()
        .withMessage('End date must be a valid date')
        .custom((value) => {
            if (new Date(value) <= new Date()) {
                throw new Error('End date must be in the future');
            }
            return true;
        }),
    
    handleValidationErrors
];

/**
 * Donation creation validation
 */
const validateDonationCreation = [
    body('campaignId')
        .isMongoId()
        .withMessage('Invalid campaign ID'),
    
    body('amount')
        .isNumeric()
        .isFloat({ min: 1 })
        .withMessage('Donation amount must be a positive number'),
    
    body('donorName')
        .trim()
        .isLength({ min: 2, max: 100 })
        .withMessage('Donor name must be between 2 and 100 characters'),
    
    body('donorEmail')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    body('donorPhone')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    
    body('message')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Message must be less than 500 characters'),
    
    body('paymentMethod')
        .isIn(['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet'])
        .withMessage('Invalid payment method'),
    
    handleValidationErrors
];

/**
 * Company profile validation
 */
const validateCompanyProfile = [
    body('companyName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('Company name must be between 2 and 200 characters'),
    
    body('companyEmail')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    body('companyPhoneNumber')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    
    body('numberOfEmployees')
        .optional()
        .isInt({ min: 1, max: 1000000 })
        .withMessage('Number of employees must be between 1 and 1,000,000'),
    
    body('companyType')
        .optional()
        .isIn(['IT', 'Manufacturing', 'Healthcare', 'Education', 'Finance', 'Retail', 'Construction', 'Agriculture', 'Other'])
        .withMessage('Invalid company type'),
    
    handleValidationErrors
];

/**
 * NGO profile validation
 */
const validateNGOProfile = [
    body('ngoName')
        .optional()
        .trim()
        .isLength({ min: 2, max: 200 })
        .withMessage('NGO name must be between 2 and 200 characters'),
    
    body('email')
        .optional()
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    body('contactNumber')
        .optional()
        .isMobilePhone()
        .withMessage('Please provide a valid phone number'),
    
    body('numberOfEmployees')
        .optional()
        .isInt({ min: 1, max: 100000 })
        .withMessage('Number of employees must be between 1 and 100,000'),
    
    body('ngoType')
        .optional()
        .isIn(['Trust', 'Society', 'Section 8 Company', 'Other'])
        .withMessage('Invalid NGO type'),
    
    handleValidationErrors
];

/**
 * Pagination validation
 */
const validatePagination = [
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    
    handleValidationErrors
];

/**
 * MongoDB ObjectId validation
 */
const validateObjectId = (paramName) => [
    param(paramName)
        .isMongoId()
        .withMessage(`Invalid ${paramName}`),
    
    handleValidationErrors
];

/**
 * Search validation
 */
const validateSearch = [
    query('search')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Search term must be between 1 and 100 characters'),
    
    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    validateRegistration,
    validateLogin,
    validatePasswordChange,
    validateCampaignCreation,
    validateCampaignUpdate,
    validateDonationCreation,
    validateCompanyProfile,
    validateNGOProfile,
    validatePagination,
    validateObjectId,
    validateSearch
};
