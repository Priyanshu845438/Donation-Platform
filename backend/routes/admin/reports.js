
const express = require("express");
const ReportsController = require("../../controllers/reportsController");
const authMiddleware = require("../../middleware/auth");

const router = express.Router();

// User Management Reports
router.get("/users", authMiddleware(["admin"]), ReportsController.getUserReport);

// NGO Reports
router.get("/ngos", authMiddleware(["admin"]), ReportsController.getNGOReport);

// Campaign Reports
router.get("/campaigns", authMiddleware(["admin"]), ReportsController.getCampaignReport);

// Donation Reports
router.get("/donations", authMiddleware(["admin"]), ReportsController.getDonationReport);

// Financial Reports
router.get("/financial", authMiddleware(["admin"]), ReportsController.getFinancialReport);

// Government Compliance Reports
router.get("/compliance", authMiddleware(["admin"]), ReportsController.getComplianceReport);

// Activity Reports
router.get("/activities", authMiddleware(["admin"]), ReportsController.getActivityReport);

// Combined Dashboard Report
router.get("/dashboard", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { export: exportType } = req.query;
        
        // Get summary data from all models
        const [userCount, ngoCount, companyCount, campaignCount, donationSummary] = await Promise.all([
            require("../../models/User").countDocuments(),
            require("../../models/NGO").countDocuments(),
            require("../../models/Company").countDocuments(),
            require("../../models/Campaign").countDocuments(),
            require("../../models/Donation").aggregate([
                { $match: { status: 'Completed' } },
                { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } }
            ])
        ]);

        const reportData = {
            overview: {
                totalUsers: userCount,
                totalNGOs: ngoCount,
                totalCompanies: companyCount,
                totalCampaigns: campaignCount,
                totalDonations: donationSummary[0]?.count || 0,
                totalDonationAmount: donationSummary[0]?.total || 0
            },
            generatedAt: new Date()
        };

        if (exportType === 'pdf') {
            return await ReportsController.generateDashboardPDF(res, reportData);
        } else if (exportType === 'excel') {
            return await ReportsController.generateDashboardExcel(res, reportData);
        }

        res.json({
            success: true,
            message: "Dashboard report generated successfully",
            ...reportData
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to generate dashboard report",
            error: error.message
        });
    }
});

module.exports = router;
