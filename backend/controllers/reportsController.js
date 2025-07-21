
const User = require("../models/User");
const NGO = require("../models/NGO");
const Company = require("../models/Company");
const Campaign = require("../models/Campaign");
const Donation = require("../models/Donation");
const Activity = require("../models/Activity");
const { createErrorResponse, createSuccessResponse } = require("../utils/errorHandler");
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');

class ReportsController {
    // User Management Reports
    static async getUserReport(req, res) {
        try {
            const { 
                startDate, 
                endDate, 
                role, 
                status, 
                approvalStatus,
                format = 'json',
                export: exportType 
            } = req.query;

            let query = {};
            
            // Date filters
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            // Role filter
            if (role) query.role = role;
            
            // Status filters
            if (status) query.isActive = status === 'active';
            if (approvalStatus) query.approvalStatus = approvalStatus;

            const users = await User.find(query)
                .select('-password')
                .populate('role')
                .sort({ createdAt: -1 });

            // Generate statistics
            const stats = {
                totalUsers: users.length,
                roleDistribution: {},
                statusDistribution: {},
                approvalDistribution: {},
                monthlyRegistrations: {}
            };

            users.forEach(user => {
                // Role distribution
                stats.roleDistribution[user.role] = (stats.roleDistribution[user.role] || 0) + 1;
                
                // Status distribution
                const status = user.isActive ? 'active' : 'inactive';
                stats.statusDistribution[status] = (stats.statusDistribution[status] || 0) + 1;
                
                // Approval distribution
                stats.approvalDistribution[user.approvalStatus] = (stats.approvalDistribution[user.approvalStatus] || 0) + 1;
                
                // Monthly registrations
                const month = user.createdAt.toISOString().substring(0, 7);
                stats.monthlyRegistrations[month] = (stats.monthlyRegistrations[month] || 0) + 1;
            });

            const reportData = { users, stats, generatedAt: new Date() };

            if (exportType === 'pdf') {
                return await ReportsController.generateUserPDF(res, reportData);
            } else if (exportType === 'excel') {
                return await ReportsController.generateUserExcel(res, reportData);
            }

            return createSuccessResponse(res, 200, {
                message: "User report generated successfully",
                ...reportData
            });

        } catch (error) {
            console.error("User report error:", error);
            return createErrorResponse(res, 500, "Failed to generate user report", error.message);
        }
    }

    // NGO Reports
    static async getNGOReport(req, res) {
        try {
            const { 
                startDate, 
                endDate, 
                status,
                ngoType,
                certification,
                export: exportType 
            } = req.query;

            let query = {};
            
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            if (status) query.isActive = status === 'active';
            if (ngoType) query.ngoType = ngoType;

            const ngos = await NGO.find(query)
                .populate('userId', 'fullName email createdAt')
                .sort({ createdAt: -1 });

            // Get campaigns for each NGO
            const ngoIds = ngos.map(ngo => ngo._id);
            const campaigns = await Campaign.aggregate([
                { $match: { ngoId: { $in: ngoIds } } },
                { 
                    $group: {
                        _id: "$ngoId",
                        totalCampaigns: { $sum: 1 },
                        activeCampaigns: { $sum: { $cond: ["$isActive", 1, 0] } },
                        totalTargetAmount: { $sum: "$targetAmount" },
                        totalRaisedAmount: { $sum: "$raisedAmount" }
                    }
                }
            ]);

            const campaignMap = {};
            campaigns.forEach(camp => {
                campaignMap[camp._id] = camp;
            });

            const reportData = {
                ngos: ngos.map(ngo => ({
                    ...ngo.toObject(),
                    campaigns: campaignMap[ngo._id] || {
                        totalCampaigns: 0,
                        activeCampaigns: 0,
                        totalTargetAmount: 0,
                        totalRaisedAmount: 0
                    }
                })),
                summary: {
                    totalNGOs: ngos.length,
                    activeNGOs: ngos.filter(ngo => ngo.isActive).length,
                    certifiedNGOs: ngos.filter(ngo => ngo.is80GCertified || ngo.is12ACertified).length,
                    totalCampaigns: campaigns.reduce((sum, camp) => sum + camp.totalCampaigns, 0),
                    totalFundsRaised: campaigns.reduce((sum, camp) => sum + camp.totalRaisedAmount, 0)
                },
                generatedAt: new Date()
            };

            if (exportType === 'pdf') {
                return await ReportsController.generateNGOPDF(res, reportData);
            } else if (exportType === 'excel') {
                return await ReportsController.generateNGOExcel(res, reportData);
            }

            return createSuccessResponse(res, 200, {
                message: "NGO report generated successfully",
                ...reportData
            });

        } catch (error) {
            console.error("NGO report error:", error);
            return createErrorResponse(res, 500, "Failed to generate NGO report", error.message);
        }
    }

