const express = require("express");
const User = require("../../models/User");
const ngo = require("../../models/NGO");
const company = require("../../models/Company");
const Campaign = require("../../models/Campaign");
const Notice = require("../../models/Notice");
const Settings = require("../../models/Settings");
const Activity = require("../../models/Activity");
const authMiddleware = require("../../middleware/auth");
const bcrypt = require("bcryptjs");

const AdminController = require("../../controllers/adminController");

const router = express.Router();

// Dashboard analytics
router.get("/dashboard", authMiddleware(["admin"]), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalngos = await ngo.countDocuments();
        const totalCompanies = await company.countDocuments();
        const totalCampaigns = await Campaign.countDocuments();

        res.json({
            analytics: {
                totalUsers,
                totalngos,
                totalCompanies,
                totalCampaigns,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching dashboard data",
            error: error.message,
        });
    }
});

// Dashboard stats endpoint
router.get("/dashboard/stats", authMiddleware(["admin"]), async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalngos = await ngo.countDocuments();
        const totalCompanies = await company.countDocuments();
        const totalCampaigns = await Campaign.countDocuments();
        const activeCampaigns = await Campaign.countDocuments({
            isActive: true,
        });
        const pendingApprovals = await User.countDocuments({
            approvalStatus: "Pending",
        });

        // Get donation statistics
        const donationStats = await Campaign.aggregate([
            { $group: { _id: null, totalRaised: { $sum: "$raisedAmount" } } },
        ]);

        const recentUsers = await User.find()
            .select("fullName email role createdAt")
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            success: true,
            data: {
                overview: {
                    totalUsers,
                    totalngos,
                    totalCompanies,
                    totalCampaigns,
                    activeCampaigns,
                    pendingApprovals,
                    totalRaised: donationStats[0]?.totalRaised || 0,
                },
                recentUsers,
                systemHealth: {
                    status: "healthy",
                    uptime: process.uptime(),
                    memory: process.memoryUsage(),
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching dashboard stats",
            error: error.message,
        });
    }
});

// Create user endpoint
router.post("/create-user", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, role } = req.body;

        if (!fullName || !email || !password || !phoneNumber || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res
                .status(400)
                .json({ message: "User with this email already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            isVerified: true,
            isActive: true,
            approvalStatus: "approved",
        });

        await newUser.save();

        // Create profile based on role
        if (role === "ngo") {
            await ngo.create({
                userId: newUser._id,
                ngoName: fullName,
                email: email,
                contactNumber: phoneNumber,
            });
        } else if (role === "company") {
            await company.create({
                userId: newUser._id,
                companyName: fullName,
                companyEmail: email,
                companyPhoneNumber: phoneNumber,
            });
        }

        res.status(201).json({
            message: "User created successfully",
            user: {
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                role: newUser.role,
                isActive: newUser.isActive,
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating user",
            error: error.message,
        });
    }
});

// User management - keep existing endpoint for backward compatibility
router.post("/users", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, role } = req.body;

        if (!fullName || !email || !password || !phoneNumber || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            isVerified: true,
            isActive: true,
            approvalStatus: "approved",
        });

        await newUser.save();
        res.status(201).json({
            message: "User created successfully",
            user: newUser,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating user",
            error: error.message,
        });
    }
});

router.get("/users", authMiddleware(["admin"]), async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            role,
            approvalStatus,
            search,
        } = req.query;

        let query = {};

        if (role) {
            query.role = role;
        }

        if (approvalStatus) {
            query.approvalStatus = approvalStatus;
        }

        if (search) {
            query.$or = [
                { fullName: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } },
            ];
        }

        const users = await User.find(query)
            .select("-password")
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ createdAt: -1 });

        const total = await User.countDocuments(query);

        res.json({
            success: true,
            data: {
                users,
                pagination: {
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    pages: Math.ceil(total / parseInt(limit)),
                },
            },
        });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching users",
            error: error.message,
        });
    }
});

router.put("/users/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const user = await User.findByIdAndUpdate(id, updateData, {
            new: true,
        }).select("-password");
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User updated successfully", user });
    } catch (error) {
        res.status(500).json({
            message: "Error updating user",
            error: error.message,
        });
    }
});

router.delete("/users/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting user",
            error: error.message,
        });
    }
});

