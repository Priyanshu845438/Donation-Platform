// const Campaign = require('../models/Campaign');
// const Donation = require('../models/Donation');
// const User = require('../models/User');
// const Company = require('../models/Company');
// const NGO = require('../models/NGO');
// const logger = require('../utils/logger');

// /**
//  * Get global platform statistics
//  */
// exports.getGlobalStats = async (req, res) => {
//     try {
//         const [
//             totalDonationsResult,
//             totalUsersCount,
//             totalCampaignsCount,
//             totalCompaniesCount,
//             totalNGOsCount,
//             activeCampaignsCount,
//             completedCampaignsCount,
//             categoryStats,
//             monthlyGrowth
//         ] = await Promise.all([
//             // Total donations amount
//             Donation.aggregate([
//                 { $match: { status: 'completed' } },
//                 { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
//             ]),
            
//             // Total users
//             User.countDocuments({ isActive: true }),
            
//             // Total campaigns
//             Campaign.countDocuments(),
            
//             // Total companies
//             Company.countDocuments({ isActive: true }),
            
//             // Total NGOs
//             NGO.countDocuments({ isActive: true }),
            
//             // Active campaigns
//             Campaign.countDocuments({ status: 'active', endDate: { $gt: new Date() } }),
            
//             // Completed campaigns
//             Campaign.countDocuments({ status: 'completed' }),
            
//             // Category-wise statistics
//             Campaign.aggregate([
//                 {
//                     $group: {
//                         _id: '$category',
//                         count: { $sum: 1 },
//                         totalGoal: { $sum: '$goalAmount' },
//                         totalRaised: { $sum: '$raisedAmount' }
//                     }
//                 },
//                 { $sort: { count: -1 } }
//             ]),
            
//             // Monthly growth for the last 12 months
//             Promise.all([
//                 Donation.aggregate([
//                     { 
//                         $match: { 
//                             status: 'completed',
//                             createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
//                         }
//                     },
//                     {
//                         $group: {
//                             _id: { 
//                                 year: { $year: "$createdAt" }, 
//                                 month: { $month: "$createdAt" } 
//                             },
//                             donations: { $sum: "$amount" },
//                             count: { $sum: 1 }
//                         }
//                     },
//                     { $sort: { "_id.year": 1, "_id.month": 1 } }
//                 ]),
//                 User.aggregate([
//                     { 
//                         $match: { 
//                             createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
//                         }
//                     },
//                     {
//                         $group: {
//                             _id: { 
//                                 year: { $year: "$createdAt" }, 
//                                 month: { $month: "$createdAt" } 
//                             },
//                             users: { $sum: 1 }
//                         }
//                     },
//                     { $sort: { "_id.year": 1, "_id.month": 1 } }
//                 ]),
//                 Campaign.aggregate([
//                     { 
//                         $match: { 
//                             createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) }
//                         }
//                     },
//                     {
//                         $group: {
//                             _id: { 
//                                 year: { $year: "$createdAt" }, 
//                                 month: { $month: "$createdAt" } 
//                             },
//                             campaigns: { $sum: 1 }
//                         }
//                     },
//                     { $sort: { "_id.year": 1, "_id.month": 1 } }
//                 ])
//             ])
//         ]);

//         // Process monthly growth data
//         const [monthlyDonations, monthlyUsers, monthlyCampaigns] = monthlyGrowth;
        
//         const monthlyGrowthData = [];
//         for (let i = 11; i >= 0; i--) {
//             const date = new Date();
//             date.setMonth(date.getMonth() - i);
//             const year = date.getFullYear();
//             const month = date.getMonth() + 1;
            
//             const donationData = monthlyDonations.find(d => d._id.year === year && d._id.month === month);
//             const userData = monthlyUsers.find(u => u._id.year === year && u._id.month === month);
//             const campaignData = monthlyCampaigns.find(c => c._id.year === year && c._id.month === month);
            
