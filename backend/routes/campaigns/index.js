const express = require("express");
const Campaign = require("../../models/Campaign");
const NGO = require("../../models/NGO");
const authMiddleware = require("../../middleware/auth");
const upload = require("../../middleware/uploadMiddleware");

const router = express.Router();

// Get all campaigns (public)
router.get("/", async (req, res) => {
    try {
        const { category, search, limit = 10, page = 1 } = req.query;

        let query = { isActive: true };

        if (category) {
            query.category = category;
        }

        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        const campaigns = await Campaign.find(query)
            .populate("ngoId", "ngoName email")
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Campaign.countDocuments(query);

        res.json({
            campaigns,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching campaigns", error: error.message });
    }
});

// Get single campaign
router.get("/:id", async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id)
            .populate("ngoId", "ngoName email website");

        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }

        res.json(campaign);
    } catch (error) {
        res.status(500).json({ message: "Error fetching campaign", error: error.message });
    }
});

// Create campaign (NGO only)
router.post("/", authMiddleware(["ngo"]), upload.fields([
    { name: "campaignImage", maxCount: 1 },
    { name: "documents", maxCount: 5 }
]), async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const ngo = await NGO.findOne({ userId });

        if (!ngo) {
            return res.status(404).json({ message: "NGO profile not found" });
        }

        const campaignData = {
            ...req.body,
            ngoId: ngo._id,
            createdBy: userId,
            approvalStatus: "pending",
            isActive: false
        };

        if (req.files?.campaignImage) {
            campaignData.image = `/uploads/campaign/image/${req.files.campaignImage[0].filename}`;
        }

        if (req.files?.documents) {
            campaignData.documents = req.files.documents.map(file => `/uploads/campaign/documents/${file.filename}`);
        }

        const campaign = new Campaign(campaignData);
        await campaign.save();

        res.status(201).json({ message: "Campaign created successfully", campaign });
    } catch (error) {
        res.status(500).json({ message: "Error creating campaign", error: error.message });
    }
});

// Update campaign
router.put("/:id", authMiddleware(["ngo", "admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;
        const userId = req.user._id || req.user.id;

        let query = { _id: id };

        // If not admin, only allow NGO to update their own campaigns
        if (role !== "admin") {
            query.createdBy = userId;
        }

        const campaign = await Campaign.findOneAndUpdate(query, req.body, { new: true });

        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found or unauthorized" });
        }

        res.json({ message: "Campaign updated successfully", campaign });
    } catch (error) {
        res.status(500).json({ message: "Error updating campaign", error: error.message });
    }
});

// Delete campaign
router.delete("/:id", authMiddleware(["ngo", "admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;
        const userId = req.user._id || req.user.id;

        let query = { _id: id };

        // If not admin, only allow NGO to delete their own campaigns
        if (role !== "admin") {
            query.createdBy = userId;
        }

        const campaign = await Campaign.findOneAndDelete(query);

        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found or unauthorized" });
        }

        res.json({ message: "Campaign deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting campaign", error: error.message });
    }
});

module.exports = router;