// User approval endpoint
router.put(
    "/users/:id/approval",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { approvalStatus } = req.body;

            const validStatuses = ["pending", "approved", "rejected"];
            if (!validStatuses.includes(approvalStatus)) {
                return res
                    .status(400)
                    .json({ message: "Invalid approval status" });
            }

            const user = await User.findByIdAndUpdate(
                id,
                { approvalStatus, updatedAt: new Date() },
                { new: true },
            ).select("-password");

            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }

            res.json({
                message: `User ${approvalStatus.toLowerCase()} successfully`,
                user,
            });
        } catch (error) {
            res.status(500).json({
                message: "Error updating user approval status",
                error: error.message,
            });
        }
    },
);

// ngo management
router.get("/ngos", authMiddleware(["admin"]), async (req, res) => {
    try {
        const ngos = await ngo.find().populate("userId", "fullName email");
        res.json(ngos);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching ngos",
            error: error.message,
        });
    }
});

router.put("/ngos/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const ngo = await ngo.findByIdAndUpdate(id, req.body, { new: true });
        if (!ngo) {
            return res.status(404).json({ message: "ngo not found" });
        }
        res.json({ message: "ngo updated successfully", ngo });
    } catch (error) {
        res.status(500).json({
            message: "Error updating ngo",
            error: error.message,
        });
    }
});

// company management
router.get("/companies", authMiddleware(["admin"]), async (req, res) => {
    try {
        const companies = await company
            .find()
            .populate("userId", "fullName email");
        res.json(companies);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching companies",
            error: error.message,
        });
    }
});

router.put("/companies/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const company = await company.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        if (!company) {
            return res.status(404).json({ message: "company not found" });
        }
        res.json({ message: "company updated successfully", company });
    } catch (error) {
        res.status(500).json({
            message: "Error updating company",
            error: error.message,
        });
    }
});

// Campaign management
router.get("/campaigns", authMiddleware(["admin"]), async (req, res) => {
    try {
        const campaigns = await Campaign.find().populate("ngoId", "ngoName");
        res.json(campaigns);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching campaigns",
            error: error.message,
        });
    }
});

router.put("/campaigns/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await Campaign.findByIdAndUpdate(id, req.body, {
            new: true,
        });
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }
        res.json({ message: "Campaign updated successfully", campaign });
    } catch (error) {
        res.status(500).json({
            message: "Error updating campaign",
            error: error.message,
        });
    }
});

router.delete("/campaigns/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        await Campaign.findByIdAndDelete(id);
        res.json({ message: "Campaign deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting campaign",
            error: error.message,
        });
    }
});

// Notice management
router.post("/notices", authMiddleware(["admin"]), async (req, res) => {
    try {
        const notice = new Notice(req.body);
        await notice.save();
        res.status(201).json({
            message: "Notice created successfully",
            notice,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating notice",
            error: error.message,
        });
    }
});

router.get("/notices", authMiddleware(["admin"]), async (req, res) => {
    try {
        const notices = await Notice.find();
        res.json(notices);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching notices",
            error: error.message,
        });
    }
});

// Settings management
router.get("/settings", authMiddleware(["admin"]), async (req, res) => {
    try {
        const settings = await Settings.findOne();
        res.json(settings || {});
    } catch (error) {
        res.status(500).json({
            message: "Error fetching settings",
            error: error.message,
        });
    }
});

router.put("/settings", authMiddleware(["admin"]), async (req, res) => {
    try {
        const settings = await Settings.findOneAndUpdate({}, req.body, {
            new: true,
            upsert: true,
        });
        res.json({ message: "Settings updated successfully", settings });
    } catch (error) {
        res.status(500).json({
            message: "Error updating settings",
            error: error.message,
        });
    }
});

// Missing ngo routes for test compatibility
router.get("/ngos/", authMiddleware(["admin"]), async (req, res) => {
    try {
        const ngos = await ngo.find().populate("userId", "fullName email");
        res.json({ success: true, ngos });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching ngos",
            error: error.message,
        });
    }
});

router.put("/ngos/", authMiddleware(["admin"]), async (req, res) => {
    res.status(400).json({ message: "ngo ID is required for update" });
});

