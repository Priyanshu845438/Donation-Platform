
const express = require("express");
const Notice = require("../../models/Notice");
const User = require("../../models/User");
const authMiddleware = require("../../middleware/auth");
const Activity = require("../../models/Activity");
const nodemailer = require("nodemailer");

const router = express.Router();

// Get all notices with filtering and pagination
router.get("/", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { page = 1, limit = 10, type, priority, targetRole, status, search } = req.query;

        let query = {};
        
        if (type) query.type = type;
        if (priority) query.priority = priority;
        if (targetRole) query.targetRole = targetRole;
        if (status) query.isActive = status === "active";
        
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: "i" } },
                { content: { $regex: search, $options: "i" } }
            ];
        }

        const notices = await Notice.find(query)
            .populate("createdBy", "fullName email")
            .populate("targetUsers", "fullName email role")
            .populate("readBy.user", "fullName email")
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));

        const total = await Notice.countDocuments(query);

        // Get notice statistics
        const stats = await Notice.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);

        res.json({
            success: true,
            notices,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / parseInt(limit))
            },
            stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching notices",
            error: error.message
        });
    }
});

// Create a new notice
router.post("/", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { 
            title, 
            content, 
            type = "info", 
            priority = "medium", 
            targetRole, 
            targetUsers, 
            sendEmail = false, 
            scheduledAt 
        } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: "Title and content are required"
            });
        }

        const notice = new Notice({
            title,
            content,
            type,
            priority,
            targetRole,
            targetUsers,
            sendEmail,
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
            createdBy: req.user.id
        });

        await notice.save();

        // If not scheduled, send immediately
        if (!scheduledAt) {
            await sendNoticeToUsers(notice);
        }

        // Log activity
        await Activity.create({
            userId: req.user.id,
            action: "admin_create_notice",
            description: `Admin created notice: ${title}`,
            metadata: { noticeId: notice._id, type, priority }
        });

        res.status(201).json({
            success: true,
            message: "Notice created successfully",
            notice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error creating notice",
            error: error.message
        });
    }
});

// Get a specific notice by ID
router.get("/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;

        const notice = await Notice.findById(id)
            .populate("createdBy", "fullName email")
            .populate("targetUsers", "fullName email role")
            .populate("readBy.user", "fullName email");

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: "Notice not found"
            });
        }

        res.json({
            success: true,
            notice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching notice",
            error: error.message
        });
    }
});

// Update a notice
router.put("/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const notice = await Notice.findByIdAndUpdate(
            id,
            { ...updateData, updatedAt: new Date() },
            { new: true }
        ).populate("createdBy", "fullName email");

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: "Notice not found"
            });
        }

        // Log activity
        await Activity.create({
            userId: req.user.id,
            action: "admin_update_notice",
            description: `Admin updated notice: ${notice.title}`,
            metadata: { noticeId: id }
        });

        res.json({
            success: true,
            message: "Notice updated successfully",
            notice
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error updating notice",
            error: error.message
        });
    }
});

// Delete a notice
router.delete("/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;

        const notice = await Notice.findByIdAndDelete(id);

        if (!notice) {
            return res.status(404).json({
                success: false,
                message: "Notice not found"
            });
        }

        // Log activity
        await Activity.create({
            userId: req.user.id,
            action: "admin_delete_notice",
            description: `Admin deleted notice: ${notice.title}`,
            metadata: { deletedNoticeId: id }
        });

        res.json({
            success: true,
            message: "Notice deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error deleting notice",
            error: error.message
        });
    }
});

// Send notice to specific users
router.post("/:id/send", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { userIds } = req.body;

        const notice = await Notice.findById(id);
        if (!notice) {
            return res.status(404).json({
                success: false,
                message: "Notice not found"
            });
        }

        if (userIds && userIds.length > 0) {
            notice.targetUsers = [...new Set([...notice.targetUsers, ...userIds])];
            await notice.save();
        }

        await sendNoticeToUsers(notice);

        res.json({
            success: true,
            message: "Notice sent successfully"
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error sending notice",
            error: error.message
        });
    }
});

// Mark notice as read (for users)
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

