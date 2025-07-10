const NGO = require('../models/NGO');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const logger = require('../utils/logger');
const { sanitizeInput } = require('../utils/sanitizer');
const { validateEmail, validatePhone, validateUrl } = require('../utils/validators');

/**
 * Get NGO profile
 */
exports.getNGOProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const ngo = await NGO.findOne({ userId }).populate('userId', 'fullName email phoneNumber');
        
        if (!ngo) {
            return res.status(404).json({
                success: false,
                message: 'NGO profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: ngo
        });

    } catch (error) {
        logger.error('Get NGO profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch NGO profile',
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

        // Remove fields that shouldn't be updated
        delete updates.userId;
        delete updates.createdAt;
        delete updates.updatedAt;

        // Sanitize inputs
        const sanitizedUpdates = {};
        for (const key in updates) {
            if (updates[key] !== undefined && updates[key] !== null) {
                if (typeof updates[key] === 'string') {
                    sanitizedUpdates[key] = sanitizeInput(updates[key]);
                } else if (typeof updates[key] === 'object' && !Array.isArray(updates[key])) {
                    // Handle nested objects like bankDetails, authorizedPerson
                    sanitizedUpdates[key] = {};
                    for (const nestedKey in updates[key]) {
                        if (typeof updates[key][nestedKey] === 'string') {
                            sanitizedUpdates[key][nestedKey] = sanitizeInput(updates[key][nestedKey]);
                        } else {
                            sanitizedUpdates[key][nestedKey] = updates[key][nestedKey];
                        }
                    }
                } else {
                    sanitizedUpdates[key] = updates[key];
                }
            }
        }

        // Validate inputs
        if (sanitizedUpdates.email && !validateEmail(sanitizedUpdates.email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        if (sanitizedUpdates.contactNumber && !validatePhone(sanitizedUpdates.contactNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid contact number format'
            });
        }

        if (sanitizedUpdates.website && !validateUrl(sanitizedUpdates.website)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid website URL format'
            });
        }

        if (sanitizedUpdates.authorizedPerson?.email && !validateEmail(sanitizedUpdates.authorizedPerson.email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid authorized person email format'
            });
        }

        if (sanitizedUpdates.authorizedPerson?.phone && !validatePhone(sanitizedUpdates.authorizedPerson.phone)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid authorized person phone format'
            });
        }

        if (sanitizedUpdates.numberOfEmployees && (sanitizedUpdates.numberOfEmployees < 1 || sanitizedUpdates.numberOfEmployees > 100000)) {
            return res.status(400).json({
                success: false,
                message: 'Number of employees must be between 1 and 100,000'
            });
        }

        const validNGOTypes = ['Trust', 'Society', 'Section 8 Company', 'Other'];
        if (sanitizedUpdates.ngoType && !validNGOTypes.includes(sanitizedUpdates.ngoType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid NGO type'
            });
        }

        const ngo = await NGO.findOneAndUpdate(
            { userId },
            { ...sanitizedUpdates, updatedAt: new Date() },
            { new: true }
        ).populate('userId', 'fullName email phoneNumber');

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
        logger.error('Update NGO profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update NGO profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get NGO dashboard analytics
 */
exports.getNGODashboard = async (req, res) => {
    try {
        const userId = req.user.id;

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
            ngo: {
                name: ngo.ngoName,
                email: ngo.email,
                registrationNumber: ngo.registrationNumber,
                isActive: ngo.isActive,
                is80GCertified: ngo.is80GCertified,
                is12ACertified: ngo.is12ACertified
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
            }))
        };

        res.status(200).json({
            success: true,
            data: analytics,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Get NGO dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch NGO dashboard',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get all NGOs (for public listing)
 */
exports.getNGOs = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        const searchQuery = { isActive: true };
        if (search) {
            searchQuery.$or = [
                { ngoName: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } },
                { ngoType: { $regex: search, $options: 'i' } }
            ];
        }

        const [ngos, totalNGOs] = await Promise.all([
            NGO.find(searchQuery)
                .populate('userId', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-panNumber -tanNumber -gstNumber -bankDetails'), // Hide sensitive info
            NGO.countDocuments(searchQuery)
        ]);

        res.status(200).json({
            success: true,
            data: {
                ngos,
                pagination: {
                    page,
                    limit,
                    total: totalNGOs,
                    pages: Math.ceil(totalNGOs / limit)
                }
            }
        });

    } catch (error) {
        logger.error('Get NGOs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch NGOs',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get NGO by ID
 */
exports.getNGOById = async (req, res) => {
    try {
        const { id } = req.params;

        const ngo = await NGO.findById(id)
            .populate('userId', 'fullName email')
            .select('-panNumber -tanNumber -gstNumber -bankDetails'); // Hide sensitive info

        if (!ngo) {
            return res.status(404).json({
                success: false,
                message: 'NGO not found'
            });
        }

        if (!ngo.isActive) {
            return res.status(404).json({
                success: false,
                message: 'NGO not found'
            });
        }

        res.status(200).json({
            success: true,
            data: ngo
        });

    } catch (error) {
        logger.error('Get NGO by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch NGO',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Upload NGO logo
 */
exports.uploadNGOLogo = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const logoPath = `/uploads/ngo/${req.file.filename}`;

        const ngo = await NGO.findOneAndUpdate(
            { userId },
            { logo: logoPath, updatedAt: new Date() },
            { new: true }
        );

        if (!ngo) {
            return res.status(404).json({
                success: false,
                message: 'NGO profile not found'
            });
        }

        logger.info(`NGO logo uploaded for user: ${userId}`);

        res.status(200).json({
            success: true,
            message: 'NGO logo uploaded successfully',
            data: {
                logoPath: logoPath
            }
        });

    } catch (error) {
        logger.error('Upload NGO logo error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload NGO logo',
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
        logger.error('Get NGO donations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch NGO donations',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
