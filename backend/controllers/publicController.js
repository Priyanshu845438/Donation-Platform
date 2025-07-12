
const ShareLink = require("../models/ShareLink");
const User = require("../models/User");
const Company = require("../models/Company");
const NGO = require("../models/NGO");
const Campaign = require("../models/Campaign");
const { createSuccessResponse, createErrorResponse } = require("../utils/errorHandler");

class PublicController {
    static async getSharedProfile(req, res) {
        try {
            const { shareId } = req.params;

            const shareLink = await ShareLink.findOne({ 
                shareId, 
                resourceType: "profile",
                isActive: true 
            });

            if (!shareLink) {
                return createErrorResponse(res, 404, "Shared profile not found or expired");
            }

            const user = await User.findById(shareLink.resourceId).select("-password");
            if (!user) {
                return createErrorResponse(res, 404, "Profile not found");
            }

            let profileData = null;
            if (user.role === "ngo") {
                profileData = await NGO.findOne({ userId: user._id });
            } else if (user.role === "company") {
                profileData = await Company.findOne({ userId: user._id });
            }

            // Update view count
            shareLink.viewCount += 1;
            await shareLink.save();

            return createSuccessResponse(res, 200, {
                message: "Shared profile retrieved successfully",
                profile: {
                    user,
                    profileData,
                    customDesign: shareLink.customDesign
                }
            });

        } catch (error) {
            console.error("Get shared profile error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve shared profile", error.message);
        }
    }

    static async getSharedCampaign(req, res) {
        try {
            const { shareId } = req.params;

            const shareLink = await ShareLink.findOne({ 
                shareId, 
                resourceType: "campaign",
                isActive: true 
            });

            if (!shareLink) {
                return createErrorResponse(res, 404, "Shared campaign not found or expired");
            }

            const campaign = await Campaign.findById(shareLink.resourceId)
                .populate("ngoId", "ngoName email");

            if (!campaign) {
                return createErrorResponse(res, 404, "Campaign not found");
            }

            // Update view count
            shareLink.viewCount += 1;
            await shareLink.save();

            return createSuccessResponse(res, 200, {
                message: "Shared campaign retrieved successfully",
                campaign,
                customDesign: shareLink.customDesign
            });

        } catch (error) {
            console.error("Get shared campaign error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve shared campaign", error.message);
        }
    }

    static async getSharedPortfolio(req, res) {
        try {
            const { shareId } = req.params;

            const shareLink = await ShareLink.findOne({ 
                shareId, 
                resourceType: "portfolio",
                isActive: true 
            });

            if (!shareLink) {
                return createErrorResponse(res, 404, "Shared portfolio not found or expired");
            }

            const user = await User.findById(shareLink.resourceId).select("-password");
            if (!user) {
                return createErrorResponse(res, 404, "Portfolio not found");
            }

            let profileData = null;
            let campaigns = [];

            if (user.role === "ngo") {
                profileData = await NGO.findOne({ userId: user._id });
                campaigns = await Campaign.find({ ngoId: profileData._id }).limit(10);
            } else if (user.role === "company") {
                profileData = await Company.findOne({ userId: user._id });
            }

            // Update view count
            shareLink.viewCount += 1;
            await shareLink.save();

            return createSuccessResponse(res, 200, {
                message: "Shared portfolio retrieved successfully",
                portfolio: {
                    user,
                    profileData,
                    campaigns,
                    customDesign: shareLink.customDesign
                }
            });

        } catch (error) {
            console.error("Get shared portfolio error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve shared portfolio", error.message);
        }
    }
}

module.exports = PublicController;
