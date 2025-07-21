
const express = require("express");
const Donation = require("../../models/Donation");
const Company = require("../../models/Company");
const NGO = require("../../models/NGO");
const Campaign = require("../../models/Campaign");
const User = require("../../models/User");
const authMiddleware = require("../../middleware/auth");
const { createErrorResponse, createSuccessResponse } = require("../../utils/errorHandler");

const router = express.Router();

// Get all donations with advanced filtering
router.get("/", authMiddleware([]), async (req, res) => {
    try {
        const { role } = req.user;
        const userId = req.user._id || req.user.id;
        const { 
            status, 
            campaignId, 
            startDate, 
            endDate, 
            minAmount, 
            maxAmount, 
            page = 1, 
            limit = 10,
            sortBy = 'donationDate',
            sortOrder = 'desc'
        } = req.query;

        // Build query based on user role
        let query = {};

        if (role === "company") {
            const company = await Company.findOne({ userId });
            if (company) {
                query.companyId = company._id;
            }
        } else if (role === "ngo") {
            const ngo = await NGO.findOne({ userId });
            if (ngo) {
                // Find campaigns created by this NGO
                const campaigns = await Campaign.find({ ngoId: ngo._id });
                const campaignIds = campaigns.map(c => c._id);
                query.campaignId = { $in: campaignIds };
            }
        } else if (role === "donor") {
            query.donorId = userId;
        }
        // Admin can see all donations (no additional filter)

        // Apply additional filters
        if (status) query.status = status;
        if (campaignId) query.campaignId = campaignId;
        if (startDate || endDate) {
            query.donationDate = {};
            if (startDate) query.donationDate.$gte = new Date(startDate);
            if (endDate) query.donationDate.$lte = new Date(endDate);
        }
        if (minAmount || maxAmount) {
            query.amount = {};
            if (minAmount) query.amount.$gte = parseInt(minAmount);
            if (maxAmount) query.amount.$lte = parseInt(maxAmount);
        }

        // Pagination
        const pageNum = Math.max(1, parseInt(page));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
        const skip = (pageNum - 1) * limitNum;

        // Sort options
        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

        const donations = await Donation.find(query)
            .populate("donorId", "fullName email")
            .populate("companyId", "companyName")
            .populate({
                path: "campaignId",
                select: "campaignName title ngoId",
                populate: {
                    path: "ngoId",
                    select: "ngoName"
                }
            })
            .sort(sortOptions)
            .skip(skip)
            .limit(limitNum);

        const total = await Donation.countDocuments(query);

        // Calculate summary statistics
        const summary = await Donation.aggregate([
            { $match: query },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: "$amount" },
                    totalDonations: { $sum: 1 },
                    completedAmount: {
                        $sum: { $cond: [{ $eq: ["$status", "Completed"] }, "$amount", 0] }
                    },
                    completedDonations: {
                        $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
                    }
                }
            }
        ]);

        return createSuccessResponse(res, 200, {
            message: "Donations retrieved successfully",
            donations,
            pagination: {
                current: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            },
            summary: summary[0] || {
                totalAmount: 0,
                totalDonations: 0,
                completedAmount: 0,
                completedDonations: 0
            }
        });

    } catch (error) {
        console.error("Get donations error:", error);
        return createErrorResponse(res, 500, "Failed to retrieve donations", error.message);
    }
});

// Get single donation with full details
router.get("/:id", authMiddleware([]), async (req, res) => {
    try {
        const { id } = req.params;
        const { role } = req.user;
        const userId = req.user._id || req.user.id;

        const donation = await Donation.findById(id)
            .populate("donorId", "fullName email phoneNumber")
            .populate("companyId", "companyName companyEmail")
            .populate({
                path: "campaignId",
                select: "campaignName title description ngoId",
                populate: {
                    path: "ngoId",
                    select: "ngoName email contactNumber"
                }
            });

        if (!donation) {
            return createErrorResponse(res, 404, "Donation not found");
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
            const campaign = await Campaign.findById(donation.campaignId._id);
            authorized = ngo && campaign && campaign.ngoId.toString() === ngo._id.toString();
        } else if (role === "donor") {
            authorized = donation.donorId?.toString() === userId;
        }

        if (!authorized) {
            return createErrorResponse(res, 403, "Access denied");
        }

        return createSuccessResponse(res, 200, {
            message: "Donation retrieved successfully",
            donation
        });

    } catch (error) {
        console.error("Get donation error:", error);
        return createErrorResponse(res, 500, "Failed to retrieve donation", error.message);
    }
});

