const Activity = require('../models/Activity');

// Middleware for tracking user activity
const activityLogger = (action, details = '') => {
    return async (req, res, next) => {
        try {
            if (req.user) {
                // Create a new activity log
                const newActivity = new Activity({
                    userId: req.user.id,
                    action: action,
                    details: details
                });

                // Save the activity to the database
                await newActivity.save();
            }

            next();
        } catch (error) {
            console.error('Error logging activity:', error);
            next();
        }
    };
};

module.exports = activityLogger;
