const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const logger = require('../utils/logger');
const { sanitizeInput } = require('../utils/sanitizer');
const { validateEmail, validatePhone } = require('../utils/validators');
const { createSuccessResponse, createErrorResponse } = require("../utils/errorHandler");

// Get all donations (Admin only)
const getAllDonations = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 15, 
            status, 
            campaignId, 
            startDate, 
            endDate, 
            minAmount, 
            maxAmount,
            sortBy = 'donationDate',
            sortOrder = 'desc'
        } = req.query;

        // Build query
        let query = {};

        if (status) query.status = status;
        if (campaignId) query.campaignId = campaignId;
        if (startDate || endDate) {
            query.donationDate = {};
            if (startDate) query.donationDate.$gte = new Date(startDate);
            if (endDate) query.donationDate.$lte = new Date(endDate);
        }
        if (minAmount || maxAmount) {
            query.amount = {};
            if (minAmount) query.amount.$gte = parseInt(minAmount);
            if (maxAmount) query.amount.$lte = parseInt(maxAmount);
        }

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const donations = await Donation.find(query)
            .populate("donorId", "fullName email")
            .populate("companyId", "companyName")
            .populate({
                path: "campaignId",
                select: "campaignName title ngoId",
                populate: {
                    path: "ngoId",
                    select: "ngoName"
                }
            })
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);

        const total = await Donation.countDocuments(query);

        // Calculate summary statistics
        const summary = await Donation.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    totalDonations: { $sum: 1 },
                    completedAmount: {
                        $sum: { $cond: [{ $eq: ["$status", "Completed"] }, "$amount", 0] }
                    },
                    completedDonations: {
                        $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
                    }
                }
            }
        ]);

        return createSuccessResponse(res, 200, {
            message: "Donations retrieved successfully",
            donations,
            pagination: {
                current: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            },
            summary: summary[0] || {
                totalAmount: 0,
                totalDonations: 0,
                completedAmount: 0,
                completedDonations: 0
            }
        });

    } catch (error) {
        console.error("Get all donations error:", error);
        return createErrorResponse(res, 500, "Failed to retrieve donations", error.message);
    }
};

/**
 * Create a new donation
 */