//             monthlyGrowthData.push({
//                 year,
//                 month,
//                 donations: donationData?.donations || 0,
//                 donationCount: donationData?.count || 0,
//                 users: userData?.users || 0,
//                 campaigns: campaignData?.campaigns || 0
//             });
//         }

//         const stats = {
//             overview: {
//                 totalDonations: totalDonationsResult[0]?.total || 0,
//                 totalDonationCount: totalDonationsResult[0]?.count || 0,
//                 totalUsers: totalUsersCount,
//                 totalCampaigns: totalCampaignsCount,
//                 totalCompanies: totalCompaniesCount,
//                 totalNGOs: totalNGOsCount,
//                 activeCampaigns: activeCampaignsCount,
//                 completedCampaigns: completedCampaignsCount
//             },
//             categories: categoryStats.map(cat => ({
//                 category: cat._id,
//                 count: cat.count,
//                 totalGoal: cat.totalGoal,
//                 totalRaised: cat.totalRaised,
//                 successRate: ((cat.totalRaised / cat.totalGoal) * 100).toFixed(2)
//             })),
//             monthlyGrowth: monthlyGrowthData
//         };

//         res.status(200).json({
//             success: true,
//             data: stats,
//             timestamp: new Date().toISOString()
//         });

//     } catch (error) {
//         logger.error('Get global stats error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch global statistics',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// /**
//  * Get donation statistics
//  */
// exports.getDonationStats = async (req, res) => {
//     try {
//         const { period = '30d', campaignId } = req.query;

//         let dateFilter = {};
//         const now = new Date();
        
//         switch (period) {
//             case '7d':
//                 dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
//                 break;
//             case '30d':
//                 dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
//                 break;
//             case '90d':
//                 dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
//                 break;
//             case '1y':
//                 dateFilter = { createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
//                 break;
//             default:
//                 dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
//         }

//         const matchQuery = { status: 'completed', ...dateFilter };
//         if (campaignId) {
//             matchQuery.campaignId = campaignId;
//         }

//         const [
//             totalStats,
//             dailyStats,
//             paymentMethodStats,
//             topDonors,
//             donationAmountDistribution
//         ] = await Promise.all([
//             Donation.aggregate([
//                 { $match: matchQuery },
//                 {
//                     $group: {
//                         _id: null,
//                         totalAmount: { $sum: '$amount' },
//                         totalCount: { $sum: 1 },
//                         averageAmount: { $avg: '$amount' },
//                         maxAmount: { $max: '$amount' },
//                         minAmount: { $min: '$amount' }
//                     }
//                 }
//             ]),

//             Donation.aggregate([
//                 { $match: matchQuery },
//                 {
//                     $group: {
//                         _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
//                         count: { $sum: 1 },
//                         amount: { $sum: '$amount' }
//                     }
//                 },
//                 { $sort: { '_id': 1 } }
//             ]),

//             Donation.aggregate([
//                 { $match: matchQuery },
//                 {
//                     $group: {
//                         _id: '$paymentMethod',
//                         count: { $sum: 1 },
//                         amount: { $sum: '$amount' }
//                     }
//                 },
//                 { $sort: { amount: -1 } }
//             ]),

//             Donation.aggregate([
//                 { $match: matchQuery },
//                 {
//                     $group: {
//                         _id: '$donorEmail',
//                         totalAmount: { $sum: '$amount' },
//                         count: { $sum: 1 },
//                         donorName: { $first: '$donorName' }
//                     }
//                 },
//                 { $sort: { totalAmount: -1 } },
//                 { $limit: 10 }
//             ]),

//             Donation.aggregate([
//                 { $match: matchQuery },
//                 {
//                     $bucket: {
//                         groupBy: '$amount',
//                         boundaries: [0, 100, 500, 1000, 5000, 10000, 50000, 100000],
//                         default: 'Other',
//                         output: {
//                             count: { $sum: 1 },
//                             totalAmount: { $sum: '$amount' }
//                         }
//                     }
//                 }
//             ])
//         ]);

