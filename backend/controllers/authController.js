const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Company = require("../models/Company");
const NGO = require("../models/NGO");
const Activity = require("../models/Activity");
const Settings = require("../models/Settings");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { validateEmail, validatePassword, validatePhoneNumber } = require("../utils/validators");
const { createErrorResponse, createSuccessResponse } = require("../utils/errorHandler");

class AuthController {
    // Enhanced registration with approval system
    static async register(req, res) {
        try {
            const { fullName, email, password, phoneNumber, role } = req.body;

            // Validate required fields
            if (!fullName || !email || !password || !phoneNumber || !role) {
                return createErrorResponse(res, 400, "All fields are required");
            }

            // Validate input formats
            if (!validateEmail(email)) {
                return createErrorResponse(res, 400, "Invalid email format");
            }

            if (!validatePassword(password)) {
                return createErrorResponse(res, 400, "Password must be at least 8 characters with uppercase, lowercase, number, and special character");
            }

            if (!validatePhoneNumber(phoneNumber)) {
                return createErrorResponse(res, 400, "Invalid phone number format");
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return createErrorResponse(res, 400, "User already exists with this email");
            }

            // Get settings for auto-approval
            const generalSettings = await Settings.findOne({ category: "general" });
            const autoApprove = generalSettings?.settings?.get("auto_approve_users") || false;

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 12);

            // Create user
            const newUser = new User({
                fullName,
                email,
                password: hashedPassword,
                phoneNumber,
                role: role.toLowerCase(),
                isVerified: false,
                isActive: autoApprove,
                approvalStatus: autoApprove ? "approved" : "pending"
            });

            await newUser.save();

            // Create role-specific profile
            let profileData = null;
            if (role.toLowerCase() === "ngo") {
                profileData = await this.createNGOProfile(newUser, { fullName, email, phoneNumber });
            } else if (role.toLowerCase() === "company") {
                profileData = await this.createCompanyProfile(newUser, { fullName, email, phoneNumber });
            }

            // Log activity
            await Activity.create({
                userId: newUser._id,
                action: "user_registration",
                description: `User registered with role: ${role}`,
                metadata: { role, email }
            });

            // Send confirmation email
            await this.sendRegistrationEmail(newUser, autoApprove);

            return createSuccessResponse(res, 201, {
                message: autoApprove ? "Registration successful" : "Registration successful. Please wait for admin approval.",
                user: {
                    id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    role: newUser.role,
                    approvalStatus: newUser.approvalStatus
                },
                profile: profileData
            });

        } catch (error) {
            console.error("Registration error:", error);
            return createErrorResponse(res, 500, "Registration failed", error.message);
        }
    }

    // Enhanced login with approval check
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                return createErrorResponse(res, 400, "Email and password are required");
            }

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return createErrorResponse(res, 400, "Invalid credentials");
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return createErrorResponse(res, 400, "Invalid credentials");
            }

            // Check approval status
            if (user.approvalStatus === "pending") {
                return createErrorResponse(res, 403, "Your account is pending approval from admin");
            }

            if (user.approvalStatus === "rejected") {
                return createErrorResponse(res, 403, "Your account has been rejected by admin");
            }

            // Check if user is active
            if (!user.isActive) {
                return createErrorResponse(res, 403, "Your account has been deactivated");
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user._id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: "24h" }
            );

            // Update last login
            user.lastLogin = new Date();
            await user.save();

            // Log activity
            await Activity.create({
                userId: user._id,
                action: "user_login",
                description: "User logged in successfully"
            });

            return createSuccessResponse(res, 200, {
                message: "Login successful",
                token,
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                    isVerified: user.isVerified,
                    lastLogin: user.lastLogin
                }
            });

        } catch (error) {
            console.error("Login error:", error);
            return createErrorResponse(res, 500, "Login failed", error.message);
        }
    }

    // Get user profile
    static async getProfile(req, res) {
        try {
            const userId = req.user.id;
            const role = req.user.role;

            let profileData = null;
            if (role === "ngo") {
                profileData = await NGO.findOne({ userId }).populate("userId", "-password");
            } else if (role === "company") {
                profileData = await Company.findOne({ userId }).populate("userId", "-password");
            } else {
                profileData = await User.findById(userId).select("-password");
            }

            if (!profileData) {
                return createErrorResponse(res, 404, "Profile not found");
            }

            return createSuccessResponse(res, 200, {
                message: "Profile retrieved successfully",
                profile: profileData
            });

        } catch (error) {
            console.error("Get profile error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve profile", error.message);
        }
    }

    // Update profile
    static async updateProfile(req, res) {
        try {
            const userId = req.user.id;
            const role = req.user.role;
            const updateData = req.body;

            // Handle file upload
            if (req.file) {
                updateData.profileImage = `/uploads/profile/${req.file.filename}`;
            }

            let updatedProfile = null;
            if (role === "ngo") {
                updatedProfile = await NGO.findOneAndUpdate(
                    { userId },
                    updateData,
                    { new: true, runValidators: true }
                );
            } else if (role === "company") {
                updatedProfile = await Company.findOneAndUpdate(
                    { userId },
                    updateData,
                    { new: true, runValidators: true }
                );
            }

            if (!updatedProfile) {
                return createErrorResponse(res, 404, "Profile not found");
            }

            // Log activity
            await Activity.create({
                userId,
                action: "profile_update",
                description: "User updated their profile"
            });

            return createSuccessResponse(res, 200, {
                message: "Profile updated successfully",
                profile: updatedProfile
            });

        } catch (error) {
            console.error("Update profile error:", error);
            return createErrorResponse(res, 500, "Failed to update profile", error.message);
        }
    }

    // Create NGO profile
    static async createNGOProfile(user, userData) {
        try {
            const newNGO = await NGO.create({
                userId: user._id,
                ngoName: userData.fullName,
                email: userData.email,
                contactNumber: userData.phoneNumber,
                isActive: true,
                // Ensure sparse unique fields are not set to undefined
                panNumber: null,
                tanNumber: null,
                gstNumber: null,
                authorizedPerson: {
                    name: null,
                    phone: null,
                    email: null
                },
                bankDetails: {
                    accountHolderName: null,
                    accountNumber: null,
                    ifscCode: null,
                    bankName: null,
                    branchName: null
                }
            });
            return newNGO;
        } catch (error) {
            console.error("NGO profile creation error:", error);
            throw error;
        }
    }

    // Create Company profile
    static async createCompanyProfile(user, userData) {
        try {
            const newCompany = await Company.create({
                userId: user._id,
                companyName: userData.fullName,
                companyEmail: userData.email,
                companyPhoneNumber: userData.phoneNumber,
                isActive: true
            });
            return newCompany;
        } catch (error) {
            console.error("Company profile creation error:", error);
            throw error;
        }
    }

    // Send registration email
    static async sendRegistrationEmail(user, autoApprove) {
        try {
            const emailSettings = await Settings.findOne({ category: "email" });
            if (!emailSettings) return;

            const transporter = nodemailer.createTransporter({
                host: emailSettings.settings.get("smtp_host"),
                port: emailSettings.settings.get("smtp_port"),
                secure: emailSettings.settings.get("smtp_secure"),
                auth: {
                    user: process.env.EMAIL_ID,
                    pass: process.env.EMAIL_PASS
                }
            });

            const subject = autoApprove ? "Welcome to Donation Platform" : "Registration Pending Approval";
            const message = autoApprove 
                ? `Welcome ${user.fullName}! Your account has been activated.`
                : `Hello ${user.fullName}! Your registration is pending admin approval.`;

            await transporter.sendMail({
                from: emailSettings.settings.get("from_email"),
                to: user.email,
                subject,
                text: message
            });
        } catch (error) {
            console.error("Email sending error:", error);
        }
    }

    // Other methods (logout, verifyToken, etc.) continue...
    static async logout(req, res) {
        try {
            await Activity.create({
                userId: req.user.id,
                action: "user_logout",
                description: "User logged out"
            });

            return createSuccessResponse(res, 200, { message: "Logout successful" });
        } catch (error) {
            return createErrorResponse(res, 500, "Logout failed", error.message);
        }
    }

    static async verifyToken(req, res) {
        try {
            const token = req.header("Authorization")?.replace("Bearer ", "");
            if (!token) {
                return createErrorResponse(res, 401, "No token provided");
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select("-password");

            if (!user) {
                return createErrorResponse(res, 401, "Invalid token");
            }

            return createSuccessResponse(res, 200, {
                message: "Token is valid",
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    role: user.role,
                    isVerified: user.isVerified
                }
            });

        } catch (error) {
            return createErrorResponse(res, 401, "Invalid token");
        }
    }

    static async getUserActivity(req, res) {
        try {
            const activities = await Activity.find({ userId: req.user.id })
                .sort({ createdAt: -1 })
                .limit(50);

            return createSuccessResponse(res, 200, {
                message: "Activities retrieved successfully",
                activities
            });
        } catch (error) {
            return createErrorResponse(res, 500, "Failed to retrieve activities", error.message);
        }
    }

    // Add other methods like forgotPassword, resetPassword, changePassword, deleteProfile
}

