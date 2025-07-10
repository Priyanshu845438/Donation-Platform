const express = require("express");
const User = require("../models/User");
const NGO = require("../models/NGO");
const Company = require("../models/Company");
const Donor = require("../models/User"); // Import Donor model (using User model for donors)
const { authMiddleware } = require("../middleware/auth");
const bcrypt = require("bcryptjs");
const path = require("path");
const { singleUpload } = require("../middleware/upload");

// Import dashboard routes
const dashboardRoutes = require("./admin/dashboard");

const router = express.Router();

// Mount dashboard routes
router.use('/dashboard', dashboardRoutes);

// Add analytics endpoint for compatibility
router.get("/analytics", authMiddleware(["admin"]), async (req, res) => {
    try {
        // Import the dashboard controller
        const { getAnalytics } = require("./admin/dashboard");
        await getAnalytics(req, res);
    } catch (error) {
        res.status(500).json({ message: "Error fetching analytics", error: error.message });
    }
});

// Admin Creates User
router.post("/create-user", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, role } = req.body;

        // Validate required fields
        if (!fullName || !email || !password || !phoneNumber || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Allowed roles
        const allowedRoles = ["NGO", "Company", "Admin", "Donor"];
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        if (role === "Admin") {
            return res.status(403).json({ message: "Admins can only be created by existing admins" });
        }

        // Check if the email exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "Email already in use" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save user
        const newUser = new User({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            isVerified: true,         // Auto-verified
            isActive: true,           // Active by default
            approvalStatus: "Approved", // Auto-approved
        });

        const savedUser = await newUser.save();

        // Send response
        res.status(201).json({
            _id: savedUser._id,
            fullName: savedUser.fullName,
            email: savedUser.email,
            phoneNumber: savedUser.phoneNumber,
            password: savedUser.password, // Hashed password
            role: savedUser.role,
            isVerified: savedUser.isVerified,
            isActive: savedUser.isActive,
            approvalStatus: savedUser.approvalStatus,
            createdAt: savedUser.createdAt,
            updatedAt: savedUser.updatedAt,
            __v: savedUser.__v,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
});

// Edit Company Profile (Admin Only)
router.put("/edit-company/:userId", authMiddleware(["admin"]), singleUpload("company", "companyLogo")[0], async (req, res) => {
    try {
        const { userId } = req.params;
        const updateFields = req.body;

        // Allowed fields for update
        const allowedFields = [
            "companyName",
            "registrationNumber",
            "companyAddress",
            "companyEmail",
            "companyPhoneNumber",
            "ceoName",
            "ceoContactNumber",
            "ceoEmail",
            "companyType",
            "numberOfEmployees"
        ];

        // Filter the request body to allow only valid fields
        const filteredUpdate = {};
        Object.keys(updateFields).forEach((key) => {
            if (allowedFields.includes(key)) {
                filteredUpdate[key] = updateFields[key];
            }
        });

        // Handle file upload (if provided)
        if (req.file) {
            filteredUpdate.companyLogo = `/uploads/company/${userId}${path.extname(req.file.originalname)}`;
        }

        // Update company profile
        const company = await Company.findOneAndUpdate({ userId }, filteredUpdate, { new: true });

        if (!company) {
            return res.status(404).json({ message: "Company profile not found" });
        }

        res.status(200).json({ message: "Company profile updated successfully", company });
    } catch (error) {
        res.status(500).json({ message: "Error updating company profile", error: error.message });
    }
});


router.put("/edit-ngo/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const updateFields = req.body;

        // Allowed fields for update
        const allowedFields = [
            "ngoName",
            "registrationNumber",
            "registeredYear",
            "address",
            "contactNumber",
            "email",
            "website",
            "authorizedPerson.name",
            "authorizedPerson.phone",
            "authorizedPerson.email",
            "panNumber",
            "tanNumber",
            "gstNumber",
            "numberOfEmployees",
            "ngoType",
            "is80GCertified",
            "is12ACertified",
            "bankDetails.accountHolderName",
            "bankDetails.accountNumber",
            "bankDetails.ifscCode",
            "bankDetails.bankName",
            "bankDetails.branchName",
            "logo",
            "isActive"
        ];

        // Filter the request body to allow only valid fields
        const filteredUpdate = {};
        Object.keys(updateFields).forEach((key) => {
            if (allowedFields.includes(key)) {
                filteredUpdate[key] = updateFields[key];
            }
        });

        const ngo = await NGO.findByIdAndUpdate(id, filteredUpdate, { new: true });

        if (!ngo) {
            return res.status(404).json({ message: "NGO not found" });
        }

        res.status(200).json({ message: "NGO updated successfully", ngo });
    } catch (error) {
        res.status(500).json({ message: "Error updating NGO", error: error.message });
    }
});


// ✅ Delete Company
router.delete("/delete-company/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;

        let company = await Company.findById(id);
        if (!company) {
            return res.status(404).json({ message: "Company not found." });
        }

        await company.deleteOne();

        res.status(200).json({ message: "Company deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting company", error: error.message });
    }
});

// ✅ Delete NGO
router.delete("/delete-ngo/:id", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;

        let ngo = await NGO.findById(id);
        if (!ngo) {
            return res.status(404).json({ message: "NGO not found." });
        }

        await ngo.deleteOne();
        res.status(200).json({ message: "NGO deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting NGO", error: error.message });
    }
});

// Get All Users (Admin Only)
router.get("/users", authMiddleware(["admin"]), async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

// ✅ Get All Companies
router.get("/companies", authMiddleware(["admin"]), async (req, res) => {
    try {
        const companies = await Company.find();
        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({ message: "Error fetching companies", error: error.message });
    }
});

// ✅ Get All NGOs
router.get("/ngos", authMiddleware(["admin"]), async (req, res) => {
    try {
        const ngos = await NGO.find();
        res.status(200).json(ngos);
    } catch (error) {
        res.status(500).json({ message: "Error fetching NGOs", error: error.message });
    }
});

// NGO status update (Admin Only)
router.patch("/ngos/:id/status", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        // Validate status
        const validStatuses = ["active", "inactive", "rejected"];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Update NGO status
        const ngo = await NGO.findByIdAndUpdate(id, { approvalStatus: status, rejectionReason: reason }, { new: true });

        if (!ngo) {
            return res.status(404).json({ message: "NGO not found" });
        }

        res.status(200).json({ message: `NGO status updated to ${status}`, ngo });
    } catch (error) {
        res.status(500).json({ message: "Error updating NGO status", error: error.message });
    }
});

// View NGO Profile (Public)
router.get("/ngos/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const ngo = await NGO.findById(id);

        if (!ngo) {
            return res.status(404).json({ message: "NGO not found" });
        }

        res.status(200).json(ngo);
    } catch (error) {
        res.status(500).json({ message: "Error fetching NGO profile", error: error.message });
    }
});

// ✅ Get All Donors
router.get("/donors", authMiddleware(["admin"]), async (req, res) => {
    try {
        const donors = await Donor.find({ role: "Donor" });
        res.status(200).json(donors);
    } catch (error) {
        res.status(500).json({ message: "Error fetching donors", error: error.message });
    }
});

module.exports = router;