
const express = require("express");
const authMiddleware = require("../../middleware/auth");
const { createSuccessResponse, createErrorResponse } = require("../../utils/errorHandler");
const User = require("../../models/User");
const Campaign = require("../../models/Campaign");
const Activity = require("../../models/Activity");

const router = express.Router();

// Get system information
router.get("/info", authMiddleware(["admin"]), async (req, res) => {
    try {
        const os = require('os');
        const systemInfo = {
            server: {
                platform: os.platform(),
                arch: os.arch(),
                nodeVersion: process.version,
                uptime: Math.floor(process.uptime()),
                hostname: os.hostname()
            },
            memory: {
                total: Math.round(os.totalmem() / 1024 / 1024),
                free: Math.round(os.freemem() / 1024 / 1024),
                used: Math.round((os.totalmem() - os.freemem()) / 1024 / 1024),
                processUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
                processTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
            },
            cpu: {
                cores: os.cpus().length,
                model: os.cpus()[0]?.model || 'Unknown',
                loadAverage: os.loadavg()
            },
            database: {
                status: require('mongoose').connection.readyState === 1 ? "Connected" : "Disconnected",
                name: require('mongoose').connection.name || "donation_platform"
            }
        };

        return createSuccessResponse(res, 200, {
            message: "System information retrieved successfully",
            systemInfo
        });
    } catch (error) {
        console.error("Get system info error:", error);
        return createErrorResponse(res, 500, "Failed to retrieve system information", error.message);
    }
});

// Get system health
router.get("/health", authMiddleware(["admin"]), async (req, res) => {
    try {
        const memoryUsage = process.memoryUsage();
        const systemMemory = require('os').totalmem();
        const freeMemory = require('os').freemem();

        const healthStatus = {
            status: "healthy",
            checks: {
                database: require('mongoose').connection.readyState === 1,
                memory: (memoryUsage.heapUsed / memoryUsage.heapTotal) < 0.9,
                uptime: process.uptime() > 0
            },
            metrics: {
                uptime: Math.floor(process.uptime()),
                memoryUsage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
                systemMemoryUsage: Math.round(((systemMemory - freeMemory) / systemMemory) * 100),
                activeConnections: await User.countDocuments({ 
                    lastLogin: { $gte: new Date(Date.now() - 30 * 60 * 1000) } 
                })
            }
        };

        // Determine overall status
        const failedChecks = Object.values(healthStatus.checks).filter(check => !check).length;
        if (failedChecks > 0) {
            healthStatus.status = failedChecks > 1 ? "critical" : "warning";
        }

        return createSuccessResponse(res, 200, {
            message: "System health retrieved successfully",
            health: healthStatus
        });
    } catch (error) {
        console.error("Get system health error:", error);
        return createErrorResponse(res, 500, "Failed to retrieve system health", error.message);
    }
});

// Get performance metrics
router.get("/performance", authMiddleware(["admin"]), async (req, res) => {
    try {
        const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        const metrics = {
            requests: {
                total: 0, // You can implement request counting middleware
                errors: 0,
                averageResponseTime: 0
            },
            database: {
                totalQueries: 0,
                slowQueries: 0,
                averageQueryTime: 0
            },
            users: {
                activeUsers: await User.countDocuments({
                    lastLogin: { $gte: last24h }
                }),
                totalUsers: await User.countDocuments(),
                newUsers: await User.countDocuments({
                    createdAt: { $gte: last24h }
                })
            },
            activities: {
                total: await Activity.countDocuments({
                    createdAt: { $gte: last24h }
                }),
                errors: await Activity.countDocuments({
                    action: { $regex: /error|fail/i },
                    createdAt: { $gte: last24h }
                })
            }
        };

        return createSuccessResponse(res, 200, {
            message: "Performance metrics retrieved successfully",
            metrics
        });
    } catch (error) {
        console.error("Get performance metrics error:", error);
        return createErrorResponse(res, 500, "Failed to retrieve performance metrics", error.message);
    }
});

module.exports = router;
