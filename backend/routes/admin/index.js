const express = require("express");
const User = require("../../models/User");
const ngo = require("../../models/NGO");
const company = require("../../models/Company");
const Campaign = require("../../models/Campaign");
const Notice = require("../../models/Notice");
const Settings = require("../../models/Settings");
const Activity = require("../../models/Activity");
const authMiddleware = require("../../middleware/auth");
const bcrypt = require("bcryptjs");

const AdminController = require("../../controllers/adminController");
const profileRoutes = require("./profile");
const campaignRoutes = require("./campaigns");
const noticeRoutes = require("./notice");
const reportsRoutes = require("./reports");
const testUploadRoutes = require("./test-uploads");

const router = express.Router();

// Use notice routes
router.use("/notices", noticeRoutes);

// Use reports routes
router.use("/reports", reportsRoutes);

// Enhanced Professional Dashboard
router.get("/dashboard", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { timeRange = "30d", refresh = false } = req.query;
        
        // Define time filters
        const timeFilters = {
            "7d": new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            "30d": new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            "90d": new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            "1y": new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        };
        
        const dateFilter = timeFilters[timeRange] || timeFilters["30d"];
        const previousPeriod = new Date(dateFilter.getTime() - (Date.now() - dateFilter.getTime()));

        // Core metrics with growth calculation
        const [
            totalUsers,
            totalngos,
            totalCompanies,
            totalCampaigns,
            activeCampaigns,
            pendingApprovals,
            
            // Previous period data for growth calculation
            previousUsers,
            previousNgos,
            previousCompanies,
            previousCampaigns,
            
            // New registrations in current period
            newUsers,
            newNgos,
            newCompanies,
            newCampaigns,
            
            // Activity metrics
            recentActivities,
            topActiveUsers,
            
            // Security metrics
            failedLoginAttempts,
            suspiciousActivities
        ] = await Promise.all([
            // Current totals
            User.countDocuments(),
            ngo.countDocuments(),
            company.countDocuments(),
            Campaign.countDocuments(),
            Campaign.countDocuments({ isActive: true }),
            User.countDocuments({ approvalStatus: "pending" }),
            
            // Previous period totals
            User.countDocuments({ createdAt: { $lt: dateFilter } }),
            ngo.countDocuments({ createdAt: { $lt: dateFilter } }),
            company.countDocuments({ createdAt: { $lt: dateFilter } }),
            Campaign.countDocuments({ createdAt: { $lt: dateFilter } }),
            
            // New in current period
            User.countDocuments({ createdAt: { $gte: dateFilter } }),
            ngo.countDocuments({ createdAt: { $gte: dateFilter } }),
            company.countDocuments({ createdAt: { $gte: dateFilter } }),
            Campaign.countDocuments({ createdAt: { $gte: dateFilter } }),
            
            // Activity data
            Activity.find({ createdAt: { $gte: dateFilter } })
                .populate("userId", "fullName email role")
                .sort({ createdAt: -1 })
                .limit(10),
            
            // Top active users
            Activity.aggregate([
                { $match: { createdAt: { $gte: dateFilter } } },
                { $group: { _id: "$userId", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 5 },
                { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
                { $unwind: "$user" },
                { $project: { _id: 1, count: 1, "user.fullName": 1, "user.email": 1, "user.role": 1 } }
            ]),
            
            // Security metrics
            Activity.countDocuments({ 
                action: "login_failed", 
                createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
            }),
            Activity.countDocuments({ 
                action: { $in: ["suspicious_access", "multiple_failed_login"] }, 
                createdAt: { $gte: dateFilter } 
            })
        ]);

        // Calculate growth percentages
        const calculateGrowth = (current, previous) => {
            if (previous === 0) return current > 0 ? 100 : 0;
            return Math.round(((current - previous) / previous) * 100);
        };

        // User role distribution
        const userRoleDistribution = await User.aggregate([
            { $group: { _id: "$role", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        // Campaign performance metrics
        const campaignPerformance = await Campaign.aggregate([
            {
                $group: {
                    _id: null,
                    totalTarget: { $sum: "$targetAmount" },
                    totalRaised: { $sum: "$raisedAmount" },
                    averageTarget: { $avg: "$targetAmount" },
                    averageRaised: { $avg: "$raisedAmount" },
                    completionRate: {
                        $avg: {
                            $cond: [
                                { $gt: ["$targetAmount", 0] },
                                { $divide: ["$raisedAmount", "$targetAmount"] },
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // Daily activity trend
        const activityTrend = await Activity.aggregate([
            { $match: { createdAt: { $gte: dateFilter } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
            { $limit: 30 }
        ]);

        // System health metrics
        const systemHealth = {
            status: "healthy",
            uptime: Math.floor(process.uptime()),
            memory: {
                used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
                percentage: Math.round((process.memoryUsage().heapUsed / process.memoryUsage().heapTotal) * 100)
            },
            cpu: process.cpuUsage(),
            database: {
                status: require('mongoose').connection.readyState === 1 ? "connected" : "disconnected",
                responseTime: "< 50ms"
            }
        };

        // Comprehensive dashboard response
        const dashboardData = {
            success: true,
            timestamp: new Date().toISOString(),
            timeRange,
            
            // Key Performance Indicators
            kpis: {
                users: {
                    total: totalUsers,
                    new: newUsers,
                    growth: calculateGrowth(totalUsers, previousUsers),
                    active: await User.countDocuments({ 
                        isActive: true, 
                        lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } 
                    })
                },
                ngos: {
                    total: totalngos,
                    new: newNgos,
                    growth: calculateGrowth(totalngos, previousNgos),
                    active: await ngo.countDocuments({ isActive: true })
                },
                companies: {
                    total: totalCompanies,
                    new: newCompanies,
                    growth: calculateGrowth(totalCompanies, previousCompanies),
                    active: await company.countDocuments({ isActive: true })
                },
                campaigns: {
                    total: totalCampaigns,
                    new: newCampaigns,
                    active: activeCampaigns,
                    growth: calculateGrowth(totalCampaigns, previousCampaigns),
                    performance: campaignPerformance[0] || {}
                }
            },
            
            // Quick Actions Data
            quickActions: {
                pendingApprovals,
                recentActivities: recentActivities.length,
                systemAlerts: suspiciousActivities > 0 ? 1 : 0,
                maintenanceMode: false
            },
            
            // Charts Data
            charts: {
                userRoleDistribution,
                activityTrend,
                campaignPerformance: campaignPerformance[0] || {},
                
                // Monthly registration trend
                registrationTrend: await User.aggregate([
                    { $match: { createdAt: { $gte: dateFilter } } },
                    {
                        $group: {
                            _id: {
                                year: { $year: "$createdAt" },
                                month: { $month: "$createdAt" }
                            },
                            users: { $sum: 1 }
                        }
                    },
                    { $sort: { "_id.year": 1, "_id.month": 1 } }
                ])
            },
            
            // Recent Activities
            recentActivities: recentActivities.slice(0, 5),
            
            // Top Performers
            topActiveUsers,
            
            // Security Dashboard
            security: {
                status: suspiciousActivities > 5 ? "warning" : "secure",
                failedLoginAttempts,
                suspiciousActivities,
                lastSecurityScan: new Date().toISOString()
            },
            
            // System Health
            systemHealth,
            
            // Recommendations
            recommendations: [
                pendingApprovals > 0 ? `${pendingApprovals} users awaiting approval` : null,
                suspiciousActivities > 0 ? `${suspiciousActivities} suspicious activities detected` : null,
                systemHealth.memory.percentage > 80 ? "High memory usage detected" : null,
                activeCampaigns === 0 ? "No active campaigns currently running" : null
            ].filter(Boolean)
        };

        res.json(dashboardData);
    } catch (error) {
        console.error("Dashboard error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching dashboard data",
            error: error.message,
        });
    }
});

// Professional Dashboard Widgets
router.get("/dashboard/widgets", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { widget, timeRange = "30d" } = req.query;
        
        const dateFilter = {
            "7d": new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            "30d": new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            "90d": new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            "1y": new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
        }[timeRange] || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

        const widgets = {};

        // User Analytics Widget
        if (!widget || widget === "user-analytics") {
            widgets.userAnalytics = {
                title: "User Analytics",
                data: await User.aggregate([
                    {
                        $facet: {
                            roleDistribution: [
                                { $group: { _id: "$role", count: { $sum: 1 } } },
                                { $sort: { count: -1 } }
                            ],
                            statusDistribution: [
                                { $group: { _id: "$isActive", count: { $sum: 1 } } }
                            ],
                            registrationTrend: [
                                { $match: { createdAt: { $gte: dateFilter } } },
                                {
                                    $group: {
                                        _id: {
                                            year: { $year: "$createdAt" },
                                            month: { $month: "$createdAt" },
                                            day: { $dayOfMonth: "$createdAt" }
                                        },
                                        count: { $sum: 1 }
                                    }
                                },
                                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
                            ]
                        }
                    }
                ])
            };
        }

        // Campaign Performance Widget
        if (!widget || widget === "campaign-performance") {
            widgets.campaignPerformance = {
                title: "Campaign Performance",
                data: await Campaign.aggregate([
                    {
                        $facet: {
                            overview: [
                                {
                                    $group: {
                                        _id: null,
                                        totalCampaigns: { $sum: 1 },
                                        activeCampaigns: { $sum: { $cond: ["$isActive", 1, 0] } },
                                        totalTarget: { $sum: "$targetAmount" },
                                        totalRaised: { $sum: "$raisedAmount" },
                                        avgCompletionRate: {
                                            $avg: {
                                                $cond: [
                                                    { $gt: ["$targetAmount", 0] },
                                                    { $divide: ["$raisedAmount", "$targetAmount"] },
                                                    0
                                                ]
                                            }
                                        }
                                    }
                                }
                            ],
                            topPerforming: [
                                {
                                    $addFields: {
                                        completionRate: {
                                            $cond: [
                                                { $gt: ["$targetAmount", 0] },
                                                { $divide: ["$raisedAmount", "$targetAmount"] },
                                                0
                                            ]
                                        }
                                    }
                                },
                                { $sort: { completionRate: -1 } },
                                { $limit: 5 },
                                {
                                    $lookup: {
                                        from: "ngos",
                                        localField: "ngoId",
                                        foreignField: "_id",
                                        as: "ngo"
                                    }
                                },
                                {
                                    $project: {
                                        title: 1,
                                        campaignName: 1,
                                        targetAmount: 1,
                                        raisedAmount: 1,
                                        completionRate: 1,
                                        "ngo.ngoName": 1
                                    }
                                }
                            ]
                        }
                    }
                ])
            };
        }

        // Activity Timeline Widget
        if (!widget || widget === "activity-timeline") {
            widgets.activityTimeline = {
                title: "Recent Activities",
                data: await Activity.find({ createdAt: { $gte: dateFilter } })
                    .populate("userId", "fullName email role")
                    .sort({ createdAt: -1 })
                    .limit(20)
                    .lean()
            };
        }

        // Security Monitor Widget
        if (!widget || widget === "security-monitor") {
            const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
            
            widgets.securityMonitor = {
                title: "Security Monitor",
                data: {
                    failedLogins: await Activity.countDocuments({
                        action: "login_failed",
                        createdAt: { $gte: last24h }
                    }),
                    suspiciousActivities: await Activity.countDocuments({
                        action: { $in: ["suspicious_access", "multiple_failed_login"] },
                        createdAt: { $gte: last24h }
                    }),
                    recentSecurityEvents: await Activity.find({
                        action: { $in: ["login_failed", "suspicious_access", "security_alert"] },
                        createdAt: { $gte: last24h }
                    })
                    .populate("userId", "fullName email")
                    .sort({ createdAt: -1 })
                    .limit(10)
                    .lean(),
                    securityScore: 95, // Calculate based on various factors
                    recommendations: [
                        "Enable 2FA for all admin accounts",
                        "Review recent failed login attempts",
                        "Update security policies"
                    ]
                }
            };
        }

        // System Health Widget
        if (!widget || widget === "system-health") {
            const memoryUsage = process.memoryUsage();
            const cpuUsage = process.cpuUsage();
            
            widgets.systemHealth = {
                title: "System Health",
                data: {
                    status: "healthy",
                    uptime: Math.floor(process.uptime()),
                    memory: {
                        used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                        total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
                    },
                    cpu: {
                        user: cpuUsage.user,
                        system: cpuUsage.system,
                        loadAverage: require('os').loadavg()
                    },
                    database: {
                        status: require('mongoose').connection.readyState === 1 ? "connected" : "disconnected",
                        collections: await Promise.all([
                            User.estimatedDocumentCount(),
                            Campaign.estimatedDocumentCount(),
                            Activity.estimatedDocumentCount()
                        ]).then(([users, campaigns, activities]) => ({
                            users,
                            campaigns,
                            activities
                        }))
                    }
                }
            };
        }

        res.json({
            success: true,
            widgets,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error("Dashboard widgets error:", error);
        res.status(500).json({
            success: false,
            message: "Error fetching dashboard widgets",
            error: error.message
        });
    }
});

// Dashboard stats endpoint with enhanced features
router.get("/dashboard/stats", authMiddleware(["admin"]), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalngos = await ngo.countDocuments();
        const totalCompanies = await company.countDocuments();
        const totalCampaigns = await Campaign.countDocuments();
        const activeCampaigns = await Campaign.countDocuments({
            isActive: true,
        });
        const pendingApprovals = await User.countDocuments({
            approvalStatus: "Pending",
        });

        // Get donation statistics
        const donationStats = await Campaign.aggregate([
            { $group: { _id: null, totalRaised: { $sum: "$raisedAmount" } } },
        ]);

        // Recent activities and security stats
        const recentActivities = await Activity.find()
            .populate("userId", "fullName email")
            .sort({ createdAt: -1 })
            .limit(10);

        const recentUsers = await User.find()
            .select("fullName email role createdAt isActive")
            .sort({ createdAt: -1 })
            .limit(5);

        // Security metrics
        const failedLogins = await Activity.countDocuments({
            action: "login_failed",
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        const suspiciousActivities = await Activity.countDocuments({
            action: { $in: ["multiple_failed_login", "suspicious_access"] },
            createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
        });

        // System health metrics
        const memoryUsage = process.memoryUsage();
        const systemHealth = {
            status: memoryUsage.heapUsed / memoryUsage.heapTotal < 0.9 ? "healthy" : "warning",
            uptime: process.uptime(),
            memory: {
                used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
            },
            cpu: {
                usage: process.cpuUsage(),
                loadAverage: require('os').loadavg()
            }
        };

        // Growth metrics (last 30 days)
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const newUsersThisMonth = await User.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });
        const newCampaignsThisMonth = await Campaign.countDocuments({
            createdAt: { $gte: thirtyDaysAgo }
        });

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalngos,
                    totalCompanies,
                    totalCampaigns,
                    activeCampaigns,
                    pendingApprovals,
                    totalRaised: donationStats[0]?.totalRaised || 0,
                    newUsersThisMonth,
                    newCampaignsThisMonth
                },
                recentUsers,
                recentActivities,
                security: {
                    failedLoginsToday: failedLogins,
                    suspiciousActivities,
                    activeUsers: await User.countDocuments({ isActive: true }),
                    inactiveUsers: await User.countDocuments({ isActive: false })
                },
                systemHealth,
                performance: {
                    responseTime: Date.now() - req.startTime || 0,
                    requestsCount: 0, // You can implement request counting
                    errorRate: 0 // You can implement error rate tracking
                }
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching dashboard stats",
            error: error.message,
        });
    }
});

// System Health Monitoring
router.get("/dashboard/system-health", authMiddleware(["admin"]), async (req, res) => {
    try {
        const os = require('os');
        const memoryUsage = process.memoryUsage();
        
        const systemInfo = {
            server: {
                platform: os.platform(),
                arch: os.arch(),
                nodeVersion: process.version,
                uptime: process.uptime()
            },
            memory: {
                total: os.totalmem(),
                free: os.freemem(),
                used: os.totalmem() - os.freemem(),
                processUsed: memoryUsage.heapUsed,
                processTotal: memoryUsage.heapTotal
            },
            cpu: {
                cores: os.cpus().length,
                loadAverage: os.loadavg(),
                usage: process.cpuUsage()
            },
            database: {
                status: "connected", // You can implement actual DB health check
                connectionCount: 1, // Implement actual connection tracking
                responseTime: "< 100ms" // Implement actual response time tracking
            }
        };

        res.json({
            success: true,
            data: systemInfo,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching system health",
            error: error.message,
        });
    }
});

// Security Center Dashboard
router.get("/dashboard/security", authMiddleware(["admin"]), async (req, res) => {
    try {
        const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const securityMetrics = {
            authentication: {
                failedLogins24h: await Activity.countDocuments({
                    action: "login_failed",
                    createdAt: { $gte: last24Hours }
                }),
                successfulLogins24h: await Activity.countDocuments({
                    action: "login_success",
                    createdAt: { $gte: last24Hours }
                }),
                uniqueLoginIPs: await Activity.distinct("ipAddress", {
                    action: "login_success",
                    createdAt: { $gte: lastWeek }
                }).then(ips => ips.length)
            },
            users: {
                activeUsers: await User.countDocuments({ isActive: true }),
                suspendedUsers: await User.countDocuments({ isActive: false }),
                pendingApprovals: await User.countDocuments({ approvalStatus: "pending" }),
                adminUsers: await User.countDocuments({ role: "admin" })
            },
            sessions: {
                activeSessions: await User.countDocuments({ 
                    lastLogin: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
                }),
                expiredSessions: 0 // Implement session tracking
            },
            threats: {
                suspiciousActivities: await Activity.countDocuments({
                    action: { $in: ["suspicious_access", "multiple_failed_login"] },
                    createdAt: { $gte: lastWeek }
                }),
                blockedIPs: 0, // Implement IP blocking
                securityAlerts: await Activity.countDocuments({
                    action: "security_alert",
                    createdAt: { $gte: lastWeek }
                })
            }
        };

        // Recent security events
        const recentSecurityEvents = await Activity.find({
            action: { $in: ["login_failed", "suspicious_access", "security_alert", "admin_action"] },
            createdAt: { $gte: lastWeek }
        })
        .populate("userId", "fullName email")
        .sort({ createdAt: -1 })
        .limit(20);

        res.json({
            success: true,
            data: {
                metrics: securityMetrics,
                recentEvents: recentSecurityEvents,
                recommendations: [
                    "Enable two-factor authentication for all admin accounts",
                    "Review users with multiple failed login attempts",
                    "Update password policies for stronger security",
                    "Monitor suspicious IP addresses"
                ]
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching security dashboard",
            error: error.message,
        });
    }
});

// Advanced Analytics Dashboard
router.get("/dashboard/analytics", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { timeRange = "30d" } = req.query;
        
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
            default:
                dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        }

        // User growth analytics
        const userGrowth = await User.aggregate([
            { $match: { createdAt: { $gte: dateFilter } } },
            {
                $group: {
                    _id: {
                        year: { $year: "$createdAt" },
                        month: { $month: "$createdAt" },
                        day: { $dayOfMonth: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
        ]);

        // Campaign performance
        const campaignAnalytics = await Campaign.aggregate([
            { $match: { createdAt: { $gte: dateFilter } } },
            {
                $group: {
                    _id: null,
                    totalCampaigns: { $sum: 1 },
                    activeCampaigns: { $sum: { $cond: ["$isActive", 1, 0] } },
                    totalTarget: { $sum: "$targetAmount" },
                    totalRaised: { $sum: "$raisedAmount" },
                    avgCompletionRate: { 
                        $avg: { 
                            $cond: [
                                { $gt: ["$targetAmount", 0] },
                                { $divide: ["$raisedAmount", "$targetAmount"] },
                                0
                            ]
                        }
                    }
                }
            }
        ]);

        // User role distribution
        const userRoleDistribution = await User.aggregate([
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 }
                }
            }
        ]);

        // Geographic distribution (if you have location data)
        const geographicData = await User.aggregate([
            {
                $group: {
                    _id: "$country",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                userGrowth,
                campaignAnalytics: campaignAnalytics[0] || {},
                userRoleDistribution,
                geographicData,
                timeRange,
                summary: {
                    totalUsers: await User.countDocuments(),
                    growthRate: 0, // Calculate growth rate
                    conversionRate: 0, // Calculate conversion rate
                    engagement: {
                        dailyActiveUsers: await User.countDocuments({
                            lastLogin: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
                        }),
                        weeklyActiveUsers: await User.countDocuments({
                            lastLogin: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                        })
                    }
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching analytics dashboard",
            error: error.message,
        });
    }
});

// Audit Trail Dashboard
router.get("/dashboard/audit-trail", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { page = 1, limit = 50, action, userId, dateFrom, dateTo } = req.query;
        
        let query = {};
        
        if (action) query.action = action;
        if (userId) query.userId = userId;
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
            if (dateTo) query.createdAt.$lte = new Date(dateTo);
        }

        const auditLogs = await Activity.find(query)
            .populate("userId", "fullName email role")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const totalLogs = await Activity.countDocuments(query);

        // Action summary
        const actionSummary = await Activity.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$action",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // User activity summary
        const userActivitySummary = await Activity.aggregate([
            { $match: query },
            {
                $group: {
                    _id: "$userId",
                    count: { $sum: 1 },
                    lastActivity: { $max: "$createdAt" }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);

        res.json({
            success: true,
            data: {
                auditLogs,
                pagination: {
                    total: totalLogs,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(totalLogs / parseInt(limit))
                },
                summary: {
                    totalLogs,
                    actionSummary,
                    userActivitySummary,
                    timeRange: {
                        from: dateFrom || "All time",
                        to: dateTo || "Present"
                    }
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching audit trail",
            error: error.message,
        });
    }
});

// Real-time Dashboard Data (WebSocket alternative)
router.get("/dashboard/real-time", authMiddleware(["admin"]), async (req, res) => {
    try {
        const last5Minutes = new Date(Date.now() - 5 * 60 * 1000);
        
        const realTimeData = {
            activeUsers: await User.countDocuments({
                lastLogin: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
            }),
            recentActivities: await Activity.find({
                createdAt: { $gte: last5Minutes }
            })
            .populate("userId", "fullName")
            .sort({ createdAt: -1 })
            .limit(10),
            systemStatus: {
                memory: process.memoryUsage(),
                uptime: process.uptime(),
                timestamp: new Date().toISOString()
            },
            alerts: await Activity.find({
                action: { $in: ["security_alert", "system_error"] },
                createdAt: { $gte: last5Minutes }
            }).limit(5)
        };

        res.json({
            success: true,
            data: realTimeData,
            lastUpdated: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching real-time data",
            error: error.message,
        });
    }
});

// Create user endpoint
router.post("/create-user", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, role } = req.body;

        if (!fullName || !email || !password || !phoneNumber || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            isVerified: true,
            isActive: true,
            approvalStatus: "approved",
        });

        await newUser.save();

        // Create profile based on role
        if (role === "ngo") {
            await ngo.create({
                userId: newUser._id,
                ngoName: fullName,
                email: email,
                contactNumber: phoneNumber,
            });
        } else if (role === "company") {
            await company.create({
                userId: newUser._id,
                companyName: fullName,
                companyEmail: email,
                companyPhoneNumber: phoneNumber,
            });
        }

        res.status(201).json({
            message: "User created successfully",
            user: {
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role,
                isActive: newUser.isActive,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating user",
            error: error.message,
        });
    }
});

// User management - keep existing endpoint for backward compatibility
router.post("/users", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, role } = req.body;

        if (!fullName || !email || !password || !phoneNumber || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            isVerified: true,
            isActive: true,
            approvalStatus: "approved",
        });

        await newUser.save();
        res.status(201).json({
            message: "User created successfully",
            user: newUser,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating user",
            error: error.message,
        });
    }
});

router.get("/users", authMiddleware(["admin"]), async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            role,
            approvalStatus,
            search,
        } = req.query;

        let query = {};

        if (role) {
            query.role = role;
        }

        if (approvalStatus) {
            query.approvalStatus = approvalStatus;
        }

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const users = await User.find(query)
            .select("-password")
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching users",
            error: error.message,
        });
    }
});

