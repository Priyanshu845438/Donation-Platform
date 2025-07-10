const Company = require('../models/Company');
const User = require('../models/User');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const logger = require('../utils/logger');
const { sanitizeInput } = require('../utils/sanitizer');
const { validateEmail, validatePhone, validateUrl } = require('../utils/validators');

/**
 * Get company profile
 */
exports.getCompanyProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const company = await Company.findOne({ userId }).populate('userId', 'fullName email phoneNumber');
        
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company profile not found'
            });
        }

        res.status(200).json({
            success: true,
            data: company
        });

    } catch (error) {
        logger.error('Get company profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch company profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update company profile
 */
exports.updateCompanyProfile = async (req, res) => {
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
                } else {
                    sanitizedUpdates[key] = updates[key];
                }
            }
        }

        // Validate inputs
        if (sanitizedUpdates.companyEmail && !validateEmail(sanitizedUpdates.companyEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid company email format'
            });
        }

        if (sanitizedUpdates.companyPhoneNumber && !validatePhone(sanitizedUpdates.companyPhoneNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid company phone number format'
            });
        }

        if (sanitizedUpdates.ceoContactNumber && !validatePhone(sanitizedUpdates.ceoContactNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid CEO contact number format'
            });
        }

        if (sanitizedUpdates.ceoEmail && !validateEmail(sanitizedUpdates.ceoEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid CEO email format'
            });
        }

        if (sanitizedUpdates.website && !validateUrl(sanitizedUpdates.website)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid website URL format'
            });
        }

        if (sanitizedUpdates.numberOfEmployees && (sanitizedUpdates.numberOfEmployees < 1 || sanitizedUpdates.numberOfEmployees > 1000000)) {
            return res.status(400).json({
                success: false,
                message: 'Number of employees must be between 1 and 1,000,000'
            });
        }

        const validCompanyTypes = ['IT', 'Manufacturing', 'Healthcare', 'Education', 'Finance', 'Retail', 'Construction', 'Agriculture', 'Other'];
        if (sanitizedUpdates.companyType && !validCompanyTypes.includes(sanitizedUpdates.companyType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid company type'
            });
        }

        const company = await Company.findOneAndUpdate(
            { userId },
            { ...sanitizedUpdates, updatedAt: new Date() },
            { new: true }
        ).populate('userId', 'fullName email phoneNumber');

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company profile not found'
            });
        }

        logger.info(`Company profile updated for user: ${userId}`);

        res.status(200).json({
            success: true,
            message: 'Company profile updated successfully',
            data: company
        });

    } catch (error) {
        logger.error('Update company profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update company profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get company dashboard analytics
 */
exports.getCompanyDashboard = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get company profile
        const company = await Company.findOne({ userId });
        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company profile not found'
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
            // Total donations made by this company
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
            company: {
                name: company.companyName,
                email: company.companyEmail,
                type: company.companyType,
                employees: company.numberOfEmployees,
                isActive: company.isActive
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
        logger.error('Get company dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch company dashboard',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get company donation history
 */
exports.getCompanyDonations = async (req, res) => {
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
        logger.error('Get company donations error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch company donations',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get all companies (for admin or public listing)
 */
exports.getCompanies = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        const searchQuery = { isActive: true };
        if (search) {
            searchQuery.$or = [
                { companyName: { $regex: search, $options: 'i' } },
                { companyEmail: { $regex: search, $options: 'i' } },
                { companyType: { $regex: search, $options: 'i' } }
            ];
        }

        const [companies, totalCompanies] = await Promise.all([
            Company.find(searchQuery)
                .populate('userId', 'fullName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('-registrationNumber -ceoContactNumber -ceoEmail'), // Hide sensitive info
            Company.countDocuments(searchQuery)
        ]);

        res.status(200).json({
            success: true,
            data: {
                companies,
                pagination: {
                    page,
                    limit,
                    total: totalCompanies,
                    pages: Math.ceil(totalCompanies / limit)
                }
            }
        });

    } catch (error) {
        logger.error('Get companies error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch companies',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get company by ID
 */
exports.getCompanyById = async (req, res) => {
    try {
        const { id } = req.params;

        const company = await Company.findById(id)
            .populate('userId', 'fullName email')
            .select('-registrationNumber -ceoContactNumber -ceoEmail'); // Hide sensitive info

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        if (!company.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Company not found'
            });
        }

        res.status(200).json({
            success: true,
            data: company
        });

    } catch (error) {
        logger.error('Get company by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch company',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Upload company logo
 */
exports.uploadCompanyLogo = async (req, res) => {
    try {
        const userId = req.user.id;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No file uploaded'
            });
        }

        const logoPath = `/uploads/company/${req.file.filename}`;

        const company = await Company.findOneAndUpdate(
            { userId },
            { companyLogo: logoPath, updatedAt: new Date() },
            { new: true }
        );

        if (!company) {
            return res.status(404).json({
                success: false,
                message: 'Company profile not found'
            });
        }

        logger.info(`Company logo uploaded for user: ${userId}`);

        res.status(200).json({
            success: true,
            message: 'Company logo uploaded successfully',
            data: {
                logoPath: logoPath
            }
        });

    } catch (error) {
        logger.error('Upload company logo error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to upload company logo',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