// Get notices for current user
router.get("/user/my-notices", authMiddleware(), async (req, res) => {
    try {
        const { page = 1, limit = 10, type, unread } = req.query;

        let query = {
            $or: [
                { targetRole: "all" },
                { targetRole: req.user.role },
                { targetUsers: req.user.id }
            ],
            isActive: true
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
            message: "Error fetching user notices",
            error: error.message
        });
    }
});

// Get notice statistics
router.get("/stats/overview", authMiddleware(["admin"]), async (req, res) => {
    try {
        const totalNotices = await Notice.countDocuments();
        const activeNotices = await Notice.countDocuments({ isActive: true });
        const scheduledNotices = await Notice.countDocuments({ 
            scheduledAt: { $gt: new Date() } 
        });

        const typeStats = await Notice.aggregate([
            { $group: { _id: "$type", count: { $sum: 1 } } }
        ]);

        const priorityStats = await Notice.aggregate([
            { $group: { _id: "$priority", count: { $sum: 1 } } }
        ]);

        const recentNotices = await Notice.find()
            .populate("createdBy", "fullName")
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            stats: {
                totalNotices,
                activeNotices,
                scheduledNotices,
                typeStats,
                priorityStats,
                recentNotices
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error fetching notice statistics",
            error: error.message
        });
    }
});

// Helper function to send notices to users
async function sendNoticeToUsers(notice) {
    try {
        let targetUsers = [];

        if (notice.targetRole && notice.targetRole !== "all") {
            const roleUsers = await User.find({ 
                role: notice.targetRole, 
                isActive: true 
            });
            targetUsers = [...targetUsers, ...roleUsers];
        } else if (notice.targetRole === "all") {
            const allUsers = await User.find({ isActive: true });
            targetUsers = [...targetUsers, ...allUsers];
        }

        if (notice.targetUsers && notice.targetUsers.length > 0) {
            const specificUsers = await User.find({ 
                _id: { $in: notice.targetUsers },
                isActive: true 
            });
            targetUsers = [...targetUsers, ...specificUsers];
        }

        // Remove duplicates
        targetUsers = targetUsers.filter((user, index, self) =>
            index === self.findIndex(u => u._id.toString() === user._id.toString())
        );

        // Send email notifications if enabled
        if (notice.sendEmail && targetUsers.length > 0) {
            await sendEmailNotifications(notice, targetUsers);
        }

        // Mark as sent
        notice.sentAt = new Date();
        await notice.save();

        return { success: true, sentTo: targetUsers.length };
    } catch (error) {
        console.error("Error sending notice to users:", error);
        return { success: false, error: error.message };
    }
}

// Helper function to send email notifications
async function sendEmailNotifications(notice, users) {
    try {
        // Configure email transporter (you might want to move this to config)
        const transporter = nodemailer.createTransporter({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: process.env.SMTP_PORT || 587,
            secure: false,
            auth: {
                user: process.env.EMAIL_ID,
                pass: process.env.EMAIL_PASS
            }
        });

        const emailPromises = users.map(user => {
            const mailOptions = {
                from: process.env.EMAIL_ID,
                to: user.email,
                subject: `[${notice.type.toUpperCase()}] ${notice.title}`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                            <h2 style="color: #333; margin-bottom: 20px;">${notice.title}</h2>
                            <div style="background-color: white; padding: 20px; border-radius: 4px; border-left: 4px solid #007bff;">
                                <p style="color: #666; line-height: 1.6;">${notice.content}</p>
                            </div>
                            <div style="margin-top: 20px; padding: 15px; background-color: #e9ecef; border-radius: 4px;">
                                <p style="margin: 0; color: #6c757d; font-size: 14px;">
                                    <strong>Priority:</strong> ${notice.priority.toUpperCase()} |
                                    <strong>Type:</strong> ${notice.type.toUpperCase()}
                                </p>
                            </div>
                        </div>
                    </div>
                `
            };

            return transporter.sendMail(mailOptions);
        });

        await Promise.all(emailPromises);
        console.log(`Email notifications sent to ${users.length} users`);
    } catch (error) {
        console.error("Error sending email notifications:", error);
    }
}

module.exports = router;
