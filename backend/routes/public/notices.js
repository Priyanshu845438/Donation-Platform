
const express = require("express");
const Notice = require("../../models/Notice");
const authMiddleware = require("../../middleware/auth");

const router = express.Router();

// Get public notices (no authentication required)
router.get("/public", async (req, res) => {
    try {
        const { page = 1, limit = 10, type } = req.query;

        let query = {
            targetRole: "all",
            isActive: true,
            $or: [
                { scheduledAt: null },
                { scheduledAt: { $lte: new Date() } }
            ]
        };

        if (type) query.type = type;

        const notices = await Notice.find(query)
            .select("title content type priority createdAt")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Notice.countDocuments(query);

        res.json({
            success: true,
            notices,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching public notices",
            error: error.message
        });
    }
});

// Get user-specific notices (authentication required)
router.get("/my-notices", authMiddleware(), async (req, res) => {
    try {
        const { page = 1, limit = 10, type, unread } = req.query;

        let query = {
            $or: [
                { targetRole: "all" },
                { targetRole: req.user.role },
                { targetUsers: req.user.id }
            ],
            isActive: true,
            $and: [
                {
                    $or: [
                        { scheduledAt: null },
                        { scheduledAt: { $lte: new Date() } }
                    ]
                }
            ]
        };

        if (type) query.type = type;

        if (unread === "true") {
            query["readBy.user"] = { $ne: req.user.id };
        }

        const notices = await Notice.find(query)
            .populate("createdBy", "fullName")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Notice.countDocuments(query);

        // Count unread notices
        const unreadCount = await Notice.countDocuments({
            ...query,
            "readBy.user": { $ne: req.user.id }
        });

        res.json({
            success: true,
            notices,
            unreadCount,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching user notices",
            error: error.message
        });
    }
});

// Mark notice as read
router.put("/:id/read", authMiddleware(), async (req, res) => {
    try {
        const { id } = req.params;

        const notice = await Notice.findById(id);
        if (!notice) {
            return res.status(404).json({
                success: false,
                message: "Notice not found"
            });
        }

        // Check if user is eligible to read this notice
        const isEligible = notice.targetRole === "all" || 
                          notice.targetRole === req.user.role || 
                          notice.targetUsers.includes(req.user.id);

        if (!isEligible) {
            return res.status(403).json({
                success: false,
                message: "You are not authorized to read this notice"
            });
        }

        // Check if already read
        const alreadyRead = notice.readBy.some(
            read => read.user.toString() === req.user.id
        );

        if (!alreadyRead) {
            notice.readBy.push({
                user: req.user.id,
                readAt: new Date()
            });
            await notice.save();
        }

        res.json({
            success: true,
            message: "Notice marked as read"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error marking notice as read",
            error: error.message
        });
    }
});

// Get unread notice count
router.get("/unread-count", authMiddleware(), async (req, res) => {
    try {
        const unreadCount = await Notice.countDocuments({
            $or: [
                { targetRole: "all" },
                { targetRole: req.user.role },
                { targetUsers: req.user.id }
            ],
            isActive: true,
            $and: [
                {
                    $or: [
                        { scheduledAt: null },
                        { scheduledAt: { $lte: new Date() } }
                    ]
                }
            ],
            "readBy.user": { $ne: req.user.id }
        });

        res.json({
            success: true,
            unreadCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching unread count",
            error: error.message
        });
    }
});

module.exports = router;
