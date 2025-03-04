const express = require("express");
const router = express.Router();
const Donation = require("../models/Donation");
const Campaign = require("../models/Campaign");
const authMiddleware = require("../middleware/auth");
const { v4: uuidv4 } = require("uuid");

// 💰 Make a Donation (Authenticated Users)
router.post("/donate/:campaignId", authMiddleware(["admin", "ngo", "user", "company"]), async (req, res) => {
    try {
        const { amount, donorName, donorEmail, donorPhone } = req.body;
        const { campaignId } = req.params;

        // Find the campaign
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }

        // Generate unique orderId
        const orderId = uuidv4();

        // Create a new donation
        const donation = new Donation({
            orderId,
            amount,
            donorName,
            donorEmail,
            donorPhone,
            campaignId,
            donationLink: `http://localhost:5000/api/donations/payment/${orderId}`, // Fixed donation link
        });

        // Save the donation
        await donation.save();

        // Update campaign raised amount
        campaign.raisedAmount += amount;
        await campaign.save();

        res.status(201).json({
            success: true,
            message: "Donation made successfully",
            donationId: donation._id,
            orderId,
            campaignId,
        });
    } catch (error) {
        console.error("Donation Error:", error);
        res.status(500).json({ message: "Donation error", error: error.message });
    }
});

// 💰 Make a Donation (External Users)
router.post("/donate-external/:campaignId", async (req, res) => {
    try {
        const { amount, donorName, donorEmail, donorPhone } = req.body;
        const { campaignId } = req.params;

        // Find the campaign
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }

        // Generate unique orderId
        const orderId = uuidv4();

        // Create a new donation
        const donation = new Donation({
            orderId,
            amount,
            donorName,
            donorEmail,
            donorPhone,
            campaignId,
            donationLink: `http://localhost:5000/api/donations/payment/${orderId}`, // Fixed donation link
        });

        // Save the donation
        await donation.save();

        // Update campaign raised amount
        campaign.raisedAmount += amount;
        await campaign.save();

        res.status(201).json({
            success: true,
            message: "Donation made successfully",
            donationId: donation._id,
            orderId,
            campaignId,
        });
    } catch (error) {
        console.error("Donation Error:", error);
        res.status(500).json({ message: "Donation error", error: error.message });
    }
});

// 🔍 Get All Donations (Admin Only)
router.get("/", authMiddleware(["admin"]), async (req, res) => {
    try {
        const donations = await Donation.find();
        res.status(200).json({ donations });
    } catch (error) {
        console.error("Get Donations Error:", error);
        res.status(500).json({ message: "Get donations error", error: error.message });
    }
});

// 🔍 Get Donations by Campaign ID (Admin & NGO)
router.get("/campaign/:campaignId", authMiddleware(["admin", "ngo"]), async (req, res) => {
    try {
        const { campaignId } = req.params;
        
        // Find the campaign
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }

        // Check if the user is an admin or the NGO owner
        if (req.user.role !== "admin" && campaign.ngo.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to view donations for this campaign" });
        }

        // Get donations for this campaign
        const donations = await Donation.find({ campaignId });
        res.status(200).json({ donations });
    } catch (error) {
        console.error("Get Donations Error:", error);
        res.status(500).json({ message: "Get donations error", error: error.message });
    }
});

// ✏️ Update Donation Status (Admin Only)
router.put("/:donationId", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { donationId } = req.params;
        const { status } = req.body;

        const donation = await Donation.findById(donationId);
        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        donation.status = status;
        await donation.save();

        res.status(200).json({ message: "Donation status updated", donation });
    } catch (error) {
        console.error("Update Donation Error:", error);
        res.status(500).json({ message: "Update donation error", error: error.message });
    }
});

// ❌ Delete Donation (Admin Only)
router.delete("/:donationId", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { donationId } = req.params;
        const donation = await Donation.findByIdAndDelete(donationId);

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        res.status(200).json({ message: "Donation deleted", donation });
    } catch (error) {
        console.error("Delete Donation Error:", error);
        res.status(500).json({ message: "Delete donation error", error: error.message });
    }
});

module.exports = router;