//         const stats = {
//             overview: totalStats[0] || {
//                 totalAmount: 0,
//                 totalCount: 0,
//                 averageAmount: 0,
//                 maxAmount: 0,
//                 minAmount: 0
//             },
//             dailyStats: dailyStats,
//             paymentMethods: paymentMethodStats,
//             topDonors: topDonors.map(donor => ({
//                 email: donor._id,
//                 name: donor.donorName,
//                 totalAmount: donor.totalAmount,
//                 count: donor.count
//             })),
//             donationDistribution: donationAmountDistribution.map(bucket => ({
//                 range: bucket._id === 'Other' ? '100000+' : `${bucket._id}`,
//                 count: bucket.count,
//                 amount: bucket.totalAmount
//             }))
//         };

//         res.status(200).json({
//             success: true,
//             data: stats,
//             period: period,
//             timestamp: new Date().toISOString()
//         });

//     } catch (error) {
//         logger.error('Get donation stats error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch donation statistics',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// /**
//  * Get campaign statistics
//  */
// exports.getCampaignStats = async (req, res) => {
//     try {
//         const { period = '30d', status = 'all' } = req.query;

//         let dateFilter = {};
//         const now = new Date();
        
//         switch (period) {
//             case '7d':
//                 dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
//                 break;
//             case '30d':
//                 dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
//                 break;
//             case '90d':
//                 dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
//                 break;
//             case '1y':
//                 dateFilter = { createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
//                 break;
//             default:
//                 dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
//         }

//         const matchQuery = { ...dateFilter };
//         if (status !== 'all') {
//             matchQuery.status = status;
//         }

//         const [
//             totalStats,
//             statusStats,
//             categoryStats,
//             topCampaigns,
//             successfulCampaigns,
//             averageGoalByCategory
//         ] = await Promise.all([
//             Campaign.aggregate([
//                 { $match: matchQuery },
//                 {
//                     $group: {
//                         _id: null,
//                         totalCount: { $sum: 1 },
//                         totalGoal: { $sum: '$goalAmount' },
//                         totalRaised: { $sum: '$raisedAmount' },
//                         averageGoal: { $avg: '$goalAmount' },
//                         averageRaised: { $avg: '$raisedAmount' }
//                     }
//                 }
//             ]),

//             Campaign.aggregate([
//                 { $match: matchQuery },
//                 {
//                     $group: {
//                         _id: '$status',
//                         count: { $sum: 1 },
//                         totalGoal: { $sum: '$goalAmount' },
//                         totalRaised: { $sum: '$raisedAmount' }
//                     }
//                 }
//             ]),

//             Campaign.aggregate([
//                 { $match: matchQuery },
//                 {
//                     $group: {
//                         _id: '$category',
//                         count: { $sum: 1 },
//                         totalGoal: { $sum: '$goalAmount' },
//                         totalRaised: { $sum: '$raisedAmount' }
//                     }
//                 },
//                 { $sort: { count: -1 } }
//             ]),

//             Campaign.find(matchQuery)
//                 .sort({ raisedAmount: -1 })
//                 .limit(10)
//                 .select('title goalAmount raisedAmount status category createdAt'),

//             Campaign.aggregate([
//                 { $match: { ...matchQuery, status: 'completed' } },
//                 {
//                     $project: {
//                         title: 1,
//                         goalAmount: 1,
//                         raisedAmount: 1,
//                         successRate: {
//                             $multiply: [
//                                 { $divide: ['$raisedAmount', '$goalAmount'] },
//                                 100
//                             ]
//                         }
//                     }
//                 },
//                 { $match: { successRate: { $gte: 100 } } },
//                 { $sort: { successRate: -1 } },
//                 { $limit: 5 }
//             ]),

