const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require("../models/Company"); // ✅ Make sure this is present
const NGO = require("../models/NGO"); // ✅ Make sure this is present
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const nodemailer = require("nodemailer");
require("dotenv").config(); // Load environment variables
const crypto = require("crypto");
const activityLogger = require('../middleware/activityLogger');





const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "Donation_Priyanshu";

// Default Admin Setup (Only Run Once)
router.post("/setup-admin", async (req, res) => {
    try {
        // Delete existing admin to prevent conflicts
        await User.deleteOne({ email: "acadify.online@gmail.com" });

        const hashedPassword = await bcrypt.hash("Acadify@123", 10);
        
        const admin = new User({
            fullName: "Acadify",
            email: "acadify.online@gmail.com",
            phoneNumber: "6206698170",
            password: hashedPassword, // ✅ Correctly hashed password
            role: "Admin",
        });

        await admin.save();
        res.status(201).json({ message: "Default admin created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error setting up admin", error: error.message });
    }
});


//signup
router.post("/signup", async (req, res) => {
    try {
        const { fullName, email, password, phoneNumber, role } = req.body;

        if (!fullName || !email || !password || !phoneNumber || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (!["NGO", "Company", "Admin", "Donor"].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        if (role === "Admin") {
            return res.status(403).json({ message: "Admins can only be created by existing admins" });
        }

        // 🔵 1️⃣ **Hash the Password before saving**
        const saltRounds = 10; // Higher value = more secure but slower
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        console.log("🟢 Creating user with hashed password:", email);
        const newUser = new User({
            fullName,
            email,
            phoneNumber,
            password: hashedPassword, // ✅ Store hashed password
            role
        });
        await newUser.save();
        console.log("✅ User created successfully:", newUser._id);

        let newCompany = null;
        let newNGO = null;

        // 🔵 2️⃣ If Role is "Company", Create a Company Profile
        if (role.trim().toLowerCase() === "company") {
            console.log("🟢 Attempting to create company profile for:", email);
            try {
                newCompany = await Company.create({
                    userId: newUser._id,  // ✅ Now userId exists
                    companyName: fullName,
                    companyEmail: email,
                    registrationNumber: "Pending",
                    companyAddress: "Not provided",
                    companyPhoneNumber: phoneNumber,
                    ceoName: "Not provided",
                    ceoContactNumber: "Not provided",
                    ceoEmail: "Not provided",
                    companyType: "IT",
                    numberOfEmployees: 1,
                    companyLogo: "",
                });

                console.log("✅ Company profile created successfully:", newCompany);
            } catch (companyError) {
                console.error("❌ ERROR: Failed to create company:", companyError.message);
                return res.status(500).json({ message: "Company profile creation failed", error: companyError.message });
            }
        }

        // 🔵 3️⃣ If Role is "NGO", Create an NGO Profile
        if (role.trim().toLowerCase() === "ngo") {
            console.log("🟢 Attempting to create NGO profile for:", email);
            try {
                newNGO = await NGO.create({
                    ngoName: fullName,
                    registrationNumber: "Pending",
                    registeredYear: new Date().getFullYear(),
                    address: "Not provided",
                    contactNumber: phoneNumber,
                    email: email,
                    website: "Not provided",
                    authorizedPerson: {
                        name: "Not provided",
                        phone: "Not provided",
                        email: "Not provided",
                    },
                    panNumber: "Not provided",
                    tanNumber: "Not provided",
                    gstNumber: "Not provided",
                    numberOfEmployees: 1,
                    ngoType: "Trust", // Default value
                    is80GCertified: false,
                    is12ACertified: false,
                    bankDetails: {
                        accountHolderName: "Not provided",
                        accountNumber: "Not provided",
                        ifscCode: "Not provided",
                        bankName: "Not provided",
                        branchName: "Not provided",
                    },
                    logo: "",
                    isActive: true,
                });

                console.log("✅ NGO profile created successfully:", newNGO);
            } catch (ngoError) {
                console.error("❌ ERROR: Failed to create NGO:", ngoError.message);
                return res.status(500).json({ message: "NGO profile creation failed", error: ngoError.message });
            }
        }

        res.status(201).json({
            message: `${role} registered successfully`,
            user: newUser,
            company: newCompany,
            ngo: newNGO
        });

    } catch (error) {
        console.error("❌ Error registering user:", error);
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
});

// Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({ message: "Please provide all required fields: email, password, and role" });
        }

        const user = await User.findOne({ email, role });
        if (!user) {
            return res.status(404).json({ message: "No user found with this email and role combination" });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

        // Track activity (Login)
        activityLogger('Login', `User logged in at ${new Date().toISOString()}`)(req, res, () => {});

        res.status(200).json({ message: "Login successful", token, user });
    } catch (error) {
        res.status(500).json({ message: "Internal server error", error: error.message });
    }
});


//Featch own Profile
router.get("/my-profile", authMiddleware(), async (req, res) => {
    try {
        const { role, userId } = req.user; // Extract role & user ID from token

        let model;
        if (role === "NGO") {
            model = NGO;
        } else if (role === "Company") {
            model = Company;
        } else {
            return res.status(403).json({ message: "You are not authorized to access this profile." });
        }

        // 🔍 Convert userId to ObjectId before searching
        let entity = await model.findOne({ userId: new mongoose.Types.ObjectId(userId) });

        if (!entity) {
            return res.status(404).json({ message: `${role} profile not found.` });
        }

        res.status(200).json({ message: "Profile retrieved successfully", entity });
    } catch (error) {
        console.error("❌ Error fetching profile:", error);
        res.status(500).json({ message: "Error fetching profile", error: error.message });
    }
});


