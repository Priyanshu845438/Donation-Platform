
const express = require("express");
const NGO = require("../../models/NGO");
const Company = require("../../models/Company");
const Campaign = require("../../models/Campaign");
const Donation = require("../../models/Donation");
const authMiddleware = require("../../middleware/auth");
const upload = require("../../middleware/uploadMiddleware");

const router = express.Router();

// Dashboard
router.get("/dashboard", authMiddleware(["ngo"]), async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const ngo = await NGO.findOne({ userId });
        
        if (!ngo) {
            return res.status(404).json({ message: "NGO profile not found" });
        }

        const campaigns = await Campaign.find({ ngoId: ngo._id });
        const totalDonations = await Donation.aggregate([
            { $match: { ngoId: ngo._id } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);

        res.json({
            success: true,
            data: {
                ngo,
                campaigns,
                totalDonations: totalDonations[0]?.total || 0,
                campaignCount: campaigns.length
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching dashboard data", error: error.message });
    }
});

// Profile management
router.get("/profile", authMiddleware(["ngo"]), async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const ngo = await NGO.findOne({ userId });
        
        if (!ngo) {
            return res.status(404).json({ message: "NGO profile not found" });
        }

        res.json(ngo);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile", error: error.message });
    }
});

router.put("/profile", authMiddleware(["ngo"]), upload.single("logo"), async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const updateData = req.body;

        if (req.file) {
            updateData.logo = `/uploads/ngo/${req.file.filename}`;
        }

        const ngo = await NGO.findOneAndUpdate({ userId }, updateData, { new: true });
        
        if (!ngo) {
            return res.status(404).json({ message: "NGO profile not found" });
        }

        res.json({ message: "Profile updated successfully", ngo });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
});

// Campaign management
router.post("/campaigns", authMiddleware(["ngo"]), upload.fields([
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
            createdBy: userId
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

router.get("/campaigns", authMiddleware(["ngo"]), async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const ngo = await NGO.findOne({ userId });
        
        if (!ngo) {
            return res.status(404).json({ message: "NGO profile not found" });
        }

        const campaigns = await Campaign.find({ ngoId: ngo._id });
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: "Error fetching campaigns", error: error.message });
    }
});

router.put("/campaigns/:id", authMiddleware(["ngo"]), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id || req.user.id;
        
        const campaign = await Campaign.findOneAndUpdate(
            { _id: id, createdBy: userId },
            req.body,
            { new: true }
        );

        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found or unauthorized" });
        }

        res.json({ message: "Campaign updated successfully", campaign });
    } catch (error) {
        res.status(500).json({ message: "Error updating campaign", error: error.message });
    }
});

// View companies
router.get("/companies", authMiddleware(["ngo"]), async (req, res) => {
    try {
        const companies = await Company.find({ isActive: true }).populate("userId", "fullName email");
        res.json(companies);
    } catch (error) {
        res.status(500).json({ message: "Error fetching companies", error: error.message });
    }
});

router.get("/companies/:id", authMiddleware(["ngo"]), async (req, res) => {
    try {
        const { id } = req.params;
        const company = await Company.findById(id).populate("userId", "fullName email");
        
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.json(company);
    } catch (error) {
        res.status(500).json({ message: "Error fetching company", error: error.message });
    }
});

// Donations received
router.get("/donations", authMiddleware(["ngo"]), async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const ngo = await NGO.findOne({ userId });
        
        if (!ngo) {
            return res.status(404).json({ message: "NGO profile not found" });
        }

        const donations = await Donation.find({ ngoId: ngo._id })
            .populate("companyId", "companyName")
            .populate("campaignId", "title")
            .sort({ createdAt: -1 });

        res.json(donations);
    } catch (error) {
        res.status(500).json({ message: "Error fetching donations", error: error.message });
    }
});

module.exports = router;