//             Campaign.aggregate([
//                 { $match: matchQuery },
//                 {
//                     $group: {
//                         _id: '$category',
//                         averageGoal: { $avg: '$goalAmount' },
//                         averageRaised: { $avg: '$raisedAmount' },
//                         averageSuccessRate: {
//                             $avg: {
//                                 $multiply: [
//                                     { $divide: ['$raisedAmount', '$goalAmount'] },
//                                     100
//                                 ]
//                             }
//                         }
//                     }
//                 },
//                 { $sort: { averageSuccessRate: -1 } }
//             ])
//         ]);

//         const stats = {
//             overview: totalStats[0] || {
//                 totalCount: 0,
//                 totalGoal: 0,
//                 totalRaised: 0,
//                 averageGoal: 0,
//                 averageRaised: 0,
//                 successRate: 0
//             },
//             statusBreakdown: statusStats,
//             categoryBreakdown: categoryStats.map(cat => ({
//                 category: cat._id,
//                 count: cat.count,
//                 totalGoal: cat.totalGoal,
//                 totalRaised: cat.totalRaised,
//                 successRate: ((cat.totalRaised / cat.totalGoal) * 100).toFixed(2)
//             })),
//             topCampaigns: topCampaigns.map(campaign => ({
//                 id: campaign._id,
//                 title: campaign.title,
//                 goalAmount: campaign.goalAmount,
//                 raisedAmount: campaign.raisedAmount,
//                 successRate: ((campaign.raisedAmount / campaign.goalAmount) * 100).toFixed(2),
//                 status: campaign.status,
//                 category: campaign.category,
//                 createdAt: campaign.createdAt
//             })),
//             successfulCampaigns: successfulCampaigns,
//             categoryPerformance: averageGoalByCategory
//         };

//         // Calculate overall success rate
//         if (stats.overview.totalGoal > 0) {
//             stats.overview.successRate = ((stats.overview.totalRaised / stats.overview.totalGoal) * 100).toFixed(2);
//         }

//         res.status(200).json({
//             success: true,
//             data: stats,
//             period: period,
//             timestamp: new Date().toISOString()
//         });

//     } catch (error) {
//         logger.error('Get campaign stats error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch campaign statistics',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

// /**
//  * Get user statistics
//  */
// exports.getUserStats = async (req, res) => {
//     try {
//         const { period = '30d' } = req.query;

//         let dateFilter = {};
//         const now = new Date();
        
//         switch (period) {
//             case '7d':
//                 dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
//                 break;
//             case '30d':
//                 dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
//                 break;
//             case '90d':
//                 dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
//                 break;
//             case '1y':
//                 dateFilter = { createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
//                 break;
//             default:
//                 dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
//         }

//         const [
//             totalStats,
//             roleStats,
//             registrationTrend,
//             activeUsers,
//             topDonors,
//             topCampaignCreators
//         ] = await Promise.all([
//             User.aggregate([
//                 { $match: dateFilter },
//                 {
//                     $group: {
//                         _id: null,
//                         totalCount: { $sum: 1 },
//                         activeCount: { $sum: { $cond: ['$isActive', 1, 0] } }
//                     }
//                 }
//             ]),

//             User.aggregate([
//                 { $match: dateFilter },
//                 {
//                     $group: {
//                         _id: '$role',
//                         count: { $sum: 1 },
//                         activeCount: { $sum: { $cond: ['$isActive', 1, 0] } }
//                     }
//                 }
//             ]),

//             User.aggregate([
//                 { $match: dateFilter },
//                 {
//                     $group: {
//                         _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
//                         count: { $sum: 1 }
//                     }
//                 },
//                 { $sort: { '_id': 1 } }
//             ]),

//             User.countDocuments({ isActive: true, lastLogin: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }),

