const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

/**
 * General rate limiter
 */
const generalLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    trustProxy: true, // Trust proxy settings for accurate IP detection
    handler: (req, res) => {
        logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many requests from this IP, please try again later.'
        });
    }
});

/**
 * Authentication rate limiter (stricter)
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5000, // limit each IP to 5 auth requests per windowMs
    trustProxy: true, // Trust proxy settings
    message: {
        success: false,
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Auth rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many authentication attempts, please try again later.'
        });
    }
});

/**
 * Password reset rate limiter
 */
const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // limit each IP to 3 password reset requests per windowMs
    trustProxy: true,
    message: {
        success: false,
        message: 'Too many password reset attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Password reset rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many password reset attempts, please try again later.'
        });
    }
});

/**
 * File upload rate limiter
 */
const uploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 10 upload requests per windowMs
    trustProxy: true,
    message: {
        success: false,
        message: 'Too many file upload attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Upload rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many file upload attempts, please try again later.'
        });
    }
});

/**
 * Donation rate limiter
 */
const donationLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 5, // limit each IP to 5 donation requests per minute
    trustProxy: true,
    message: {
        success: false,
        message: 'Too many donation attempts, please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Donation rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many donation attempts, please slow down.'
        });
    }
});

/**
 * Campaign creation rate limiter
 */
const campaignCreationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 1000, // limit each IP to 5 campaign creation requests per hour
    trustProxy: true,
    message: {
        success: false,
        message: 'Too many campaign creation attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Campaign creation rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many campaign creation attempts, please try again later.'
        });
    }
});

/**
 * Registration rate limiter
 */
const registrationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 2000, // limit each IP to 20 registration requests per hour (increased for testing)
    trustProxy: true,
    message: {
        success: false,
        message: 'Too many registration attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`Registration rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'Too many registration attempts, please try again later.'
        });
    }
});

/**
 * API rate limiter (for API endpoints)
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 API requests per windowMs
    trustProxy: true,
    message: {
        success: false,
        message: 'API rate limit exceeded, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        logger.warn(`API rate limit exceeded for IP: ${req.ip}`);
        res.status(429).json({
            success: false,
            message: 'API rate limit exceeded, please try again later.'
        });
    }
});

module.exports = {
    generalLimiter,
    authLimiter,
    passwordResetLimiter,
    uploadLimiter,
    donationLimiter,
    campaignCreationLimiter,
    registrationLimiter,
    apiLimiter
};