router.put("/ngos/:id/status", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const ngo = await ngo.findByIdAndUpdate(
            id,
            { isActive },
            { new: true },
        );
        if (!ngo) {
            return res.status(404).json({ message: "ngo not found" });
        }
        res.json({
            message: `ngo ${isActive ? "enabled" : "disabled"} successfully`,
            ngo,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating ngo status",
            error: error.message,
        });
    }
});

router.post("/ngos/:id/share", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const ShareLink = require("../../models/ShareLink");

        // Check if share link already exists for this NGO
        let shareLink = await ShareLink.findOne({
            resourceType: "profile",
            resourceId: id
        });

        if (!shareLink) {
            // Create new share link only if one doesn't exist
            shareLink = new ShareLink({
                resourceType: "profile",
                resourceId: id,
                createdBy: req.user.id
            });
            await shareLink.save();
        }

        const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/share/profile/${shareLink.shareId}`;
        res.json({ message: "Share link generated", shareLink: shareUrl });
    } catch (error) {
        res.status(500).json({
            message: "Error generating share link",
            error: error.message,
        });
    }
});

// Individual ngo management
router.get("/ngos/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const ngo = await ngo.findById(id).populate("userId", "fullName email");
        if (!ngo) {
            return res.status(404).json({ message: "ngo not found" });
        }
        res.json({ success: true, ngo });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching ngo",
            error: error.message,
        });
    }
});

router.put("/ngos/:id/status", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;
        const ngo = await ngo.findByIdAndUpdate(
            id,
            { isActive },
            { new: true },
        );
        if (!ngo) {
            return res.status(404).json({ message: "ngo not found" });
        }
        res.json({
            message: `ngo ${isActive ? "enabled" : "disabled"} successfully`,
            ngo,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating ngo status",
            error: error.message,
        });
    }
});

router.post("/ngos/:id/share", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const ShareLink = require("../../models/ShareLink");

        // Check if share link already exists for this NGO
        let shareLink = await ShareLink.findOne({
            resourceType: "profile",
            resourceId: id
        });

        if (!shareLink) {
            // Create new share link only if one doesn't exist
            shareLink = new ShareLink({
                resourceType: "profile",
                resourceId: id,
                createdBy: req.user.id
            });
            await shareLink.save();
        }

        const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/share/profile/${shareLink.shareId}`;
        res.json({ message: "Share link generated", shareLink: shareUrl });
    } catch (error) {
        res.status(500).json({
            message: "Error generating share link",
            error: error.message,
        });
    }
});

router.delete("/ngos/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        await ngo.findByIdAndDelete(id);
        res.json({ message: "ngo deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting ngo",
            error: error.message,
        });
    }
});

// Missing company routes for test compatibility
router.get("/companies/", authMiddleware(["admin"]), async (req, res) => {
    try {
        const companies = await company
            .find()
            .populate("userId", "fullName email");
        res.json({ success: true, companies });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching companies",
            error: error.message,
        });
    }
});

router.put("/companies/", authMiddleware(["admin"]), async (req, res) => {
    res.status(400).json({ message: "company ID is required for update" });
});

router.put(
    "/companies/:id/status",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            const company = await company.findByIdAndUpdate(
                id,
                { isActive },
                { new: true },
            );
            if (!company) {
                return res.status(404).json({ message: "company not found" });
            }
            res.json({
                message: `company ${isActive ? "enabled" : "disabled"} successfully`,
                company,
            });
        } catch (error) {
            res.status(500).json({
                message: "Error updating company status",
                error: error.message,
            });
        }
    },
);