router.put("/users/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const user = await User.findByIdAndUpdate(id, updateData, {
            new: true,
        }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({
            message: "Error updating user",
            error: error.message,
        });
    }
});

router.delete("/users/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting user",
            error: error.message,
        });
    }
});

// User approval endpoint
router.put(
    "/users/:id/approval",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { approvalStatus } = req.body;

            const validStatuses = ["pending", "approved", "rejected"];
            if (!validStatuses.includes(approvalStatus)) {
                return res
                    .status(400)
                    .json({ message: "Invalid approval status" });
            }

            const user = await User.findByIdAndUpdate(
                id,
                { approvalStatus, updatedAt: new Date() },
                { new: true },
            ).select("-password");

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json({
                message: `User ${approvalStatus.toLowerCase()} successfully`,
                user,
            });
        } catch (error) {
            res.status(500).json({
                message: "Error updating user approval status",
                error: error.message,
            });
        }
    },
);

// ngo management
router.get("/ngos", authMiddleware(["admin"]), async (req, res) => {
    try {
        const ngos = await ngo.find().populate("userId", "fullName email");
        res.json(ngos);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching ngos",
            error: error.message,
        });
    }
});

router.put("/ngos/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const ngo = await ngo.findByIdAndUpdate(id, req.body, { new: true });
        if (!ngo) {
            return res.status(404).json({ message: "ngo not found" });
        }
        res.json({ message: "ngo updated successfully", ngo });
    } catch (error) {
        res.status(500).json({
            message: "Error updating ngo",
            error: error.message,
        });
    }
});

