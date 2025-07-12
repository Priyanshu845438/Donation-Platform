
const express = require("express");
const Company = require("../../models/Company");
const NGO = require("../../models/NGO");
const Campaign = require("../../models/Campaign");
const Donation = require("../../models/Donation");
const authMiddleware = require("../../middleware/auth");
const upload = require("../../middleware/uploadMiddleware");

const router = express.Router();

// Dashboard
router.get("/dashboard", authMiddleware(["company"]), async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const company = await Company.findOne({ userId });
        
        if (!company) {
            return res.status(404).json({ message: "Company profile not found" });
        }

        const donations = await Donation.find({ companyId: company._id });
        const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);

        res.json({
            company,
            donations,
            totalDonated,
            donationCount: donations.length
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching dashboard data", error: error.message });
    }
});

// Profile management
router.get("/profile", authMiddleware(["company"]), async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const company = await Company.findOne({ userId });
        
        if (!company) {
            return res.status(404).json({ message: "Company profile not found" });
        }

        res.json(company);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile", error: error.message });
    }
});

router.put("/profile", authMiddleware(["company"]), upload.single("companyLogo"), async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const updateData = req.body;

        if (req.file) {
            updateData.companyLogo = `/uploads/company/${req.file.filename}`;
        }

        const company = await Company.findOneAndUpdate({ userId }, updateData, { new: true });
        
        if (!company) {
            return res.status(404).json({ message: "Company profile not found" });
        }

        res.json({ message: "Profile updated successfully", company });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
});

// View NGOs
router.get("/ngos", authMiddleware(["company"]), async (req, res) => {
    try {
        const ngos = await NGO.find({ isActive: true }).populate("userId", "fullName email");
        res.json(ngos);
    } catch (error) {
        res.status(500).json({ message: "Error fetching NGOs", error: error.message });
    }
});

router.get("/ngos/:id", authMiddleware(["company"]), async (req, res) => {
    try {
        const { id } = req.params;
        const ngo = await NGO.findById(id).populate("userId", "fullName email");
        
        if (!ngo) {
            return res.status(404).json({ message: "NGO not found" });
        }

        // Also get NGO's campaigns
        const campaigns = await Campaign.find({ ngoId: id, isActive: true });
        
        res.json({ ngo, campaigns });
    } catch (error) {
        res.status(500).json({ message: "Error fetching NGO", error: error.message });
    }
});

// View campaigns
router.get("/campaigns", authMiddleware(["company"]), async (req, res) => {
    try {
        const campaigns = await Campaign.find({ isActive: true })
            .populate("ngoId", "ngoName email")
            .sort({ createdAt: -1 });
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({ message: "Error fetching campaigns", error: error.message });
    }
});

router.get("/campaigns/:id", authMiddleware(["company"]), async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await Campaign.findById(id).populate("ngoId", "ngoName email");
        
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }

        res.json(campaign);
    } catch (error) {
        res.status(500).json({ message: "Error fetching campaign", error: error.message });
    }
});

// Make donations
router.post("/donations", authMiddleware(["company"]), async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { ngoId, campaignId, amount, message } = req.body;
        
        const company = await Company.findOne({ userId });
        if (!company) {
            return res.status(404).json({ message: "Company profile not found" });
        }

        const donation = new Donation({
            companyId: company._id,
            ngoId,
            campaignId,
            amount,
            message,
            status: "completed" // or "pending" based on payment integration
        });

        await donation.save();
        res.status(201).json({ message: "Donation made successfully", donation });
    } catch (error) {
        res.status(500).json({ message: "Error making donation", error: error.message });
    }
});

// View donations made
router.get("/donations", authMiddleware(["company"]), async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { page = 1, limit = 10 } = req.query;
        
        const company = await Company.findOne({ userId });
        
        if (!company) {
            return res.status(404).json({ message: "Company profile not found" });
        }

        const donations = await Donation.find({ companyId: company._id })
            .populate("ngoId", "ngoName")
            .populate("campaignId", "title")
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await Donation.countDocuments({ companyId: company._id });

        res.json({
            success: true,
            data: {
                donations,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit))
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching donations", error: error.message });
    }
});

// Make donation endpoint (as referenced in tests)
router.post("/donate", authMiddleware(["company"]), async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const { campaignId, amount, donationType, isAnonymous, message, paymentMethod } = req.body;
        
        const company = await Company.findOne({ userId });
        if (!company) {
            return res.status(404).json({ message: "Company profile not found" });
        }

        // Validate campaign exists
        const campaign = await Campaign.findById(campaignId);
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }

        const donation = new Donation({
            companyId: company._id,
            ngoId: campaign.ngoId,
            campaignId,
            amount,
            donationType,
            isAnonymous,
            message,
            paymentMethod,
            status: "completed" // or "pending" based on payment integration
        });

        await donation.save();

        // Update campaign raised amount
        await Campaign.findByIdAndUpdate(campaignId, {
            $inc: { raisedAmount: amount }
        });

        res.status(200).json({ 
            message: "Donation made successfully", 
            donation 
        });
    } catch (error) {
        res.status(500).json({ message: "Error making donation", error: error.message });
    }
});

module.exports = router;