router.post(
    "/companies/:id/share",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const ShareLink = require("../../models/ShareLink");

            // Check if share link already exists for this Company
            let shareLink = await ShareLink.findOne({
                resourceType: "profile",
                resourceId: id
            });

            if (!shareLink) {
                // Create new share link only if one doesn't exist
                shareLink = new ShareLink({
                    resourceType: "profile",
                    resourceId: id,
                    createdBy: req.user.id
                });
                await shareLink.save();
            }

            const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/share/profile/${shareLink.shareId}`;
            res.json({ message: "Share link generated", shareLink: shareUrl });
        } catch (error) {
            res.status(500).json({
                message: "Error generating share link",
                error: error.message,
            });
        }
    },
);

// Individual company management
router.get("/companies/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const company = await company
            .findById(id)
            .populate("userId", "fullName email");
        if (!company) {
            return res.status(404).json({ message: "company not found" });
        }
        res.json({ success: true, company });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching company",
            error: error.message,
        });
    }
});

router.put(
    "/companies/:id/status",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            const company = await company.findByIdAndUpdate(
                id,
                { isActive },
                { new: true },
            );
            if (!company) {
                return res.status(404).json({ message: "company not found" });
            }
            res.json({
                message: `company ${isActive ? "enabled" : "disabled"} successfully`,
                company,
            });
        } catch (error) {
            res.status(500).json({
                message: "Error updating company status",
                error: error.message,
            });
        }
    },
);

router.post(
    "/companies/:id/share",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const ShareLink = require("../../models/ShareLink");

            // Check if share link already exists for this Company
            let shareLink = await ShareLink.findOne({
                resourceType: "profile",
                resourceId: id
            });

            if (!shareLink) {
                // Create new share link only if one doesn't exist
                shareLink = new ShareLink({
                    resourceType: "profile",
                    resourceId: id,
                    createdBy: req.user.id
                });
                await shareLink.save();
            }

            const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/share/profile/${shareLink.shareId}`;
            res.json({ message: "Share link generated", shareLink: shareUrl });
        } catch (error) {
            res.status(500).json({
                message: "Error generating share link",
                error: error.message,
            });
        }
    },
);

router.delete("/companies/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        await company.findByIdAndDelete(id);
        res.json({ message: "company deleted successfully" });
    } catch (error) {
        res.status(500).json({
            message: "Error deleting company",
            error: error.message,
        });
    }
});

// Get share link custom design
router.get("/share/:shareId/customize", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { shareId } = req.params;

        const ShareLink = require("../../models/ShareLink");

        const shareLink = await ShareLink.findOne({ shareId });
        if (!shareLink) {
            return res.status(404).json({ message: "Share link not found" });
        }

        res.json({ 
            message: "Custom design retrieved successfully",
            customDesign: shareLink.customDesign || {},
            shareLink: {
                shareId: shareLink.shareId,
                resourceType: shareLink.resourceType,
                isActive: shareLink.isActive,
                viewCount: shareLink.viewCount
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving custom design",
            error: error.message,
        });
    }
});

// Update share link custom design
router.put("/share/:shareId/customize", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { shareId } = req.params;
        const { customDesign } = req.body;

        const ShareLink = require("../../models/ShareLink");

        const shareLink = await ShareLink.findOne({ shareId });
        if (!shareLink) {
            return res.status(404).json({ message: "Share link not found" });
        }

        shareLink.customDesign = customDesign;
        await shareLink.save();

        res.json({ 
            message: "Custom design updated successfully",
            shareLink 
        });
    } catch (error) {
        res.status(500).json({
            message: "Error updating custom design",
            error: error.message,
        });
    }
});

// Missing Campaign routes for test compatibility
router.get("/campaigns/", authMiddleware(["admin"]), async (req, res) => {
    try {
        const campaigns = await Campaign.find().populate("ngoId", "ngoName");
        res.json({ success: true, campaigns });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching campaigns",
            error: error.message,
        });
    }
});

router.put("/campaigns/", authMiddleware(["admin"]), async (req, res) => {
    res.status(400).json({ message: "Campaign ID is required for update" });
});

router.put(
    "/campaigns/:id/status",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            const campaign = await Campaign.findByIdAndUpdate(
                id,
                { isActive },
                { new: true },
            );
            if (!campaign) {
                return res.status(404).json({ message: "Campaign not found" });
            }
            res.json({
                message: `Campaign ${isActive ? "enabled" : "disabled"} successfully`,
                campaign,
            });
        } catch (error) {
            res.status(500).json({
                message: "Error updating campaign status",
                error: error.message,
            });
        }
    },
);