// Update donation status (Admin only)
router.put("/:id/status", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, refundReason } = req.body;

        const validStatuses = ["Pending", "Completed", "Failed", "Refunded"];
        if (!validStatuses.includes(status)) {
            return createErrorResponse(res, 400, "Invalid status");
        }

        const updateData = { status, updatedAt: new Date() };
        
        if (status === "Completed") {
            updateData.completedAt = new Date();
        } else if (status === "Refunded") {
            updateData.refundedAt = new Date();
            if (refundReason) updateData.refundReason = refundReason;
        }

        const donation = await Donation.findByIdAndUpdate(id, updateData, { new: true })
            .populate("campaignId", "campaignName");

        if (!donation) {
            return createErrorResponse(res, 404, "Donation not found");
        }

        // Update campaign raised amount if status changed to completed
        if (status === "Completed") {
            await Campaign.findByIdAndUpdate(donation.campaignId._id, {
                $inc: { raisedAmount: donation.amount }
            });
        }

        return createSuccessResponse(res, 200, {
            message: "Donation status updated successfully",
            donation
        });

    } catch (error) {
        console.error("Update donation status error:", error);
        return createErrorResponse(res, 500, "Failed to update donation status", error.message);
    }
});

// Get donation analytics
router.get("/analytics/summary", authMiddleware([]), async (req, res) => {
    try {
        const { role } = req.user;
        const userId = req.user._id || req.user.id;
        const { period = '30' } = req.query; // days

        // Build query based on user role
        let matchQuery = {};
        
        if (role === "company") {
            const company = await Company.findOne({ userId });
            if (company) matchQuery.companyId = company._id;
        } else if (role === "ngo") {
            const ngo = await NGO.findOne({ userId });
            if (ngo) {
                const campaigns = await Campaign.find({ ngoId: ngo._id });
                const campaignIds = campaigns.map(c => c._id);
                matchQuery.campaignId = { $in: campaignIds };
            }
        } else if (role === "donor") {
            matchQuery.donorId = userId;
        }

        // Add date filter
        const periodDays = parseInt(period);
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - periodDays);
        matchQuery.donationDate = { $gte: startDate };

        const analytics = await Donation.aggregate([
            { $match: matchQuery },
            {
                $group: {
                    _id: null,
                    totalDonations: { $sum: 1 },
                    totalAmount: { $sum: "$amount" },
                    completedDonations: {
                        $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
                    },
                    completedAmount: {
                        $sum: { $cond: [{ $eq: ["$status", "Completed"] }, "$amount", 0] }
                    },
                    averageAmount: { $avg: "$amount" },
                    statusBreakdown: {
                        $push: "$status"
                    }
                }
            }
        ]);

        // Daily trends
        const dailyTrends = await Donation.aggregate([
            { $match: { ...matchQuery, status: "Completed" } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$donationDate" }
                    },
                    amount: { $sum: "$amount" },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return createSuccessResponse(res, 200, {
            message: "Donation analytics retrieved successfully",
            analytics: analytics[0] || {
                totalDonations: 0,
                totalAmount: 0,
                completedDonations: 0,
                completedAmount: 0,
                averageAmount: 0
            },
            dailyTrends,
            period: `${periodDays} days`
        });

    } catch (error) {
        console.error("Get donation analytics error:", error);
        return createErrorResponse(res, 500, "Failed to retrieve donation analytics", error.message);
    }
});

module.exports = router;
