
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Activity = require('../models/Activity');
const logger = require('../utils/logger');

/**
 * Get User Activities
 */
router.get('/activities', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [activities, totalActivities] = await Promise.all([
            Activity.find({ userId })
                .sort({ createdAt: -1 })
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
            message: 'Failed to get user activities'
        });
    }
});

/**
 * Protected Health Check
 */
router.get('/health', authenticateToken, async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'Protected health check successful',
            user: {
                id: req.user.id,
                role: req.user.role,
                email: req.user.email
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Protected health check error:', error);
        res.status(500).json({
            success: false,
            message: 'Protected health check failed'
        });
    }
});

/**
 * Get Protected Dashboard
 */
router.get('/dashboard', authenticateToken, async (req, res) => {
    try {
        const user = req.user;
        let redirectUrl;

        switch (user.role) {
            case 'admin':
                redirectUrl = '/admin/dashboard';
                break;
            case 'company':
                redirectUrl = '/companies/dashboard/analytics';
                break;
            case 'ngo':
                redirectUrl = '/ngo/dashboard';
                break;
            default:
                redirectUrl = '/users/dashboard/analytics';
        }

        res.status(200).json({
            success: true,
            message: 'Dashboard redirect information',
            data: {
                role: user.role,
                redirectUrl,
                user: {
                    id: user.id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role
                }
            }
        });

    } catch (error) {
        logger.error('Get protected dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get dashboard information'
        });
    }
});

/**
 * Update User Preferences
 */
router.patch('/preferences', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { preferences } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { preferences, updatedAt: new Date() },
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
            data: user
        });

    } catch (error) {
        logger.error('Update user preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update preferences'
        });
    }
});

/**
 * Get Notifications
 */
router.get('/notifications', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // Mock notifications data
        const notifications = [
            {
                id: '1',
                title: 'Welcome to the platform!',
                message: 'Thank you for joining our donation platform.',
                type: 'welcome',
                isRead: false,
                createdAt: new Date()
            }
        ];

        res.status(200).json({
            success: true,
            data: {
                notifications,
                pagination: {
                    page,
                    limit,
                    total: notifications.length,
                    pages: Math.ceil(notifications.length / limit)
                }
            }
        });

    } catch (error) {
        logger.error('Get notifications error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get notifications'
        });
    }
});

/**
 * Mark Notification as Read
 */
router.patch('/notifications/:notificationId/read', authenticateToken, async (req, res) => {
    try {
        const { notificationId } = req.params;

        res.status(200).json({
            success: true,
            message: 'Notification marked as read',
            data: { notificationId, isRead: true }
        });

    } catch (error) {
        logger.error('Mark notification as read error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to mark notification as read'
        });
    }
});

module.exports = router;