//             Donation.aggregate([
//                 { $match: { status: 'completed' } },
//                 {
//                     $group: {
//                         _id: '$donorId',
//                         totalAmount: { $sum: '$amount' },
//                         count: { $sum: 1 }
//                     }
//                 },
//                 { $sort: { totalAmount: -1 } },
//                 { $limit: 10 },
//                 {
//                     $lookup: {
//                         from: 'users',
//                         localField: '_id',
//                         foreignField: '_id',
//                         as: 'user'
//                     }
//                 },
//                 { $unwind: '$user' },
//                 {
//                     $project: {
//                         totalAmount: 1,
//                         count: 1,
//                         userName: '$user.fullName',
//                         userEmail: '$user.email'
//                     }
//                 }
//             ]),

//             Campaign.aggregate([
//                 {
//                     $group: {
//                         _id: '$createdBy',
//                         campaignCount: { $sum: 1 },
//                         totalRaised: { $sum: '$raisedAmount' }
//                     }
//                 },
//                 { $sort: { totalRaised: -1 } },
//                 { $limit: 10 },
//                 {
//                     $lookup: {
//                         from: 'users',
//                         localField: '_id',
//                         foreignField: '_id',
//                         as: 'user'
//                     }
//                 },
//                 { $unwind: '$user' },
//                 {
//                     $project: {
//                         campaignCount: 1,
//                         totalRaised: 1,
//                         userName: '$user.fullName',
//                         userEmail: '$user.email'
//                     }
//                 }
//             ])
//         ]);

//         const stats = {
//             overview: totalStats[0] || {
//                 totalCount: 0,
//                 activeCount: 0
//             },
//             roleBreakdown: roleStats,
//             registrationTrend: registrationTrend,
//             activeUsers: activeUsers,
//             topDonors: topDonors,
//             topCampaignCreators: topCampaignCreators
//         };

//         res.status(200).json({
//             success: true,
//             data: stats,
//             period: period,
//             timestamp: new Date().toISOString()
//         });

//     } catch (error) {
//         logger.error('Get user stats error:', error);
//         res.status(500).json({
//             success: false,
//             message: 'Failed to fetch user statistics',
//             error: process.env.NODE_ENV === 'development' ? error.message : undefined
//         });
//     }
// };

const mongoose = require('mongoose');
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const User = require('../models/User');
const Company = require('../models/Company');
const NGO = require('../models/NGO');
const logger = require('../utils/logger');

/**
 * Get global statistics
 */
