const express = require('express');
const router = express.Router();
const Campaign = require('../models/Campaign');
const Donation = require('../models/Donation');
const User = require('../models/User'); // Ensure you have a User model

// Get statistics
router.get('/', async (req, res) => {
    try {
        // Total Donations Received
        const totalReceived = await Donation.aggregate([
            { $group: { _id: null, totalAmount: { $sum: "$amount" } } }
        ]);

        // Count of All Campaigns
        const totalCampaigns = await Campaign.countDocuments();

        // Count of NGOs (role: 'ngo')
        const totalNGOs = await User.countDocuments({ role: 'ngo' });

        // Count of Companies (role: 'company')
        const totalCompanies = await User.countDocuments({ role: 'company' });

        res.json({
            totalReceived: totalReceived.length > 0 ? totalReceived[0].totalAmount : 0,
            totalCampaigns,
            totalNGOs,
            totalCompanies
        });
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

module.exports = router;
