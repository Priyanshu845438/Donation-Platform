const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const authMiddleware = require("../middleware/auth");

const router = express.Router();
const Campaign = require("../models/Campaign");

// Ensure directories exist
const createFolder = (folderPath) => {
    if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath, { recursive: true });
    }
};

const imageStoragePath = "uploads/campaign/image/";
const proofStoragePath = "uploads/campaign/proof/";

createFolder(imageStoragePath);
createFolder(proofStoragePath);

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const folderPath = file.fieldname === "campaignImages" ? imageStoragePath : proofStoragePath;
        cb(null, folderPath);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
    }
});

const upload = multer({ storage });

const generateUniqueDonationLink = async (campaignName) => {
    let donationLink;
    let isUnique = false;

    while (!isUnique) {
        // Generate a donation link using campaign name + random string
        donationLink = `${campaignName.replace(/\s+/g, "-").toLowerCase()}-${Math.random().toString(36).substring(7)}`;

        // Check if it already exists in the database
        const existingCampaign = await Campaign.findOne({ donationLink });
        if (!existingCampaign) {
            isUnique = true;
        }
    }
    return donationLink;
};

router.post(
    "/create",
    authMiddleware(["admin", "ngo"]),
    upload.fields([
        { name: "campaignImages", maxCount: 3 },
        { name: "proofDocs", maxCount: 3 }
    ]),
    async (req, res) => {
        try {
            if (!req.user || !req.user.id) {
                return res.status(400).json({ success: false, message: "Authentication failed. User ID missing." });
            }

            if (req.user.role.toLowerCase() !== "ngo" && req.user.role.toLowerCase() !== "admin") {
                return res.status(403).json({ success: false, message: "Only NGOs and Admins can create campaigns." });
            }

            // ✅ Generate unique donation link
            const donationLink = await generateUniqueDonationLink(req.body.campaignName);

            // ✅ Include `createdBy` (NGO ID)
            const campaignData = {
                campaignName: req.body.campaignName,
                contactNumber: req.body.contactNumber,
                explainStory: req.body.explainStory,
                importance: req.body.importance,
                goalAmount: parseFloat(req.body.goalAmount),
                endDate: new Date(req.body.endDate),
                campaignImages: req.files["campaignImages"]?.map(file => `/uploads/campaign/image/${file.filename}`) || [],
                proofDocs: req.files["proofDocs"]?.map(file => `/uploads/campaign/proof/${file.filename}`) || [],
                createdBy: req.user.id,
                donationLink // ✅ Assign the unique donation link
            };

            const campaign = new Campaign(campaignData);
            await campaign.save();

            res.status(201).json({ success: true, message: "Campaign created successfully", campaign });

        } catch (error) {
            console.error("❌ Campaign Creation Error:", error);
            res.status(500).json({ success: false, message: "Error creating campaign", error: error.message });
        }
    }
);


// Edit Campaign
router.put("/edit/:id", authMiddleware(["admin", "ngo"]), async (req, res) => {
    try {
        const { id } = req.params;
        let campaign = await Campaign.findById(id);
        if (!campaign) return res.status(404).json({ message: "Campaign not found." });
        
        if (req.user.role !== "admin" && campaign.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only edit your own campaign." });
        }

        Object.assign(campaign, req.body);
        await campaign.save();
        res.status(200).json({ message: "Campaign updated successfully", campaign });
    } catch (error) {
        res.status(500).json({ message: "Error updating campaign", error: error.message });
    }
});

// Delete Campaign
router.delete("/delete/:id", authMiddleware(["admin", "ngo"]), async (req, res) => {
    try {
        const { id } = req.params;
        let campaign = await Campaign.findById(id);
        if (!campaign) return res.status(404).json({ message: "Campaign not found." });
        
        if (req.user.role !== "admin" && campaign.createdBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "You can only delete your own campaign." });
        }

        await campaign.deleteOne();
        res.status(200).json({ message: "Campaign deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting campaign", error: error.message });
    }
});

// Fetch All Campaigns
router.get("/campaigns", async (req, res) => {
    try {
        const campaigns = await Campaign.find().populate("createdBy", "fullName email");
        res.status(200).json({ success: true, campaigns });
    } catch (error) {
        res.status(500).json({ message: "Error fetching campaigns", error: error.message });
    }
});

// Get a Single Campaign by ID
router.get("/:id", async (req, res) => {
    try {
        const campaign = await Campaign.findById(req.params.id);
        if (!campaign) return res.status(404).json({ message: "Campaign not found" });
        res.json(campaign);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
});

// Serve uploaded images statically
router.use("/uploads", express.static("uploads"));

module.exports = router;
