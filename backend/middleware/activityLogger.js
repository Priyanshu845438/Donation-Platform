const Activity = require('../models/Activity');
const logger = require('../utils/logger');

/**
 * Activity logger middleware
 */
const activityLogger = (action, details = '') => {
    return async (req, res, next) => {
        try {
            // Only log activity if user is authenticated
            if (req.user && req.user.id) {
                const activityData = {
                    userId: req.user.id,
                    action: action,
                    details: details || `${req.method} ${req.originalUrl}`,
                    ipAddress: req.ip || req.connection.remoteAddress,
                    userAgent: req.get('User-Agent') || 'Unknown',
                    timestamp: new Date()
                };

                // Add request body for certain actions (excluding sensitive data)
                if (['CREATE', 'UPDATE', 'DELETE'].includes(action)) {
                    const sanitizedBody = { ...req.body };
                    // Remove sensitive fields
                    delete sanitizedBody.password;
                    delete sanitizedBody.currentPassword;
                    delete sanitizedBody.newPassword;
                    delete sanitizedBody.confirmPassword;
                    
                    activityData.requestData = sanitizedBody;
                }

                // Create activity record
                const activity = new Activity(activityData);
                await activity.save();

                logger.info(`Activity logged: ${action} by user ${req.user.id}`);
            }

            next();
        } catch (error) {
            logger.error('Activity logging error:', error);
            // Don't block the request if activity logging fails
            next();
        }
    };
};

/**
 * Login activity logger
 */
const loginActivityLogger = activityLogger('LOGIN', 'User logged in');

/**
 * Logout activity logger
 */
const logoutActivityLogger = activityLogger('LOGOUT', 'User logged out');

/**
 * Registration activity logger
 */
const registrationActivityLogger = activityLogger('REGISTER', 'New user registered');

/**
 * Profile update activity logger
 */
const profileUpdateActivityLogger = activityLogger('UPDATE_PROFILE', 'Profile updated');

/**
 * Password change activity logger
 */
const passwordChangeActivityLogger = activityLogger('CHANGE_PASSWORD', 'Password changed');

/**
 * Campaign creation activity logger
 */
const campaignCreateActivityLogger = activityLogger('CREATE_CAMPAIGN', 'Campaign created');

/**
 * Campaign update activity logger
 */
const campaignUpdateActivityLogger = activityLogger('UPDATE_CAMPAIGN', 'Campaign updated');

/**
 * Campaign deletion activity logger
 */
const campaignDeleteActivityLogger = activityLogger('DELETE_CAMPAIGN', 'Campaign deleted');

/**
 * Donation activity logger
 */
const donationActivityLogger = activityLogger('DONATE', 'Donation made');

/**
 * File upload activity logger
 */
const fileUploadActivityLogger = activityLogger('FILE_UPLOAD', 'File uploaded');

/**
 * Admin action activity logger
 */
const adminActionActivityLogger = (action, details) => {
    return activityLogger(`ADMIN_${action}`, details);
};

/**
 * Get user activities
 */
const getUserActivities = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [activities, totalActivities] = await Promise.all([
            Activity.find({ userId })
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit),
            Activity.countDocuments({ userId })
        ]);

        res.status(200).json({
            success: true,
            data: {
                activities,
                pagination: {
                    page,
                    limit,
                    total: totalActivities,
                    pages: Math.ceil(totalActivities / limit)
                }
            }
        });

    } catch (error) {
        logger.error('Get user activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user activities',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get all activities (admin only)
 */
const getAllActivities = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const userId = req.query.userId;
        const action = req.query.action;

        const searchQuery = {};
        if (userId) {
            searchQuery.userId = userId;
        }
        if (action) {
            searchQuery.action = action;
        }

        const [activities, totalActivities] = await Promise.all([
            Activity.find(searchQuery)
                .populate('userId', 'fullName email')
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit),
            Activity.countDocuments(searchQuery)
        ]);

        res.status(200).json({
            success: true,
            data: {
                activities,
                pagination: {
                    page,
                    limit,
                    total: totalActivities,
                    pages: Math.ceil(totalActivities / limit)
                }
            }
        });

    } catch (error) {
        logger.error('Get all activities error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch activities',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    activityLogger,
    loginActivityLogger,
    logoutActivityLogger,
    registrationActivityLogger,
    profileUpdateActivityLogger,
    passwordChangeActivityLogger,
    campaignCreateActivityLogger,
    campaignUpdateActivityLogger,
    campaignDeleteActivityLogger,
    donationActivityLogger,
    fileUploadActivityLogger,
    adminActionActivityLogger,
    getUserActivities,
    getAllActivities
};
