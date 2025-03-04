const express = require("express");
const User = require("../models/User");
const authMiddleware = require("../middleware/auth");
const router = express.Router();
const bcrypt = require("bcryptjs"); 


// ✅ Fix: Call authMiddleware with "admin" role
router.post("/create-company", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let existingCompany = await User.findOne({ email });
        if (existingCompany) {
            return res.status(400).json({ message: "Company already exists." });
        }

        const newCompany = new User({ name, email, password, role: "company" });
        await newCompany.save();

        res.status(201).json({ message: "Company registered successfully", company: newCompany });
    } catch (error) {
        res.status(500).json({ message: "Error creating company", error: error.message });
    }
});

// ✅ Fix: Add authMiddleware to edit-company route
router.put("/edit-company/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        let company = await User.findById(id);
        if (!company) {
            return res.status(404).json({ message: "Company not found." });
        }

        company.name = name || company.name;
        company.email = email || company.email;

        await company.save();

        res.status(200).json({ message: "Company updated successfully", company });
    } catch (error) {
        res.status(500).json({ message: "Error updating company", error: error.message });
    }
});

// ✅ Fix: Add authMiddleware to delete-company route
router.delete("/delete-company/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;

        let company = await User.findById(id);
        if (!company) {
            return res.status(404).json({ message: "Company not found." });
        }

        await company.deleteOne();

        res.status(200).json({ message: "Company deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting company", error: error.message });
    }
});

// ✅ Get All Companies
router.get("/companies", authMiddleware(["admin"]), async (req, res) => {
    try {
        const companies = await User.find({ role: "company" });
        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({ message: "Error fetching companies", error: error.message });
    }
});

// ✅ Create NGO
router.post("/create-ngo", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { name, email, password } = req.body;

        let existingNGO = await User.findOne({ email });
        if (existingNGO) {
            return res.status(400).json({ message: "NGO already exists." });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newNGO = new User({ name, email, password: hashedPassword, role: "ngo" });
        await newNGO.save();

        res.status(201).json({ message: "NGO registered successfully", ngo: newNGO });
    } catch (error) {
        res.status(500).json({ message: "Error creating NGO", error: error.message });
    }
});

// ✅ Edit NGOs
router.put("/edit-ngo/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email } = req.body;

        let ngo = await User.findById(id);
        if (!ngo || ngo.role !== "ngo") {
            return res.status(404).json({ message: "NGO not found." });
        }

        ngo.name = name || ngo.name;
        ngo.email = email || ngo.email;
        await ngo.save();

        res.status(200).json({ message: "NGO updated successfully", ngo });
    } catch (error) {
        res.status(500).json({ message: "Error updating NGO", error: error.message });
    }
});

// ✅ Delete NGO
router.delete("/delete-ngo/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;

        let ngo = await User.findById(id);
        if (!ngo || ngo.role !== "ngo") {
            return res.status(404).json({ message: "NGO not found." });
        }

        await ngo.deleteOne();
        res.status(200).json({ message: "NGO deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting NGO", error: error.message });
    }
});

// ✅ Get All NGOs
router.get("/ngos", authMiddleware(["admin"]), async (req, res) => {
    try {
        const ngos = await User.find({ role: "ngo" });
        res.status(200).json(ngos);
    } catch (error) {
        res.status(500).json({ message: "Error fetching NGOs", error: error.message });
    }
});

module.exports = router;
