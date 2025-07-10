const express = require("express");
const User = require("../models/User"); // Import User model
const { authMiddleware } = require("../middleware/auth"); // Import auth middleware

const router = express.Router();

/**
 * ✅ Get All Companies (NGO Only)
 */
router.get("/companies", authMiddleware, async (req, res) => {
    try {
        const companies = await User.find({ role: "company" }).select("-password"); // Exclude password
        res.status(200).json({
            message: "Companies fetched successfully",
            companies: companies
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching companies", error: error.message });
    }
});

/**
 * ✅ Get a Single Company Profile (NGO Only)
 */
router.get("/company/:id", authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid company ID format" });
        }

        const company = await User.findOne({ _id: id, role: "company" }).select("-password");
        if (!company) {
            return res.status(404).json({ message: "Company not found" });
        }

        res.status(200).json({
            message: "Company fetched successfully",
            company: company
        });
    } catch (error) {
        res.status(500).json({ message: "Error fetching company profile", error: error.message });
    }
});

module.exports = router;