// company management
router.get("/companies", authMiddleware(["admin"]), async (req, res) => {
    try {
        const companies = await company
            .find()
            .populate("userId", "fullName email");
        res.json(companies);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching companies",
            error: error.message,
        });
    }
});

router.put("/companies/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const company = await company.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        if (!company) {
            return res.status(404).json({ message: "company not found" });
        }
        res.json({ message: "company updated successfully", company });
    } catch (error) {
        res.status(500).json({
            message: "Error updating company",
            error: error.message,
        });
    }
});

// Campaign management
router.get("/campaigns", authMiddleware(["admin"]), async (req, res) => {
    try {
        const campaigns = await Campaign.find().populate("ngoId", "ngoName");
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching campaigns",
            error: error.message,
        });
    }
});

router.put("/campaigns/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await Campaign.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }
        res.json({ message: "Campaign updated successfully", campaign });
    } catch (error) {
        res.status(500).json({
            message: "Error updating campaign",
            error: error.message,
        });
    }
});

router.delete("/campaigns/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        await Campaign.findByIdAndDelete(id);
        res.json({ message: "Campaign deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting campaign",
            error: error.message,
        });
    }
});

// Notice management
router.post("/notices", authMiddleware(["admin"]), async (req, res) => {
    try {
        const notice = new Notice(req.body);
        await notice.save();
        res.status(201).json({
            message: "Notice created successfully",
            notice,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating notice",
            error: error.message,
        });
    }
});

