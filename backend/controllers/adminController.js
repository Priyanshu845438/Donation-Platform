const User = require("../models/User");
const NGO = require("../models/NGO");
const Company = require("../models/Company");
const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");
const Activity = require("../models/Activity");
const Notice = require("../models/Notice");
const Settings = require("../models/Settings");
const ShareLink = require("../models/ShareLink");
const bcrypt = require("bcryptjs");
const { createErrorResponse, createSuccessResponse } = require("../utils/errorHandler");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

class AdminController {
    // Dashboard analytics
    static async getDashboard(req, res) {
        try {
            const [
                totalUsers,
                totalNGOs,
                totalCompanies,
                totalCampaigns,
                totalDonations,
                pendingApprovals,
                recentActivities
            ] = await Promise.all([
                User.countDocuments(),
                NGO.countDocuments(),
                Company.countDocuments(),
                Campaign.countDocuments(),
                Donation.countDocuments(),
                User.countDocuments({ approvalStatus: "pending" }),
                Activity.find().sort({ createdAt: -1 }).limit(10).populate("userId", "fullName email")
            ]);

            // Role-wise statistics
            const roleStats = await User.aggregate([
                { $group: { _id: "$role", count: { $sum: 1 } } }
            ]);

            // Monthly registration trends
            const monthlyRegistrations = await User.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": -1, "_id.month": -1 } },
                { $limit: 12 }
            ]);