    // Campaign Reports
    static async getCampaignReport(req, res) {
        try {
            const { 
                startDate, 
                endDate, 
                status,
                category,
                approvalStatus,
                ngoId,
                minAmount,
                maxAmount,
                export: exportType 
            } = req.query;

            let query = {};
            
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            if (status) query.isActive = status === 'active';
            if (category) query.category = category;
            if (approvalStatus) query.approvalStatus = approvalStatus;
            if (ngoId) query.ngoId = ngoId;
            
            if (minAmount || maxAmount) {
                query.targetAmount = {};
                if (minAmount) query.targetAmount.$gte = parseInt(minAmount);
                if (maxAmount) query.targetAmount.$lte = parseInt(maxAmount);
            }

            const campaigns = await Campaign.find(query)
                .populate('ngoId', 'ngoName email')
                .populate('createdBy', 'fullName email')
                .sort({ createdAt: -1 });

            // Get donation statistics for campaigns
            const campaignIds = campaigns.map(campaign => campaign._id);
            const donationStats = await Donation.aggregate([
                { $match: { campaignId: { $in: campaignIds } } },
                {
                    $group: {
                        _id: "$campaignId",
                        totalDonations: { $sum: 1 },
                        totalAmount: { $sum: "$amount" },
                        uniqueDonors: { $addToSet: "$donorId" }
                    }
                }
            ]);

            const donationMap = {};
            donationStats.forEach(stat => {
                donationMap[stat._id] = {
                    ...stat,
                    uniqueDonors: stat.uniqueDonors.length
                };
            });

            const reportData = {
                campaigns: campaigns.map(campaign => ({
                    ...campaign.toObject(),
                    donations: donationMap[campaign._id] || {
                        totalDonations: 0,
                        totalAmount: 0,
                        uniqueDonors: 0
                    }
                })),
                summary: {
                    totalCampaigns: campaigns.length,
                    activeCampaigns: campaigns.filter(c => c.isActive).length,
                    approvedCampaigns: campaigns.filter(c => c.approvalStatus === 'approved').length,
                    totalTargetAmount: campaigns.reduce((sum, c) => sum + c.targetAmount, 0),
                    totalRaisedAmount: campaigns.reduce((sum, c) => sum + c.raisedAmount, 0),
                    categoryDistribution: {}
                },
                generatedAt: new Date()
            };

            // Category distribution
            campaigns.forEach(campaign => {
                const category = campaign.category || 'Uncategorized';
                reportData.summary.categoryDistribution[category] = (reportData.summary.categoryDistribution[category] || 0) + 1;
            });

            if (exportType === 'pdf') {
                return await ReportsController.generateCampaignPDF(res, reportData);
            } else if (exportType === 'excel') {
                return await ReportsController.generateCampaignExcel(res, reportData);
            }

            return createSuccessResponse(res, 200, {
                message: "Campaign report generated successfully",
                ...reportData
            });

        } catch (error) {
            console.error("Campaign report error:", error);
            return createErrorResponse(res, 500, "Failed to generate campaign report", error.message);
        }
    }