router.get("/notices", authMiddleware(["admin"]), async (req, res) => {
    try {
        const notices = await Notice.find();
        res.json(notices);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching notices",
            error: error.message,
        });
    }
});

// Settings management
router.get("/settings", authMiddleware(["admin"]), AdminController.getAllSettings);
router.get("/settings/:category", authMiddleware(["admin"]), AdminController.getSettingsByCategory);
router.put("/settings", authMiddleware(["admin"]), AdminController.updateSettings);
router.put("/settings/bulk", authMiddleware(["admin"]), AdminController.updateMultipleSettings);
router.put("/settings/:category/reset", authMiddleware(["admin"]), AdminController.resetSettings);

// Rate limiting configuration
router.put("/settings/rate-limiting", authMiddleware(["admin"]), AdminController.updateRateLimiting);

// Environment configuration
router.put("/settings/environment", authMiddleware(["admin"]), AdminController.updateEnvironmentConfig);

// Password management
router.put("/users/:userId/password", authMiddleware(["admin"]), AdminController.changeUserPassword);

// System information
router.get("/system/info", authMiddleware(["admin"]), AdminController.getSystemInfo);

// Enhanced Dashboard Routes
router.get("/dashboard/analytics", authMiddleware(["admin"]), AdminController.getDashboardAnalytics);
router.get("/dashboard/security", authMiddleware(["admin"]), AdminController.getSecurityDashboard);
router.get("/dashboard/system-health", authMiddleware(["admin"]), AdminController.getSystemHealth);
router.get("/dashboard/performance", authMiddleware(["admin"]), AdminController.getPerformanceMetrics);

// Missing ngo routes for test compatibility
router.get("/ngos/", authMiddleware(["admin"]), async (req, res) => {
    try {
        const ngos = await ngo.find().populate("userId", "fullName email");
        res.json({ success: true, ngos });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching ngos",
            error: error.message,
        });
    }
});

router.put("/ngos/", authMiddleware(["admin"]), async (req, res) => {
    res.status(400).json({ message: "ngo ID is required for update" });
});

router.put("/ngos/:id/status", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const ngo = await ngo.findByIdAndUpdate(
            id,
            { isActive },
            { new: true },
        );
        if (!ngo) {
            return res.status(404).json({ message: "ngo not found" });
        }
        res.json({
            message: `ngo ${isActive ? "enabled" : "disabled"} successfully`,
            ngo,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating ngo status",
            error: error.message,
        });
    }
});

router.post("/ngos/:id/share", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const ShareLink = require("../../models/ShareLink");

        // Check if share link already exists for this NGO
        let shareLink = await ShareLink.findOne({
            resourceType: "profile",
            resourceId: id
        });

        if (!shareLink) {
            // Create new share link only if one doesn't exist
            shareLink = new ShareLink({
                resourceType: "profile",
                resourceId: id,
                createdBy: req.user.id
            });
            await shareLink.save();
        }

        const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/share/profile/${shareLink.shareId}`;
        res.json({ message: "Share link generated", shareLink: shareUrl });
    } catch (error) {
        res.status(500).json({
            message: "Error generating share link",
            error: error.message,
        });
    }
});

// Individual ngo management
router.get("/ngos/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const ngo = await ngo.findById(id).populate("userId", "fullName email");
        if (!ngo) {
            return res.status(404).json({ message: "ngo not found" });
        }
        res.json({ success: true, ngo });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching ngo",
            error: error.message,
        });
    }
});

router.put("/ngos/:id/status", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const ngo = await ngo.findByIdAndUpdate(
            id,
            { isActive },
            { new: true },
        );
        if (!ngo) {
            return res.status(404).json({ message: "ngo not found" });
        }
        res.json({
            message: `ngo ${isActive ? "enabled" : "disabled"} successfully`,
            ngo,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating ngo status",
            error: error.message,
        });
    }
});

router.post("/ngos/:id/share", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const ShareLink = require("../../models/ShareLink");

        // Check if share link already exists for this NGO
        let shareLink = await ShareLink.findOne({
            resourceType: "profile",
            resourceId: id
        });

        if (!shareLink) {
            // Create new share link only if one doesn't exist
            shareLink = new ShareLink({
                resourceType: "profile",
                resourceId: id,
                createdBy: req.user.id
            });
            await shareLink.save();
        }

        const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/share/profile/${shareLink.shareId}`;
        res.json({ message: "Share link generated", shareLink: shareUrl });
    } catch (error) {
        res.status(500).json({
            message: "Error generating share link",
            error: error.message,
        });
    }
});

router.delete("/ngos/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        await ngo.findByIdAndDelete(id);
        res.json({ message: "ngo deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting ngo",
            error: error.message,
        });
    }
});

// Missing company routes for test compatibility
router.get("/companies/", authMiddleware(["admin"]), async (req, res) => {
    try {
        const companies = await company
            .find()
            .populate("userId", "fullName email");
        res.json({ success: true, companies });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching companies",
            error: error.message,
        });
    }
});

router.put("/companies/", authMiddleware(["admin"]), async (req, res) => {
    res.status(400).json({ message: "company ID is required for update" });
});

router.put(
    "/companies/:id/status",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            const company = await company.findByIdAndUpdate(
                id,
                { isActive },
                { new: true },
            );
            if (!company) {
                return res.status(404).json({ message: "company not found" });
            }
            res.json({
                message: `company ${isActive ? "enabled" : "disabled"} successfully`,
                company,
            });
        } catch (error) {
            res.status(500).json({
                message: "Error updating company status",
                error: error.message,
            });
        }
    },
);

