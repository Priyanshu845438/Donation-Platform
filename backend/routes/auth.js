const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Default Admin Setup (Only Run Once)
router.post("/setup-admin", async (req, res) => {
    try {
        const existingAdmin = await User.findOne({ role: "admin" });
        if (existingAdmin) return res.status(400).json({ message: "Admin already exists" });

        const hashedPassword = await bcrypt.hash("admin@123", 10);
        const admin = new User({ name: "Admin", email: "admin@system.com", password: hashedPassword, role: "admin" });

        await admin.save();
        res.status(201).json({ message: "Default admin created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error setting up admin" });
    }
});

// Register User (NGO & Company Self-Register, Admin Can Add Any Role)
router.post("/signup", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!["ngo", "company", "admin"].includes(role)) return res.status(400).json({ message: "Invalid role" });

        // Admin can't register themselves (only setup-admin should create the first admin)
        if (role === "admin") return res.status(403).json({ message: "Admins can only be created by existing admins" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role });

        await newUser.save();
        res.status(201).json({ message: `${role} registered successfully`, user: newUser });
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Error registering user", error: error.message });
    }
    
});

// Admin Creates User (Admin Only)
router.post("/create-user", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        if (!["ngo", "company", "admin"].includes(role)) return res.status(400).json({ message: "Invalid role" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword, role });

        await newUser.save();
        res.status(201).json({ message: `${role} created successfully`, user: newUser });
    } catch (error) {
        res.status(500).json({ message: "Error creating user" });
    }
});

// Login Route
// Login Route
router.post("/login", async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Check if all required fields are provided
        if (!email || !password || !role) {
            return res.status(400).json({ message: "Please provide email, password, and role" });
        }

        // Find user by email and role
        const user = await User.findOne({ email, role });
        
        // If user is not found
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Compare the password with the hash in the database
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Invalid password" });
        }

        // Create a JWT token
        const token = jwt.sign(
            { userId: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        // Send token and user info in the response
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                email: user.email,
                role: user.role
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

// Get All Users (Admin Only)
router.get("/users", async (req, res) => {
    try {
        const users = await User.find();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

// ✅ Edit Own Profile (Admin, NGO, Company)
router.put("/edit-profile", authMiddleware(), async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const userId = req.user.id;

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Update fields only if provided
        if (name) user.name = name;
        if (email) user.email = email;
        if (password) user.password = await bcrypt.hash(password, 10); // Hash new password

        await user.save();

        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Error updating profile", error: error.message });
    }
});

// ✅ Delete Own Profile (Admin, NGO, Company)
router.delete("/delete-profile", authMiddleware(), async (req, res) => {
    try {
        const userId = req.user.id;

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        await user.deleteOne();
        res.status(200).json({ message: "Profile deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting profile", error: error.message });
    }
});

// ✅ Get Own Profile (Admin, NGO, Company)
router.get("/profile", authMiddleware(), async (req, res) => {
    try {
        const userId = req.user.id;
        let user = await User.findById(userId).select("-password"); // Exclude password for security
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ message: "Error fetching profile", error: error.message });
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

/**
 * ✅ Logout API (All Users)
 */
router.post("/logout", authMiddleware(), async (req, res) => {
    try {
        // Simply send a success message since JWT is stateless
        res.status(200).json({
            message: "Logout successful. Please clear your token on the client side."
        });
    } catch (error) {
        res.status(500).json({ message: "Error logging out", error: error.message });
    }
});
// Don't forget to export the router!
module.exports = router;
