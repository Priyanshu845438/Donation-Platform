const express = require("express");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// 🛡️ Only Admins Can Access This Route
router.get("/admin-data", authMiddleware(["admin"]), (req, res) => {
    res.json({ message: "Admin data accessible" });
});

// 🛡️ Only NGOs Can Access This Route
router.get("/ngo-data", authMiddleware(["ngo"]), (req, res) => {
    res.json({ message: "NGO data accessible" });
});

// 🛡️ Only Companies Can Access This Route
router.get("/company-data", authMiddleware(["company"]), (req, res) => {
    res.json({ message: "Company data accessible" });
});

module.exports = router;