router.post(
    "/companies/:id/share",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const ShareLink = require("../../models/ShareLink");

            // Check if share link already exists for this Company
            let shareLink = await ShareLink.findOne({
                resourceType: "profile",
                resourceId: id
            });

            if (!shareLink) {
                // Create new share link only if one doesn't exist
                shareLink = new ShareLink({
                    resourceType: "profile",
                    resourceId: id,
                    createdBy: req.user.id
                });
                await shareLink.save();
            }

            const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/share/profile/${shareLink.shareId}`;
            res.json({ message: "Share link generated", shareLink: shareUrl });
        } catch (error) {
            res.status(500).json({
                message: "Error generating share link",
                error: error.message,
            });
        }
    },
);

// Individual company management
router.get("/companies/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const company = await company
            .findById(id)
            .populate("userId", "fullName email");
        if (!company) {
            return res.status(404).json({ message: "company not found" });
        }
        res.json({ success: true, company });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching company",
            error: error.message,
        });
    }
});

router.put(
    "/companies/:id/status",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            const company = await company.findByIdAndUpdate(
                id,
                { isActive },
                { new: true },
            );
            if (!company) {
                return res.status(404).json({ message: "company not found" });
            }
            res.json({
                message: `company ${isActive ? "enabled" : "disabled"} successfully`,
                company,
            });
        } catch (error) {
            res.status(500).json({
                message: "Error updating company status",
                error: error.message,
            });
        }
    },
);

router.post(
    "/companies/:id/share",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const ShareLink = require("../../models/ShareLink");

            // Check if share link already exists for this Company
            let shareLink = await ShareLink.findOne({
                resourceType: "profile",
                resourceId: id
            });

            if (!shareLink) {
                // Create new share link only if one doesn't exist
                shareLink = new ShareLink({
                    resourceType: "profile",
                    resourceId: id,
                    createdBy: req.user.id
                });
                await shareLink.save();
            }

            const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/share/profile/${shareLink.shareId}`;
            res.json({ message: "Share link generated", shareLink: shareUrl });
        } catch (error) {
            res.status(500).json({
                message: "Error generating share link",
                error: error.message,
            });
        }
    },
);

router.delete("/companies/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        await company.findByIdAndDelete(id);
        res.json({ message: "company deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting company",
            error: error.message,
        });
    }
});

// Get share link custom design
router.get("/share/:shareId/customize", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { shareId } = req.params;

        const ShareLink = require("../../models/ShareLink");

        const shareLink = await ShareLink.findOne({ shareId });
        if (!shareLink) {
            return res.status(404).json({ message: "Share link not found" });
        }

        res.json({ 
            message: "Custom design retrieved successfully",
            customDesign: shareLink.customDesign || {},
            shareLink: {
                shareId: shareLink.shareId,
                resourceType: shareLink.resourceType,
                isActive: shareLink.isActive,
                viewCount: shareLink.viewCount
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving custom design",
            error: error.message,
        });
    }
});

// Update share link custom design
router.put("/share/:shareId/customize", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { shareId } = req.params;
        const { customDesign } = req.body;

        const ShareLink = require("../../models/ShareLink");

        const shareLink = await ShareLink.findOne({ shareId });
        if (!shareLink) {
            return res.status(404).json({ message: "Share link not found" });
        }

        shareLink.customDesign = customDesign;
        await shareLink.save();

        res.json({ 
            message: "Custom design updated successfully",
            shareLink 
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating custom design",
            error: error.message,
        });
    }
});

// Missing Campaign routes for test compatibility
router.get("/campaigns/", authMiddleware(["admin"]), async (req, res) => {
    try {
        const campaigns = await Campaign.find().populate("ngoId", "ngoName");
        res.json({ success: true, campaigns });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching campaigns",
            error: error.message,
        });
    }
});

router.put("/campaigns/", authMiddleware(["admin"]), async (req, res) => {
    res.status(400).json({ message: "Campaign ID is required for update" });
});

router.put(
    "/campaigns/:id/status",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            const campaign = await Campaign.findByIdAndUpdate(
                id,
                { isActive },
                { new: true },
            );
            if (!campaign) {
                return res.status(404).json({ message: "Campaign not found" });
            }
            res.json({
                message: `Campaign ${isActive ? "enabled" : "disabled"} successfully`,
                campaign,
            });
        } catch (error) {
            res.status(500).json({
                message: "Error updating campaign status",
                error: error.message,
            });
        }
    },
);

router.post(
    "/campaigns/:id/share",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const ShareLink = require("../../models/ShareLink");

            // Check if share link already exists for this Campaign
            let shareLink = await ShareLink.findOne({
                resourceType: "campaign",
                resourceId: id
            });

            if (!shareLink) {
                // Create new share link only if one doesn't exist
                shareLink = new ShareLink({
                    resourceType: "campaign",
                    resourceId: id,
                    createdBy: req.user.id
                });
                await shareLink.save();
            }

            const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/share/campaign/${shareLink.shareId}`;
            res.json({ message: "Share link generated", shareLink: shareUrl });
        } catch (error) {
            res.status(500).json({
                message: "Error generating share link",
                error: error.message,
            });
        }
    },
);

// Individual Campaign management
router.post("/campaigns", authMiddleware(["admin"]), async (req, res) => {
    try {
        const campaign = new Campaign(req.body);
        await campaign.save();
        res.status(201).json({
            message: "Campaign created successfully",
            campaign,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating campaign",
            error: error.message,
        });
    }
});

router.get("/campaigns/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await Campaign.findById(id).populate(
            "ngoId",
            "ngoName",
        );
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }
        res.json({ success: true, campaign });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching campaign",
            error: error.message,
        });
    }
});

router.put(
    "/campaigns/:id/status",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            const campaign = await Campaign.findByIdAndUpdate(
                id,
                { isActive },
                { new: true },
            );
            if (!campaign) {
                return res.status(404).json({ message: "Campaign not found" });
            }
            res.json({
                message: `Campaign ${isActive ? "enabled" : "disabled"} successfully`,
                campaign,
            });
        } catch (error) {
            res.status(500).json({
                message: "Error updating campaign status",
                error: error.message,
            });
        }
    },
);

router.post(
    "/campaigns/:id/share",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const ShareLink = require("../../models/ShareLink");

            // Check if share link already exists for this Campaign
            let shareLink = await ShareLink.findOne({
                resourceType: "campaign",
                resourceId: id
            });

            if (!shareLink) {
                // Create new share link only if one doesn't exist
                shareLink = new ShareLink({
                    resourceType: "campaign",
                    resourceId: id,
                    createdBy: req.user.id
                });
                await shareLink.save();
            }

            const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/share/campaign/${shareLink.shareId}`;
            res.json({ message: "Share link generated", shareLink: shareUrl });
        } catch (error) {
            res.status(500).json({
                message: "Error generating share link",
                error: error.message,
            });
        }
    },
);

// Reports & Analytics endpoints
router.get("/reports/ngos", authMiddleware(["admin"]), async (req, res) => {
    try {
        const ngoStats = await ngo.aggregate([
            {
                $group: {
                    _id: null,
                    totalngos: { $sum: 1 },
                    activengos: {
                        $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
                    },
                    inactivengos: {
                        $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
                    },
                },
            },
        ]);
        res.json({ success: true, data: ngoStats[0] || {} });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching ngo reports",
            error: error.message,
        });
    }
});

router.get(
    "/reports/companies",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const companyStats = await company.aggregate([
                {
                    $group: {
                        _id: null,
                        totalCompanies: { $sum: 1 },
                        activeCompanies: {
                            $sum: {
                                $cond: [{ $eq: ["$isActive", true] }, 1, 0],
                            },
                        },
                        inactiveCompanies: {
                            $sum: {
                                $cond: [{ $eq: ["$isActive", false] }, 1, 0],
                            },
                        },
                    },
                },
            ]);
            res.json({ success: true, data: companyStats[0] || {} });
        } catch (error) {
            res.status(500).json({
                message: "Error fetching company reports",
                error: error.message,
            });
        }
    },
);

