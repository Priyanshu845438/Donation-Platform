
const express = require("express");
const Activity = require("../../models/Activity");
const authMiddleware = require("../../middleware/auth");
const { createSuccessResponse, createErrorResponse } = require("../../utils/errorHandler");

const router = express.Router();

// Get all activities with filtering
router.get("/", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 20, 
            action, 
            userId, 
            startDate, 
            endDate,
            search 
        } = req.query;

        let query = {};
        
        if (action) query.action = action;
        if (userId) query.userId = userId;
        
        if (startDate || endDate) {
            query.createdAt = {};
            if (startDate) query.createdAt.$gte = new Date(startDate);
            if (endDate) query.createdAt.$lte = new Date(endDate);
        }

        if (search) {
            query.$or = [
                { action: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ];
        }

        const activities = await Activity.find(query)
            .populate("userId", "fullName email role")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Activity.countDocuments(query);

        // Get action statistics
        const actionStats = await Activity.aggregate([
            { $match: query },
            { $group: { _id: "$action", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        return createSuccessResponse(res, 200, {
            message: "Activities retrieved successfully",
            activities,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            },
            stats: {
                total,
                actionStats
            }
        });
    } catch (error) {
        console.error("Get activities error:", error);
        return createErrorResponse(res, 500, "Failed to retrieve activities", error.message);
    }
});

// Get activity by ID
router.get("/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        
        const activity = await Activity.findById(id)
            .populate("userId", "fullName email role");

        if (!activity) {
            return createErrorResponse(res, 404, "Activity not found");
        }

        return createSuccessResponse(res, 200, {
            message: "Activity retrieved successfully",
            activity
        });
    } catch (error) {
        console.error("Get activity error:", error);
        return createErrorResponse(res, 500, "Failed to retrieve activity", error.message);
    }
});

// Delete activity
router.delete("/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        
        const activity = await Activity.findByIdAndDelete(id);
        if (!activity) {
            return createErrorResponse(res, 404, "Activity not found");
        }

        // Log the deletion
        await Activity.create({
            userId: req.user.id,
            action: "admin_delete_activity",
            description: `Admin deleted activity: ${activity.action}`,
            metadata: { deletedActivityId: id }
        });

        return createSuccessResponse(res, 200, {
            message: "Activity deleted successfully"
        });
    } catch (error) {
        console.error("Delete activity error:", error);
        return createErrorResponse(res, 500, "Failed to delete activity", error.message);
    }
});

// Bulk delete activities
router.delete("/bulk/delete", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { activityIds, olderThan } = req.body;
        
        let deleteQuery = {};
        
        if (activityIds && activityIds.length > 0) {
            deleteQuery._id = { $in: activityIds };
        } else if (olderThan) {
            deleteQuery.createdAt = { $lt: new Date(olderThan) };
        } else {
            return createErrorResponse(res, 400, "Either activityIds or olderThan parameter is required");
        }

        const result = await Activity.deleteMany(deleteQuery);

        // Log the bulk deletion
        await Activity.create({
            userId: req.user.id,
            action: "admin_bulk_delete_activities",
            description: `Admin deleted ${result.deletedCount} activities`,
            metadata: { deletedCount: result.deletedCount, deleteQuery }
        });

        return createSuccessResponse(res, 200, {
            message: `${result.deletedCount} activities deleted successfully`,
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error("Bulk delete activities error:", error);
        return createErrorResponse(res, 500, "Failed to delete activities", error.message);
    }
});

// Get activity statistics
router.get("/stats/overview", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { timeRange = "30d" } = req.query;
        
        let dateFilter;
        switch(timeRange) {
            case "24h":
                dateFilter = new Date(Date.now() - 24 * 60 * 60 * 1000);
                break;
            case "7d":
                dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "30d":
                dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                break;
            default:
                dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        }

        const stats = {
            totalActivities: await Activity.countDocuments(),
            recentActivities: await Activity.countDocuments({ createdAt: { $gte: dateFilter } }),
            topActions: await Activity.aggregate([
                { $match: { createdAt: { $gte: dateFilter } } },
                { $group: { _id: "$action", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            topUsers: await Activity.aggregate([
                { $match: { createdAt: { $gte: dateFilter } } },
                { $group: { _id: "$userId", count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: "users",
                        localField: "_id",
                        foreignField: "_id",
                        as: "user"
                    }
                },
                { $unwind: "$user" },
                {
                    $project: {
                        userId: "$_id",
                        count: 1,
                        fullName: "$user.fullName",
                        email: "$user.email"
                    }
                }
            ]),
            dailyTrend: await Activity.aggregate([
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
            ])
        };

        return createSuccessResponse(res, 200, {
            message: "Activity statistics retrieved successfully",
            stats,
            timeRange
        });
    } catch (error) {
        console.error("Get activity stats error:", error);
        return createErrorResponse(res, 500, "Failed to retrieve activity statistics", error.message);
    }
});

module.exports = router;