// Get user profile
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');

        if (!user) {
            return res.status(404).json({
                message: 'User not found'
            });
        }

        res.json({
            message: 'Profile retrieved successfully',
            user
        });
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving profile',
            error: error.message
        });
    }
};

const setupAdmin = async (req, res) => {
    try {
        // Check if admin already exists
        const existingAdmin = await User.findOne({ 
            $or: [
                { role: 'admin' },
                { email: 'acadify.online@gmail.com' }
            ]
        });
        if (existingAdmin) {
            return res.status(200).json({
                success: true,
                message: 'Admin already exists'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 12);

        // Create admin user
        const adminUser = new User({
            fullName: 'Admin User',
            email: 'acadify.online@gmail.com',
            password: hashedPassword,
            phoneNumber: '123-456-7890',
            role: 'admin',
            isVerified: true,
            isActive: true,
            approvalStatus: "approved"
        });

        await adminUser.save();

        return res.status(201).json({
            success: true,
            message: 'Admin user created successfully',
            admin: {
                id: adminUser._id,
                fullName: adminUser.fullName,
                email: adminUser.email,
                role: adminUser.role
            }
        });

    } catch (error) {
        console.error("Admin setup error:", error);
        return res.status(500).json({
            success: false,
            message: 'Failed to setup admin user',
            error: error.message
        });
    }
};

module.exports = AuthController;
module.exports.setupAdmin = setupAdmin;