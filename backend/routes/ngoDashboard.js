const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Campaign = require("../models/Campaign"); // Example model for campaigns
const authMiddleware = require("../middleware/authMiddleware"); // You need to create this middleware

// NGO Dashboard Route
router.get("/dashboard", authMiddleware, async (req, res) => {
    try {
        const user = req.user; // user is fetched from middleware
        if (user.role !== "ngo") {
            return res.status(403).json({ message: "Access denied" });
        }

        // Example: Fetch NGO-related data
        const campaigns = await Campaign.find({ ngo: user._id });
        const donations = await Donation.find({ ngo: user._id }); // Assuming you have a Donation model
        
        // Return the data
        res.status(200).json({ 
            message: "NGO Dashboard Data", 
            campaigns, 
            donations
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
