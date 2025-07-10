const Campaign = require('../models/Campaign');
const User = require('../models/User');
const Donation = require('../models/Donation');
const logger = require('../utils/logger');
const { sanitizeInput } = require('../utils/sanitizer');
const { validateUrl } = require('../utils/validators');

/**
 * Create new campaign
 */
exports.createCampaign = async (req, res) => {
    try {
        const userId = req.user.id;
        const {
            title,
            description,
            goalAmount,
            category,
            endDate,
            tags,
            images,
            documents
        } = req.body;

        // Sanitize inputs
        const sanitizedData = {
            title: sanitizeInput(title),
            description: sanitizeInput(description),
            category: sanitizeInput(category),
            tags: tags ? tags.map(tag => sanitizeInput(tag)) : [],
            goalAmount: parseFloat(goalAmount),
            endDate: new Date(endDate)
        };

        // Validate inputs
        if (!sanitizedData.title || !sanitizedData.description || !sanitizedData.goalAmount || !sanitizedData.category) {
            return res.status(400).json({
                success: false,
                message: 'Title, description, goal amount, and category are required'
            });
        }

        if (sanitizedData.goalAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Goal amount must be greater than 0'
            });
        }

        if (sanitizedData.endDate <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'End date must be in the future'
            });
        }

        const validCategories = ['education', 'healthcare', 'environment', 'poverty', 'disaster-relief', 'animal-welfare', 'other'];
        if (!validCategories.includes(sanitizedData.category)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid category'
            });
        }

        // Create campaign
        const campaign = await Campaign.create({
            title: sanitizedData.title,
            description: sanitizedData.description,
            goalAmount: sanitizedData.goalAmount,
            category: sanitizedData.category,
            endDate: sanitizedData.endDate,
            tags: sanitizedData.tags,
            images: images || [],
            documents: documents || [],
            createdBy: userId,
            status: 'active',
            raisedAmount: 0,
            donorCount: 0
        });

        logger.info(`Campaign created: ${campaign._id} by user: ${userId}`);

        res.status(201).json({
            success: true,
            message: 'Campaign created successfully',
            data: campaign
        });

    } catch (error) {
        logger.error('Create campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create campaign',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get all campaigns with filtering and pagination
 */
exports.getCampaigns = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        
        const category = req.query.category;
        const search = req.query.search;
        const status = req.query.status || 'active';
        const sortBy = req.query.sortBy || 'createdAt';
        const sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

        // Build search query
        const searchQuery = {};
        
        if (status) {
            searchQuery.status = status;
        }
        
        if (category) {
            searchQuery.category = category;
        }
        
        if (search) {
            searchQuery.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        // Only show campaigns that haven't ended
        if (status === 'active') {
            searchQuery.endDate = { $gt: new Date() };
        }

        const [campaigns, totalCampaigns] = await Promise.all([
            Campaign.find(searchQuery)
                .populate('createdBy', 'fullName email')
                .sort({ [sortBy]: sortOrder })
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
        logger.error('Get campaigns error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaigns',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get campaign by ID
 */
exports.getCampaignById = async (req, res) => {
    try {
        const { id } = req.params;

        const campaign = await Campaign.findById(id)
            .populate('createdBy', 'fullName email phoneNumber')
            .populate({
                path: 'comments',
                populate: {
                    path: 'userId',
                    select: 'fullName'
                }
            });

        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Get recent donations for this campaign
        const recentDonations = await Donation.find({ 
            campaignId: id, 
            status: 'completed' 
        })
            .sort({ createdAt: -1 })
            .limit(10)
            .select('amount donorName createdAt');

        res.status(200).json({
            success: true,
            data: {
                campaign,
                recentDonations
            }
        });

    } catch (error) {
        logger.error('Get campaign by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaign',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update campaign
 */
exports.updateCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updates = req.body;

        // Remove fields that shouldn't be updated
        delete updates.createdBy;
        delete updates.raisedAmount;
        delete updates.donorCount;
        delete updates.createdAt;
        delete updates.updatedAt;

        // Find campaign and check ownership
        const campaign = await Campaign.findById(id);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Check if user owns the campaign or is admin
        if (campaign.createdBy.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to update this campaign'
            });
        }

        // Sanitize updates
        const sanitizedUpdates = {};
        for (const key in updates) {
            if (updates[key] !== undefined && updates[key] !== null) {
                if (typeof updates[key] === 'string') {
                    sanitizedUpdates[key] = sanitizeInput(updates[key]);
                } else {
                    sanitizedUpdates[key] = updates[key];
                }
            }
        }

        // Validate goal amount if provided
        if (sanitizedUpdates.goalAmount && sanitizedUpdates.goalAmount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Goal amount must be greater than 0'
            });
        }

        // Validate end date if provided
        if (sanitizedUpdates.endDate && new Date(sanitizedUpdates.endDate) <= new Date()) {
            return res.status(400).json({
                success: false,
                message: 'End date must be in the future'
            });
        }

        const updatedCampaign = await Campaign.findByIdAndUpdate(
            id,
            { ...sanitizedUpdates, updatedAt: new Date() },
            { new: true }
        ).populate('createdBy', 'fullName email');

        logger.info(`Campaign updated: ${id} by user: ${userId}`);

        res.status(200).json({
            success: true,
            message: 'Campaign updated successfully',
            data: updatedCampaign
        });

    } catch (error) {
        logger.error('Update campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update campaign',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Delete campaign
 */
exports.deleteCampaign = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Find campaign and check ownership
        const campaign = await Campaign.findById(id);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Check if user owns the campaign or is admin
        if (campaign.createdBy.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this campaign'
            });
        }

        // Check if campaign has donations
        const donationCount = await Donation.countDocuments({ campaignId: id });
        if (donationCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete campaign that has received donations'
            });
        }

        await Campaign.findByIdAndDelete(id);

        logger.info(`Campaign deleted: ${id} by user: ${userId}`);

        res.status(200).json({
            success: true,
            message: 'Campaign deleted successfully'
        });

    } catch (error) {
        logger.error('Delete campaign error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete campaign',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get user's campaigns
 */
exports.getUserCampaigns = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status;

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
        logger.error('Get user campaigns error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user campaigns',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get campaign statistics
 */
exports.getCampaignStats = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        // Find campaign and check ownership
        const campaign = await Campaign.findById(id);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Check if user owns the campaign or is admin
        if (campaign.createdBy.toString() !== userId && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this campaign statistics'
            });
        }

        // Get donation statistics
        const [
            totalDonations,
            donationsByDay,
            topDonors,
            averageDonation
        ] = await Promise.all([
            Donation.countDocuments({ campaignId: id, status: 'completed' }),
            
            Donation.aggregate([
                { $match: { campaignId: campaign._id, status: 'completed' } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 },
                        amount: { $sum: '$amount' }
                    }
                },
                { $sort: { '_id': 1 } }
            ]),
            
            Donation.aggregate([
                { $match: { campaignId: campaign._id, status: 'completed' } },
                { $group: { _id: '$donorEmail', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
                { $sort: { totalAmount: -1 } },
                { $limit: 10 }
            ]),
            
            Donation.aggregate([
                { $match: { campaignId: campaign._id, status: 'completed' } },
                { $group: { _id: null, average: { $avg: '$amount' } } }
            ])
        ]);

        const stats = {
            campaign: {
                id: campaign._id,
                title: campaign.title,
                goalAmount: campaign.goalAmount,
                raisedAmount: campaign.raisedAmount,
                donorCount: campaign.donorCount,
                progress: ((campaign.raisedAmount / campaign.goalAmount) * 100).toFixed(2),
                status: campaign.status,
                createdAt: campaign.createdAt,
                endDate: campaign.endDate
            },
            donations: {
                total: totalDonations,
                average: averageDonation[0]?.average || 0,
                byDay: donationsByDay,
                topDonors: topDonors.map(donor => ({
                    email: donor._id,
                    amount: donor.totalAmount,
                    count: donor.count
                }))
            }
        };

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        logger.error('Get campaign stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaign statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