router.post(
    "/campaigns/:id/share",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const ShareLink = require("../../models/ShareLink");

            // Check if share link already exists for this Campaign
            let shareLink = await ShareLink.findOne({
                resourceType: "campaign",
                resourceId: id
            });

            if (!shareLink) {
                // Create new share link only if one doesn't exist
                shareLink = new ShareLink({
                    resourceType: "campaign",
                    resourceId: id,
                    createdBy: req.user.id
                });
                await shareLink.save();
            }

            const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/share/campaign/${shareLink.shareId}`;
            res.json({ message: "Share link generated", shareLink: shareUrl });
        } catch (error) {
            res.status(500).json({
                message: "Error generating share link",
                error: error.message,
            });
        }
    },
);

// Individual Campaign management
router.post("/campaigns", authMiddleware(["admin"]), async (req, res) => {
    try {
        const campaign = new Campaign(req.body);
        await campaign.save();
        res.status(201).json({
            message: "Campaign created successfully",
            campaign,
        });
    } catch (error) {
        res.status(500).json({
            message: "Error creating campaign",
            error: error.message,
        });
    }
});

router.get("/campaigns/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const campaign = await Campaign.findById(id).populate(
            "ngoId",
            "ngoName",
        );
        if (!campaign) {
            return res.status(404).json({ message: "Campaign not found" });
        }
        res.json({ success: true, campaign });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching campaign",
            error: error.message,
        });
    }
});

router.put(
    "/campaigns/:id/status",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const { isActive } = req.body;
            const campaign = await Campaign.findByIdAndUpdate(
                id,
                { isActive },
                { new: true },
            );
            if (!campaign) {
                return res.status(404).json({ message: "Campaign not found" });
            }
            res.json({
                message: `Campaign ${isActive ? "enabled" : "disabled"} successfully`,
                campaign,
            });
        } catch (error) {
            res.status(500).json({
                message: "Error updating campaign status",
                error: error.message,
            });
        }
    },
);

router.post(
    "/campaigns/:id/share",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const { id } = req.params;
            const ShareLink = require("../../models/ShareLink");

            // Check if share link already exists for this Campaign
            let shareLink = await ShareLink.findOne({
                resourceType: "campaign",
                resourceId: id
            });

            if (!shareLink) {
                // Create new share link only if one doesn't exist
                shareLink = new ShareLink({
                    resourceType: "campaign",
                    resourceId: id,
                    createdBy: req.user.id
                });
                await shareLink.save();
            }

            const shareUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/share/campaign/${shareLink.shareId}`;
            res.json({ message: "Share link generated", shareLink: shareUrl });
        } catch (error) {
            res.status(500).json({
                message: "Error generating share link",
                error: error.message,
            });
        }
    },
);

// Reports & Analytics endpoints
router.get("/reports/ngos", authMiddleware(["admin"]), async (req, res) => {
    try {
        const ngoStats = await ngo.aggregate([
            {
                $group: {
                    _id: null,
                    totalngos: { $sum: 1 },
                    activengos: {
                        $sum: { $cond: [{ $eq: ["$isActive", true] }, 1, 0] },
                    },
                    inactivengos: {
                        $sum: { $cond: [{ $eq: ["$isActive", false] }, 1, 0] },
                    },
                },
            },
        ]);
        res.json({ success: true, data: ngoStats[0] || {} });
    } catch (error) {
        res.status(500).json({
            message: "Error fetching ngo reports",
            error: error.message,
        });
    }
});

router.get(
    "/reports/companies",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const companyStats = await company.aggregate([
                {
                    $group: {
                        _id: null,
                        totalCompanies: { $sum: 1 },
                        activeCompanies: {
                            $sum: {
                                $cond: [{ $eq: ["$isActive", true] }, 1, 0],
                            },
                        },
                        inactiveCompanies: {
                            $sum: {
                                $cond: [{ $eq: ["$isActive", false] }, 1, 0],
                            },
                        },
                    },
                },
            ]);
            res.json({ success: true, data: companyStats[0] || {} });
        } catch (error) {
            res.status(500).json({
                message: "Error fetching company reports",
                error: error.message,
            });
        }
    },
);

router.get(
    "/reports/campaigns",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const campaignStats = await Campaign.aggregate([
                {
                    $group: {
                        _id: null,
                        totalCampaigns: { $sum: 1 },
                        activeCampaigns: {
                            $sum: {
                                $cond: [{ $eq: ["$isActive", true] }, 1, 0],
                            },
                        },
                        totalTargetAmount: { $sum: "$targetAmount" },
                        totalRaisedAmount: { $sum: "$raisedAmount" },
                    },
                },
            ]);
            res.json({ success: true, data: campaignStats[0] || {} });
        } catch (error) {
            res.status(500).json({
                message: "Error fetching campaign reports",
                error: error.message,
            });
        }
    },
);

