
const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Campaign = require('../../models/Campaign');
const Donation = require('../../models/Donation');
const NGO = require('../../models/NGO');
const User = require('../../models/User');
const { createSuccessResponse, createErrorResponse } = require('../../utils/errorHandler');

// Get donor dashboard stats
router.get('/dashboard', auth, async (req, res) => {
    try {
        const userId = req.user.id;

        const [
            totalDonations,
            totalAmount,
            recentDonations,
            supportedCampaigns,
            supportedNgos
        ] = await Promise.all([
            Donation.countDocuments({ donorId: userId, status: 'completed' }),
            Donation.aggregate([
                { $match: { donorId: userId, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Donation.find({ donorId: userId })
                .populate('campaignId', 'title')
                .sort({ createdAt: -1 })
                .limit(5),
            Donation.distinct('campaignId', { donorId: userId, status: 'completed' }),
            Donation.aggregate([
                { $match: { donorId: userId, status: 'completed' } },
                { $lookup: { from: 'campaigns', localField: 'campaignId', foreignField: '_id', as: 'campaign' } },
                { $unwind: '$campaign' },
                { $group: { _id: '$campaign.ngoId' } },
                { $count: 'total' }
            ])
        ]);

        const stats = {
            totalDonations,
            totalAmount: totalAmount[0]?.total || 0,
            supportedCampaigns: supportedCampaigns.length,
            supportedNgos: supportedNgos[0]?.total || 0,
            recentDonations
        };

        createSuccessResponse(res, 200, { stats });
    } catch (error) {
        createErrorResponse(res, 500, 'Failed to fetch dashboard stats', error.message);
    }
});

// Get donor's donations
router.get('/donations', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const [donations, total] = await Promise.all([
            Donation.find({ donorId: userId })
                .populate('campaignId', 'title ngoId')
                .populate({
                    path: 'campaignId',
                    populate: {
                        path: 'ngoId',
                        select: 'organizationName'
                    }
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Donation.countDocuments({ donorId: userId })
        ]);

        createSuccessResponse(res, 200, {
            donations,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        createErrorResponse(res, 500, 'Failed to fetch donations', error.message);
    }
});

// Get available campaigns for donor
router.get('/campaigns', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const search = req.query.search;
        const category = req.query.category;

        let query = { status: 'active', endDate: { $gte: new Date() } };
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }
        
        if (category) {
            query.category = category;
        }

        const [campaigns, total] = await Promise.all([
            Campaign.find(query)
                .populate('ngoId', 'organizationName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Campaign.countDocuments(query)
        ]);

        createSuccessResponse(res, 200, {
            campaigns,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        createErrorResponse(res, 500, 'Failed to fetch campaigns', error.message);
    }
});

// Get NGOs for donor
router.get('/ngos', auth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12;
        const skip = (page - 1) * limit;
        const search = req.query.search;

        let query = { verificationStatus: 'verified' };
        
        if (search) {
            query.$or = [
                { organizationName: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const [ngos, total] = await Promise.all([
            NGO.find(query)
                .select('organizationName description profileImage location.city location.state')
                .sort({ organizationName: 1 })
                .skip(skip)
                .limit(limit),
            NGO.countDocuments(query)
        ]);

        createSuccessResponse(res, 200, {
            ngos,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        createErrorResponse(res, 500, 'Failed to fetch NGOs', error.message);
    }
});

// Get donor profile
router.get('/profile', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return createErrorResponse(res, 404, 'User not found');
        }

        createSuccessResponse(res, 200, { user });
    } catch (error) {
        createErrorResponse(res, 500, 'Failed to fetch profile', error.message);
    }
});

// Update donor profile
router.put('/profile', auth, async (req, res) => {
    try {
        const { fullName, email, phone, bio } = req.body;
        
        const user = await User.findByIdAndUpdate(
            req.user.id,
            { fullName, email, phone, bio, updatedAt: new Date() },
            { new: true }
        ).select('-password');

        createSuccessResponse(res, 200, { user });
    } catch (error) {
        createErrorResponse(res, 500, 'Failed to update profile', error.message);
    }
});

// Get donation reports
router.get('/reports', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const year = parseInt(req.query.year) || new Date().getFullYear();

        const [
            monthlyStats,
            categoryStats,
            topNgos,
            totalStats
        ] = await Promise.all([
            Donation.aggregate([
                {
                    $match: {
                        donorId: userId,
                        status: 'completed',
                        createdAt: {
                            $gte: new Date(`${year}-01-01`),
                            $lte: new Date(`${year}-12-31`)
                        }
                    }
                },
                {
                    $group: {
                        _id: { $month: '$createdAt' },
                        amount: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id': 1 } }
            ]),
            Donation.aggregate([
                { $match: { donorId: userId, status: 'completed' } },
                { $lookup: { from: 'campaigns', localField: 'campaignId', foreignField: '_id', as: 'campaign' } },
                { $unwind: '$campaign' },
                {
                    $group: {
                        _id: '$campaign.category',
                        amount: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { amount: -1 } }
            ]),
            Donation.aggregate([
                { $match: { donorId: userId, status: 'completed' } },
                { $lookup: { from: 'campaigns', localField: 'campaignId', foreignField: '_id', as: 'campaign' } },
                { $unwind: '$campaign' },
                { $lookup: { from: 'ngos', localField: 'campaign.ngoId', foreignField: '_id', as: 'ngo' } },
                { $unwind: '$ngo' },
                {
                    $group: {
                        _id: '$ngo._id',
                        ngoName: { $first: '$ngo.organizationName' },
                        amount: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { amount: -1 } },
                { $limit: 5 }
            ]),
            Donation.aggregate([
                { $match: { donorId: userId, status: 'completed' } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: '$amount' },
                        totalCount: { $sum: 1 },
                        avgAmount: { $avg: '$amount' }
                    }
                }
            ])
        ]);

        createSuccessResponse(res, 200, {
            year,
            monthlyStats,
            categoryStats,
            topNgos,
            totalStats: totalStats[0] || { totalAmount: 0, totalCount: 0, avgAmount: 0 }
        });
    } catch (error) {
        createErrorResponse(res, 500, 'Failed to fetch reports', error.message);
    }
});

module.exports = router;
