
const rateLimit = require("express-rate-limit");
const Settings = require("../models/Settings");
const Activity = require("../models/Activity");

// Store for dynamic rate limiters
const rateLimiters = new Map();

// Create rate limiter based on settings
const createRateLimiter = (config) => {
    return rateLimit({
        windowMs: (config.window_minutes || 15) * 60 * 1000, // Convert minutes to milliseconds
        max: config.max_requests || 100,
        message: {
            error: "Too many requests",
            message: `Rate limit exceeded. Try again in ${config.window_minutes || 15} minutes.`,
            retryAfter: config.window_minutes || 15
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: async (req, res) => {
            // Log rate limit violation
            try {
                await Activity.create({
                    userId: req.user?.id || null,
                    action: "rate_limit_exceeded",
                    description: `Rate limit exceeded from IP: ${req.ip}`,
                    metadata: { 
                        ip: req.ip, 
                        userAgent: req.get('User-Agent'),
                        endpoint: req.originalUrl
                    }
                });
            } catch (error) {
                console.error("Error logging rate limit violation:", error);
            }

            res.status(429).json({
                error: "Too many requests",
                message: `Rate limit exceeded. Try again in ${config.window_minutes || 15} minutes.`,
                retryAfter: config.window_minutes || 15
            });
        }
    });
};

// Auth-specific rate limiter
const createAuthRateLimiter = (config) => {
    return rateLimit({
        windowMs: (config.auth_window_minutes || 15) * 60 * 1000,
        max: config.auth_attempts_limit || 5,
        message: {
            error: "Too many authentication attempts",
            message: `Too many login attempts. Try again in ${config.auth_window_minutes || 15} minutes.`,
            retryAfter: config.auth_window_minutes || 15
        },
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: true,
        handler: async (req, res) => {
            try {
                await Activity.create({
                    action: "auth_rate_limit_exceeded",
                    description: `Authentication rate limit exceeded from IP: ${req.ip}`,
                    metadata: { 
                        ip: req.ip, 
                        userAgent: req.get('User-Agent'),
                        endpoint: req.originalUrl
                    }
                });
            } catch (error) {
                console.error("Error logging auth rate limit violation:", error);
            }

            res.status(429).json({
                error: "Too many authentication attempts",
                message: `Too many login attempts. Try again in ${config.auth_window_minutes || 15} minutes.`,
                retryAfter: config.auth_window_minutes || 15
            });
        }
    });
};

// Upload-specific rate limiter
const createUploadRateLimiter = (config) => {
    return rateLimit({
        windowMs: (config.window_minutes || 15) * 60 * 1000,
        max: Math.floor((config.max_requests || 100) / 4), // Quarter of normal rate for uploads
        message: {
            error: "Too many upload requests",
            message: `Upload rate limit exceeded. Try again in ${config.window_minutes || 15} minutes.`,
            retryAfter: config.window_minutes || 15
        },
        standardHeaders: true,
        legacyHeaders: false
    });
};

// Dynamic rate limiter middleware
const dynamicRateLimit = async (req, res, next) => {
    try {
        // Get rate limiting settings
        const rateLimitSettings = await Settings.findOne({ category: "rate_limiting" });
        
        if (!rateLimitSettings || !rateLimitSettings.settings.get("enabled")) {
            return next(); // Rate limiting disabled
        }

        const config = Object.fromEntries(rateLimitSettings.settings);
        
        // Create or get existing rate limiter
        const limiterKey = `general_${config.window_minutes}_${config.max_requests}`;
        
        if (!rateLimiters.has(limiterKey)) {
            rateLimiters.set(limiterKey, createRateLimiter(config));
        }

        const limiter = rateLimiters.get(limiterKey);
        limiter(req, res, next);

    } catch (error) {
        console.error("Rate limiter error:", error);
        next(); // Continue without rate limiting on error
    }
};

// Auth rate limiter middleware
const authRateLimit = async (req, res, next) => {
    try {
        const rateLimitSettings = await Settings.findOne({ category: "rate_limiting" });
        
        if (!rateLimitSettings || !rateLimitSettings.settings.get("enabled")) {
            return next();
        }

        const config = Object.fromEntries(rateLimitSettings.settings);
        
        const limiterKey = `auth_${config.auth_window_minutes}_${config.auth_attempts_limit}`;
        
        if (!rateLimiters.has(limiterKey)) {
            rateLimiters.set(limiterKey, createAuthRateLimiter(config));
        }

        const limiter = rateLimiters.get(limiterKey);
        limiter(req, res, next);

    } catch (error) {
        console.error("Auth rate limiter error:", error);
        next();
    }
};

// Upload rate limiter middleware
const uploadRateLimit = async (req, res, next) => {
    try {
        const rateLimitSettings = await Settings.findOne({ category: "rate_limiting" });
        
        if (!rateLimitSettings || !rateLimitSettings.settings.get("enabled")) {
            return next();
        }

        const config = Object.fromEntries(rateLimitSettings.settings);
        
        const limiterKey = `upload_${config.window_minutes}_${Math.floor(config.max_requests / 4)}`;
        
        if (!rateLimiters.has(limiterKey)) {
            rateLimiters.set(limiterKey, createUploadRateLimiter(config));
        }

        const limiter = rateLimiters.get(limiterKey);
        limiter(req, res, next);

    } catch (error) {
        console.error("Upload rate limiter error:", error);
        next();
    }
};

// Clear rate limiter cache (useful when settings change)
const clearRateLimiterCache = () => {
    rateLimiters.clear();
};

module.exports = {
    dynamicRateLimit,
    authRateLimit,
    uploadRateLimit,
    clearRateLimiterCache
};
