const Campaign = require('../../models/Campaign');
const Donation = require('../../models/Donation');
const NGO = require('../../models/NGO');
const logger = require('../../utils/logger');

/**
 * Get NGO dashboard analytics
 */
exports.getNGOAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        logger.info(`NGO analytics requested by user: ${userId}`);

        // Get NGO profile
        const ngo = await NGO.findOne({ userId });
        if (!ngo) {
            return res.status(404).json({
                success: false,
                message: 'NGO profile not found'
            });
        }

        // Run all queries in parallel for better performance
        const [
            totalDonationsResult,
            activeCampaignsCount,
            totalCampaignsCount,
            completedCampaignsCount,
            topCampaigns,
            recentDonations,
            monthlyDonations
        ] = await Promise.all([
            // Total donations received by this NGO
            Donation.aggregate([
                { 
                    $lookup: {
                        from: 'campaigns',
                        localField: 'campaignId',
                        foreignField: '_id',
                        as: 'campaign'
                    }
                },
                { $unwind: '$campaign' },
                { $match: { 'campaign.createdBy': userId, status: 'completed' } },
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]),
            
            // Active campaigns count
            Campaign.countDocuments({ createdBy: userId, status: 'active' }),
            
            // Total campaigns count
            Campaign.countDocuments({ createdBy: userId }),
            
            // Completed campaigns count
            Campaign.countDocuments({ createdBy: userId, status: 'completed' }),
            
            // Top performing campaigns
            Campaign.find({ createdBy: userId })
                .sort({ raisedAmount: -1 })
                .limit(5)
                .select('title goalAmount raisedAmount status createdAt'),
            
            // Recent donations
            Donation.aggregate([
                { 
                    $lookup: {
                        from: 'campaigns',
                        localField: 'campaignId',
                        foreignField: '_id',
                        as: 'campaign'
                    }
                },
                { $unwind: '$campaign' },
                { $match: { 'campaign.createdBy': userId, status: 'completed' } },
                { $sort: { createdAt: -1 } },
                { $limit: 10 },
                {
                    $project: {
                        amount: 1,
                        donorName: 1,
                        donorEmail: 1,
                        createdAt: 1,
                        campaignTitle: '$campaign.title'
                    }
                }
            ]),
            
            // Monthly donations for the last 12 months
            Donation.aggregate([
                { 
                    $lookup: {
                        from: 'campaigns',
                        localField: 'campaignId',
                        foreignField: '_id',
                        as: 'campaign'
                    }
                },
                { $unwind: '$campaign' },
                { 
                    $match: { 
                        'campaign.createdBy': userId,
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

        // Process and format the data
        const analytics = {
            overview: {
                totalDonations: totalDonationsResult[0]?.total || 0,
                activeCampaigns: activeCampaignsCount,
                totalCampaigns: totalCampaignsCount,
                completedCampaigns: completedCampaignsCount
            },
            topCampaigns: topCampaigns.map(campaign => ({
                id: campaign._id,
                title: campaign.title,
                goalAmount: campaign.goalAmount,
                raisedAmount: campaign.raisedAmount,
                progress: ((campaign.raisedAmount / campaign.goalAmount) * 100).toFixed(2),
                status: campaign.status,
                createdAt: campaign.createdAt
            })),
            recentDonations: recentDonations.map(donation => ({
                id: donation._id,
                amount: donation.amount,
                donorName: donation.donorName,
                donorEmail: donation.donorEmail,
                campaign: donation.campaignTitle,
                date: donation.createdAt
            })),
            monthlyDonations: monthlyDonations.map(month => ({
                year: month._id.year,
                month: month._id.month,
                total: month.total,
                count: month.count
            })),
            ngoProfile: {
                name: ngo.ngoName,
                email: ngo.email,
                registrationNumber: ngo.registrationNumber,
                isActive: ngo.isActive,
                is80GCertified: ngo.is80GCertified,
                is12ACertified: ngo.is12ACertified
            }
        };

        res.status(200).json({
            success: true,
            data: analytics,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error("Error fetching NGO analytics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch NGO dashboard analytics",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get NGO campaigns
 */
exports.getNGOCampaigns = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status || '';

        const searchQuery = { createdBy: userId };
        if (status) {
            searchQuery.status = status;
        }

        const [campaigns, totalCampaigns] = await Promise.all([
            Campaign.find(searchQuery)
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
        logger.error("Error fetching NGO campaigns:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch NGO campaigns",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get NGO donation history
 */
exports.getNGODonations = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [donations, totalDonations] = await Promise.all([
            Donation.aggregate([
                { 
                    $lookup: {
                        from: 'campaigns',
                        localField: 'campaignId',
                        foreignField: '_id',
                        as: 'campaign'
                    }
                },
                { $unwind: '$campaign' },
                { $match: { 'campaign.createdBy': userId } },
                { $sort: { createdAt: -1 } },
                { $skip: skip },
                { $limit: limit },
                {
                    $project: {
                        amount: 1,
                        donorName: 1,
                        donorEmail: 1,
                        donorPhone: 1,
                        status: 1,
                        paymentMethod: 1,
                        createdAt: 1,
                        campaignTitle: '$campaign.title',
                        campaignId: '$campaign._id'
                    }
                }
            ]),
            
            Donation.aggregate([
                { 
                    $lookup: {
                        from: 'campaigns',
                        localField: 'campaignId',
                        foreignField: '_id',
                        as: 'campaign'
                    }
                },
                { $unwind: '$campaign' },
                { $match: { 'campaign.createdBy': userId } },
                { $count: 'total' }
            ])
        ]);

        res.status(200).json({
            success: true,
            data: {
                donations,
                pagination: {
                    page,
                    limit,
                    total: totalDonations[0]?.total || 0,
                    pages: Math.ceil((totalDonations[0]?.total || 0) / limit)
                }
            }
        });

    } catch (error) {
        logger.error("Error fetching NGO donations:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch NGO donations",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update NGO profile
 */
exports.updateNGOProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        // Remove fields that shouldn't be updated directly
        delete updates.userId;
        delete updates.createdAt;
        delete updates.updatedAt;

        const ngo = await NGO.findOneAndUpdate(
            { userId },
            { ...updates, updatedAt: new Date() },
            { new: true }
        );

        if (!ngo) {
            return res.status(404).json({
                success: false,
                message: 'NGO profile not found'
            });
        }

        logger.info(`NGO profile updated for user: ${userId}`);

        res.status(200).json({
            success: true,
            message: 'NGO profile updated successfully',
            data: ngo
        });

    } catch (error) {
        logger.error("Error updating NGO profile:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update NGO profile",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