    // Donation Reports
    static async getDonationReport(req, res) {
        try {
            const { 
                startDate, 
                endDate, 
                status,
                paymentMethod,
                minAmount,
                maxAmount,
                donorId,
                campaignId,
                export: exportType 
            } = req.query;

            let query = {};
            
            if (startDate || endDate) {
                query.donationDate = {};
                if (startDate) query.donationDate.$gte = new Date(startDate);
                if (endDate) query.donationDate.$lte = new Date(endDate);
            }

            if (status) query.status = status;
            if (paymentMethod) query.paymentMethod = paymentMethod;
            if (donorId) query.donorId = donorId;
            if (campaignId) query.campaignId = campaignId;
            
            if (minAmount || maxAmount) {
                query.amount = {};
                if (minAmount) query.amount.$gte = parseInt(minAmount);
                if (maxAmount) query.amount.$lte = parseInt(maxAmount);
            }

            const donations = await Donation.find(query)
                .populate('donorId', 'fullName email role')
                .populate('campaignId', 'title campaignName ngoId')
                .populate({
                    path: 'campaignId',
                    populate: {
                        path: 'ngoId',
                        select: 'ngoName'
                    }
                })
                .sort({ donationDate: -1 });

            const reportData = {
                donations,
                summary: {
                    totalDonations: donations.length,
                    totalAmount: donations.reduce((sum, d) => sum + d.amount, 0),
                    averageAmount: donations.length > 0 ? donations.reduce((sum, d) => sum + d.amount, 0) / donations.length : 0,
                    uniqueDonors: new Set(donations.map(d => d.donorId._id.toString())).size,
                    uniqueCampaigns: new Set(donations.map(d => d.campaignId._id.toString())).size,
                    paymentMethodDistribution: {},
                    statusDistribution: {},
                    monthlyTrends: {}
                },
                generatedAt: new Date()
            };

            // Generate distributions
            donations.forEach(donation => {
                // Payment method distribution
                const method = donation.paymentMethod;
                reportData.summary.paymentMethodDistribution[method] = (reportData.summary.paymentMethodDistribution[method] || 0) + 1;
                
                // Status distribution
                const status = donation.status;
                reportData.summary.statusDistribution[status] = (reportData.summary.statusDistribution[status] || 0) + 1;
                
                // Monthly trends
                const month = donation.donationDate.toISOString().substring(0, 7);
                if (!reportData.summary.monthlyTrends[month]) {
                    reportData.summary.monthlyTrends[month] = { count: 0, amount: 0 };
                }
                reportData.summary.monthlyTrends[month].count += 1;
                reportData.summary.monthlyTrends[month].amount += donation.amount;
            });

            if (exportType === 'pdf') {
                return await ReportsController.generateDonationPDF(res, reportData);
            } else if (exportType === 'excel') {
                return await ReportsController.generateDonationExcel(res, reportData);
            }

            return createSuccessResponse(res, 200, {
                message: "Donation report generated successfully",
                ...reportData
            });

        } catch (error) {
            console.error("Donation report error:", error);
            return createErrorResponse(res, 500, "Failed to generate donation report", error.message);
        }
    }

    // Financial Summary Report
    static async getFinancialReport(req, res) {
        try {
            const { 
                startDate, 
                endDate, 
                export: exportType 
            } = req.query;

            let dateQuery = {};
            if (startDate || endDate) {
                dateQuery.donationDate = {};
                if (startDate) dateQuery.donationDate.$gte = new Date(startDate);
                if (endDate) dateQuery.donationDate.$lte = new Date(endDate);
            }

            // Get donation summary
            const donationSummary = await Donation.aggregate([
                { $match: { ...dateQuery, status: 'Completed' } },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$amount" },
                        totalDonations: { $sum: 1 },
                        averageAmount: { $avg: "$amount" }
                    }
                }
            ]);

            // Get NGO-wise collection
            const ngoWiseCollection = await Donation.aggregate([
                { $match: { ...dateQuery, status: 'Completed' } },
                {
                    $lookup: {
                        from: 'campaigns',
                        localField: 'campaignId',
                        foreignField: '_id',
                        as: 'campaign'
                    }
                },
                { $unwind: '$campaign' },
                {
                    $lookup: {
                        from: 'ngos',
                        localField: 'campaign.ngoId',
                        foreignField: '_id',
                        as: 'ngo'
                    }
                },
                { $unwind: '$ngo' },
                {
                    $group: {
                        _id: '$ngo._id',
                        ngoName: { $first: '$ngo.ngoName' },
                        totalAmount: { $sum: '$amount' },
                        totalDonations: { $sum: 1 },
                        campaigns: { $addToSet: '$campaign._id' }
                    }
                },
                { $sort: { totalAmount: -1 } }
            ]);

            // Get monthly trends
            const monthlyTrends = await Donation.aggregate([
                { $match: { ...dateQuery, status: 'Completed' } },
                {
                    $group: {
                        _id: {
                            year: { $year: '$donationDate' },
                            month: { $month: '$donationDate' }
                        },
                        totalAmount: { $sum: '$amount' },
                        totalDonations: { $sum: 1 }
                    }
                },
                { $sort: { '_id.year': 1, '_id.month': 1 } }
            ]);

            // Get category-wise distribution
            const categoryWiseDistribution = await Donation.aggregate([
                { $match: { ...dateQuery, status: 'Completed' } },
                {
                    $lookup: {
                        from: 'campaigns',
                        localField: 'campaignId',
                        foreignField: '_id',
                        as: 'campaign'
                    }
                },
                { $unwind: '$campaign' },
                {
                    $group: {
                        _id: '$campaign.category',
                        totalAmount: { $sum: '$amount' },
                        totalDonations: { $sum: 1 }
                    }
                }
            ]);

