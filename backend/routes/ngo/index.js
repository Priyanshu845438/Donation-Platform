
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
            stats: {
                totalCampaigns: campaigns.length,
                totalRaised: totalDonations[0]?.total || 0,
                completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
                activeCampaigns: campaigns.filter(c => c.status === 'active').length
            },
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

// Volunteering management
router.get("/volunteering", authMiddleware(["ngo"]), async (req, res) => {
    try {
        // For now, return empty volunteering data
        res.json({
            success: true,
            data: {
                volunteers: [],
                opportunities: [],
                applications: []
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching volunteering data", error: error.message });
    }
});

// Users management (view donors/users)
router.get("/users", authMiddleware(["ngo"]), async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const ngo = await NGO.findOne({ userId });
        
        if (!ngo) {
            return res.status(404).json({ message: "NGO profile not found" });
        }

        // Get users who have donated to this NGO's campaigns
        const donations = await Donation.find({ ngoId: ngo._id })
            .populate("donorId", "fullName email")
            .select("donorId donorName donorEmail amount createdAt");

        const uniqueDonors = donations.reduce((acc, donation) => {
            const donorKey = donation.donorEmail || donation.donorId?._id;
            if (donorKey && !acc[donorKey]) {
                acc[donorKey] = {
                    id: donation.donorId?._id,
                    name: donation.donorName || donation.donorId?.fullName,
                    email: donation.donorEmail || donation.donorId?.email,
                    totalDonated: 0,
                    donationCount: 0,
                    lastDonation: donation.createdAt
                };
            }
            if (acc[donorKey]) {
                acc[donorKey].totalDonated += donation.amount;
                acc[donorKey].donationCount += 1;
                if (donation.createdAt > acc[donorKey].lastDonation) {
                    acc[donorKey].lastDonation = donation.createdAt;
                }
            }
            return acc;
        }, {});

        res.json({
            success: true,
            data: Object.values(uniqueDonors)
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching users", error: error.message });
    }
});

// Reports
router.get("/reports", authMiddleware(["ngo"]), async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const ngo = await NGO.findOne({ userId });
        
        if (!ngo) {
            return res.status(404).json({ message: "NGO profile not found" });
        }

        const campaigns = await Campaign.find({ ngoId: ngo._id });
        const donations = await Donation.find({ ngoId: ngo._id });

        // Generate reports data
        const reports = {
            campaignPerformance: campaigns.map(campaign => ({
                id: campaign._id,
                title: campaign.title,
                goalAmount: campaign.goalAmount,
                raisedAmount: campaign.raisedAmount,
                donorCount: donations.filter(d => d.campaignId?.toString() === campaign._id.toString()).length,
                status: campaign.status
            })),
            donationTrends: {
                monthly: [],
                yearly: []
            },
            summary: {
                totalCampaigns: campaigns.length,
                totalRaised: donations.reduce((sum, d) => sum + d.amount, 0),
                totalDonors: new Set(donations.map(d => d.donorEmail)).size
            }
        };

        res.json({
            success: true,
            data: reports
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching reports", error: error.message });
    }
});

// Settings
router.get("/settings", authMiddleware(["ngo"]), async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const ngo = await NGO.findOne({ userId });
        
        if (!ngo) {
            return res.status(404).json({ message: "NGO profile not found" });
        }

        res.json({
            success: true,
            data: {
                notifications: {
                    emailNotifications: true,
                    donationAlerts: true,
                    campaignUpdates: true
                },
                privacy: {
                    profileVisibility: "public",
                    contactInfoVisible: true
                },
                preferences: {
                    currency: "INR",
                    timezone: "Asia/Kolkata"
                }
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching settings", error: error.message });
    }
});

router.put("/settings", authMiddleware(["ngo"]), async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const settings = req.body;

        // For now, just return success
        // In a real app, you'd save these settings to a user preferences model
        
        res.json({
            success: true,
            message: "Settings updated successfully",
            data: settings
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating settings", error: error.message });
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
