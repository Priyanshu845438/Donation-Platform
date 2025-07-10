const User = require('../models/User');
const Company = require('../models/Company');
const NGO = require('../models/NGO');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');
const { sanitizeInput } = require('../utils/sanitizer');
const { validateEmail, validatePhone } = require('../utils/validators');

/**
 * Get user profile
 */
exports.getUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let profileData = null;

        // Get role-specific profile
        if (user.role === 'company') {
            profileData = await Company.findOne({ userId });
        } else if (user.role === 'ngo') {
            profileData = await NGO.findOne({ userId });
        }

        res.status(200).json({
            success: true,
            data: {
                user,
                profile: profileData
            }
        });

    } catch (error) {
        logger.error('Get user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update user profile
 */
exports.updateUserProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        // Remove sensitive fields
        delete updates.password;
        delete updates.role;
        delete updates.email;
        delete updates.createdAt;
        delete updates.updatedAt;

        // Sanitize inputs
        const sanitizedUpdates = {};
        for (const key in updates) {
            if (updates[key] !== undefined && updates[key] !== null) {
                sanitizedUpdates[key] = sanitizeInput(updates[key]);
            }
        }

        // Validate phone number if provided
        if (sanitizedUpdates.phoneNumber && !validatePhone(sanitizedUpdates.phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format'
            });
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

        logger.info(`User profile updated: ${userId}`);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });

    } catch (error) {
        logger.error('Update user profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get user dashboard
 */
exports.getUserDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get user
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Run all queries in parallel for better performance
        const [
            totalDonationsResult,
            donationCount,
            campaignCount,
            recentDonations,
            topCampaigns,
            monthlyDonations
        ] = await Promise.all([
            // Total donations made by this user
            Donation.aggregate([
                { $match: { donorId: userId, status: 'completed' } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            
            // Total number of donations
            Donation.countDocuments({ donorId: userId, status: 'completed' }),
            
            // Number of campaigns supported
            Donation.distinct('campaignId', { donorId: userId, status: 'completed' }).then(campaigns => campaigns.length),
            
            // Recent donations
            Donation.find({ donorId: userId, status: 'completed' })
                .populate('campaignId', 'title')
                .sort({ createdAt: -1 })
                .limit(10)
                .select('amount campaignId createdAt'),
            
            // Top campaigns by donation amount
            Donation.aggregate([
                { $match: { donorId: userId, status: 'completed' } },
                { $group: { _id: '$campaignId', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
                { $sort: { totalAmount: -1 } },
                { $limit: 5 },
                {
                    $lookup: {
                        from: 'campaigns',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'campaign'
                    }
                },
                { $unwind: '$campaign' },
                {
                    $project: {
                        campaignId: '$_id',
                        title: '$campaign.title',
                        totalAmount: 1,
                        count: 1
                    }
                }
            ]),
            
            // Monthly donations for the last 12 months
            Donation.aggregate([
                { 
                    $match: { 
                        donorId: userId,
                        status: 'completed',
                        createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
                    }
                },
                {
                    $group: {
                        _id: { 
                            year: { $year: "$createdAt" }, 
                            month: { $month: "$createdAt" } 
                        },
                        total: { $sum: "$amount" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ])
        ]);

        const analytics = {
            overview: {
                totalDonations: totalDonationsResult[0]?.total || 0,
                donationCount: donationCount,
                campaignCount: campaignCount
            },
            user: {
                name: user.fullName,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                createdAt: user.createdAt
            },
            recentDonations: recentDonations.map(donation => ({
                id: donation._id,
                amount: donation.amount,
                campaign: donation.campaignId?.title || 'Unknown Campaign',
                date: donation.createdAt
            })),
            topCampaigns: topCampaigns.map(campaign => ({
                id: campaign.campaignId,
                title: campaign.title,
                totalAmount: campaign.totalAmount,
                donationCount: campaign.count
            })),
            monthlyDonations: monthlyDonations.map(month => ({
                year: month._id.year,
                month: month._id.month,
                total: month.total,
                count: month.count
            }))
        };

        res.status(200).json({
            success: true,
            data: analytics,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Get user dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user dashboard',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get user donation history
 */
exports.getUserDonations = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [donations, totalDonations] = await Promise.all([
            Donation.find({ donorId: userId })
                .populate('campaignId', 'title')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Donation.countDocuments({ donorId: userId })
        ]);

        res.status(200).json({
            success: true,
            data: {
                donations,
                pagination: {
                    page,
                    limit,
                    total: totalDonations,
                    pages: Math.ceil(totalDonations / limit)
                }
            }
        });

    } catch (error) {
        logger.error('Get user donations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user donations',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get all users (admin only)
 */
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const role = req.query.role || '';

        const searchQuery = {};
        if (search) {
            searchQuery.$or = [
                { fullName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }
        if (role) {
            searchQuery.role = role;
        }

        const [users, totalUsers] = await Promise.all([
            User.find(searchQuery)
                .select('-password')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(searchQuery)
        ]);

        res.status(200).json({
            success: true,
            data: {
                users,
                pagination: {
                    page,
                    limit,
                    total: totalUsers,
                    pages: Math.ceil(totalUsers / limit)
                }
            }
        });

    } catch (error) {
        logger.error('Get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch users',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get user by ID
 */
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let profileData = null;

        // Get role-specific profile
        if (user.role === 'company') {
            profileData = await Company.findOne({ userId: id });
        } else if (user.role === 'ngo') {
            profileData = await NGO.findOne({ userId: id });
        }

        res.status(200).json({
            success: true,
            data: {
                user,
                profile: profileData
            }
        });

    } catch (error) {
        logger.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update user status (admin only)
 */
exports.updateUserStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isActive must be a boolean value'
            });
        }

        const user = await User.findByIdAndUpdate(
            id,
            { isActive, updatedAt: new Date() },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        logger.info(`User ${id} status updated to ${isActive ? 'active' : 'inactive'}`);

        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: user
        });

    } catch (error) {
        logger.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete user account (admin only)
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if user has donations
        const donationCount = await Donation.countDocuments({ donorId: id });
        if (donationCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete user who has made donations'
            });
        }

        // Check if user has campaigns
        const campaignCount = await Campaign.countDocuments({ createdBy: id });
        if (campaignCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete user who has created campaigns'
            });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Delete associated profiles
        if (user.role === 'company') {
            await Company.findOneAndDelete({ userId: id });
        } else if (user.role === 'ngo') {
            await NGO.findOneAndDelete({ userId: id });
        }

        logger.info(`User deleted: ${id}`);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        logger.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete user',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Upload user profile image
 */
exports.uploadProfileImage = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const imagePath = `/uploads/profile/${req.file.filename}`;

        const user = await User.findByIdAndUpdate(
            userId,
            { profileImage: imagePath, updatedAt: new Date() },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        logger.info(`Profile image uploaded for user: ${userId}`);

        res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            data: {
                imagePath: imagePath
            }
        });

    } catch (error) {
        logger.error('Upload profile image error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload profile image',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
