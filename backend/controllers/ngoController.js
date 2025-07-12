
const NGO = require("../models/NGO");
const Company = require("../models/Company");
const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");
const Activity = require("../models/Activity");
const { createSuccessResponse, createErrorResponse } = require("../utils/errorHandler");

class NGOController {
    // Dashboard
    static async getDashboard(req, res) {
        try {
            const userId = req.user.id;
            const ngo = await NGO.findOne({ userId });
            
            if (!ngo) {
                return createErrorResponse(res, 404, "NGO profile not found");
            }

            const [totalCampaigns, totalDonations, activeCampaigns, recentDonations] = await Promise.all([
                Campaign.countDocuments({ ngoId: ngo._id }),
                Donation.countDocuments({ ngoId: ngo._id }),
                Campaign.countDocuments({ ngoId: ngo._id, status: "active" }),
                Donation.find({ ngoId: ngo._id }).sort({ createdAt: -1 }).limit(5).populate("companyId", "companyName")
            ]);

            const donationStats = await Donation.aggregate([
                { $match: { ngoId: ngo._id } },
                { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
            ]);

            return createSuccessResponse(res, 200, {
                message: "Dashboard data retrieved successfully",
                dashboard: {
                    totalCampaigns,
                    totalDonations,
                    activeCampaigns,
                    totalAmount: donationStats[0]?.totalAmount || 0,
                    recentDonations
                }
            });

        } catch (error) {
            console.error("NGO dashboard error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve dashboard data", error.message);
        }
    }

    // Get companies
    static async getCompanies(req, res) {
        try {
            const companies = await Company.find({ isActive: true })
                .select("companyName companyEmail companyType numberOfEmployees companyLogo")
                .sort({ createdAt: -1 });

            return createSuccessResponse(res, 200, {
                message: "Companies retrieved successfully",
                companies
            });

        } catch (error) {
            console.error("Get companies error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve companies", error.message);
        }
    }

    // Get company profile
    static async getCompanyProfile(req, res) {
        try {
            const { id } = req.params;
            
            const company = await Company.findById(id);
            if (!company) {
                return createErrorResponse(res, 404, "Company not found");
            }

            return createSuccessResponse(res, 200, {
                message: "Company profile retrieved successfully",
                company
            });

        } catch (error) {
            console.error("Get company profile error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve company profile", error.message);
        }
    }

    // Get NGO profile
    static async getProfile(req, res) {
        try {
            const userId = req.user.id;
            
            const ngo = await NGO.findOne({ userId });
            if (!ngo) {
                return createErrorResponse(res, 404, "NGO profile not found");
            }

            return createSuccessResponse(res, 200, {
                message: "NGO profile retrieved successfully",
                profile: ngo
            });

        } catch (error) {
            console.error("Get NGO profile error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve profile", error.message);
        }
    }

    // Update NGO profile
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const updateData = req.body;

            const updatedNGO = await NGO.findOneAndUpdate(
                { userId },
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedNGO) {
                return createErrorResponse(res, 404, "NGO profile not found");
            }

            await Activity.create({
                userId,
                action: "profile_updated",
                description: "NGO profile updated"
            });

            return createSuccessResponse(res, 200, {
                message: "NGO profile updated successfully",
                profile: updatedNGO
            });

        } catch (error) {
            console.error("Update NGO profile error:", error);
            return createErrorResponse(res, 500, "Failed to update profile", error.message);
        }
    }

    // Create campaign
    static async createCampaign(req, res) {
        try {
            const userId = req.user.id;
            const ngo = await NGO.findOne({ userId });
            
            if (!ngo) {
                return createErrorResponse(res, 404, "NGO profile not found");
            }

            const campaignData = {
                ...req.body,
                ngoId: ngo._id,
                createdBy: userId
            };

            const campaign = new Campaign(campaignData);
            await campaign.save();

            await Activity.create({
                userId,
                action: "campaign_created",
                description: `Created campaign: ${campaign.title}`
            });

            return createSuccessResponse(res, 201, {
                message: "Campaign created successfully",
                campaign
            });

        } catch (error) {
            console.error("Create campaign error:", error);
            return createErrorResponse(res, 500, "Failed to create campaign", error.message);
        }
    }

    // Get campaigns
    static async getCampaigns(req, res) {
        try {
            const userId = req.user.id;
            const ngo = await NGO.findOne({ userId });
            
            if (!ngo) {
                return createErrorResponse(res, 404, "NGO profile not found");
            }

            const campaigns = await Campaign.find({ ngoId: ngo._id })
                .sort({ createdAt: -1 });

            return createSuccessResponse(res, 200, {
                message: "Campaigns retrieved successfully",
                campaigns
            });

        } catch (error) {
            console.error("Get campaigns error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve campaigns", error.message);
        }
    }

    // Update campaign
    static async updateCampaign(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const updateData = req.body;

            const ngo = await NGO.findOne({ userId });
            if (!ngo) {
                return createErrorResponse(res, 404, "NGO profile not found");
            }

            const campaign = await Campaign.findOneAndUpdate(
                { _id: id, ngoId: ngo._id },
                updateData,
                { new: true, runValidators: true }
            );

            if (!campaign) {
                return createErrorResponse(res, 404, "Campaign not found or unauthorized");
            }

            await Activity.create({
                userId,
                action: "campaign_updated",
                description: `Updated campaign: ${campaign.title}`
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

    // Get donations
    static async getDonations(req, res) {
        try {
            const userId = req.user.id;
            const ngo = await NGO.findOne({ userId });
            
            if (!ngo) {
                return createErrorResponse(res, 404, "NGO profile not found");
            }

            const donations = await Donation.find({ ngoId: ngo._id })
                .populate("companyId", "companyName companyEmail")
                .populate("campaignId", "title")
                .sort({ createdAt: -1 });

            return createSuccessResponse(res, 200, {
                message: "Donations retrieved successfully",
                donations
            });

        } catch (error) {
            console.error("Get donations error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve donations", error.message);
        }
    }
}

module.exports = NGOController;