// Storage configuration for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, "../uploads/Profile")); // Save in "uploads/Profile" folder
    },
    filename: function (req, file, cb) {
        cb(null, `company_logo_${req.user.userId}${path.extname(file.originalname)}`);
    }
});

// File filter: Only allow images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
        cb(null, true);
    } else {
        cb(new Error("Only image files are allowed"), false);
    }
};

// Initialize multer with storage & file filter
const upload = multer({ storage, fileFilter });

// ✏️ Edit Own Profile Route
router.put("/update-profile", authMiddleware(), upload.single("companyLogo"), async (req, res) => {
    try {
        const { role, userId } = req.user; // Extract role & user ID from token
        let updateData = req.body;

        let model;
        if (role === "NGO") {
            model = NGO;
        } else if (role === "Company") {
            model = Company;
        } else {
            return res.status(403).json({ message: "You are not authorized to update this profile." });
        }

        // 🔍 Find the user's profile based on `userId`
        let entity = await model.findOne({ userId });
        if (!entity) {
            return res.status(404).json({ message: `${role} profile not found.` });
        }

        // 🚫 Prevent Name, Email & Phone Number Change
        const protectedFields = ["companyName", "companyEmail", "companyPhoneNumber"];
        Object.keys(updateData).forEach((key) => {
            if (!protectedFields.includes(key)) {
                entity[key] = updateData[key];
            }
        });

        // 📂 Handle Image Upload
        if (req.file) {
            entity.companyLogo = `/uploads/Profile/${req.file.filename}`;
        }

        // ✅ Save Changes
        await entity.save();

        // Log activity
        activityLogger('Profile Updated', `User updated their profile at ${new Date().toISOString()}`)(req, res, () => {});

        res.status(200).json({ message: `${role} profile updated successfully`, entity });
    } catch (error) {
        console.error("❌ Error updating profile:", error);
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
});

// Delete Own Profile
router.delete("/delete-profile", authMiddleware(), async (req, res) => {
    try {
        const { role, userId } = req.user; // Extract role & user ID from token

        // Check if the user exists
        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        let model;
        if (role === "NGO") {
            model = NGO;
        } else if (role === "Company") {
            model = Company;
        } else {
            return res.status(403).json({ message: "You are not authorized to delete this profile." });
        }

        // Check if the profile exists in Company or NGO collection
        let profile = await model.findOne({ userId });
        if (profile) {
            await profile.deleteOne(); // Delete the profile
        }

        // Delete user from the User collection
        await user.deleteOne();

        res.status(200).json({ message: "Profile and associated user data deleted successfully." });
    } catch (error) {
        console.error("❌ Error deleting profile:", error);
        res.status(500).json({ message: "Error deleting profile", error: error.message });
    }
});

// Create transporter using Hostinger SMTP
const transporter = nodemailer.createTransport({
    host: 'smtp.hostinger.com',  // Hostinger SMTP host
    port: 465,  // Port 587 for TLS
    secure: true,  // Set to true if using SSL (port 465)
    auth: {
        user: process.env.EMAIL_ID,  // Your Hostinger email address (e.g., support@yourdomain.com)
        pass: process.env.EMAIL_PASS,  // Your Hostinger email password
    }
});

// Forgot Password Route
router.post("/forgot-password", async (req, res) => {
    try {
        const { email } = req.body;
        
        // Log the email to ensure it's correct
        console.log("Received email:", email);

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Generate Reset Token (Valid for 1 hour)
        const resetToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
        await user.save();

        // Send Email with Reset Link
        const resetURL = `http://localhost:3000/reset-password/${resetToken}`;
        const mailOptions = {
            from: process.env.EMAIL_ID,  // Sender email
            to: email,  // Receiver email
            subject: "Password Reset Request",
            text: `Click the link to reset your password: ${resetURL}`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: "Password reset email sent successfully." });
    } catch (error) {
        console.error("❌ Error in forgot password:", error);
        res.status(500).json({ message: "Error sending reset email", error: error.message });
    }
});


// Change Password Route (Authenticated)
router.post("/change-password", authMiddleware([]), async (req, res) => {  // Pass an empty array for 'allowedRoles'
    try {
        const { currentPassword, newPassword } = req.body;

        // Check if both current and new passwords are provided
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Please provide both current and new passwords." });
        }

        // Ensure that req.user.userId exists and is valid
        const userId = req.user.userId;  // Change from req.user.id to req.user.userId

        if (!userId) {
            return res.status(400).json({ message: "Invalid user ID." });
        }

        // Find the user by their userId
        const user = await User.findById(userId);  // Find user based on the user ID from the token

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect." });
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update the user's password in the database
        user.password = hashedPassword;
        await user.save();

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
});

router.get('/activity', authMiddleware(['user', 'admin']), async (req, res) => {
    try {
        const activities = await Activity.find({ userId: req.user.id }).sort({ timestamp: -1 });

        if (!activities) {
            return res.status(404).json({ message: 'No activities found for this user' });
        }

        res.status(200).json({ activities });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Logout Route (Authenticated)
router.post("/logout", authMiddleware([]), async (req, res) => {
    try {
        // Send a response to the client confirming the logout
        res.status(200).json({ message: "Logout successful" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error." });
    }
});


// Middleware to verify JWT and check user role
function authMiddleware(roles = []) {
    return (req, res, next) => {
        const token = req.header("Authorization");
        if (!token) return res.status(401).json({ message: "Access Denied" });

        try {
            const decoded = jwt.verify(token.replace("Bearer ", ""), JWT_SECRET);
            if (roles.length && !roles.includes(decoded.role)) {
                return res.status(403).json({ message: "Forbidden" });
            }

            req.user = decoded;
            next();
        } catch (error) {
            res.status(401).json({ message: "Invalid Token" });
        }
    };
}


module.exports = router;