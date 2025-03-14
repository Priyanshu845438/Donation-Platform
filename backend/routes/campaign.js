const express = require("express");
const Campaign = require("../models/Campaign");
const authMiddleware = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

const router = express.Router();

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/"); // Store images in "uploads/" folder
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Unique filename
    },
});

const upload = multer({ storage: storage });

/**
 * ✅ Create Campaign (Admin & NGO)
 * - Supports Image Uploads
 */
router.post("/create", authMiddleware(["admin", "ngo"]), upload.fields([
    { name: "campaignImage", maxCount: 1 },
    { name: "proofDocs", maxCount: 3 }
]), async (req, res) => {
    try {
        const {
            campaignName,
            contactNumber,
            explainStory,
            importance,
            goalAmount,
            endDate
        } = req.body;

        // Validate required fields
        if (!campaignName || !contactNumber || !explainStory || !importance || !goalAmount || !endDate) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

        // Validate file uploads
        if (!req.files.campaignImage || !req.files.proofDocs) {
            return res.status(400).json({
                success: false,
                message: "Campaign image and proof documents are required"
            });
        }

        const campaignData = {
            campaignName,
            contactNumber,
            explainStory,
            importance,
            goalAmount: parseFloat(goalAmount),
            endDate: new Date(endDate),
            createdBy: req.user.id,
            campaignImage: `/uploads/${req.files.campaignImage[0].filename}`,
            proofDocs: req.files.proofDocs.map(file => `/uploads/${file.filename}`)
        };

        const campaign = new Campaign(campaignData);
        await campaign.save();

        res.status(201).json({
            success: true,
            message: "Campaign created successfully",
            campaign
        });

    } catch (error) {
        console.error("Campaign Creation Error:", error);
        res.status(500).json({
            success: false,
            message: "Error creating campaign",
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * ✅ Edit Campaign (Only the NGO who created it or Admin)
 */
router.put("/edit/:id", authMiddleware(["admin", "ngo"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { campaignName, contactNumber, explainStory, importance, goalAmount } = req.body;

        let campaign = await Campaign.findById(id);
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found." });
        }

        // Admins can edit any campaign; NGOs can edit only their own
        if (req.user.role !== "admin" && campaign.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only edit your own campaign." });
        }

        if (campaignName) campaign.campaignName = campaignName;
        if (contactNumber) campaign.contactNumber = contactNumber;
        if (explainStory) campaign.explainStory = explainStory;
        if (importance) campaign.importance = importance;
        if (goalAmount) campaign.goalAmount = goalAmount;

        await campaign.save();
        res.status(200).json({ message: "Campaign updated successfully", campaign });
    } catch (error) {
        res.status(500).json({ message: "Error updating campaign", error: error.message });
    }
});

/**
 * ✅ Delete Campaign (Only the NGO who created it or Admin)
 */
router.delete("/delete/:id", authMiddleware(["admin", "ngo"]), async (req, res) => {
    try {
        const { id } = req.params;

        let campaign = await Campaign.findById(id);
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found." });
        }

        // Admins can delete any campaign; NGOs can delete only their own
        if (req.user.role !== "admin" && campaign.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only delete your own campaign." });
        }

        await campaign.deleteOne();
        res.status(200).json({ message: "Campaign deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting campaign", error: error.message });
    }
});

/**
 * ✅ Get Campaign by Donation Link (Public)
 */
router.get("/donate/:link", async (req, res) => {
    try {
        const { link } = req.params;
        const campaign = await Campaign.findOne({ donationLink: link });

        if (!campaign) {
            return res.status(404).json({ message: "Invalid donation link." });
        }

        res.status(200).json({ campaign });
    } catch (error) {
        res.status(500).json({ message: "Error fetching campaign", error: error.message });
    }
});

/**
 * ✅ Fetch All Campaigns (Public)
 */
router.get("/campaigns", async (req, res) => {
    try {
        const campaigns = await Campaign.find()
            .populate("createdBy", "ngoName email") // Populate NGO details
            .exec();

        if (!campaigns || campaigns.length === 0) {
            return res.status(404).json({ message: "No campaigns found." });
        }

        res.status(200).json({
            message: "Campaigns fetched successfully",
            campaigns,
        });
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        res.status(500).json({ message: "Error fetching campaigns", error: error.message });
    }
});

/**
 * ✅ Get a Single Campaign by ID (Public)
 */
router.get("/:id", async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) {
          return res.status(404).json({ message: "Campaign not found" });
        }
        res.json(campaign);
      } catch (error) {
        console.error("Error fetching campaign:", error);
        res.status(500).json({ message: "Server error" });
      }
    });

// Serve uploaded images statically
router.use("/uploads", express.static("uploads"));

module.exports = router;
