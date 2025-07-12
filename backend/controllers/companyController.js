
const Company = require("../models/Company");
const NGO = require("../models/NGO");
const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");
const Activity = require("../models/Activity");
const { createSuccessResponse, createErrorResponse } = require("../utils/errorHandler");

class CompanyController {
    // Dashboard
    static async getDashboard(req, res) {
        try {
            const userId = req.user.id;
            const company = await Company.findOne({ userId });
            
            if (!company) {
                return createErrorResponse(res, 404, "Company profile not found");
            }

            const [totalDonations, totalCampaignsSupported, recentDonations] = await Promise.all([
                Donation.countDocuments({ companyId: company._id }),
                Donation.distinct("campaignId", { companyId: company._id }).then(campaigns => campaigns.length),
                Donation.find({ companyId: company._id }).sort({ createdAt: -1 }).limit(5)
                    .populate("ngoId", "ngoName")
                    .populate("campaignId", "title")
            ]);

            const donationStats = await Donation.aggregate([
                { $match: { companyId: company._id } },
                { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
            ]);

            return createSuccessResponse(res, 200, {
                message: "Dashboard data retrieved successfully",
                dashboard: {
                    totalDonations,
                    totalCampaignsSupported,
                    totalAmount: donationStats[0]?.totalAmount || 0,
                    recentDonations
                }
            });

        } catch (error) {
            console.error("Company dashboard error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve dashboard data", error.message);
        }
    }

    // Get NGOs
    static async getNGOs(req, res) {
        try {
            const ngos = await NGO.find({ isActive: true })
                .select("ngoName email ngoType is80GCertified is12ACertified logo")
                .sort({ createdAt: -1 });

            return createSuccessResponse(res, 200, {
                message: "NGOs retrieved successfully",
                ngos
            });

        } catch (error) {
            console.error("Get NGOs error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve NGOs", error.message);
        }
    }

    // Get NGO profile
    static async getNGOProfile(req, res) {
        try {
            const { id } = req.params;
            
            const ngo = await NGO.findById(id);
            if (!ngo) {
                return createErrorResponse(res, 404, "NGO not found");
            }

            // Get NGO's campaigns
            const campaigns = await Campaign.find({ ngoId: ngo._id, status: "active" })
                .select("title description targetAmount raisedAmount images")
                .limit(10);

            return createSuccessResponse(res, 200, {
                message: "NGO profile retrieved successfully",
                ngo,
                campaigns
            });

        } catch (error) {
            console.error("Get NGO profile error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve NGO profile", error.message);
        }
    }

    // Get company profile
    static async getProfile(req, res) {
        try {
            const userId = req.user.id;
            
            const company = await Company.findOne({ userId });
            if (!company) {
                return createErrorResponse(res, 404, "Company profile not found");
            }

            return createSuccessResponse(res, 200, {
                message: "Company profile retrieved successfully",
                profile: company
            });

        } catch (error) {
            console.error("Get company profile error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve profile", error.message);
        }
    }

    // Update company profile
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const updateData = req.body;

            const updatedCompany = await Company.findOneAndUpdate(
                { userId },
                updateData,
                { new: true, runValidators: true }
            );

            if (!updatedCompany) {
                return createErrorResponse(res, 404, "Company profile not found");
            }

            await Activity.create({
                userId,
                action: "profile_updated",
                description: "Company profile updated"
            });

            return createSuccessResponse(res, 200, {
                message: "Company profile updated successfully",
                profile: updatedCompany
            });

        } catch (error) {
            console.error("Update company profile error:", error);
            return createErrorResponse(res, 500, "Failed to update profile", error.message);
        }
    }

    // Make donation
    static async makeDonation(req, res) {
        try {
            const userId = req.user.id;
            const { ngoId, campaignId, amount, message } = req.body;

            const company = await Company.findOne({ userId });
            if (!company) {
                return createErrorResponse(res, 404, "Company profile not found");
            }

            const donation = new Donation({
                companyId: company._id,
                ngoId,
                campaignId,
                amount,
                message,
                status: "pending"
            });

            await donation.save();

            await Activity.create({
                userId,
                action: "donation_initiated",
                description: `Initiated donation of ₹${amount}`
            });

            return createSuccessResponse(res, 201, {
                message: "Donation initiated successfully",
                donation
            });

        } catch (error) {
            console.error("Make donation error:", error);
            return createErrorResponse(res, 500, "Failed to initiate donation", error.message);
        }
    }

    // Get donations
    static async getDonations(req, res) {
        try {
            const userId = req.user.id;
            const company = await Company.findOne({ userId });
            
            if (!company) {
                return createErrorResponse(res, 404, "Company profile not found");
            }

            const donations = await Donation.find({ companyId: company._id })
                .populate("ngoId", "ngoName email")
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

module.exports = CompanyController;
