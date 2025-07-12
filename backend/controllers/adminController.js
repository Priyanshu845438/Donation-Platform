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
                profileData = await this.createNGOProfile(newUser, { fullName, email, phoneNumber });
            } else if (role.toLowerCase() === "company") {
                profileData = await this.createCompanyProfile(newUser, { fullName, email, phoneNumber });
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
            await this.sendApprovalEmail(user, status);

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
                await this.sendNoticeToUsers(notice);
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

    // Settings Management
    static async getSettings(req, res) {
        try {
            const settings = await Settings.find().sort({ category: 1 });

            return createSuccessResponse(res, 200, {
                message: "Settings retrieved successfully",
                settings
            });

        } catch (error) {
            console.error("Get settings error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve settings", error.message);
        }
    }

    static async updateSettings(req, res) {
        try {
            const { category, settings } = req.body;

            const updatedSettings = await Settings.findOneAndUpdate(
                { category },
                { 
                    settings: new Map(Object.entries(settings)),
                    updatedBy: req.user.id
                },
                { new: true, upsert: true }
            );

            await Activity.create({
                userId: req.user.id,
                action: "admin_update_settings",
                description: `Admin updated ${category} settings`,
                metadata: { category, settings }
            });

            return createSuccessResponse(res, 200, {
                message: "Settings updated successfully",
                settings: updatedSettings
            });

        } catch (error) {
            console.error("Update settings error:", error);
            return createErrorResponse(res, 500, "Failed to update settings", error.message);
        }
    }

    // Helper methods
    static async sendApprovalEmail(user, status) {
        try {
            const emailSettings = await Settings.findOne({ category: "email" });
            if (!emailSettings) return;

            const transporter = nodemailer.createTransporter({
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

    // Add more methods for reports, campaign management, etc.
}

module.exports = AdminController;