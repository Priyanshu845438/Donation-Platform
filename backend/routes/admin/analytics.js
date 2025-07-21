
const express = require("express");
const authMiddleware = require("../../middleware/auth");
const { createSuccessResponse, createErrorResponse } = require("../../utils/errorHandler");
const User = require("../../models/User");
const NGO = require("../../models/NGO");
const Company = require("../../models/Company");
const Campaign = require("../../models/Campaign");
const Donation = require("../../models/Donation");
const Activity = require("../../models/Activity");

const router = express.Router();

// Get comprehensive analytics
router.get("/dashboard", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { timeRange = "30d", granularity = "day" } = req.query;
        
        let dateFilter;
        switch(timeRange) {
            case "7d":
                dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "30d":
                dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                break;
            case "90d":
                dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                break;
            case "1y":
                dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        }

        // Overview metrics
        const overview = {
            totalUsers: await User.countDocuments(),
            totalNGOs: await NGO.countDocuments(),
            totalCompanies: await Company.countDocuments(),
            totalCampaigns: await Campaign.countDocuments(),
            activeCampaigns: await Campaign.countDocuments({ isActive: true }),
            totalDonations: await Donation.countDocuments(),
            totalDonationAmount: await Donation.aggregate([
                { $group: { _id: null, total: { $sum: "$amount" } } }
            ]).then(result => result[0]?.total || 0)
        };

        // Growth metrics
        const growth = {
            newUsers: await User.countDocuments({ createdAt: { $gte: dateFilter } }),
            newNGOs: await NGO.countDocuments({ createdAt: { $gte: dateFilter } }),
            newCampaigns: await Campaign.countDocuments({ createdAt: { $gte: dateFilter } }),
            newDonations: await Donation.countDocuments({ createdAt: { $gte: dateFilter } })
        };

        // User analytics
        const userAnalytics = {
            roleDistribution: await User.aggregate([
                { $group: { _id: "$role", count: { $sum: 1 } } }
            ]),
            statusDistribution: await User.aggregate([
                { $group: { _id: "$isActive", count: { $sum: 1 } } }
            ]),
            approvalDistribution: await User.aggregate([
                { $group: { _id: "$approvalStatus", count: { $sum: 1 } } }
            ])
        };

        // Campaign analytics
        const campaignAnalytics = {
            statusDistribution: await Campaign.aggregate([
                { $group: { _id: "$isActive", count: { $sum: 1 } } }
            ]),
            categoryDistribution: await Campaign.aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } }
            ]),
            fundingProgress: await Campaign.aggregate([
                {
                    $group: {
                        _id: null,
                        totalTarget: { $sum: "$targetAmount" },
                        totalRaised: { $sum: "$raisedAmount" }
                    }
                }
            ])
        };

        // Activity analytics
        const activityAnalytics = {
            recentActivity: await Activity.countDocuments({ createdAt: { $gte: dateFilter } }),
            topActions: await Activity.aggregate([
                { $match: { createdAt: { $gte: dateFilter } } },
                { $group: { _id: "$action", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ])
        };

        // Time series data
        const timeSeries = await User.aggregate([
            { $match: { createdAt: { $gte: dateFilter } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: granularity === "day" ? { $dayOfMonth: "$createdAt" } : null
                    },
                    users: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);

        const analytics = {
            overview,
            growth,
            userAnalytics,
            campaignAnalytics,
            activityAnalytics,
            timeSeries,
            timeRange,
            generatedAt: new Date().toISOString()
        };

        return createSuccessResponse(res, 200, {
            message: "Analytics retrieved successfully",
            analytics
        });
    } catch (error) {
        console.error("Get analytics error:", error);
        return createErrorResponse(res, 500, "Failed to retrieve analytics", error.message);
    }
});

// Get real-time metrics
router.get("/realtime", authMiddleware(["admin"]), async (req, res) => {
    try {
        const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);
        const last30Minutes = new Date(Date.now() - 30 * 60 * 1000);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const realTimeMetrics = {
            activeUsers: await User.countDocuments({
                lastLogin: { $gte: last30Minutes }
            }),
            recentActivities: await Activity.countDocuments({
                createdAt: { $gte: last5Minutes }
            }),
            todayStats: {
                newUsers: await User.countDocuments({ createdAt: { $gte: today } }),
                newDonations: await Donation.countDocuments({ createdAt: { $gte: today } }),
                newCampaigns: await Campaign.countDocuments({ createdAt: { $gte: today } })
            },
            systemStatus: {
                uptime: Math.floor(process.uptime()),
                memoryUsage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100),
                databaseConnected: require('mongoose').connection.readyState === 1
            },
            timestamp: new Date().toISOString()
        };

        return createSuccessResponse(res, 200, {
            message: "Real-time metrics retrieved successfully",
            metrics: realTimeMetrics
        });
    } catch (error) {
        console.error("Get real-time metrics error:", error);
        return createErrorResponse(res, 500, "Failed to retrieve real-time metrics", error.message);
    }
});

module.exports = router;
