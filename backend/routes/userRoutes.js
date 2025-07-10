const express = require('express');
const {
    getUserProfile,
    updateUserProfile,
    getUserDashboard,
    getUserDonations,
    getAllUsers,
    getUserById,
    updateUserStatus,
    deleteUser,
    uploadProfileImage
} = require('../controllers/userController');
const { userMiddleware, adminMiddleware } = require('../middleware/auth');
const {
    validatePagination,
    validateObjectId,
    validateSearch
} = require('../middleware/validation');
const {
    profileUpdateActivityLogger,
    fileUploadActivityLogger,
    adminActionActivityLogger
} = require('../middleware/activityLogger');
const { profileImageUpload } = require('../middleware/uploadMiddleware');
const { uploadLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes (no authentication required)

// Get user by ID (public profile view)
router.get('/profile/:id',
    validateObjectId('id'),
    getUserById
);

// Protected routes (authentication required)
router.use(userMiddleware);

// User profile management
router.get('/profile/me', getUserProfile);

router.patch('/profile/me',
    profileUpdateActivityLogger,
    updateUserProfile
);

// User dashboard
router.get('/dashboard/analytics', getUserDashboard);

// User donation history
router.get('/donations/history',
    validatePagination,
    getUserDonations
);

// Upload profile image
router.post('/profile/image',
    uploadLimiter,
    profileImageUpload,
    fileUploadActivityLogger,
    uploadProfileImage
);

// Get user's favorite campaigns
router.get('/favorites', async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // This would typically fetch user's favorite campaigns
        // For now, returning empty result
        res.status(200).json({
            success: true,
            data: {
                favorites: [],
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
            message: 'Failed to fetch favorite campaigns',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Add campaign to favorites
router.post('/favorites/:campaignId', 
    validateObjectId('campaignId'),
    async (req, res) => {
        try {
            const { campaignId } = req.params;
            const userId = req.user.id;

            // This would typically add campaign to user's favorites
            // For now, returning success response
            res.status(200).json({
                success: true,
                message: 'Campaign added to favorites'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to add campaign to favorites',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

// Remove campaign from favorites
router.delete('/favorites/:campaignId',
    validateObjectId('campaignId'),
    async (req, res) => {
        try {
            const { campaignId } = req.params;
            const userId = req.user.id;

            // This would typically remove campaign from user's favorites
            // For now, returning success response
            res.status(200).json({
                success: true,
                message: 'Campaign removed from favorites'
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to remove campaign from favorites',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

// Get user's following list
router.get('/following',
    validatePagination,
    async (req, res) => {
        try {
            const userId = req.user.id;
            const User = require('../models/User');

            const user = await User.findById(userId)
                .populate('following', 'fullName email profileImage')
                .select('following');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    following: user.following,
                    count: user.following.length
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch following list',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

// Get user's followers list
router.get('/followers',
    validatePagination,
    async (req, res) => {
        try {
            const userId = req.user.id;
            const User = require('../models/User');

            const user = await User.findById(userId)
                .populate('followers', 'fullName email profileImage')
                .select('followers');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.status(200).json({
                success: true,
                data: {
                    followers: user.followers,
                    count: user.followers.length
                }
            });

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to fetch followers list',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

// Follow/Unfollow user
router.post('/follow/:targetUserId',
    validateObjectId('targetUserId'),
    async (req, res) => {
        try {
            const userId = req.user.id;
            const { targetUserId } = req.params;
            const User = require('../models/User');

            if (userId === targetUserId) {
                return res.status(400).json({
                    success: false,
                    message: 'You cannot follow yourself'
                });
            }

            const user = await User.findById(userId);
            const targetUser = await User.findById(targetUserId);

            if (!user || !targetUser) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            const isFollowing = user.following.includes(targetUserId);

            if (isFollowing) {
                // Unfollow
                await user.unfollowUser(targetUserId);
                res.status(200).json({
                    success: true,
                    message: 'User unfollowed successfully',
                    action: 'unfollowed'
                });
            } else {
                // Follow
                await user.followUser(targetUserId);
                res.status(200).json({
                    success: true,
                    message: 'User followed successfully',
                    action: 'followed'
                });
            }

        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Failed to follow/unfollow user',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    }
);

// Admin only routes
router.use(adminMiddleware);

// Get all users (admin only)
router.get('/',
    validatePagination,
    validateSearch,
    getAllUsers
);

// Update user status (admin only)
router.patch('/:id/status',
    validateObjectId('id'),
    adminActionActivityLogger('UPDATE_USER_STATUS', 'Admin updated user status'),
    updateUserStatus
);

// Delete user (admin only)
router.delete('/:id',
    validateObjectId('id'),
    adminActionActivityLogger('DELETE_USER', 'Admin deleted user'),
    deleteUser
);

module.exports = router;