            const reportData = {
                summary: donationSummary[0] || { totalAmount: 0, totalDonations: 0, averageAmount: 0 },
                ngoWiseCollection: ngoWiseCollection.map(item => ({
                    ...item,
                    campaignCount: item.campaigns.length
                })),
                monthlyTrends,
                categoryWiseDistribution,
                reportPeriod: {
                    startDate: startDate || 'All time',
                    endDate: endDate || 'Present'
                },
                generatedAt: new Date()
            };

            if (exportType === 'pdf') {
                return await ReportsController.generateFinancialPDF(res, reportData);
            } else if (exportType === 'excel') {
                return await ReportsController.generateFinancialExcel(res, reportData);
            }

            return createSuccessResponse(res, 200, {
                message: "Financial report generated successfully",
                ...reportData
            });

        } catch (error) {
            console.error("Financial report error:", error);
            return createErrorResponse(res, 500, "Failed to generate financial report", error.message);
        }
    }

    // Government Compliance Report
    static async getComplianceReport(req, res) {
        try {
            const { 
                startDate, 
                endDate, 
                export: exportType 
            } = req.query;

            let dateQuery = {};
            if (startDate || endDate) {
                dateQuery.donationDate = {};
                if (startDate) dateQuery.donationDate.$gte = new Date(startDate);
                if (endDate) dateQuery.donationDate.$lte = new Date(endDate);
            }

            // Get 80G eligible donations
            const eligibleDonations = await Donation.aggregate([
                { $match: { ...dateQuery, status: 'Completed' } },
                {
                    $lookup: {
                        from: 'campaigns',
                        localField: 'campaignId',
                        foreignField: '_id',
                        as: 'campaign'
                    }
                },
                { $unwind: '$campaign' },
                {
                    $lookup: {
                        from: 'ngos',
                        localField: 'campaign.ngoId',
                        foreignField: '_id',
                        as: 'ngo'
                    }
                },
                { $unwind: '$ngo' },
                {
                    $match: {
                        $or: [
                            { 'ngo.is80GCertified': true },
                            { 'ngo.is12ACertified': true }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'donorId',
                        foreignField: '_id',
                        as: 'donor'
                    }
                },
                { $unwind: '$donor' },
                {
                    $project: {
                        donorName: '$donor.fullName',
                        donorEmail: '$donor.email',
                        panNumber: 1,
                        amount: 1,
                        donationDate: 1,
                        transactionId: 1,
                        ngoName: '$ngo.ngoName',
                        ngoRegistrationNumber: '$ngo.registrationNumber',
                        is80GCertified: '$ngo.is80GCertified',
                        is12ACertified: '$ngo.is12ACertified',
                        campaignTitle: '$campaign.title'
                    }
                }
            ]);

            // Get PAN-wise donation summary
            const panWiseSummary = await Donation.aggregate([
                { $match: { ...dateQuery, status: 'Completed' } },
                {
                    $group: {
                        _id: '$panNumber',
                        totalAmount: { $sum: '$amount' },
                        totalDonations: { $sum: 1 },
                        donorInfo: { $first: '$$ROOT' }
                    }
                },
                {
                    $lookup: {
                        from: 'users',
                        localField: 'donorInfo.donorId',
                        foreignField: '_id',
                        as: 'donor'
                    }
                },
                { $unwind: '$donor' },
                {
                    $project: {
                        panNumber: '$_id',
                        donorName: '$donor.fullName',
                        donorEmail: '$donor.email',
                        totalAmount: 1,
                        totalDonations: 1
                    }
                }
            ]);

            const reportData = {
                eligibleDonations,
                panWiseSummary,
                summary: {
                    totalEligibleDonations: eligibleDonations.length,
                    totalEligibleAmount: eligibleDonations.reduce((sum, d) => sum + d.amount, 0),
                    uniquePANs: panWiseSummary.length,
                    certified80GNGOs: await NGO.countDocuments({ is80GCertified: true }),
                    certified12ANGOs: await NGO.countDocuments({ is12ACertified: true })
                },
                reportPeriod: {
                    startDate: startDate || 'All time',
                    endDate: endDate || 'Present'
                },
                generatedAt: new Date()
            };

            if (exportType === 'pdf') {
                return await ReportsController.generateCompliancePDF(res, reportData);
            } else if (exportType === 'excel') {
                return await ReportsController.generateComplianceExcel(res, reportData);
            }

            return createSuccessResponse(res, 200, {
                message: "Compliance report generated successfully",
                ...reportData
            });

        } catch (error) {
            console.error("Compliance report error:", error);
            return createErrorResponse(res, 500, "Failed to generate compliance report", error.message);
        }
    }

    // Activity Report
    static async getActivityReport(req, res) {
        try {
            const { 
                startDate, 
                endDate, 
                action,
                userId,
                export: exportType 
            } = req.query;

            let query = {};
            
            if (startDate || endDate) {
                query.createdAt = {};
                if (startDate) query.createdAt.$gte = new Date(startDate);
                if (endDate) query.createdAt.$lte = new Date(endDate);
            }

            if (action) query.action = action;
            if (userId) query.userId = userId;

            const activities = await Activity.find(query)
                .populate('userId', 'fullName email role')
                .sort({ createdAt: -1 })
                .limit(1000);

            const reportData = {
                activities,
                summary: {
                    totalActivities: activities.length,
                    actionDistribution: {},
                    userDistribution: {},
                    dailyTrends: {}
                },
                generatedAt: new Date()
            };

            // Generate distributions
            activities.forEach(activity => {
                // Action distribution
                const action = activity.action;
                reportData.summary.actionDistribution[action] = (reportData.summary.actionDistribution[action] || 0) + 1;
                
                // User distribution
                const userId = activity.userId?._id.toString();
                if (userId) {
                    reportData.summary.userDistribution[userId] = (reportData.summary.userDistribution[userId] || 0) + 1;
                }
                
                // Daily trends
                const day = activity.createdAt.toISOString().substring(0, 10);
                reportData.summary.dailyTrends[day] = (reportData.summary.dailyTrends[day] || 0) + 1;
            });

            if (exportType === 'pdf') {
                return await ReportsController.generateActivityPDF(res, reportData);
            } else if (exportType === 'excel') {
                return await ReportsController.generateActivityExcel(res, reportData);
            }

            return createSuccessResponse(res, 200, {
                message: "Activity report generated successfully",
                ...reportData
            });

        } catch (error) {
            console.error("Activity report error:", error);
            return createErrorResponse(res, 500, "Failed to generate activity report", error.message);
        }
    }

    // PDF Generation Methods
    static async generateUserPDF(res, data) {
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=user-report.pdf');
        
        doc.pipe(res);
        
        // Header
        doc.fontSize(20).text('User Management Report', 50, 50);
        doc.fontSize(12).text(`Generated on: ${data.generatedAt.toLocaleDateString()}`, 50, 80);
        
        // Summary
        let yPosition = 120;
        doc.fontSize(16).text('Summary', 50, yPosition);
        yPosition += 30;
        
        doc.fontSize(12)
           .text(`Total Users: ${data.stats.totalUsers}`, 70, yPosition)
           .text(`Active Users: ${data.stats.statusDistribution.active || 0}`, 70, yPosition + 20)
           .text(`Inactive Users: ${data.stats.statusDistribution.inactive || 0}`, 70, yPosition + 40);
        
        yPosition += 80;
        
        // Role Distribution
        doc.fontSize(14).text('Role Distribution:', 50, yPosition);
        yPosition += 25;
        
        Object.entries(data.stats.roleDistribution).forEach(([role, count]) => {
            doc.fontSize(11).text(`${role.toUpperCase()}: ${count}`, 70, yPosition);
            yPosition += 15;
        });
        
        doc.end();
    }

    static async generateUserExcel(res, data) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('User Report');
        
        // Headers
        worksheet.columns = [
            { header: 'Full Name', key: 'fullName', width: 20 },
            { header: 'Email', key: 'email', width: 25 },
            { header: 'Role', key: 'role', width: 15 },
            { header: 'Status', key: 'isActive', width: 10 },
            { header: 'Approval Status', key: 'approvalStatus', width: 15 },
            { header: 'Created Date', key: 'createdAt', width: 15 }
        ];
        
        // Add data
        data.users.forEach(user => {
            worksheet.addRow({
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                isActive: user.isActive ? 'Active' : 'Inactive',
                approvalStatus: user.approvalStatus,
                createdAt: user.createdAt.toLocaleDateString()
            });
        });
        
        // Style headers
        worksheet.getRow(1).font = { bold: true };
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=user-report.xlsx');
        
        await workbook.xlsx.write(res);
        res.end();
    }

    // Similar methods for other report types (NGO, Campaign, Donation, etc.)
    // ... (Additional PDF and Excel generation methods would follow the same pattern)

    static async generateDonationExcel(res, data) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Donation Report');
        
        worksheet.columns = [
            { header: 'Transaction ID', key: 'transactionId', width: 20 },
            { header: 'Donor Name', key: 'donorName', width: 20 },
            { header: 'Campaign', key: 'campaignName', width: 25 },
            { header: 'NGO', key: 'ngoName', width: 20 },
            { header: 'Amount', key: 'amount', width: 12 },
            { header: 'Payment Method', key: 'paymentMethod', width: 15 },
            { header: 'Status', key: 'status', width: 12 },
            { header: 'Date', key: 'donationDate', width: 15 }
        ];
        
        data.donations.forEach(donation => {
            worksheet.addRow({
                transactionId: donation.transactionId,
                donorName: donation.donorId?.fullName || 'Anonymous',
                campaignName: donation.campaignId?.title || donation.campaignId?.campaignName,
                ngoName: donation.campaignId?.ngoId?.ngoName || 'N/A',
                amount: donation.amount,
                paymentMethod: donation.paymentMethod,
                status: donation.status,
                donationDate: donation.donationDate.toLocaleDateString()
            });
        });
        
        worksheet.getRow(1).font = { bold: true };
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=donation-report.xlsx');
        
        await workbook.xlsx.write(res);
        res.end();
    }

    static async generateFinancialExcel(res, data) {
        const workbook = new ExcelJS.Workbook();
        
        // Summary sheet
        const summarySheet = workbook.addWorksheet('Financial Summary');
        summarySheet.columns = [
            { header: 'Metric', key: 'metric', width: 25 },
            { header: 'Value', key: 'value', width: 20 }
        ];
        
        summarySheet.addRows([
            { metric: 'Total Amount Raised', value: data.summary.totalAmount },
            { metric: 'Total Donations', value: data.summary.totalDonations },
            { metric: 'Average Donation', value: data.summary.averageAmount.toFixed(2) }
        ]);
        
        // NGO-wise collection sheet
        const ngoSheet = workbook.addWorksheet('NGO-wise Collection');
        ngoSheet.columns = [
            { header: 'NGO Name', key: 'ngoName', width: 25 },
            { header: 'Total Amount', key: 'totalAmount', width: 15 },
            { header: 'Total Donations', key: 'totalDonations', width: 15 },
            { header: 'Campaign Count', key: 'campaignCount', width: 15 }
        ];
        
        data.ngoWiseCollection.forEach(ngo => {
            ngoSheet.addRow(ngo);
        });
        
        summarySheet.getRow(1).font = { bold: true };
        ngoSheet.getRow(1).font = { bold: true };
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=financial-report.xlsx');
        
        await workbook.xlsx.write(res);
        res.end();
    }

    static async generateComplianceExcel(res, data) {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Tax Compliance Report');
        
        worksheet.columns = [
            { header: 'Donor Name', key: 'donorName', width: 20 },
            { header: 'PAN Number', key: 'panNumber', width: 15 },
            { header: 'Amount', key: 'amount', width: 12 },
            { header: 'NGO Name', key: 'ngoName', width: 25 },
            { header: 'Registration No.', key: 'ngoRegistrationNumber', width: 20 },
            { header: '80G Certified', key: 'is80GCertified', width: 12 },
            { header: '12A Certified', key: 'is12ACertified', width: 12 },
            { header: 'Transaction ID', key: 'transactionId', width: 20 },
            { header: 'Date', key: 'donationDate', width: 15 }
        ];
        
        data.eligibleDonations.forEach(donation => {
            worksheet.addRow({
                donorName: donation.donorName,
                panNumber: donation.panNumber,
                amount: donation.amount,
                ngoName: donation.ngoName,
                ngoRegistrationNumber: donation.ngoRegistrationNumber,
                is80GCertified: donation.is80GCertified ? 'Yes' : 'No',
                is12ACertified: donation.is12ACertified ? 'Yes' : 'No',
                transactionId: donation.transactionId,
                donationDate: donation.donationDate.toLocaleDateString()
            });
        });
        
        worksheet.getRow(1).font = { bold: true };
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=compliance-report.xlsx');
        
        await workbook.xlsx.write(res);
        res.end();
    }
}

module.exports = ReportsController;