router.get(
    "/reports/campaigns",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const campaignStats = await Campaign.aggregate([
                {
                    $group: {
                        _id: null,
                        totalCampaigns: { $sum: 1 },
                        activeCampaigns: {
                            $sum: {
                                $cond: [{ $eq: ["$isActive", true] }, 1, 0],
                            },
                        },
                        totalTargetAmount: { $sum: "$targetAmount" },
                        totalRaisedAmount: { $sum: "$raisedAmount" },
                    },
                },
            ]);
            res.json({ success: true, data: campaignStats[0] || {} });
        } catch (error) {
            res.status(500).json({
                message: "Error fetching campaign reports",
                error: error.message,
            });
        }
    },
);

router.get(
    "/reports/donations",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            // This would require a Donation model which we'll assume exists
            res.json({
                success: true,
                data: { totalDonations: 0, totalAmount: 0 },
            });
        } catch (error) {
            res.status(500).json({
                message: "Error fetching donation reports",
                error: error.message,
            });
        }
    },
);

router.get(
    "/reports/activities",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const activityStats = await Activity.aggregate([
                {
                    $group: {
                        _id: "$action",
                        count: { $sum: 1 },
                    },
                },
            ]);
            res.json({ success: true, data: activityStats });
        } catch (error) {
            res.status(500).json({
                message: "Error fetching activity reports",
                error: error.message,
            });
        }
    },
);

router.get(
    "/reports/transactions",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            // This would require a Transaction model which we'll assume exists
            res.json({
                success: true,
                data: { totalTransactions: 0, totalAmount: 0 },
            });
        } catch (error) {
            res.status(500).json({
                message: "Error fetching transaction reports",
                error: error.message,
            });
        }
    },
);