exports.getGlobalStats = async (req, res) => {
    try {
        const [
            totalUsers,
            totalCampaigns,
            activeCampaigns,
            totalDonations,
            totalDonationAmount,
            totalNGOs,
            totalCompanies
        ] = await Promise.all([
            User.countDocuments(),
            Campaign.countDocuments(),
            Campaign.countDocuments({ status: 'active', endDate: { $gt: new Date() } }),
            Donation.countDocuments({ status: 'completed' }),
            Donation.aggregate([
                { $match: { status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            mongoose.model('NGO').countDocuments(),
            mongoose.model('Company').countDocuments()
        ]);

        const donationTotal = totalDonationAmount.length > 0 ? totalDonationAmount[0].total : 0;

        const stats = {
            totalUsers,
            totalCampaigns,
            activeCampaigns,
            totalDonations,
            totalDonationAmount: donationTotal,
            totalNGOs,
            totalCompanies,
            campaigns: {
                total: totalCampaigns,
                active: activeCampaigns
            },
            donations: {
                count: totalDonations,
                amount: donationTotal
            },
            organizations: {
                ngos: totalNGOs,
                companies: totalCompanies
            }
        };

        res.status(200).json({
            success: true,
            data: stats
        });

    } catch (error) {
        logger.error('Get global stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch global statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get donation statistics
 */
exports.getDonationStats = async (req, res) => {
    try {
        const { period = '30d', campaignId } = req.query;

        let dateFilter = {};
        const now = new Date();

        switch (period) {
            case '7d':
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
                break;
            case '30d':
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
                break;
            case '90d':
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
                break;
            case '1y':
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
                break;
            default:
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        }

        const matchQuery = { status: 'completed', ...dateFilter };
        if (campaignId) {
            matchQuery.campaignId = campaignId;
        }

        const [
            totalStats,
            dailyStats,
            paymentMethodStats,
            topDonors,
            donationAmountDistribution
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
                { $sort: { '_id': 1 } }
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
            ]),

            Donation.aggregate([
                { $match: matchQuery },
                {
                    $bucket: {
                        groupBy: '$amount',
                        boundaries: [0, 100, 500, 1000, 5000, 10000, 50000, 100000],
                        default: 'Other',
                        output: {
                            count: { $sum: 1 },
                            totalAmount: { $sum: '$amount' }
                        }
                    }
                }
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
            dailyStats: dailyStats,
            paymentMethods: paymentMethodStats,
            topDonors: topDonors.map(donor => ({
                email: donor._id,
                name: donor.donorName,
                totalAmount: donor.totalAmount,
                count: donor.count
            })),
            donationDistribution: donationAmountDistribution.map(bucket => ({
                range: bucket._id === 'Other' ? '100000+' : `${bucket._id}`,
                count: bucket.count,
                amount: bucket.totalAmount
            }))
        };

        res.status(200).json({
            success: true,
            data: stats,
            period: period,
            timestamp: new Date().toISOString()
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

/**
 * Get campaign statistics
 */
exports.getCampaignStats = async (req, res) => {
    try {
        const { period = '30d', status = 'all' } = req.query;

        let dateFilter = {};
        const now = new Date();

        switch (period) {
            case '7d':
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
                break;
            case '30d':
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
                break;
            case '90d':
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
                break;
            case '1y':
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
                break;
            default:
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        }

        const matchQuery = { ...dateFilter };
        if (status !== 'all') {
            matchQuery.status = status;
        }

        const [
            totalStats,
            statusStats,
            categoryStats,
            topCampaigns,
            successfulCampaigns,
            averageGoalByCategory
        ] = await Promise.all([
            Campaign.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: null,
                        totalCount: { $sum: 1 },
                        totalGoal: { $sum: '$goalAmount' },
                        totalRaised: { $sum: '$raisedAmount' },
                        averageGoal: { $avg: '$goalAmount' },
                        averageRaised: { $avg: '$raisedAmount' }
                    }
                }
            ]),

            Campaign.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: '$status',
                        count: { $sum: 1 },
                        totalGoal: { $sum: '$goalAmount' },
                        totalRaised: { $sum: '$raisedAmount' }
                    }
                }
            ]),

            Campaign.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: '$category',
                        count: { $sum: 1 },
                        totalGoal: { $sum: '$goalAmount' },
                        totalRaised: { $sum: '$raisedAmount' }
                    }
                },
                { $sort: { count: -1 } }
            ]),

            Campaign.find(matchQuery)
                .sort({ raisedAmount: -1 })
                .limit(10)
                .select('title goalAmount raisedAmount status category createdAt'),

            Campaign.aggregate([
                { $match: { ...matchQuery, status: 'completed' } },
                {
                    $project: {
                        title: 1,
                        goalAmount: 1,
                        raisedAmount: 1,
                        successRate: {
                            $multiply: [
                                { $divide: ['$raisedAmount', '$goalAmount'] },
                                100
                            ]
                        }
                    }
                },
                { $match: { successRate: { $gte: 100 } } },
                { $sort: { successRate: -1 } },
                { $limit: 5 }
            ]),

            Campaign.aggregate([
                { $match: matchQuery },
                {
                    $group: {
                        _id: '$category',
                        averageGoal: { $avg: '$goalAmount' },
                        averageRaised: { $avg: '$raisedAmount' },
                        averageSuccessRate: {
                            $avg: {
                                $multiply: [
                                    { $divide: ['$raisedAmount', '$goalAmount'] },
                                    100
                                ]
                            }
                        }
                    }
                },
                { $sort: { averageSuccessRate: -1 } }
            ])
        ]);

        const stats = {
            overview: totalStats[0] || {
                totalCount: 0,
                totalGoal: 0,
                totalRaised: 0,
                averageGoal: 0,
                averageRaised: 0,
                successRate: 0
            },
            statusBreakdown: statusStats,
            categoryBreakdown: categoryStats.map(cat => ({
                category: cat._id,
                count: cat.count,
                totalGoal: cat.totalGoal,
                totalRaised: cat.totalRaised,
                successRate: ((cat.totalRaised / cat.totalGoal) * 100).toFixed(2)
            })),
            topCampaigns: topCampaigns.map(campaign => ({
                id: campaign._id,
                title: campaign.title,
                goalAmount: campaign.goalAmount,
                raisedAmount: campaign.raisedAmount,
                successRate: ((campaign.raisedAmount / campaign.goalAmount) * 100).toFixed(2),
                status: campaign.status,
                category: campaign.category,
                createdAt: campaign.createdAt
            })),
            successfulCampaigns: successfulCampaigns,
            categoryPerformance: averageGoalByCategory
        };

        // Calculate overall success rate
        if (stats.overview.totalGoal > 0) {
            stats.overview.successRate = ((stats.overview.totalRaised / stats.overview.totalGoal) * 100).toFixed(2);
        }

        res.status(200).json({
            success: true,
            data: stats,
            period: period,
            timestamp: new Date().toISOString()
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

/**
 * Get user statistics
 */
exports.getUserStats = async (req, res) => {
    try {
        const { period = '30d' } = req.query;

        let dateFilter = {};
        const now = new Date();

        switch (period) {
            case '7d':
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
                break;
            case '30d':
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
                break;
            case '90d':
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
                break;
            case '1y':
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
                break;
            default:
                dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        }

        const [
            totalStats,
            roleStats,
            registrationTrend,
            activeUsers,
            topDonors,
            topCampaignCreators
        ] = await Promise.all([
            User.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: null,
                        totalCount: { $sum: 1 },
                        activeCount: { $sum: { $cond: ['$isActive', 1, 0] } }
                    }
                }
            ]),

            User.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: '$role',
                        count: { $sum: 1 },
                        activeCount: { $sum: { $cond: ['$isActive', 1, 0] } }
                    }
                }
            ]),

            User.aggregate([
                { $match: dateFilter },
                {
                    $group: {
                        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { '_id': 1 } }
            ]),

            User.countDocuments({ isActive: true, lastLogin: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } }),

            Donation.aggregate([
                { $match: { status: 'completed' } },
                {
                    $group: {
                        _id: '$donorId',
                        totalAmount: { $sum: '$amount' },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { totalAmount: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $project: {
                        totalAmount: 1,
                        count: 1,
                        userName: '$user.fullName',
                        userEmail: '$user.email'
                    }
                }
            ]),

            Campaign.aggregate([
                {
                    $group: {
                        _id: '$createdBy',
                        campaignCount: { $sum: 1 },
                        totalRaised: { $sum: '$raisedAmount' }
                    }
                },
                { $sort: { totalRaised: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'users',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'user'
                    }
                },
                { $unwind: '$user' },
                {
                    $project: {
                        campaignCount: 1,
                        totalRaised: 1,
                        userName: '$user.fullName',
                        userEmail: '$user.email'
                    }
                }
            ])
        ]);

        const stats = {
            overview: totalStats[0] || {
                totalCount: 0,
                activeCount: 0
            },
            roleBreakdown: roleStats,
            registrationTrend: registrationTrend,
            activeUsers: activeUsers,
            topDonors: topDonors,
            topCampaignCreators: topCampaignCreators
        };

        res.status(200).json({
            success: true,
            data: stats,
            period: period,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        logger.error('Get user stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user statistics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};