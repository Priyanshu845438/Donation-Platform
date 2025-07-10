const express = require('express');
const { userMiddleware } = require('../middleware/auth');
const { getUserActivities, getAllActivities } = require('../middleware/activityLogger');
const { validatePagination } = require('../middleware/validation');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(userMiddleware);

/**
 * Get user's activity history
 */
router.get('/activities', 
    validatePagination,
    getUserActivities
);

/**
 * Health check for authenticated users
 */
router.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Protected route access successful',
        user: {
            id: req.user.id,
            role: req.user.role,
            email: req.user.email
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * Get user's dashboard data based on role
 */
router.get('/dashboard', async (req, res) => {
    try {
        const { role } = req.user;
        
        // Redirect to appropriate dashboard based on role
        let dashboardData = {
            role: role,
            redirectTo: null,
            message: 'Dashboard access successful'
        };

        switch (role) {
            case 'admin':
                dashboardData.redirectTo = '/api/admin/dashboard';
                break;
            case 'company':
                dashboardData.redirectTo = '/api/companies/dashboard';
                break;
            case 'ngo':
                dashboardData.redirectTo = '/api/ngo/dashboard';
                break;
            case 'user':
            default:
                dashboardData.redirectTo = '/api/users/dashboard';
                break;
        }

        res.status(200).json({
            success: true,
            data: dashboardData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard information',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Update user preferences
 */
router.patch('/preferences', async (req, res) => {
    try {
        const User = require('../models/User');
        const { sanitizeInput } = require('../utils/sanitizer');
        
        const userId = req.user.id;
        const updates = req.body;

        // Sanitize preference updates
        const sanitizedUpdates = {};
        if (updates.preferences) {
            for (const key in updates.preferences) {
                if (updates.preferences[key] !== undefined) {
                    if (typeof updates.preferences[key] === 'string') {
                        sanitizedUpdates[`preferences.${key}`] = sanitizeInput(updates.preferences[key]);
                    } else {
                        sanitizedUpdates[`preferences.${key}`] = updates.preferences[key];
                    }
                }
            }
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { ...sanitizedUpdates, updatedAt: new Date() },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Preferences updated successfully',
            data: user.preferences
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to update preferences',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Get user's notifications
 */
router.get('/notifications', 
    validatePagination,
    async (req, res) => {
        try {
            // This would typically fetch notifications from a notifications collection
            // For now, returning a placeholder structure
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            res.status(200).json({
                success: true,
                data: {
                    notifications: [],
                    unreadCount: 0,
                    pagination: {
                        page,
                        limit,
                        total: 0,
                        pages: 0
                    }
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch notifications',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

/**
 * Mark notification as read
 */
router.patch('/notifications/:notificationId/read', async (req, res) => {
    try {
        const { notificationId } = req.params;

        // This would typically update the notification status
        // For now, returning success response
        res.status(200).json({
            success: true,
            message: 'Notification marked as read'
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
