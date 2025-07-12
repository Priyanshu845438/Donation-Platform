
const express = require("express");
const Donation = require("../../models/Donation");
const Company = require("../../models/Company");
const NGO = require("../../models/NGO");
const Campaign = require("../../models/Campaign");
const authMiddleware = require("../../middleware/auth");

const router = express.Router();

// Make a donation (Company/Donor only)
router.post("/", authMiddleware(["company", "donor"]), async (req, res) => {
    try {
        const { role } = req.user;
        const userId = req.user._id || req.user.id;
        const { ngoId, campaignId, amount, message, paymentMethod } = req.body;

        let donorProfile = null;
        
        if (role === "company") {
            donorProfile = await Company.findOne({ userId });
        }
        // Add Donor model handling when implemented

        if (!donorProfile && role === "company") {
            return res.status(404).json({ message: "Profile not found" });
        }

        const donation = new Donation({
            companyId: role === "company" ? donorProfile._id : null,
            donorId: role === "donor" ? userId : null,
            ngoId,
            campaignId,
            amount,
            message,
            paymentMethod,
            status: "pending"
        });

        await donation.save();

        // Update campaign raised amount if campaign exists
        if (campaignId) {
            await Campaign.findByIdAndUpdate(campaignId, {
                $inc: { raisedAmount: amount }
            });
        }

        res.status(201).json({ message: "Donation initiated successfully", donation });
    } catch (error) {
        res.status(500).json({ message: "Error making donation", error: error.message });
    }
});

// Get donations (filtered by user role)
router.get("/", authMiddleware([]), async (req, res) => {
    try {
        const { role } = req.user;
        const userId = req.user._id || req.user.id;
        let query = {};

        if (role === "company") {
            const company = await Company.findOne({ userId });
            if (company) {
                query.companyId = company._id;
            }
        } else if (role === "ngo") {
            const ngo = await NGO.findOne({ userId });
            if (ngo) {
                query.ngoId = ngo._id;
            }
        } else if (role === "admin") {
            // Admin can see all donations
        } else {
            query.donorId = userId;
        }

        const donations = await Donation.find(query)
            .populate("companyId", "companyName")
            .populate("ngoId", "ngoName")
            .populate("campaignId", "title")
            .sort({ createdAt: -1 });

        res.json(donations);
    } catch (error) {
        res.status(500).json({ message: "Error fetching donations", error: error.message });
    }
});

// Get single donation
router.get("/:id", authMiddleware([]), async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;
        const userId = req.user._id || req.user.id;

        const donation = await Donation.findById(id)
            .populate("companyId", "companyName")
            .populate("ngoId", "ngoName")
            .populate("campaignId", "title");

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        // Check authorization
        let authorized = false;
        
        if (role === "admin") {
            authorized = true;
        } else if (role === "company") {
            const company = await Company.findOne({ userId });
            authorized = company && donation.companyId?.toString() === company._id.toString();
        } else if (role === "ngo") {
            const ngo = await NGO.findOne({ userId });
            authorized = ngo && donation.ngoId?.toString() === ngo._id.toString();
        } else if (role === "donor") {
            authorized = donation.donorId?.toString() === userId;
        }

        if (!authorized) {
            return res.status(403).json({ message: "Access denied" });
        }

        res.json(donation);
    } catch (error) {
        res.status(500).json({ message: "Error fetching donation", error: error.message });
    }
});

// Update donation status (Admin only)
router.put("/:id/status", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const validStatuses = ["pending", "completed", "failed", "refunded"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const donation = await Donation.findByIdAndUpdate(
            id,
            { status, updatedAt: new Date() },
            { new: true }
        );

        if (!donation) {
            return res.status(404).json({ message: "Donation not found" });
        }

        res.json({ message: "Donation status updated successfully", donation });
    } catch (error) {
        res.status(500).json({ message: "Error updating donation status", error: error.message });
    }
});

module.exports = router;
