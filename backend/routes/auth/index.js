const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Company = require("../../models/Company");
const NGO = require("../../models/NGO");
const Activity = require("../../models/Activity");
const authMiddleware = require("../../middleware/auth");
const upload = require("../../middleware/uploadMiddleware");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "Donation_Priyanshu";

// Setup default admin (only if no admin exists)
router.post("/setup-admin", async (req, res) => {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ role: "admin" });

        if (existingAdmin) {
            return res.status(400).json({
                status: "fail",
                message: "Admin already exists"
            });
        }

        // Create default admin
        const hashedPassword = await bcrypt.hash("Acadify@123", 10);

        const adminUser = new User({
            email: "admin@acadify.com",
            password: hashedPassword,
            role: "admin",
            firstName: "System",
            fullName: "Admin",
            phoneNumber: "1234567890",
            isApproved: true,
            isActive: true
        });

        await adminUser.save();

        res.status(201).json({
            status: "success",
            message: "Default admin created successfully",
            data: {
                user: {
                    id: adminUser._id,
                    email: adminUser.email,
                    role: adminUser.role
                }
            }
        });

    } catch (error) {
        console.error("Setup admin error:", error);
        res.status(500).json({
            status: "error",
            message: "Error setting up admin",
            error: error.message
        });
    }
});

// Register
router.post("/register", async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, role } = req.body;

        if (!fullName || !email || !password || !phoneNumber || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const normalizedRole = role.trim().toLowerCase();
        if (!["ngo", "company", "admin", "donor"].includes(normalizedRole)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        if (normalizedRole === "admin") {
            return res.status(403).json({ message: "Admins can only be created by existing admins" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            role
        });
        await newUser.save();

        let newCompany = null;
        let newNGO = null;

        if (normalizedRole === "company") {
            newCompany = await Company.create({
                userId: newUser._id,
                companyName: fullName,
                companyEmail: email,
                companyPhoneNumber: phoneNumber,
                ceoEmail: email
            });
        }

        if (normalizedRole === "ngo") {
            newNGO = await NGO.create({
                userId: newUser._id,
                ngoName: fullName,
                email: email,
                contactNumber: phoneNumber,
                authorizedPerson: { 
                    name: "Not provided",
                    phone: "Not provided",
                    email: email // Use actual email instead of null
                },
                panNumber: "",
                tanNumber: "",
                gstNumber: "",
                bankDetails: {
                    accountHolderName: "Not provided",
                    accountNumber: "",
                    ifscCode: "Not provided",
                    bankName: "Not provided",
                    branchName: "Not provided"
                }
            });
        }

        const newActivity = new Activity({
            userId: newUser._id,
            action: "User registered"
        });
        await newActivity.save();

        res.status(201).json({
            message: `${role} registered successfully`,
            user: newUser,
            company: newCompany,
            ngo: newNGO
        });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
});

// Login
router.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        // Find user by email first, then check role if provided
        const query = { email };
        if (role) {
            query.role = role;
        }

        const user = await User.findOne(query);
        if (!user) {
            const message = role 
                ? "No user found with this email and role combination" 
                : "No user found with this email";
            return res.status(404).json({ message });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user._id, userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        const newActivity = new Activity({
            userId: user._id,
            action: "User logged in"
        });
        await newActivity.save();

        res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});

// Get profile
router.get("/profile", authMiddleware([]), async (req, res) => {
    try {
        const { role } = req.user;
        const userId = req.user._id || req.user.id;
        let model;

        if (role === "ngo") model = NGO;
        else if (role === "company") model = Company;
        else return res.status(403).json({ message: "You are not authorized to access this profile." });

        let entity = await model.findOne({ userId });
        if (!entity) {
            return res.status(404).json({ message: `${role} profile not found.` });
        }

        res.status(200).json({ message: "Profile retrieved successfully", entity });
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile", error: error.message });
    }
});

// Update profile
router.put("/profile", authMiddleware([]), upload.single("profileImage"), async (req, res) => {
    try {
        const { role } = req.user;
        const userId = req.user._id || req.user.id;
        let updateData = req.body;

        let model;
        if (role === "ngo") model = NGO;
        else if (role === "company") model = Company;
        else return res.status(403).json({ message: "You are not authorized to update this profile." });

        let entity = await model.findOne({ userId });
        if (!entity) {
            return res.status(404).json({ message: `${role} profile not found.` });
        }

        Object.keys(updateData).forEach((key) => {
            entity[key] = updateData[key];
        });

        if (req.file) {
            entity.logo = `/uploads/Profile/${req.file.filename}`;
        }

        await entity.save();
        res.status(200).json({ message: `${role} profile updated successfully`, entity });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
});

// Other routes...
router.post("/logout", authMiddleware([]), (req, res) => {
    res.status(200).json({ message: "Logout successful" });
});

router.get("/activity", authMiddleware([]), async (req, res) => {
    try {
        const userId = req.user._id || req.user.id;
        const activities = await Activity.find({ userId }).sort({ timestamp: -1 });
        res.status(200).json({ activities });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Add signup alias for register route
router.post("/signup", async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, role } = req.body;

        if (!fullName || !email || !password || !phoneNumber || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const normalizedRole = role.trim().toLowerCase();
        if (!["ngo", "company", "admin", "donor"].includes(normalizedRole)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        if (normalizedRole === "admin") {
            return res.status(403).json({ message: "Admins can only be created by existing admins" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists with this email" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword,
            role: normalizedRole
        });
        await newUser.save();

        let newCompany = null;
        let newNGO = null;

        if (normalizedRole === "company") {
            newCompany = await Company.create({
                userId: newUser._id,
                companyName: fullName,
                companyEmail: email,
                companyPhoneNumber: phoneNumber,
                ceoEmail: email
            });
        }

        if (normalizedRole === "ngo") {
            newNGO = await NGO.create({
                userId: newUser._id,
                ngoName: fullName,
                email: email,
                contactNumber: phoneNumber,
                authorizedPerson: { 
                    name: "Not provided",
                    phone: "Not provided",
                    email: email // Use actual email instead of null
                },
                panNumber: "",
                tanNumber: "",
                gstNumber: "",
                bankDetails: {
                    accountHolderName: "Not provided",
                    accountNumber: "",
                    ifscCode: "Not provided",
                    bankName: "Not provided",
                    branchName: "Not provided"
                }
            });
        }

        const newActivity = new Activity({
            userId: newUser._id,
            action: "User registered"
        });
        await newActivity.save();

        res.status(201).json({
            message: `${role} registered successfully`,
            user: newUser,
            company: newCompany,
            ngo: newNGO
        });
    } catch (error) {
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
});

module.exports = router;