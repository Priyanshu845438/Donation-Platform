const express = require("express");
const User = require("../models/User"); // ✅ Import User model
const authMiddleware = require("../middleware/auth");

const router = express.Router();

/**
 * ✅ Get All NGOs (Company Only)
 */
router.get("/ngos", authMiddleware(["company"]), async (req, res) => {
    try {
        console.log("Fetching NGOs...");

        const ngos = await User.find({ role: "ngo" }).select("-password"); // Fetch NGOs from DB

        console.log("NGOs Found:", ngos); // Debugging

        res.status(200).json({
            message: "NGOs fetched successfully",
            ngos: ngos
        });
    } catch (error) {
        console.error("Error fetching NGOs:", error);
        res.status(500).json({ message: "Error fetching NGOs", error: error.message });
    }
});

/**
 * ✅ Get a Single NGO Profile (Company Only)
 */
router.get("/ngo/:id", authMiddleware(["company"]), async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid NGO ID format" });
        }

        const ngo = await User.findOne({ _id: id, role: "ngo" }).select("-password");
        if (!ngo) {
            return res.status(404).json({ message: "NGO not found" });
        }

        res.status(200).json({
            message: "NGO fetched successfully",
            ngo: ngo
        });
    } catch (error) {
        console.error("Error fetching NGO profile:", error);
        res.status(500).json({ message: "Error fetching NGO profile", error: error.message });
    }
});

// Get company data for dashboard
router.get("/dashboard", authMiddleware, async (req, res) => {
    try {
      const companyId = req.user.id; // Assuming `req.user` contains user details after JWT authentication
      const company = await Company.findById(companyId);
      
      if (!company) {
        return res.status(404).json({ message: "Company not found" });
      }
  
      // Send company data (modify as per your model structure)
      res.json({
        companyName: company.companyName,
        companyEmail: company.companyEmail,
        campaigns: company.campaigns, // Assuming campaigns is an array in the Company model
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  });
  

module.exports = router;
