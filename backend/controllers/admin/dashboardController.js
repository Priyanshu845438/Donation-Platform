const Campaign = require('../../models/Campaign');
const Donation = require('../../models/Donation');
const User = require('../../models/User');
const Company = require('../../models/Company');
const NGO = require('../../models/NGO');
const logger = require('../../utils/logger');

/**
 * Get comprehensive analytics for admin dashboard
 */
exports.getAnalytics = async (req, res) => {
    try {
        logger.info('Admin analytics requested');

        // Run all queries in parallel for better performance
        const [
            totalDonationsResult,
            activeCampaignsCount,
            totalUsersCount,
            totalCompaniesCount,
            totalNGOsCount,
            topDonors,
            recentDonations,
            campaignStats,
            monthlyDonations
        ] = await Promise.all([
            // Total donations amount
            Donation.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),

            // Active campaigns count
            Campaign.countDocuments({ status: 'active' }),

            // Total users count
            User.countDocuments(),

            // Total companies count
            Company.countDocuments(),

            // Total NGOs count
            NGO.countDocuments(),

            // Top donors by total donation amount
            Donation.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: "$donorEmail", totalDonated: { $sum: "$amount" }, donationCount: { $sum: 1 } } },
                { $sort: { totalDonated: -1 } },
                { $limit: 10 }
            ]),

            // Recent donations
            Donation.find({ status: 'completed' })
                .populate('campaignId', 'title')
                .sort({ createdAt: -1 })
                .limit(10)
                .select('amount donorName donorEmail campaignId createdAt'),

            // Campaign statistics
            Campaign.aggregate([
                {
                    $group: {
                        _id: "$status",
                        count: { $sum: 1 },
                        totalGoal: { $sum: "$goalAmount" },
                        totalRaised: { $sum: "$raisedAmount" }
                    }
                }
            ]),

            // Monthly donations for the last 12 months
            Donation.aggregate([
                { $match: { status: 'completed', createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) } } },
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

        // Process and format the data
        const analytics = {
            overview: {
                totalDonations: totalDonationsResult[0]?.total || 0,
                activeCampaigns: activeCampaignsCount,
                totalUsers: totalUsersCount,
                totalCompanies: totalCompaniesCount,
                totalNGOs: totalNGOsCount
            },
            topDonors: topDonors.map(donor => ({
                email: donor._id,
                totalDonated: donor.totalDonated,
                donationCount: donor.donationCount
            })),
            recentDonations: recentDonations.map(donation => ({
                id: donation._id,
                amount: donation.amount,
                donorName: donation.donorName,
                donorEmail: donation.donorEmail,
                campaign: donation.campaignId?.title || 'Unknown Campaign',
                date: donation.createdAt
            })),
            campaignStats: campaignStats.reduce((acc, stat) => {
                acc[stat._id] = {
                    count: stat.count,
                    totalGoal: stat.totalGoal,
                    totalRaised: stat.totalRaised
                };
                return acc;
            }, {}),
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
        logger.error("Error fetching admin analytics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch dashboard analytics",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get user management data
 */
exports.getUserManagement = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';
        const role = req.query.role || '';

        // Build search query
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
        logger.error("Error fetching user management data:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user management data",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get campaign management data
 */
exports.getCampaignManagement = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status || '';

        const searchQuery = {};
        if (status) {
            searchQuery.status = status;
        }

        const [campaigns, totalCampaigns] = await Promise.all([
            Campaign.find(searchQuery)
                .populate('createdBy', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Campaign.countDocuments(searchQuery)
        ]);

        res.status(200).json({
            success: true,
            data: {
                campaigns,
                pagination: {
                    page,
                    limit,
                    total: totalCampaigns,
                    pages: Math.ceil(totalCampaigns / limit)
                }
            }
        });

    } catch (error) {
        logger.error("Error fetching campaign management data:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch campaign management data",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update user status (activate/deactivate)
 */
exports.updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({
                success: false,
                message: 'isActive must be a boolean value'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { isActive },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        logger.info(`User ${userId} status updated to ${isActive ? 'active' : 'inactive'}`);

        res.status(200).json({
            success: true,
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            data: user
        });

    } catch (error) {
        logger.error("Error updating user status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update user status",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update campaign status
 */
exports.updateCampaignStatus = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const { status, reason } = req.body;

        // Handle different request types
        if (req.method === 'DELETE') {
            // Delete campaign
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                return res.status(404).json({
                    success: false,
                    message: 'Campaign not found'
                });
            }

            await Campaign.findByIdAndDelete(campaignId);
            logger.info(`Campaign ${campaignId} deleted by admin`);

            return res.status(200).json({
                success: true,
                message: 'Campaign deleted successfully'
            });
        }

        // Update campaign details or status
        if (req.url.includes('/status')) {
            const allowedStatuses = ['active', 'inactive', 'completed', 'suspended', 'pending', 'rejected'];
            if (!allowedStatuses.includes(status)) {
                return res.status(400).json({
                    success: false,
                    message: `Status must be one of: ${allowedStatuses.join(', ')}`
                });
            }

            const campaign = await Campaign.findByIdAndUpdate(
                campaignId,
                { status, reason },
                { new: true }
            ).populate('createdBy', 'fullName email');

            if (!campaign) {
                return res.status(404).json({
                    success: false,
                    message: 'Campaign not found'
                });
            }

            logger.info(`Campaign ${campaignId} status updated to ${status}`);

            return res.status(200).json({
                success: true,
                message: `Campaign status updated to ${status}`,
                data: campaign
            });
        } else {
            // Update campaign details
            const { title, description, goal } = req.body;
            const updateData = {};
            
            if (title) updateData.title = title;
            if (description) updateData.description = description;
            if (goal) updateData.goalAmount = goal;

            const campaign = await Campaign.findByIdAndUpdate(
                campaignId,
                updateData,
                { new: true }
            ).populate('createdBy', 'fullName email');

            if (!campaign) {
                return res.status(404).json({
                    success: false,
                    message: 'Campaign not found'
                });
            }

            logger.info(`Campaign ${campaignId} updated by admin`);

            return res.status(200).json({
                success: true,
                message: 'Campaign updated successfully',
                data: campaign
            });
        }

    } catch (error) {
        logger.error("Error updating campaign:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update campaign",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Enhanced user management with individual user operations
 */
exports.getUserById = async (req, res) => {
    try {
        const { userId } = req.params;
        
        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {
        logger.error("Error fetching user:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch user",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update user profile
 */
exports.updateUserProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullName, phoneNumber } = req.body;

        const user = await User.findByIdAndUpdate(
            userId,
            { fullName, phoneNumber },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        logger.info(`User ${userId} profile updated by admin`);

        res.status(200).json({
            success: true,
            message: 'User profile updated successfully',
            data: user
        });

    } catch (error) {
        logger.error("Error updating user profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update user profile",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete user
 */
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        await User.findByIdAndDelete(userId);

        logger.info(`User ${userId} deleted by admin`);

        res.status(200).json({
            success: true,
            message: 'User deleted successfully'
        });

    } catch (error) {
        logger.error("Error deleting user:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete user",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
const getAnalytics = async (req, res) => {
    try {
        // Get user statistics
        const totalUsers = await User.countDocuments() || 0;
        const activeUsers = await User.countDocuments({ isActive: true }) || 0;
        const newUsersThisMonth = await User.countDocuments({
            createdAt: { $gte: new Date(new Date().setDate(1)) }
        }) || 0;

        // Get campaign statistics
        const totalCampaigns = await Campaign.countDocuments() || 0;
        const activeCampaigns = await Campaign.countDocuments({ status: 'active' }) || 0;
        const completedCampaigns = await Campaign.countDocuments({ status: 'completed' }) || 0;

        // Get donation statistics
        const totalDonations = await Donation.countDocuments() || 0;
        const totalDonationAmount = await Donation.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        const donationAmount = totalDonationAmount[0]?.total || 0;

        // Ensure all values are numbers
        const analytics = {
            users: {
                total: Number(totalUsers),
                active: Number(activeUsers),
                newThisMonth: Number(newUsersThisMonth)
            },
            campaigns: {
                total: Number(totalCampaigns),
                active: Number(activeCampaigns),
                completed: Number(completedCampaigns)
            },
            donations: {
                total: Number(totalDonations),
                amount: Number(donationAmount)
            }
        };

        console.log('Analytics data:', analytics); // Debug log
        res.status(200).json(analytics);
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ 
            message: "Error fetching analytics",
            error: error.message,
            // Return default structure on error
            users: { total: 0, active: 0, newThisMonth: 0 },
            campaigns: { total: 0, active: 0, completed: 0 },
            donations: { total: 0, amount: 0 }
        });
    }
};