// ngo Status Management
router.put("/ngos/:id/status", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findById(id);
        if (!user || user.role !== "ngo") {
            return res.status(404).json({
                status: "fail",
                message: "ngo not found",
            });
        }

        user.isActive = isActive;
        await user.save();

        res.json({
            status: "success",
            message: `ngo ${isActive ? "enabled" : "disabled"} successfully`,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

// company Status Management
router.put("/companies/:id/status", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findById(id);
        if (!user || user.role !== "company") {
            return res.status(404).json({
                status: "fail",
                message: "company not found",
            });
        }

        user.isActive = isActive;
        await user.save();

        res.json({
            status: "success",
            message: `company ${isActive ? "enabled" : "disabled"} successfully`,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

// Campaign Status Management
router.put("/campaigns/:id/status", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const campaign = await Campaign.findById(id);
        if (!campaign) {
            return res.status(404).json({
                status: "fail",
                message: "Campaign not found",
            });
        }

        campaign.isActive = isActive;
        await campaign.save();

        res.json({
            status: "success",
            message: `Campaign ${isActive ? "enabled" : "disabled"} successfully`,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

// Share Links
router.post("/ngos/:id/share", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const ShareLink = require("../../models/ShareLink");

        // Check if share link already exists for this NGO
        let shareLink = await ShareLink.findOne({
            resourceType: "profile",
            resourceId: id
        });

        if (!shareLink) {
            // Create new share link only if one doesn't exist
            shareLink = new ShareLink({
                resourceType: "profile",
                resourceId: id,
                createdBy: req.user.id,
            });
            await shareLink.save();
        }

        res.json({
            status: "success",
            data: {
                shareLink: `${req.protocol}://${req.get("host")}/share/${shareLink.shareId}`,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

router.post("/companies/:id/share", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const ShareLink = require("../../models/ShareLink");

        // Check if share link already exists for this Company
        let shareLink = await ShareLink.findOne({
            resourceType: "profile",
            resourceId: id
        });

        if (!shareLink) {
            // Create new share link only if one doesn't exist
            shareLink = new ShareLink({
                resourceType: "profile",
                resourceId: id,
                createdBy: req.user.id,
            });
            await shareLink.save();
        }

        res.json({
            status: "success",
            data: {
                shareLink: `${req.protocol}://${req.get("host")}/share/${shareLink.shareId}`,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

router.post("/campaigns/:id/share", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const ShareLink = require("../../models/ShareLink");

        // Check if share link already exists for this Campaign
        let shareLink = await ShareLink.findOne({
            resourceType: "campaign",
            resourceId: id
        });

        if (!shareLink) {
            // Create new share link only if one doesn't exist
            shareLink = new ShareLink({
                resourceType: "campaign",
                resourceId: id,
                createdBy: req.user.id,
            });
            await shareLink.save();
        }

        res.json({
            status: "success",
            data: {
                shareLink: `${req.protocol}://${req.get("host")}/share/${shareLink.shareId}`,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

// Reports Routes
router.get("/reports/ngos", authMiddleware, async (req, res) => {
    try {
        const ngos = await User.find({ role: "ngo" }).populate("ngoProfile");
        res.json({
            status: "success",
            data: { ngos },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

router.get("/reports/companies", authMiddleware, async (req, res) => {
    try {
        const companies = await User.find({ role: "company" }).populate(
            "companyProfile",
        );
        res.json({
            status: "success",
            data: { companies },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

router.get("/reports/campaigns", authMiddleware, async (req, res) => {
    try {
        const campaigns = await Campaign.find().populate("createdBy");
        res.json({
            status: "success",
            data: { campaigns },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

router.get("/reports/donations", authMiddleware, async (req, res) => {
    try {
        const Donation = require("../../models/Donation");
        const donations = await Donation.find().populate("donorId campaignId");
        res.json({
            status: "success",
            data: { donations },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

router.get("/reports/activities", authMiddleware, async (req, res) => {
    try {
        const activities = await Activity.find().populate("userId");
        res.json({
            status: "success",
            data: { activities },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

router.get("/reports/transactions", authMiddleware, async (req, res) => {
    try {
        const Donation = require("../../models/Donation");
        const transactions = await Donation.find({
            status: "completed",
        }).populate("donorId campaignId");
        res.json({
            status: "success",
            data: { transactions },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

// User profile customization for share links
router.put("/users/:id/customize", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { html, css, customDesign } = req.body;

        const ShareLink = require("../../models/ShareLink");

        // First, find if there's already a share link for this user profile
        let shareLink = await ShareLink.findOne({ 
            resourceType: "profile", 
            resourceId: id 
        });

        // Prepare the custom design object
        let designData = {};
        if (html || css) {
            designData = {
                html: html || "",
                css: css || "",
                ...(customDesign || {})
            };
        } else if (customDesign) {
            designData = customDesign;
        }

        if (!shareLink) {
            // Create new share link if it doesn't exist
            shareLink = new ShareLink({
                resourceType: "profile",
                resourceId: id,
                customDesign: designData,
                createdBy: req.user.id
            });
        } else {
            // Update existing share link
            shareLink.customDesign = designData;
        }

        await shareLink.save();

        res.json({ 
            message: "Profile customization saved successfully",
            shareLink: {
                shareId: shareLink.shareId,
                shareUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/share/profile/${shareLink.shareId}`,
                apiUrl: `http://localhost:5000/api/public/share/profile/${shareLink.shareId}`,
                customDesign: shareLink.customDesign
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error saving profile customization",
            error: error.message,
        });
    }
});

// Get user profile customization
router.get("/users/:id/customize", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;

        const ShareLink = require("../../models/ShareLink");

        const shareLink = await ShareLink.findOne({ 
            resourceType: "profile", 
            resourceId: id 
        });

        if (!shareLink) {
            return res.json({ 
                message: "No customization found",
                customDesign: { html: "", css: "" },
                shareUrl: null,
                apiUrl: null
            });
        }

        res.json({ 
            message: "Profile customization retrieved successfully",
            customDesign: shareLink.customDesign || { html: "", css: "" },
            shareUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/share/profile/${shareLink.shareId}`,
            apiUrl: `http://localhost:5000/api/public/share/profile/${shareLink.shareId}`,
            shareLink: {
                shareId: shareLink.shareId,
                resourceType: shareLink.resourceType,
                isActive: shareLink.isActive,
                viewCount: shareLink.viewCount
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving profile customization",
            error: error.message,
        });
    }
});

// Enhanced User Management Routes

// Edit user details
router.put("/users/:id/details", authMiddleware(["admin"]), AdminController.editUserDetails);

// Edit user profile (NGO/Company specific)
router.put("/users/:id/profile", authMiddleware(["admin"]), AdminController.editUserProfile);

// Delete user completely (user + profiles)
router.delete("/users/:id/complete", authMiddleware(["admin"]), AdminController.deleteUser);

router.get("/users/:id", authMiddleware(["admin"]), AdminController.viewUserProfile);

// Include upload routes
router.use("/", profileRoutes);
router.use("/campaigns", campaignRoutes);
router.use("/notices", noticeRoutes);
router.use("/reports", reportsRoutes);
router.use("/test-uploads", testUploadRoutes);

// Data Export and Backup Management
router.get("/dashboard/export/:type", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { type } = req.params;
        const { format = "json", dateFrom, dateTo } = req.query;
        
        let data;
        let dateFilter = {};
        
        if (dateFrom || dateTo) {
            if (dateFrom) dateFilter.$gte = new Date(dateFrom);
            if (dateTo) dateFilter.$lte = new Date(dateTo);
        }

        switch (type) {
            case "users":
                data = await User.find(dateFilter.createdAt ? { createdAt: dateFilter } : {})
                    .select("-password")
                    .populate("ngoProfile companyProfile");
                break;
            case "campaigns":
                data = await Campaign.find(dateFilter.createdAt ? { createdAt: dateFilter } : {})
                    .populate("ngoId", "ngoName");
                break;
            case "activities":
                data = await Activity.find(dateFilter.createdAt ? { createdAt: dateFilter } : {})
                    .populate("userId", "fullName email");
                break;
            case "analytics":
                data = {
                    userStats: await User.aggregate([
                        { $group: { _id: "$role", count: { $sum: 1 } } }
                    ]),
                    campaignStats: await Campaign.aggregate([
                        { $group: { _id: null, total: { $sum: "$raisedAmount" } } }
                    ])
                };
                break;
            default:
                return res.status(400).json({ message: "Invalid export type" });
        }

        if (format === "csv") {
            // You can implement CSV export here using a library like csv-writer
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${type}-export-${Date.now()}.csv`);
            // Implement CSV conversion
            res.send("CSV export not implemented yet");
        } else {
            res.setHeader('Content-Type', 'application/json');
            res.setHeader('Content-Disposition', `attachment; filename=${type}-export-${Date.now()}.json`);
            res.json({
                exportType: type,
                exportDate: new Date().toISOString(),
                recordCount: Array.isArray(data) ? data.length : 1,
                data
            });
        }
    } catch (error) {
        res.status(500).json({
            message: "Error exporting data",
            error: error.message,
        });
    }
});

// Automated Report Generation
router.post("/dashboard/generate-report", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { reportType, timeRange, format, includeCharts } = req.body;
        
        let reportData = {};
        let dateFilter;
        
        switch (timeRange) {
            case "daily":
                dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
                break;
            case "weekly":
                dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "monthly":
                dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                break;
            case "quarterly":
                dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                break;
            default:
                dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        }

        switch (reportType) {
            case "user-activity":
                reportData = {
                    totalUsers: await User.countDocuments(),
                    newUsers: await User.countDocuments({ createdAt: { $gte: dateFilter } }),
                    activeUsers: await User.countDocuments({ 
                        lastLogin: { $gte: dateFilter },
                        isActive: true 
                    }),
                    usersByRole: await User.aggregate([
                        { $group: { _id: "$role", count: { $sum: 1 } } }
                    ]),
                    topActiveUsers: await Activity.aggregate([
                        { $match: { createdAt: { $gte: dateFilter } } },
                        { $group: { _id: "$userId", activityCount: { $sum: 1 } } },
                        { $sort: { activityCount: -1 } },
                        { $limit: 10 }
                    ])
                };
                break;
                
            case "campaign-performance":
                reportData = {
                    totalCampaigns: await Campaign.countDocuments(),
                    activeCampaigns: await Campaign.countDocuments({ isActive: true }),
                    campaignStats: await Campaign.aggregate([
                        {
                            $group: {
                                _id: null,
                                totalTarget: { $sum: "$targetAmount" },
                                totalRaised: { $sum: "$raisedAmount" },
                                averageTarget: { $avg: "$targetAmount" },
                                averageRaised: { $avg: "$raisedAmount" }
                            }
                        }
                    ]),
                    topPerformingCampaigns: await Campaign.find()
                        .sort({ raisedAmount: -1 })
                        .limit(10)
                        .populate("ngoId", "ngoName")
                };
                break;
                
            case "security-audit":
                reportData = {
                    failedLogins: await Activity.countDocuments({
                        action: "login_failed",
                        createdAt: { $gte: dateFilter }
                    }),
                    suspiciousActivities: await Activity.find({
                        action: { $in: ["suspicious_access", "multiple_failed_login"] },
                        createdAt: { $gte: dateFilter }
                    }).populate("userId", "fullName email"),
                    adminActions: await Activity.find({
                        action: "admin_action",
                        createdAt: { $gte: dateFilter }
                    }).populate("userId", "fullName email"),
                    securityRecommendations: [
                        "Review users with multiple failed login attempts",
                        "Enable two-factor authentication",
                        "Regular password policy updates"
                    ]
                };
                break;
                
            default:
                return res.status(400).json({ message: "Invalid report type" });
        }

        const report = {
            reportId: `RPT-${Date.now()}`,
            reportType,
            timeRange,
            generatedAt: new Date().toISOString(),
            generatedBy: req.user.email,
            data: reportData,
            metadata: {
                totalRecords: Object.keys(reportData).length,
                includeCharts,
                format
            }
        };

        res.json({
            success: true,
            message: "Report generated successfully",
            report
        });
    } catch (error) {
        res.status(500).json({
            message: "Error generating report",
            error: error.message,
        });
    }
});

// Database Health and Backup Status
router.get("/dashboard/database-health", authMiddleware(["admin"]), async (req, res) => {
    try {
        const mongoose = require('mongoose');
        
        const dbStats = {
            connectionStatus: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
            databaseName: mongoose.connection.name || "Unknown",
            collections: {
                users: await User.countDocuments(),
                campaigns: await Campaign.countDocuments(),
                activities: await Activity.countDocuments(),
                ngos: await ngo.countDocuments(),
                companies: await company.countDocuments(),
                notices: await Notice.countDocuments()
            },
            indexes: {
                // You can implement index analysis here
                total: 0,
                status: "Optimal"
            },
            performance: {
                avgQueryTime: "< 50ms", // Implement actual query time tracking
                slowQueries: 0,
                connectionPool: {
                    active: 1,
                    available: 10
                }
            },
            backup: {
                lastBackup: "Not configured", // Implement backup tracking
                nextScheduled: "Not scheduled",
                status: "Manual backups only"
            }
        };

        res.json({
            success: true,
            data: dbStats,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching database health",
            error: error.message,
        });
    }
});

// Performance Metrics Dashboard
router.get("/dashboard/performance", authMiddleware(["admin"]), async (req, res) => {
    try {
        const performanceMetrics = {
            api: {
                totalRequests: 0, // Implement request counting
                averageResponseTime: 0, // Implement response time tracking
                errorRate: 0, // Implement error rate tracking
                slowestEndpoints: [] // Implement endpoint performance tracking
            },
            database: {
                queryCount: 0, // Implement query counting
                averageQueryTime: 0, // Implement query time tracking
                slowQueries: [], // Implement slow query logging
                connectionPoolUsage: 0
            },
            server: {
                cpuUsage: process.cpuUsage(),
                memoryUsage: process.memoryUsage(),
                uptime: process.uptime(),
                loadAverage: require('os').loadavg()
            },
            storage: {
                uploadedFiles: 0, // Count files in uploads directory
                totalStorageUsed: "0 MB", // Calculate storage usage
                storageLimit: "1 GB" // Your storage limit
            }
        };

        res.json({
            success: true,
            data: performanceMetrics,
            recommendations: [
                "Monitor slow database queries",
                "Implement response time optimization",
                "Set up automated performance alerts",
                "Regular cleanup of old log files"
            ]
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching performance metrics",
            error: error.message,
        });
    }
});

// Professional Dashboard Search & Filter
router.get("/dashboard/search", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { query, type, limit = 10 } = req.query;
        
        if (!query || query.length < 2) {
            return res.status(400).json({
                success: false,
                message: "Search query must be at least 2 characters"
            });
        }

        const searchRegex = new RegExp(query, "i");
        const results = {};

        // Search users
        if (!type || type === "users") {
            results.users = await User.find({
                $or: [
                    { fullName: searchRegex },
                    { email: searchRegex }
                ]
            })
            .select("_id fullName email role isActive createdAt")
            .limit(parseInt(limit))
            .lean();
        }

        // Search campaigns
        if (!type || type === "campaigns") {
            results.campaigns = await Campaign.find({
                $or: [
                    { campaignName: searchRegex },
                    { title: searchRegex },
                    { description: searchRegex }
                ]
            })
            .select("_id campaignName title targetAmount raisedAmount isActive createdAt")
            .populate("ngoId", "ngoName")
            .limit(parseInt(limit))
            .lean();
        }

        // Search NGOs
        if (!type || type === "ngos") {
            results.ngos = await ngo.find({
                $or: [
                    { ngoName: searchRegex },
                    { email: searchRegex }
                ]
            })
            .select("_id ngoName email contactNumber isActive createdAt")
            .limit(parseInt(limit))
            .lean();
        }

        // Search companies
        if (!type || type === "companies") {
            results.companies = await company.find({
                $or: [
                    { companyName: searchRegex },
                    { companyEmail: searchRegex }
                ]
            })
            .select("_id companyName companyEmail companyPhoneNumber isActive createdAt")
            .limit(parseInt(limit))
            .lean();
        }

        // Search activities
        if (!type || type === "activities") {
            results.activities = await Activity.find({
                $or: [
                    { action: searchRegex },
                    { description: searchRegex }
                ]
            })
            .populate("userId", "fullName email")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean();
        }

        res.json({
            success: true,
            query,
            results,
            totalResults: Object.values(results).reduce((total, arr) => total + arr.length, 0)
        });
    } catch (error) {
        console.error("Dashboard search error:", error);
        res.status(500).json({
            success: false,
            message: "Error performing search",
            error: error.message
        });
    }
});

// Advanced Dashboard Filters
router.get("/dashboard/filters", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { 
            entity, 
            status, 
            role, 
            dateFrom, 
            dateTo, 
            sortBy = "createdAt", 
            sortOrder = "desc",
            page = 1,
            limit = 20
        } = req.query;

        const filter = {};
        const sort = {};
        
        // Build filter object
        if (status) filter.isActive = status === "active";
        if (role) filter.role = role;
        if (dateFrom || dateTo) {
            filter.createdAt = {};
            if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
            if (dateTo) filter.createdAt.$lte = new Date(dateTo);
        }

        // Build sort object
        sort[sortBy] = sortOrder === "desc" ? -1 : 1;

        let results = {};
        let totalCount = 0;

        switch (entity) {
            case "users":
                results.users = await User.find(filter)
                    .select("-password")
                    .sort(sort)
                    .limit(parseInt(limit))
                    .skip((parseInt(page) - 1) * parseInt(limit))
                    .lean();
                totalCount = await User.countDocuments(filter);
                break;

            case "campaigns":
                results.campaigns = await Campaign.find(filter)
                    .populate("ngoId", "ngoName")
                    .sort(sort)
                    .limit(parseInt(limit))
                    .skip((parseInt(page) - 1) * parseInt(limit))
                    .lean();
                totalCount = await Campaign.countDocuments(filter);
                break;

            case "ngos":
                results.ngos = await ngo.find(filter)
                    .populate("userId", "fullName email")
                    .sort(sort)
                    .limit(parseInt(limit))
                    .skip((parseInt(page) - 1) * parseInt(limit))
                    .lean();
                totalCount = await ngo.countDocuments(filter);
                break;

            case "companies":
                results.companies = await company.find(filter)
                    .populate("userId", "fullName email")
                    .sort(sort)
                    .limit(parseInt(limit))
                    .skip((parseInt(page) - 1) * parseInt(limit))
                    .lean();
                totalCount = await company.countDocuments(filter);
                break;

            case "activities":
                results.activities = await Activity.find(filter)
                    .populate("userId", "fullName email role")
                    .sort(sort)
                    .limit(parseInt(limit))
                    .skip((parseInt(page) - 1) * parseInt(limit))
                    .lean();
                totalCount = await Activity.countDocuments(filter);
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid entity type"
                });
        }

        res.json({
            success: true,
            entity,
            results,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                pages: Math.ceil(totalCount / parseInt(limit))
            },
            filters: {
                status,
                role,
                dateFrom,
                dateTo,
                sortBy,
                sortOrder
            }
        });
    } catch (error) {
        console.error("Dashboard filters error:", error);
        res.status(500).json({
            success: false,
            message: "Error applying filters",
            error: error.message
        });
    }
});

// Professional Dashboard Quick Actions
router.post("/dashboard/quick-actions", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { action, entityType, entityIds, params = {} } = req.body;

        if (!action || !entityType || !entityIds || !Array.isArray(entityIds)) {
            return res.status(400).json({
                success: false,
                message: "Invalid quick action parameters"
            });
        }

        let results = {};
        let successCount = 0;
        let errors = [];

        switch (action) {
            case "activate":
                if (entityType === "users") {
                    await User.updateMany(
                        { _id: { $in: entityIds } },
                        { isActive: true }
                    );
                    successCount = entityIds.length;
                } else if (entityType === "campaigns") {
                    await Campaign.updateMany(
                        { _id: { $in: entityIds } },
                        { isActive: true }
                    );
                    successCount = entityIds.length;
                }
                break;

            case "deactivate":
                if (entityType === "users") {
                    await User.updateMany(
                        { _id: { $in: entityIds } },
                        { isActive: false }
                    );
                    successCount = entityIds.length;
                } else if (entityType === "campaigns") {
                    await Campaign.updateMany(
                        { _id: { $in: entityIds } },
                        { isActive: false }
                    );
                    successCount = entityIds.length;
                }
                break;

            case "approve":
                if (entityType === "users") {
                    await User.updateMany(
                        { _id: { $in: entityIds } },
                        { approvalStatus: "approved", isActive: true }
                    );
                    successCount = entityIds.length;
                } else if (entityType === "campaigns") {
                    await Campaign.updateMany(
                        { _id: { $in: entityIds } },
                        { approvalStatus: "approved", isActive: true }
                    );
                    successCount = entityIds.length;
                }
                break;

            case "reject":
                if (entityType === "users") {
                    await User.updateMany(
                        { _id: { $in: entityIds } },
                        { approvalStatus: "rejected", isActive: false }
                    );
                    successCount = entityIds.length;
                } else if (entityType === "campaigns") {
                    await Campaign.updateMany(
                        { _id: { $in: entityIds } },
                        { approvalStatus: "rejected", isActive: false }
                    );
                    successCount = entityIds.length;
                }
                break;

            case "delete":
                if (entityType === "users") {
                    // Prevent deleting admin users
                    const adminUsers = await User.find({ 
                        _id: { $in: entityIds }, 
                        role: "admin" 
                    });
                    
                    if (adminUsers.length > 0) {
                        errors.push("Cannot delete admin users");
                        return res.status(400).json({
                            success: false,
                            message: "Cannot delete admin users",
                            errors
                        });
                    }

                    await User.deleteMany({ _id: { $in: entityIds } });
                    successCount = entityIds.length;
                } else if (entityType === "campaigns") {
                    await Campaign.deleteMany({ _id: { $in: entityIds } });
                    successCount = entityIds.length;
                }
                break;

            default:
                return res.status(400).json({
                    success: false,
                    message: "Invalid action type"
                });
        }

        // Log the bulk action
        await Activity.create({
            userId: req.user.id,
            action: `admin_bulk_${action}`,
            description: `Admin performed bulk ${action} on ${successCount} ${entityType}`,
            metadata: { entityType, entityIds, successCount, action }
        });

        res.json({
            success: true,
            message: `Successfully ${action}d ${successCount} ${entityType}`,
            results: {
                action,
                entityType,
                successCount,
                totalRequested: entityIds.length,
                errors
            }
        });
    } catch (error) {
        console.error("Dashboard quick actions error:", error);
        res.status(500).json({
            success: false,
            message: "Error performing quick action",
            error: error.message
        });
    }
});

// Export router
module.exports = router;