            // Donation statistics
            const donationStats = await Donation.aggregate([
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$amount" },
                        averageAmount: { $avg: "$amount" },
                        count: { $sum: 1 }
                    }
                }
            ]);

            return createSuccessResponse(res, 200, {
                message: "Dashboard data retrieved successfully",
                dashboard: {
                    overview: {
                        totalUsers,
                        totalNGOs,
                        totalCompanies,
                        totalCampaigns,
                        totalDonations: donationStats[0]?.count || 0,
                        pendingApprovals
                    },
                    roleStats,
                    monthlyRegistrations,
                    donationStats: donationStats[0] || { totalAmount: 0, averageAmount: 0, count: 0 },
                    recentActivities
                }
            });

        } catch (error) {
            console.error("Dashboard error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve dashboard data", error.message);
        }
    }

    // Analytics with charts data
    static async getAnalytics(req, res) {
        try {
            const { period = "month" } = req.query;

            // User growth chart
            const userGrowth = await User.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: period === "month" ? { $month: "$createdAt" } : null,
                            day: period === "day" ? { $dayOfMonth: "$createdAt" } : null
                        },
                        users: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
            ]);

            // Campaign performance
            const campaignPerformance = await Campaign.aggregate([
                {
                    $lookup: {
                        from: "donations",
                        localField: "_id",
                        foreignField: "campaignId",
                        as: "donations"
                    }
                },
                {
                    $project: {
                        title: 1,
                        targetAmount: 1,
                        raisedAmount: { $sum: "$donations.amount" },
                        donationCount: { $size: "$donations" }
                    }
                }
            ]);

            // Role distribution pie chart
            const roleDistribution = await User.aggregate([
                { $group: { _id: "$role", count: { $sum: 1 } } }
            ]);

            // Donation trends
            const donationTrends = await Donation.aggregate([
                {
                    $group: {
                        _id: {
                            year: { $year: "$createdAt" },
                            month: { $month: "$createdAt" }
                        },
                        amount: { $sum: "$amount" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": 1, "_id.month": 1 } }
            ]);

            return createSuccessResponse(res, 200, {
                message: "Analytics data retrieved successfully",
                analytics: {
                    userGrowth,
                    campaignPerformance,
                    roleDistribution,
                    donationTrends
                }
            });

        } catch (error) {
            console.error("Analytics error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve analytics data", error.message);
        }
    }

    // User Management
    static async createUser(req, res) {
        try {
            const { fullName, email, password, phoneNumber, role, approvalStatus } = req.body;

            if (!fullName || !email || !password || !phoneNumber || !role) {
                return createErrorResponse(res, 400, "All fields are required");
            }

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return createErrorResponse(res, 400, "User already exists");
            }

            const hashedPassword = await bcrypt.hash(password, 12);

            const newUser = new User({
                fullName,
                email,
                password: hashedPassword,
                phoneNumber,
                role: role.toLowerCase(),
                isVerified: true,
                isActive: true,
                approvalStatus: approvalStatus || "approved"
            });

            await newUser.save();

            // Create role-specific profile
            let profileData = null;
            if (role.toLowerCase() === "ngo") {
                profileData = await AdminController.createNGOProfile(newUser, { fullName, email, phoneNumber });
            } else if (role.toLowerCase() === "company") {
                profileData = await AdminController.createCompanyProfile(newUser, { fullName, email, phoneNumber });
            }

            // Log activity
            await Activity.create({
                userId: req.user.id,
                action: "admin_create_user",
                description: `Admin created user: ${email}`,
                metadata: { targetUserId: newUser._id, role }
            });

            return createSuccessResponse(res, 201, {
                message: "User created successfully",
                user: {
                    id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    role: newUser.role
                },
                profile: profileData
            });

        } catch (error) {
            console.error("Create user error:", error);
            return createErrorResponse(res, 500, "Failed to create user", error.message);
        }
    }

    static async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 10, role, status, search } = req.query;

            const filter = {};
            if (role) filter.role = role;
            if (status) filter.approvalStatus = status;
            if (search) {
                filter.$or = [
                    { fullName: { $regex: search, $options: "i" } },
                    { email: { $regex: search, $options: "i" } }
                ];
            }

            const users = await User.find(filter)
                .select("-password")
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await User.countDocuments(filter);

            return createSuccessResponse(res, 200, {
                message: "Users retrieved successfully",
                users,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            });

        } catch (error) {
            console.error("Get users error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve users", error.message);
        }
    }

    static async approveUser(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body; // "approved" or "rejected"

            const user = await User.findByIdAndUpdate(
                id,
                { 
                    approvalStatus: status,
                    isActive: status === "approved"
                },
                { new: true }
            ).select("-password");

            if (!user) {
                return createErrorResponse(res, 404, "User not found");
            }

            await Activity.create({
                userId: req.user.id,
                action: "admin_approve_user",
                description: `Admin ${status} user: ${user.email}`,
                metadata: { targetUserId: user._id, status }
            });

            // Send email notification
            await AdminController.sendApprovalEmail(user, status);

            return createSuccessResponse(res, 200, {
                message: `User ${status} successfully`,
                user
            });

        } catch (error) {
            console.error("Approve user error:", error);
            return createErrorResponse(res, 500, "Failed to approve user", error.message);
        }
    }

    static async toggleUserStatus(req, res) {
        try {
            const { id } = req.params;

            const user = await User.findById(id);
            if (!user) {
                return createErrorResponse(res, 404, "User not found");
            }

            user.isActive = !user.isActive;
            await user.save();

            await Activity.create({
                userId: req.user.id,
                action: "admin_toggle_user_status",
                description: `Admin ${user.isActive ? 'activated' : 'deactivated'} user: ${user.email}`,
                metadata: { targetUserId: user._id, isActive: user.isActive }
            });

            return createSuccessResponse(res, 200, {
                message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
                user: { id: user._id, isActive: user.isActive }
            });

        } catch (error) {
            console.error("Toggle user status error:", error);
            return createErrorResponse(res, 500, "Failed to toggle user status", error.message);
        }
    }

    // Password Management
    static async changeUserPassword(req, res) {
        try {
            const { userId } = req.params;
            const { newPassword, sendEmail = true } = req.body;

            if (!newPassword || newPassword.length < 8) {
                return createErrorResponse(res, 400, "Password must be at least 8 characters long");
            }

            // Get security settings
            const securitySettings = await Settings.findOne({ category: "security" });
            if (securitySettings) {
                const settings = securitySettings.settings;

                if (newPassword.length < (settings.get("password_min_length") || 8)) {
                    return createErrorResponse(res, 400, `Password must be at least ${settings.get("password_min_length") || 8} characters long`);
                }

                if (settings.get("password_require_uppercase") && !/[A-Z]/.test(newPassword)) {
                    return createErrorResponse(res, 400, "Password must contain at least one uppercase letter");
                }

                if (settings.get("password_require_lowercase") && !/[a-z]/.test(newPassword)) {
                    return createErrorResponse(res, 400, "Password must contain at least one lowercase letter");
                }

                if (settings.get("password_require_numbers") && !/\d/.test(newPassword)) {
                    return createErrorResponse(res, 400, "Password must contain at least one number");
                }

                if (settings.get("password_require_symbols") && !/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
                    return createErrorResponse(res, 400, "Password must contain at least one symbol");
                }
            }

            const user = await User.findById(userId);
            if (!user) {
                return createErrorResponse(res, 404, "User not found");
            }

            // Prevent admin from changing their own password this way
            if (user._id.toString() === req.user.id) {
                return createErrorResponse(res, 400, "Cannot change your own password using this method");
            }

            const hashedPassword = await bcrypt.hash(newPassword, 12);

            await User.findByIdAndUpdate(userId, {
                password: hashedPassword,
                passwordChangedAt: new Date()
            });

            // Log activity
            await Activity.create({
                userId: req.user.id,
                action: "admin_change_user_password",
                description: `Admin changed password for user: ${user.email}`,
                metadata: { targetUserId: userId }
            });

            // Send email notification
            if (sendEmail) {
                await AdminController.sendPasswordChangeNotification(user, newPassword);
            }

            return createSuccessResponse(res, 200, {
                message: "User password changed successfully",
                emailSent: sendEmail
            });

        } catch (error) {
            console.error("Change user password error:", error);
            return createErrorResponse(res, 500, "Failed to change user password", error.message);
        }
    }

    // Settings Management
    static async getAllSettings(req, res) {
        try {
            const settings = await Settings.find().sort({ category: 1 });

            const settingsMap = {};
            settings.forEach(setting => {
                settingsMap[setting.category] = Object.fromEntries(setting.settings);
            });

            return createSuccessResponse(res, 200, {
                message: "Settings retrieved successfully",
                settings: settingsMap
            });

        } catch (error) {
            console.error("Get settings error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve settings", error.message);
        }
    }

    static async getSettingsByCategory(req, res) {
        try {
            const { category } = req.params;

            const settings = await Settings.findOne({ category });

            if (!settings) {
                return createErrorResponse(res, 404, "Settings category not found");
            }

            return createSuccessResponse(res, 200, {
                message: "Settings retrieved successfully",
                category,
                settings: Object.fromEntries(settings.settings)
            });

        } catch (error) {
            console.error("Get category settings error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve settings", error.message);
        }
    }

    static async updateSettings(req, res) {
        try {
            const { category, settings } = req.body;

            if (!category || !settings) {
                return createErrorResponse(res, 400, "Category and settings are required");
            }

            const updatedSettings = await Settings.findOneAndUpdate(
                { category },
                { 
                    settings: new Map(Object.entries(settings)),
                    updatedBy: req.user.id,
                    lastModified: new Date()
                },
                { new: true, upsert: true }
            );

            await Activity.create({
                userId: req.user.id,
                action: "admin_update_settings",
                description: `Admin updated ${category} settings`,
                metadata: { category, settingsKeys: Object.keys(settings) }
            });

            return createSuccessResponse(res, 200, {
                message: "Settings updated successfully",
                category,
                settings: Object.fromEntries(updatedSettings.settings)
            });

        } catch (error) {
            console.error("Update settings error:", error);
            return createErrorResponse(res, 500, "Failed to update settings", error.message);
        }
    }

    static async updateMultipleSettings(req, res) {
        try {
            const { settingsData } = req.body;

            if (!settingsData || typeof settingsData !== 'object') {
                return createErrorResponse(res, 400, "Settings data is required");
            }

            const updatePromises = [];
            const updatedCategories = [];

            for (const [category, settings] of Object.entries(settingsData)) {
                updatePromises.push(
                    Settings.findOneAndUpdate(
                        { category },
                        { 
                            settings: new Map(Object.entries(settings)),
                            updatedBy: req.user.id,
                            lastModified: new Date()
                        },
                        { new: true, upsert: true }
                    )
                );
                updatedCategories.push(category);
            }

            await Promise.all(updatePromises);

            await Activity.create({
                userId: req.user.id,
                action: "admin_bulk_update_settings",
                description: `Admin updated multiple settings categories: ${updatedCategories.join(', ')}`,
                metadata: { categories: updatedCategories }
            });

            return createSuccessResponse(res, 200, {
                message: "Settings updated successfully",
                updatedCategories
            });

        } catch (error) {
            console.error("Update multiple settings error:", error);
            return createErrorResponse(res, 500, "Failed to update settings", error.message);
        }
    }

    // Logo and Branding Upload
    static async uploadLogo(req, res) {
        try {
            if (!req.file) {
                return createErrorResponse(res, 400, "No logo file provided");
            }

            const logoPath = req.file.path;

            // Update branding settings
            await Settings.findOneAndUpdate(
                { category: "branding" },
                { 
                    $set: {
                        "settings.logo_url": logoPath,
                        updatedBy: req.user.id,
                        lastModified: new Date()
                    }
                },
                { upsert: true }
            );

            await Activity.create({
                userId: req.user.id,
                action: "admin_upload_logo",
                description: "Admin uploaded new logo",
                metadata: { logoPath }
            });

            return createSuccessResponse(res, 200, {
                message: "Logo uploaded successfully",
                logoPath
            });

        } catch (error) {
            console.error("Upload logo error:", error);
            return createErrorResponse(res, 500, "Failed to upload logo", error.message);
        }
    }

    static async uploadFavicon(req, res) {
        try {
            if (!req.file) {
                return createErrorResponse(res, 400, "No favicon file provided");
            }

            const faviconPath = req.file.path;

            // Update branding settings
            await Settings.findOneAndUpdate(
                { category: "branding" },
                { 
                    $set: {
                        "settings.favicon_url": faviconPath,
                        updatedBy: req.user.id,
                        lastModified: new Date()
                    }
                },
                { upsert: true }
            );

            await Activity.create({
                userId: req.user.id,
                action: "admin_upload_favicon",
                description: "Admin uploaded new favicon",
                metadata: { faviconPath }
            });

            return createSuccessResponse(res, 200, {
                message: "Favicon uploaded successfully",
                faviconPath
            });

        } catch (error) {
            console.error("Upload favicon error:", error);
            return createErrorResponse(res, 500, "Failed to upload favicon", error.message);
        }
    }

    // Environment Configuration
    static async updateEnvironmentConfig(req, res) {
        try {
            const { envData } = req.body;

            if (!envData || typeof envData !== 'object') {
                return createErrorResponse(res, 400, "Environment data is required");
            }

            // Update environment settings
            await Settings.findOneAndUpdate(
                { category: "environment" },
                { 
                    settings: new Map(Object.entries(envData)),
                    updatedBy: req.user.id,
                    lastModified: new Date()
                },
                { upsert: true }
            );

            await Activity.create({
                userId: req.user.id,
                action: "admin_update_environment",
                description: "Admin updated environment configuration",
                metadata: { updatedKeys: Object.keys(envData) }
            });

            return createSuccessResponse(res, 200, {
                message: "Environment configuration updated successfully"
            });

        } catch (error) {
            console.error("Update environment config error:", error);
            return createErrorResponse(res, 500, "Failed to update environment configuration", error.message);
        }
    }

    // Rate Limiting Configuration
    static async updateRateLimiting(req, res) {
        try {
            const { rateLimitConfig } = req.body;

            if (!rateLimitConfig || typeof rateLimitConfig !== 'object') {
                return createErrorResponse(res, 400, "Rate limit configuration is required");
            }

            // Update rate limiting settings
            await Settings.findOneAndUpdate(
                { category: "rate_limiting" },
                { 
                    settings: new Map(Object.entries(rateLimitConfig)),
                    updatedBy: req.user.id,
                    lastModified: new Date()
                },
                { upsert: true }
            );

            await Activity.create({
                userId: req.user.id,
                action: "admin_update_rate_limiting",
                description: "Admin updated rate limiting configuration",
                metadata: { config: rateLimitConfig }
            });

            return createSuccessResponse(res, 200, {
                message: "Rate limiting configuration updated successfully",
                config: rateLimitConfig
            });

        } catch (error) {
            console.error("Update rate limiting error:", error);
            return createErrorResponse(res, 500, "Failed to update rate limiting configuration", error.message);
        }
    }

    // System Configuration
    static async getSystemInfo(req, res) {
        try {
            const systemInfo = {
                nodeVersion: process.version,
                platform: process.platform,
                uptime: process.uptime(),
                memoryUsage: process.memoryUsage(),
                cpuUsage: process.cpuUsage(),
                environment: process.env.NODE_ENV || "development"
            };

            return createSuccessResponse(res, 200, {
                message: "System information retrieved successfully",
                systemInfo
            });

        } catch (error) {
            console.error("Get system info error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve system information", error.message);
        }
    }

    static async resetSettings(req, res) {
        try {
            const { category } = req.params;

            if (!category) {
                return createErrorResponse(res, 400, "Settings category is required");
            }

            // Get default settings for the category
            const defaults = Settings.getDefaultSettings();

            if (!defaults[category]) {
                return createErrorResponse(res, 404, "Settings category not found");
            }

            // Reset to default settings
            await Settings.findOneAndUpdate(
                { category },
                { 
                    settings: new Map(Object.entries(defaults[category])),
                    updatedBy: req.user.id,
                    lastModified: new Date()
                },
                { upsert: true }
            );

            await Activity.create({
                userId: req.user.id,
                action: "admin_reset_settings",
                description: `Admin reset ${category} settings to defaults`,
                metadata: { category }
            });

            return createSuccessResponse(res, 200, {
                message: `${category} settings reset to defaults successfully`,
                settings: defaults[category]
            });

        } catch (error) {
            console.error("Reset settings error:", error);
            return createErrorResponse(res, 500, "Failed to reset settings", error.message);
        }
    }

    // Notice System
    static async createNotice(req, res) {
        try {
            const { title, content, type, priority, targetRole, targetUsers, sendEmail, scheduledAt } = req.body;

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

            // Send immediately if not scheduled
            if (!scheduledAt) {
                await AdminController.sendNoticeToUsers(notice);
            }

            return createSuccessResponse(res, 201, {
                message: "Notice created successfully",
                notice
            });

        } catch (error) {
            console.error("Create notice error:", error);
            return createErrorResponse(res, 500, "Failed to create notice", error.message);
        }
    }

    // Share Link Generation
    static async generateProfileShareLink(req, res) {
        try {
            const { id } = req.params;
            const { customDesign } = req.body;

            const shareLink = new ShareLink({
                resourceType: "profile",
                resourceId: id,
                customDesign,
                createdBy: req.user.id
            });

            await shareLink.save();

            return createSuccessResponse(res, 201, {
                message: "Share link generated successfully",
                shareUrl: `${process.env.BASE_URL}/public/profile/${shareLink.shareId}`,
                shareLink
            });

        } catch (error) {
            console.error("Generate share link error:", error);
            return createErrorResponse(res, 500, "Failed to generate share link", error.message);
        }
    }

    // Helper methods
    static async sendApprovalEmail(user, status) {
        try {
            const emailSettings = await Settings.findOne({ category: "email" });
            if (!emailSettings) return;

            const transporter = nodemailer.createTransport({
                host: emailSettings.settings.get("smtp_host"),
                port: emailSettings.settings.get("smtp_port"),
                secure: emailSettings.settings.get("smtp_secure"),
                auth: {
                    user: process.env.EMAIL_ID,
                    pass: process.env.EMAIL_PASS
                }
            });

            const subject = status === "approved" ? "Account Approved" : "Account Rejected";
            const message = status === "approved" 
                ? `Congratulations ${user.fullName}! Your account has been approved and activated.`
                : `Sorry ${user.fullName}, your account registration has been rejected.`;

            await transporter.sendMail({
                from: emailSettings.settings.get("from_email"),
                to: user.email,
                subject,
                text: message
            });
        } catch (error) {
            console.error("Email sending error:", error);
        }
    }

    static async sendPasswordChangeNotification(user, newPassword) {
        try {
            const emailSettings = await Settings.findOne({ category: "email" });
            if (!emailSettings || !emailSettings.settings.get("enable_notifications")) return;

            const transporter = nodemailer.createTransporter({
                host: emailSettings.settings.get("smtp_host"),
                port: emailSettings.settings.get("smtp_port"),
                secure: emailSettings.settings.get("smtp_secure"),
                auth: {
                    user: process.env.EMAIL_ID,
                    pass: process.env.EMAIL_PASS
                }
            });

            const subject = "Password Changed by Administrator";
            const message = `Hello ${user.fullName},\n\nYour password has been changed by an administrator.\n\nNew Password: ${newPassword}\n\nPlease change this password after logging in for security reasons.\n\nBest regards,\nAdmin Team`;

            await transporter.sendMail({
                from: emailSettings.settings.get("from_email"),
                to: user.email,
                subject,
                text: message
            });
        } catch (error) {
            console.error("Password change email error:", error);
        }
    }

    static async sendNoticeToUsers(notice) {
        // Implementation for sending notices to users
        // This would handle both in-app and email notifications
    }

    static async createNGOProfile(user, details) {
        try {
            const { fullName, email, phoneNumber } = details;
            const ngo = await NGO.create({
                userId: user._id,
                ngoName: fullName,
                email,
                contactNumber: phoneNumber,
                isActive: true
            });
            return ngo;
        } catch (error) {
            console.error("Create NGO profile error:", error);
            throw error;
        }
    }

    static async createCompanyProfile(user, details) {
        try {
            const { fullName, email, phoneNumber } = details;
            const company = await Company.create({
                userId: user._id,
                companyName: fullName,
                companyEmail: email,
                companyPhoneNumber: phoneNumber,
                isActive: true
            });
            return company;
        } catch (error) {
            console.error("Create Company profile error:", error);
            throw error;
        }
    }

    // Edit user details
    static async editUserDetails(req, res) {
        try {
            const { id } = req.params;
            const { fullName, email, phoneNumber, role, isActive, approvalStatus } = req.body;

            // Check if user exists
            const user = await User.findById(id);
            if (!user) {
                return createErrorResponse(res, 404, "User not found");
            }

            // Check if email is already taken by another user
            if (email && email !== user.email) {
                const existingUser = await User.findOne({ email, _id: { $ne: id } });
                if (existingUser) {
                    return createErrorResponse(res, 400, "Email already exists");
                }
            }

            // Update user details
            const updateData = {};
            if (fullName) updateData.fullName = fullName;
            if (email) updateData.email = email;
            if (phoneNumber) updateData.phoneNumber = phoneNumber;
            if (role) updateData.role = role.toLowerCase();
            if (typeof isActive === 'boolean') updateData.isActive = isActive;
            if (approvalStatus) updateData.approvalStatus = approvalStatus;

            const updatedUser = await User.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            ).select("-password");

            // Log activity
            await Activity.create({
                userId: req.user.id,
                action: "admin_edit_user",
                description: `Admin edited user details: ${updatedUser.email}`,
                metadata: { targetUserId: id, updatedFields: Object.keys(updateData) }
            });

            return createSuccessResponse(res, 200, {
                message: "User details updated successfully",
                user: updatedUser
            });

        } catch (error) {
            console.error("Edit user details error:", error);
            return createErrorResponse(res, 500, "Failed to update user details", error.message);
        }
    }

    // Delete user and associated profiles
    static async deleteUser(req, res) {
        try {
            const { id } = req.params;

            // Check if user exists
            const user = await User.findById(id);
            if (!user) {
                return createErrorResponse(res, 404, "User not found");
            }

            // Prevent admin from deleting themselves
            if (user._id.toString() === req.user.id) {
                return createErrorResponse(res, 400, "Cannot delete your own account");
            }

            // Delete associated profiles based on role
            if (user.role === "ngo") {
                await NGO.findOneAndDelete({ userId: id });
            } else if (user.role === "company") {
                await Company.findOneAndDelete({ userId: id });
            }

            // Delete associated campaigns if any
            await Campaign.deleteMany({ 
                $or: [
                    { ngoId: id },
                    { companyId: id }
                ]
            });

            // Delete associated donations
            await Donation.deleteMany({ donorId: id });

            // Delete associated activities
            await Activity.deleteMany({ userId: id });

            // Delete the user
            await User.findByIdAndDelete(id);

            // Log activity
            await Activity.create({
                userId: req.user.id,
                action: "admin_delete_user",
                description: `Admin deleted user: ${user.email}`,
                metadata: { deletedUserId: id, deletedUserRole: user.role }
            });

            return createSuccessResponse(res, 200, {
                message: "User and associated data deleted successfully"
            });

        } catch (error) {
            console.error("Delete user error:", error);
            return createErrorResponse(res, 500, "Failed to delete user", error.message);
        }
    }

    // View user profile with complete details
    static async viewUserProfile(req, res) {
        try {
            const { id } = req.params;

            // Get user details
            const user = await User.findById(id).select("-password");
            if (!user) {
                return createErrorResponse(res, 404, "User not found");
            }

            let profileData = null;
            let campaigns = [];

            // Get role-specific profile data
            if (user.role === "ngo") {
                profileData = await NGO.findOne({ userId: id });
                campaigns = await Campaign.find({ ngoId: id }).sort({ createdAt: -1 });
            } else if (user.role === "company") {
                profileData = await Company.findOne({ userId: id });
                campaigns = await Campaign.find({ companyId: id }).sort({ createdAt: -1 });
            }

            // Get user's donations
            const donations = await Donation.find({ donorId: id })
                .populate("campaignId", "title targetAmount")
                .sort({ createdAt: -1 });

            // Get user's activities
            const activities = await Activity.find({ userId: id })
                .sort({ createdAt: -1 })
                .limit(10);

            // Calculate statistics
            const stats = {
                totalDonations: donations.length,
                totalDonationAmount: donations.reduce((sum, donation) => sum + donation.amount, 0),
                totalCampaigns: campaigns.length,
                activeCampaigns: campaigns.filter(campaign => campaign.isActive).length
            };

            return createSuccessResponse(res, 200, {
                message: "User profile retrieved successfully",
                userProfile: {
                    user,
                    profile: profileData,
                    campaigns,
                    donations,
                    activities,
                    stats
                }
            });

        } catch (error) {
            console.error("View user profile error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve user profile", error.message);
        }
    }

    // Edit user profile details (NGO/Company specific)
    static async editUserProfile(req, res) {
        try {
            const { id } = req.params;
            const profileData = req.body;

            // Get user to determine role
            const user = await User.findById(id);
            if (!user) {
                return createErrorResponse(res, 404, "User not found");
            }

            let updatedProfile = null;

            if (user.role === "ngo") {
                updatedProfile = await NGO.findOneAndUpdate(
                    { userId: id },
                    profileData,
                    { new: true, runValidators: true }
                );
            } else if (user.role === "company") {
                updatedProfile = await Company.findOneAndUpdate(
                    { userId: id },
                    profileData,
                    { new: true, runValidators: true }
                );
            } else {
                return createErrorResponse(res, 400, "User role does not have a profile to edit");
            }

            if (!updatedProfile) {
                return createErrorResponse(res, 404, "Profile not found");
            }

            // Log activity
            await Activity.create({
                userId: req.user.id,
                action: "admin_edit_user_profile",
                description: `Admin edited ${user.role} profile: ${user.email}`,
                metadata: { targetUserId: id, profileType: user.role }
            });

            return createSuccessResponse(res, 200, {
                message: "User profile updated successfully",
                profile: updatedProfile
            });

        } catch (error) {
            console.error("Edit user profile error:", error);
            return createErrorResponse(res, 500, "Failed to update user profile", error.message);
        }
    }

    // Campaign Management
    static async getAllCampaigns(req, res) {
        try {
            const { page = 1, limit = 10, status, approvalStatus, search } = req.query;

            const filter = {};
            if (status) filter.isActive = status === "active";
            if (approvalStatus) filter.approvalStatus = approvalStatus;
            if (search) {
                filter.$or = [
                    { title: { $regex: search, $options: "i" } },
                    { campaignName: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } }
                ];
            }

            const campaigns = await Campaign.find(filter)
                .populate("ngoId", "ngoName email")
                .populate("createdBy", "fullName email")
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await Campaign.countDocuments(filter);

            // Get approval statistics
            const approvalStats = await Campaign.aggregate([
                { $group: { _id: "$approvalStatus", count: { $sum: 1 } } }
            ]);

            return createSuccessResponse(res, 200, {
                message: "Campaigns retrieved successfully",
                campaigns,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                },
                approvalStats
            });

        } catch (error) {
            console.error("Get campaigns error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve campaigns", error.message);
        }
    }

    static async approveCampaign(req, res) {
        try {
            const { id } = req.params;
            const { status, adminNote } = req.body;

            const validStatuses = ["approved", "rejected"];
            if (!validStatuses.includes(status)) {
                return createErrorResponse(res, 400, "Invalid approval status");
            }

            const updateData = {
                approvalStatus: status,
                isActive: status === "approved",
                updatedAt: new Date()
            };

            if (status === "rejected" && adminNote) {
                updateData.adminNote = adminNote;
            }

            const campaign = await Campaign.findByIdAndUpdate(
                id,
                updateData,
                { new: true }
            ).populate("ngoId", "ngoName email")
             .populate("createdBy", "fullName email");

            if (!campaign) {
                return createErrorResponse(res, 404, "Campaign not found");
            }

            await Activity.create({
                userId: req.user.id,
                action: "admin_campaign_approval",
                description: `Admin ${status} campaign: ${campaign.title || campaign.campaignName}`,
                metadata: { campaignId: id, status, adminNote }
            });

            // Send notification to NGO (if email system is set up)
            // await this.sendCampaignApprovalEmail(campaign, status, adminNote);

            return createSuccessResponse(res, 200, {
                message: `Campaign ${status} successfully`,
                campaign
            });

        } catch (error) {
            console.error("Approve campaign error:", error);
            return createErrorResponse(res, 500, "Failed to approve campaign", error.message);
        }
    }

    static async getCampaignDetails(req, res) {
        try {
            const { id } = req.params;

            const campaign = await Campaign.findById(id)
                .populate("ngoId", "ngoName email contactNumber")
                .populate("createdBy", "fullName email phoneNumber");

            if (!campaign) {
                return createErrorResponse(res, 404, "Campaign not found");
            }

            // Get campaign donations if any
            const donations = await Donation.find({ campaignId: id })
                .populate("donorId", "fullName email")
                .sort({ createdAt: -1 });

            const donationStats = {
                totalDonations: donations.length,
                totalAmount: donations.reduce((sum, donation) => sum + donation.amount, 0),
                averageAmount: donations.length > 0 ? donations.reduce((sum, donation) => sum + donation.amount, 0) / donations.length : 0
            };

            return createSuccessResponse(res, 200, {
                message: "Campaign details retrieved successfully",
                campaign,
                donations,
                donationStats
            });

        } catch (error) {
            console.error("Get campaign details error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve campaign details", error.message);
        }
    }

    static async updateCampaign(req, res) {
        try {
            const { id } = req.params;
            const updateData = req.body;

            const campaign = await Campaign.findByIdAndUpdate(
                id,
                { ...updateData, updatedAt: new Date() },
                { new: true, runValidators: true }
            ).populate("ngoId", "ngoName email");

            if (!campaign) {
                return createErrorResponse(res, 404, "Campaign not found");
            }

            await Activity.create({
                userId: req.user.id,
                action: "admin_update_campaign",
                description: `Admin updated campaign: ${campaign.title || campaign.campaignName}`,
                metadata: { campaignId: id, updatedFields: Object.keys(updateData) }
            });

            return createSuccessResponse(res, 200, {
                message: "Campaign updated successfully",
                campaign
            });

        } catch (error) {
            console.error("Update campaign error:", error);
            return createErrorResponse(res, 500, "Failed to update campaign", error.message);
        }
    }

    static async deleteCampaign(req, res) {
        try {
            const { id } = req.params;

            const campaign = await Campaign.findById(id);
            if (!campaign) {
                return createErrorResponse(res, 404, "Campaign not found");
            }

            // Delete associated donations
            await Donation.deleteMany({ campaignId: id });

            // Delete the campaign
            await Campaign.findByIdAndDelete(id);

            await Activity.create({
                userId: req.user.id,
                action: "admin_delete_campaign",
                description: `Admin deleted campaign: ${campaign.title || campaign.campaignName}`,
                metadata: { deletedCampaignId: id }
            });

            return createSuccessResponse(res, 200, {
                message: "Campaign and associated data deleted successfully"
            });

        } catch (error) {
            console.error("Delete campaign error:", error);
            return createErrorResponse(res, 500, "Failed to delete campaign", error.message);
        }
    }

    // Profile Image Upload Methods
    static async uploadAdminProfileImage(req, res) {
        try {
            if (!req.file) {
                return createErrorResponse(res, 400, "No profile image provided");
            }

            const adminId = req.user.id;
            const profileImagePath = req.file.path;

            // Update admin user profile
            const updatedAdmin = await User.findByIdAndUpdate(
                adminId,
                { profileImage: profileImagePath },
                { new: true }
            ).select("-password");

            if (!updatedAdmin) {
                return createErrorResponse(res, 404, "Admin user not found");
            }

            await Activity.create({
                userId: adminId,
                action: "admin_upload_profile_image",
                description: "Admin uploaded profile image",
                metadata: { imagePath: profileImagePath }
            });

            return createSuccessResponse(res, 200, {
                message: "Profile image uploaded successfully",
                user: updatedAdmin,
                imagePath: `/${profileImagePath}`
            });

        } catch (error) {
            console.error("Upload admin profile image error:", error);
            return createErrorResponse(res, 500, "Failed to upload profile image", error.message);
        }
    }

    static async uploadUserProfileImage(req, res) {
        try {
            const { userId } = req.params;

            if (!req.file) {
                return createErrorResponse(res, 400, "No profile image provided");
            }

            const profileImagePath = req.file.path;

            // Update user profile
            const updatedUser = await User.findByIdAndUpdate(
                userId,
                { profileImage: profileImagePath },
                { new: true }
            ).select("-password");

            if (!updatedUser) {
                return createErrorResponse(res, 404, "User not found");
            }

            await Activity.create({
                userId: req.user.id,
                action: "admin_upload_user_profile_image",
                description: `Admin uploaded profile image for user: ${updatedUser.email}`,
                metadata: { targetUserId: userId, imagePath: profileImagePath }
            });

            return createSuccessResponse(res, 200, {
                message: "User profile image uploaded successfully",
                user: updatedUser,
                imagePath: `/${profileImagePath}`
            });

        } catch (error) {
            console.error("Upload user profile image error:", error);
            return createErrorResponse(res, 500, "Failed to upload user profile image", error.message);
        }
    }

    // Campaign Upload Methods
    static async uploadCampaignImages(req, res) {
        try {
            const { campaignId } = req.params;

            if (!req.files || req.files.length === 0) {
                return createErrorResponse(res, 400, "No campaign images provided");
            }

            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                return createErrorResponse(res, 404, "Campaign not found");
            }

            // Get uploaded image paths
            const imagePaths = req.files.map(file => file.path);

            // Update campaign with new images
            const updatedCampaign = await Campaign.findByIdAndUpdate(
                campaignId,
                { 
                    $push: { campaignImages: { $each: imagePaths } },
                    updatedAt: new Date()
                },
                { new: true }
            );

            await Activity.create({
                userId: req.user.id,
                action: "admin_upload_campaign_images",
                description: `Admin uploaded ${imagePaths.length} images for campaign: ${campaign.campaignName}`,
                metadata: { campaignId, imagePaths }
            });

            return createSuccessResponse(res, 200, {
                message: "Campaign images uploaded successfully",
                campaign: updatedCampaign,
                uploadedImages: imagePaths
            });

        } catch (error) {
            console.error("Upload campaign images error:", error);
            return createErrorResponse(res, 500, "Failed to upload campaign images", error.message);
        }
    }

    static async uploadCampaignDocuments(req, res) {
        try {
            const { campaignId } = req.params;

            if (!req.files || req.files.length === 0) {
                return createErrorResponse(res, 400, "No documents provided");
            }

            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                return createErrorResponse(res, 404, "Campaign not found");
            }

            // Get uploaded document paths
            const documentPaths = req.files.map(file => file.path);

            // Update campaign with new documents
            const updatedCampaign = await Campaign.findByIdAndUpdate(
                campaignId,
                { 
                    $push: { documents: { $each: documentPaths } },
                    updatedAt: new Date()
                },
                { new: true }
            );

            await Activity.create({
                userId: req.user.id,
                action: "admin_upload_campaign_documents",
                description: `Admin uploaded ${documentPaths.length} documents for campaign: ${campaign.campaignName}`,
                metadata: { campaignId, documentPaths }
            });

            return createSuccessResponse(res, 200, {
                message: "Campaign documents uploaded successfully",
                campaign: updatedCampaign,
                uploadedDocuments: documentPaths
            });

        } catch (error) {
            console.error("Upload campaign documents error:", error);
            return createErrorResponse(res, 500, "Failed to upload campaign documents", error.message);
        }
    }

    static async uploadCampaignProof(req, res) {
        try {
            const { campaignId } = req.params;

            if (!req.files || req.files.length === 0) {
                return createErrorResponse(res, 400, "No proof documents provided");
            }

            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                return createErrorResponse(res, 404, "Campaign not found");
            }

            // Get uploaded proof document paths
            const proofPaths = req.files.map(file => file.path);

            // Update campaign with new proof documents
            const updatedCampaign = await Campaign.findByIdAndUpdate(
                campaignId,
                { 
                    $push: { proofDocs: { $each: proofPaths } },
                    updatedAt: new Date()
                },
                { new: true }
            );

            await Activity.create({
                userId: req.user.id,
                action: "admin_upload_campaign_proof",
                description: `Admin uploaded ${proofPaths.length} proof documents for campaign: ${campaign.campaignName}`,
                metadata: { campaignId, proofPaths }
            });

            return createSuccessResponse(res, 200, {
                message: "Campaign proof documents uploaded successfully",
                campaign: updatedCampaign,
                uploadedProofDocs: proofPaths
            });

        } catch (error) {
            console.error("Upload campaign proof error:", error);
            return createErrorResponse(res, 500, "Failed to upload campaign proof documents", error.message);
        }
    }

    // Get campaign files
    static async getCampaignFiles(req, res) {
        try {
            const { campaignId } = req.params;
            
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                return createErrorResponse(res, 404, "Campaign not found");
            }

            const files = {
                images: campaign.campaignImages || [],
                documents: campaign.documents || [],
                proofDocs: campaign.proofDocs || []
            };

            return createSuccessResponse(res, 200, {
                message: "Campaign files retrieved successfully",
                files
            });

        } catch (error) {
            console.error("Get campaign files error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve campaign files", error.message);
        }
    }

    // Get campaign images
    static async getCampaignImages(req, res) {
        try {
            const { campaignId } = req.params;
            
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                return createErrorResponse(res, 404, "Campaign not found");
            }

            return createSuccessResponse(res, 200, {
                message: "Campaign images retrieved successfully",
                images: campaign.campaignImages || []
            });

        } catch (error) {
            console.error("Get campaign images error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve campaign images", error.message);
        }
    }

    // Get campaign documents
    static async getCampaignDocuments(req, res) {
        try {
            const { campaignId } = req.params;
            
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                return createErrorResponse(res, 404, "Campaign not found");
            }

            return createSuccessResponse(res, 200, {
                message: "Campaign documents retrieved successfully",
                documents: campaign.documents || []
            });

        } catch (error) {
            console.error("Get campaign documents error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve campaign documents", error.message);
        }
    }

    // Get campaign proof
    static async getCampaignProof(req, res) {
        try {
            const { campaignId } = req.params;
            
            const campaign = await Campaign.findById(campaignId);
            if (!campaign) {
                return createErrorResponse(res, 404, "Campaign not found");
            }

            return createSuccessResponse(res, 200, {
                message: "Campaign proof retrieved successfully",
                proofDocs: campaign.proofDocs || []
            });

        } catch (error) {
            console.error("Get campaign proof error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve campaign proof", error.message);
        }
    }

    // Dashboard Analytics Controller
    static getDashboardAnalytics = async (req, res) => {
        try {
            const { timeRange = '30d', metric } = req.query;

            let dateFilter;
            switch(timeRange) {
                case '7d':
                    dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                    break;
                case '30d':
                    dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
                    break;
                case '90d':
                    dateFilter = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
                    break;
                case '1y':
                    dateFilter = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
                    break;
                default:
                    dateFilter = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
            }

            const analytics = {};

            if (!metric || metric === 'users') {
                analytics.users = {
                    total: await User.countDocuments(),
                    new: await User.countDocuments({ createdAt: { $gte: dateFilter } }),
                    active: await User.countDocuments({ isActive: true }),
                    byRole: await User.aggregate([
                        { $group: { _id: "$role", count: { $sum: 1 } } }
                    ]),
                    growth: await User.aggregate([
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
            }

            if (!metric || metric === 'campaigns') {
                analytics.campaigns = {
                    total: await Campaign.countDocuments(),
                    active: await Campaign.countDocuments({ isActive: true }),
                    performance: await Campaign.aggregate([
                        {
                            $group: {
                                _id: null,
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
                    ])
                };
            }

            if (!metric || metric === 'activities') {
                analytics.activities = {
                    total: await Activity.countDocuments({ createdAt: { $gte: dateFilter } }),
                    byAction: await Activity.aggregate([
                        { $match: { createdAt: { $gte: dateFilter } } },
                        { $group: { _id: "$action", count: { $sum: 1 } } },
                        { $sort: { count: -1 } }
                    ]),
                    timeline: await Activity.aggregate([
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
            }

            res.json({
                success: true,
                data: analytics,
                timeRange,
                generatedAt: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching dashboard analytics',
                error: error.message
            });
        }
    };

    // Security Dashboard Controller
    static getSecurityDashboard = async (req, res) => {
        try {
            const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
            const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

            const securityData = {
                overview: {
                    totalUsers: await User.countDocuments(),
                    activeUsers: await User.countDocuments({ isActive: true }),
                    suspendedUsers: await User.countDocuments({ isActive: false }),
                    adminUsers: await User.countDocuments({ role: 'admin' })
                },
                authentication: {
                    failedLogins24h: await Activity.countDocuments({
                        action: 'login_failed',
                        createdAt: { $gte: last24Hours }
                    }),
                    successfulLogins24h: await Activity.countDocuments({
                        action: 'login_success',
                        createdAt: { $gte: last24Hours }
                    }),
                    suspiciousActivities: await Activity.countDocuments({
                        action: { $in: ['suspicious_access', 'multiple_failed_login'] },
                        createdAt: { $gte: lastWeek }
                    })
                },
                recentSecurityEvents: await Activity.find({
                    action: { $in: ['login_failed', 'suspicious_access', 'security_alert'] },
                    createdAt: { $gte: lastWeek }
                })
                .populate('userId', 'fullName email')
                .sort({ createdAt: -1 })
                .limit(20),
                riskAssessment: {
                    level: 'Low', // Implement risk calculation
                    factors: [
                        'No recent security incidents',
                        'Low failed login rate',
                        'Active monitoring enabled'
                    ]
                },
                recommendations: [
                    'Enable two-factor authentication for all admin accounts',
                    'Review users with multiple failed login attempts',
                    'Update password policies for stronger security',
                    'Monitor suspicious IP addresses'
                ]
            };

            res.json({
                success: true,
                data: securityData
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching security dashboard',
                error: error.message
            });
        }
    };

    // System Health Controller
    static getSystemHealth = async (req, res) => {
        try {
            const os = require('os');
            const fs = require('fs').promises;
            const path = require('path');

            const memoryUsage = process.memoryUsage();
            const systemMemory = {
                total: os.totalmem(),
                free: os.freemem(),
                used: os.totalmem() - os.freemem()
            };

            // Check disk space (simplified)
            let diskUsage = null;
            try {
                const stats = await fs.stat('./');
                diskUsage = {
                    total: 'Unknown',
                    free: 'Unknown',
                    used: 'Unknown'
                };
            } catch (err) {
                // Disk usage check failed
            }

            const healthData = {
                status: 'healthy', // Overall system status
                server: {
                    platform: os.platform(),
                    architecture: os.arch(),
                    nodeVersion: process.version,
                    uptime: process.uptime(),
                    pid: process.pid
                },
                memory: {
                    system: {
                        total: Math.round(systemMemory.total / 1024 / 1024),
                        free: Math.round(systemMemory.free / 1024 / 1024),
                        used: Math.round(systemMemory.used / 1024 / 1024),
                        percentage: Math.round((systemMemory.used / systemMemory.total) * 100)
                    },
                    process: {
                        rss: Math.round(memoryUsage.rss / 1024 / 1024),
                        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
                        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
                        external: Math.round(memoryUsage.external / 1024 / 1024),
                        percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100)
                    }
                },
                cpu: {
                    cores: os.cpus().length,
                    model: os.cpus()[0]?.model || 'Unknown',
                    loadAverage: os.loadavg(),
                    usage: process.cpuUsage()
                },
                database: {
                    status: require('mongoose').connection.readyState === 1 ? 'Connected' : 'Disconnected',
                    connectionString: process.env.MONGO_URI ? 'Configured' : 'Default Local',
                    collections: {
                        users: await User.estimatedDocumentCount(),
                        campaigns: await Campaign.estimatedDocumentCount(),
                        activities: await Activity.estimatedDocumentCount()
                    }
                },
                storage: diskUsage,
                network: {
                    hostname: os.hostname(),
                    interfaces: Object.keys(os.networkInterfaces()).length
                }
            };

            // Determine overall health status
            if (healthData.memory.system.percentage > 90 || healthData.memory.process.percentage > 90) {
                healthData.status = 'warning';
            }
            if (healthData.database.status !== 'Connected') {
                healthData.status = 'error';
            }

            res.json({
                success: true,
                data: healthData,
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching system health',
                error: error.message
            });
        }
    };

    // Performance Monitoring Controller
    static getPerformanceMetrics = async (req, res) => {
        try {
            const performanceData = {
                api: {
                    totalRequests: 0, // Implement request counting middleware
                    averageResponseTime: 0, // Implement response time tracking
                    errorRate: 0, // Implement error rate tracking
                    endpoints: {
                        healthiest: '/api/auth/profile',
                        slowest: '/api/admin/reports/export'
                    }
                },
                database: {
                    totalQueries: 0, // Implement query counting
                    averageQueryTime: 0, // Implement query time tracking
                    slowQueries: [], // Implement slow query logging
                    connectionPool: {
                        active: 1,
                        available: 10,
                        waiting: 0
                    }
                },
                files: {
                    totalUploads: 0, // Count files in uploads directory
                    storageUsed: '0 MB', // Calculate actual storage
                    uploadsToday: 0,
                    largestFile: '0 MB'
                },
                caching: {
                    hitRate: 0, // If you implement caching
                    missRate: 0,
                    evictions: 0
                }
            };

            // Try to get actual file statistics
            try {
                const fs = require('fs');
                const path = require('path');
                const uploadsPath = path.join(process.cwd(), 'uploads');

                if (fs.existsSync(uploadsPath)) {
                    const getDirectorySize = (dirPath) => {
                        let size = 0;
                        let fileCount = 0;

                        const files = fs.readdirSync(dirPath, { withFileTypes: true });

                        for (const file of files) {
                            const filePath = path.join(dirPath, file.name);
                            if (file.isDirectory()) {
                                const subDir = getDirectorySize(filePath);
                                size += subDir.size;
                                fileCount += subDir.count;
                            } else {
                                const stats = fs.statSync(filePath);
                                size += stats.size;
                                fileCount++;
                            }
                        }

                        return { size, count: fileCount };
                    };

                    const dirStats = getDirectorySize(uploadsPath);
                    performanceData.files.totalUploads = dirStats.count;
                    performanceData.files.storageUsed = `${(dirStats.size / 1024 / 1024).toFixed(2)} MB`;
                }
            } catch (err) {
                // File statistics failed
            }

            res.json({
                success: true,
                data: performanceData,
                recommendations: [
                    'Monitor slow database queries',
                    'Implement response time optimization',
                    'Set up automated performance alerts',
                    'Regular cleanup of old log files'
                ]
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error fetching performance metrics',
                error: error.message
            });
        }
    };
}

module.exports = AdminController;