router.get(
    "/reports/donations",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            // This would require a Donation model which we'll assume exists
            res.json({
                success: true,
                data: { totalDonations: 0, totalAmount: 0 },
            });
        } catch (error) {
            res.status(500).json({
                message: "Error fetching donation reports",
                error: error.message,
            });
        }
    },
);

router.get(
    "/reports/activities",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            const activityStats = await Activity.aggregate([
                {
                    $group: {
                        _id: "$action",
                        count: { $sum: 1 },
                    },
                },
            ]);
            res.json({ success: true, data: activityStats });
        } catch (error) {
            res.status(500).json({
                message: "Error fetching activity reports",
                error: error.message,
            });
        }
    },
);

router.get(
    "/reports/transactions",
    authMiddleware(["admin"]),
    async (req, res) => {
        try {
            // This would require a Transaction model which we'll assume exists
            res.json({
                success: true,
                data: { totalTransactions: 0, totalAmount: 0 },
            });
        } catch (error) {
            res.status(500).json({
                message: "Error fetching transaction reports",
                error: error.message,
            });
        }
    },
);

// ngo Status Management
router.put("/ngos/:id/status", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findById(id);
        if (!user || user.role !== "ngo") {
            return res.status(404).json({
                status: "fail",
                message: "ngo not found",
            });
        }

        user.isActive = isActive;
        await user.save();

        res.json({
            status: "success",
            message: `ngo ${isActive ? "enabled" : "disabled"} successfully`,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

// company Status Management
router.put("/companies/:id/status", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const user = await User.findById(id);
        if (!user || user.role !== "company") {
            return res.status(404).json({
                status: "fail",
                message: "company not found",
            });
        }

        user.isActive = isActive;
        await user.save();

        res.json({
            status: "success",
            message: `company ${isActive ? "enabled" : "disabled"} successfully`,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

// Campaign Status Management
router.put("/campaigns/:id/status", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const { isActive } = req.body;

        const campaign = await Campaign.findById(id);
        if (!campaign) {
            return res.status(404).json({
                status: "fail",
                message: "Campaign not found",
            });
        }

        campaign.isActive = isActive;
        await campaign.save();

        res.json({
            status: "success",
            message: `Campaign ${isActive ? "enabled" : "disabled"} successfully`,
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

// Share Links
router.post("/ngos/:id/share", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const ShareLink = require("../../models/ShareLink");

        // Check if share link already exists for this NGO
        let shareLink = await ShareLink.findOne({
            resourceType: "profile",
            resourceId: id
        });

        if (!shareLink) {
            // Create new share link only if one doesn't exist
            shareLink = new ShareLink({
                resourceType: "profile",
                resourceId: id,
                createdBy: req.user.id,
            });
            await shareLink.save();
        }

        res.json({
            status: "success",
            data: {
                shareLink: `${req.protocol}://${req.get("host")}/share/${shareLink.shareId}`,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

router.post("/companies/:id/share", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const ShareLink = require("../../models/ShareLink");

        // Check if share link already exists for this Company
        let shareLink = await ShareLink.findOne({
            resourceType: "profile",
            resourceId: id
        });

        if (!shareLink) {
            // Create new share link only if one doesn't exist
            shareLink = new ShareLink({
                resourceType: "profile",
                resourceId: id,
                createdBy: req.user.id,
            });
            await shareLink.save();
        }

        res.json({
            status: "success",
            data: {
                shareLink: `${req.protocol}://${req.get("host")}/share/${shareLink.shareId}`,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

router.post("/campaigns/:id/share", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;
        const ShareLink = require("../../models/ShareLink");

        // Check if share link already exists for this Campaign
        let shareLink = await ShareLink.findOne({
            resourceType: "campaign",
            resourceId: id
        });

        if (!shareLink) {
            // Create new share link only if one doesn't exist
            shareLink = new ShareLink({
                resourceType: "campaign",
                resourceId: id,
                createdBy: req.user.id,
            });
            await shareLink.save();
        }

        res.json({
            status: "success",
            data: {
                shareLink: `${req.protocol}://${req.get("host")}/share/${shareLink.shareId}`,
            },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

// Reports Routes
router.get("/reports/ngos", authMiddleware, async (req, res) => {
    try {
        const ngos = await User.find({ role: "ngo" }).populate("ngoProfile");
        res.json({
            status: "success",
            data: { ngos },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

router.get("/reports/companies", authMiddleware, async (req, res) => {
    try {
        const companies = await User.find({ role: "company" }).populate(
            "companyProfile",
        );
        res.json({
            status: "success",
            data: { companies },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

router.get("/reports/campaigns", authMiddleware, async (req, res) => {
    try {
        const campaigns = await Campaign.find().populate("createdBy");
        res.json({
            status: "success",
            data: { campaigns },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

router.get("/reports/donations", authMiddleware, async (req, res) => {
    try {
        const Donation = require("../../models/Donation");
        const donations = await Donation.find().populate("donorId campaignId");
        res.json({
            status: "success",
            data: { donations },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

router.get("/reports/activities", authMiddleware, async (req, res) => {
    try {
        const activities = await Activity.find().populate("userId");
        res.json({
            status: "success",
            data: { activities },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

router.get("/reports/transactions", authMiddleware, async (req, res) => {
    try {
        const Donation = require("../../models/Donation");
        const transactions = await Donation.find({
            status: "completed",
        }).populate("donorId campaignId");
        res.json({
            status: "success",
            data: { transactions },
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message,
        });
    }
});

// User profile customization for share links
router.put("/users/:id/customize", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { html, css, customDesign } = req.body;

        const ShareLink = require("../../models/ShareLink");

        // First, find if there's already a share link for this user profile
        let shareLink = await ShareLink.findOne({ 
            resourceType: "profile", 
            resourceId: id 
        });

        // Prepare the custom design object
        let designData = {};
        if (html || css) {
            designData = {
                html: html || "",
                css: css || "",
                ...(customDesign || {})
            };
        } else if (customDesign) {
            designData = customDesign;
        }

        if (!shareLink) {
            // Create new share link if it doesn't exist
            shareLink = new ShareLink({
                resourceType: "profile",
                resourceId: id,
                customDesign: designData,
                createdBy: req.user.id
            });
        } else {
            // Update existing share link
            shareLink.customDesign = designData;
        }

        await shareLink.save();

        res.json({ 
            message: "Profile customization saved successfully",
            shareLink: {
                shareId: shareLink.shareId,
                shareUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/share/profile/${shareLink.shareId}`,
                apiUrl: `http://localhost:5000/api/public/share/profile/${shareLink.shareId}`,
                customDesign: shareLink.customDesign
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error saving profile customization",
            error: error.message,
        });
    }
});

// Get user profile customization
router.get("/users/:id/customize", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;

        const ShareLink = require("../../models/ShareLink");

        const shareLink = await ShareLink.findOne({ 
            resourceType: "profile", 
            resourceId: id 
        });

        if (!shareLink) {
            return res.json({ 
                message: "No customization found",
                customDesign: { html: "", css: "" },
                shareUrl: null,
                apiUrl: null
            });
        }

        res.json({ 
            message: "Profile customization retrieved successfully",
            customDesign: shareLink.customDesign || { html: "", css: "" },
            shareUrl: `${process.env.FRONTEND_URL || "http://localhost:5173"}/share/profile/${shareLink.shareId}`,
            apiUrl: `http://localhost:5000/api/public/share/profile/${shareLink.shareId}`,
            shareLink: {
                shareId: shareLink.shareId,
                resourceType: shareLink.resourceType,
                isActive: shareLink.isActive,
                viewCount: shareLink.viewCount
            }
        });
    } catch (error) {
        res.status(500).json({
            message: "Error retrieving profile customization",
            error: error.message,
        });
    }
});

// Enhanced User Management Routes

// Edit user details
router.put("/users/:id/details", authMiddleware(["admin"]), AdminController.editUserDetails);

// Edit user profile (NGO/Company specific)
router.put("/users/:id/profile", authMiddleware(["admin"]), AdminController.editUserProfile);

// Delete user completely (user + profiles)
router.delete("/users/:id/complete", authMiddleware(["admin"]), AdminController.deleteUser);

router.get("/users/:id", authMiddleware(["admin"]), AdminController.viewUserProfile);

module.exports = router;