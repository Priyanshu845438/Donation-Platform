
const Campaign = require("../models/Campaign");
const NGO = require("../models/NGO");
const { uploadImage, uploadProof } = require("../middleware/uploadMiddleware");

class CampaignController {
    // Create new campaign
    static async createCampaign(req, res) {
        try {
            const userId = req.user.id;
            
            // Get NGO profile
            const ngoProfile = await NGO.findOne({ userId });
            if (!ngoProfile) {
                return res.status(404).json({ message: "NGO profile not found" });
            }

            const campaignData = {
                ...req.body,
                ngoId: ngoProfile._id,
                createdBy: userId
            };

            const newCampaign = new Campaign(campaignData);
            await newCampaign.save();

            res.status(201).json({
                message: "Campaign created successfully",
                campaign: newCampaign
            });

        } catch (error) {
            console.error("Create campaign error:", error);
            res.status(500).json({ message: "Failed to create campaign", error: error.message });
        }
    }

    // Get all campaigns
    static async getAllCampaigns(req, res) {
        try {
            const { status, category, limit = 10, page = 1 } = req.query;
            
            const filter = {};
            if (status) filter.status = status;
            if (category) filter.category = category;

            const campaigns = await Campaign.find(filter)
                .populate('ngoId', 'ngoName email')
                .limit(limit * 1)
                .skip((page - 1) * limit)
                .sort({ createdAt: -1 });

            const total = await Campaign.countDocuments(filter);

            res.status(200).json({
                message: "Campaigns retrieved successfully",
                campaigns,
                pagination: {
                    current: page,
                    total: Math.ceil(total / limit),
                    count: campaigns.length
                }
            });

        } catch (error) {
            console.error("Get campaigns error:", error);
            res.status(500).json({ message: "Failed to retrieve campaigns", error: error.message });
        }
    }

    // Get single campaign
    static async getCampaign(req, res) {
        try {
            const { id } = req.params;

            const campaign = await Campaign.findById(id).populate('ngoId', 'ngoName email contactNumber');
            if (!campaign) {
                return res.status(404).json({ message: "Campaign not found" });
            }

            res.status(200).json({
                message: "Campaign retrieved successfully",
                campaign
            });

        } catch (error) {
            console.error("Get campaign error:", error);
            res.status(500).json({ message: "Failed to retrieve campaign", error: error.message });
        }
    }

    // Update campaign
    static async updateCampaign(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;
            const updateData = req.body;

            // Check if user owns the campaign
            const campaign = await Campaign.findById(id);
            if (!campaign) {
                return res.status(404).json({ message: "Campaign not found" });
            }

            if (campaign.createdBy.toString() !== userId) {
                return res.status(403).json({ message: "Not authorized to update this campaign" });
            }

            const updatedCampaign = await Campaign.findByIdAndUpdate(
                id,
                updateData,
                { new: true, runValidators: true }
            );

            res.status(200).json({
                message: "Campaign updated successfully",
                campaign: updatedCampaign
            });

        } catch (error) {
            console.error("Update campaign error:", error);
            res.status(500).json({ message: "Failed to update campaign", error: error.message });
        }
    }

    // Delete campaign
    static async deleteCampaign(req, res) {
        try {
            const { id } = req.params;
            const userId = req.user.id;

            const campaign = await Campaign.findById(id);
            if (!campaign) {
                return res.status(404).json({ message: "Campaign not found" });
            }

            if (campaign.createdBy.toString() !== userId) {
                return res.status(403).json({ message: "Not authorized to delete this campaign" });
            }

            await Campaign.findByIdAndDelete(id);

            res.status(200).json({
                message: "Campaign deleted successfully"
            });

        } catch (error) {
            console.error("Delete campaign error:", error);
            res.status(500).json({ message: "Failed to delete campaign", error: error.message });
        }
    }
}

module.exports = CampaignController;
