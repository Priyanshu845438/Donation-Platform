const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const verifyToken = require("../middleware/auth");

const router = express.Router();

router.put("/profile", verifyToken, async (req, res) => {
    try {
        console.log("User ID from token:", req.user.id); // Debugging step

        // Validate ObjectId before querying MongoDB
        if (!mongoose.Types.ObjectId.isValid(req.user.id)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        const updates = req.body;
        const updatedUser = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ message: "Profile updated successfully", updatedUser });
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Error updating profile" });
    }
});

module.exports = router;