const createDonation = async (req, res) => {
    try {
        const { 
            campaignId, 
            amount, 
            donorName, 
            donorEmail, 
            donorPhone, 
            anonymous = false,
            message = '',
            companyId,
            paymentMethod
        } = req.body;

        // Sanitize inputs
        const sanitizedData = {
            campaignId: sanitizeInput(campaignId),
            amount: parseFloat(amount),
            donorName: sanitizeInput(donorName),
            donorEmail: sanitizeInput(donorEmail).toLowerCase(),
            donorPhone: sanitizeInput(donorPhone),
            message: sanitizeInput(message),
            isAnonymous: Boolean(anonymous),
            companyId: sanitizeInput(companyId),
            paymentMethod: sanitizeInput(paymentMethod)
        };

        // Validate inputs
        if (!sanitizedData.campaignId || !sanitizedData.amount || !sanitizedData.donorName || !sanitizedData.donorEmail) {
            return res.status(400).json({
                success: false,
                message: 'Campaign ID, amount, donor name, and email are required'
            });
        }

        if (sanitizedData.amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Donation amount must be greater than 0'
            });
        }

        if (!validateEmail(sanitizedData.donorEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        if (sanitizedData.donorPhone && !validatePhone(sanitizedData.donorPhone)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format'
            });
        }

        const validPaymentMethods = ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet'];
        if (paymentMethod && !validPaymentMethods.includes(sanitizedData.paymentMethod)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid payment method'
            });
        }

        // Check if campaign exists and is active
        const campaign = await Campaign.findById(sanitizedData.campaignId);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        if (campaign.status !== 'active') {
            return res.status(400).json({
                success: false,
                message: 'Campaign is not active'
            });
        }

        if (new Date() > campaign.endDate) {
            return res.status(400).json({
                success: false,
                message: 'Campaign has ended'
            });
        }

        // Generate unique order ID
        const orderId = `DON_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        let donorId = req.user ? req.user.id : null;

        // For guest donations, create or find user account
        if (!donorId && sanitizedData.donorEmail) {
            let existingUser = await User.findOne({ email: sanitizedData.donorEmail });

            if (!existingUser) {
                // Create new donor account with default password
                const bcrypt = require('bcryptjs');
                const hashedPassword = await bcrypt.hash('Pass123', 12);

                existingUser = await User.create({
                    fullName: sanitizedData.donorName,
                    email: sanitizedData.donorEmail,
                    password: hashedPassword,
                    phoneNumber: sanitizedData.donorPhone || '0000000000',
                    role: 'donor',
                    isVerified: true,
                    approvalStatus: 'approved',
                    isActive: true
                });

                logger.info(`Auto-generated donor account for: ${sanitizedData.donorEmail}`);
            }

            donorId = existingUser._id;
        }

        // Create donation record
        const donation = await Donation.create({
            campaignId: sanitizedData.campaignId,
            donorId: donorId,
            amount: sanitizedData.amount,
            donorName: sanitizedData.donorName,
            donorEmail: sanitizedData.donorEmail,
            donorPhone: sanitizedData.donorPhone,
            message: sanitizedData.message,
            isAnonymous: sanitizedData.isAnonymous,
            paymentMethod: sanitizedData.paymentMethod,
            orderId: orderId,
            status: 'pending',
            createdAt: new Date()
        });

        // TODO: Integrate with payment gateway
        // For now, we'll mark the donation as completed
        // In production, this would be handled by payment gateway webhook
        donation.status = 'completed';
        donation.paymentId = `PAY_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        donation.paidAt = new Date();
        await donation.save();

        // Update campaign stats
        await Campaign.findByIdAndUpdate(sanitizedData.campaignId, {
            $inc: { 
                raisedAmount: sanitizedData.amount,
                donorCount: 1
            },
            updatedAt: new Date()
        });

        logger.info(`Donation created: ${donation._id} for campaign: ${sanitizedData.campaignId}`);

        res.status(201).json({
            success: true,
            message: 'Donation created successfully',
            data: {
                donation: {
                    id: donation._id,
                    orderId: donation.orderId,
                    amount: donation.amount,
                    status: donation.status,
                    paymentId: donation.paymentId,
                    createdAt: donation.createdAt
                }
            }
        });

    } catch (error) {
        logger.error('Create donation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create donation',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get donation by ID
 */
exports.getDonationById = async (req, res) => {
    try {
        const { id } = req.params;

        const donation = await Donation.findById(id)
            .populate('campaignId', 'title')
            .populate('donorId', 'fullName email');

        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        // Check if user is authorized to view this donation
        if (req.user && req.user.role !== 'admin') {
            if (req.user.id !== donation.donorId?.toString()) {
                // Check if user is campaign owner
                const campaign = await Campaign.findById(donation.campaignId);
                if (campaign.createdBy.toString() !== req.user.id) {
                    return res.status(403).json({
                        success: false,
                        message: 'You are not authorized to view this donation'
                    });
                }
            }
        }

        res.status(200).json({
            success: true,
            data: donation
        });

    } catch (error) {
        logger.error('Get donation by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donation',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get user's donations
 */
exports.getUserDonations = async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status;

        const searchQuery = { donorId: userId };
        if (status) {
            searchQuery.status = status;
        }

        const [donations, totalDonations] = await Promise.all([
            Donation.find(searchQuery)
                .populate('campaignId', 'title')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Donation.countDocuments(searchQuery)
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
 * Get campaign donations
 */
exports.getCampaignDonations = async (req, res) => {
    try {
        const { campaignId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // Check if campaign exists
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({
                success: false,
                message: 'Campaign not found'
            });
        }

        // Check if user is authorized to view campaign donations
        if (req.user && req.user.role !== 'admin' && campaign.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to view this campaign donations'
            });
        }

        const [donations, totalDonations] = await Promise.all([
            Donation.find({ campaignId, status: 'completed' })
                .populate('donorId', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Donation.countDocuments({ campaignId, status: 'completed' })
        ]);

        // Hide sensitive information for anonymous donations
        const sanitizedDonations = donations.map(donation => {
            const donationObj = donation.toObject();
            if (donation.isAnonymous) {
                donationObj.donorName = 'Anonymous';
                donationObj.donorEmail = 'anonymous@example.com';
                donationObj.donorPhone = null;
                donationObj.donorId = null;
            }
            return donationObj;
        });

        res.status(200).json({
            success: true,
            data: {
                donations: sanitizedDonations,
                pagination: {
                    page,
                    limit,
                    total: totalDonations,
                    pages: Math.ceil(totalDonations / limit)
                }
            }
        });

    } catch (error) {
        logger.error('Get campaign donations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch campaign donations',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get all donations (admin only)
 */
exports.getAllDonations = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const status = req.query.status;
        const search = req.query.search;

        const searchQuery = {};
        if (status) {
            searchQuery.status = status;
        }
        if (search) {
            searchQuery.$or = [
                { donorName: { $regex: search, $options: 'i' } },
                { donorEmail: { $regex: search, $options: 'i' } },
                { orderId: { $regex: search, $options: 'i' } }
            ];
        }

        const [donations, totalDonations] = await Promise.all([
            Donation.find(searchQuery)
                .populate('campaignId', 'title')
                .populate('donorId', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Donation.countDocuments(searchQuery)
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
        logger.error('Get all donations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donations',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update donation status (admin only)
 */
exports.updateDonationStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: `Status must be one of: ${validStatuses.join(', ')}`
            });
        }

        const donation = await Donation.findById(id);
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        const oldStatus = donation.status;
        donation.status = status;
        donation.updatedAt = new Date();

        if (status === 'completed' && oldStatus !== 'completed') {
            donation.paidAt = new Date();
            // Update campaign stats
            await Campaign.findByIdAndUpdate(donation.campaignId, {
                $inc: { 
                    raisedAmount: donation.amount,
                    donorCount: 1
                },
                updatedAt: new Date()
            });
        } else if (oldStatus === 'completed' && status !== 'completed') {
            // Reverse campaign stats
            await Campaign.findByIdAndUpdate(donation.campaignId, {
                $inc: { 
                    raisedAmount: -donation.amount,
                    donorCount: -1
                },
                updatedAt: new Date()
            });
        }

        await donation.save();

        logger.info(`Donation status updated: ${id} from ${oldStatus} to ${status}`);

        res.status(200).json({
            success: true,
            message: 'Donation status updated successfully',
            data: donation
        });

    } catch (error) {
        logger.error('Update donation status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update donation status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get donation statistics
 */
exports.getDonationStats = async (req, res) => {
    try {
        const { campaignId } = req.query;

        let matchQuery = { status: 'completed' };
        if (campaignId) {
            matchQuery.campaignId = campaignId;
        }

        const [
            totalStats,
            dailyStats,
            methodStats,
            topDonors
        ] = await Promise.all([
            Donation.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                        totalCount: { $sum: 1 },
                        averageAmount: { $avg: '$amount' },
                        maxAmount: { $max: '$amount' },
                        minAmount: { $min: '$amount' }
                    }
                }
            ]),

            Donation.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 },
                        amount: { $sum: '$amount' }
                    }
                },
                { $sort: { '_id': -1 } },
                { $limit: 30 }
            ]),

            Donation.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: '$paymentMethod',
                        count: { $sum: 1 },
                        amount: { $sum: '$amount' }
                    }
                },
                { $sort: { amount: -1 } }
            ]),

            Donation.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: '$donorEmail',
                        totalAmount: { $sum: '$amount' },
                        count: { $sum: 1 },
                        donorName: { $first: '$donorName' }
                    }
                },
                { $sort: { totalAmount: -1 } },
                { $limit: 10 }
            ])
        ]);

        const stats = {
            overview: totalStats[0] || {
                totalAmount: 0,
                totalCount: 0,
                averageAmount: 0,
                maxAmount: 0,
                minAmount: 0
            },
            dailyStats: dailyStats.reverse(),
            paymentMethods: methodStats,
            topDonors: topDonors.map(donor => ({
                email: donor._id,
                name: donor.donorName,
                totalAmount: donor.totalAmount,
                count: donor.count
            }))
        };

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        logger.error('Get donation stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch donation statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    createDonation,
    getDonationById,
    getUserDonations,
    getCampaignDonations,
    getAllDonations,
    updateDonationStatus,
    getDonationStats
};