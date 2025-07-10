const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Company = require('../models/Company');
const NGO = require('../models/NGO');
const logger = require('../utils/logger');
const { validateEmail, validatePassword, validatePhone } = require('../utils/validators');
const { sanitizeInput } = require('../utils/sanitizer');

/**
 * User registration
 */
exports.register = async (req, res) => {
    try {
        const { fullName, email, phoneNumber, password, role } = req.body;

        // Sanitize inputs
        const sanitizedData = {
            fullName: sanitizeInput(fullName),
            email: sanitizeInput(email).toLowerCase(),
            phoneNumber: sanitizeInput(phoneNumber),
            role: sanitizeInput(role).toLowerCase()
        };

        // Validate inputs
        if (!sanitizedData.fullName || !sanitizedData.email || !sanitizedData.phoneNumber || !password || !sanitizedData.role) {
            return res.status(400).json({
                success: false,
                message: 'All fields are required'
            });
        }

        if (!validateEmail(sanitizedData.email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        if (!validatePassword(password)) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
            });
        }

        if (!validatePhone(sanitizedData.phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format'
            });
        }

        const allowedRoles = process.env.NODE_ENV === 'development' 
            ? ['user', 'company', 'ngo', 'admin'] 
            : ['user', 'company', 'ngo'];
        if (!allowedRoles.includes(sanitizedData.role)) {
            return res.status(400).json({
                success: false,
                message: `Invalid role. Must be ${allowedRoles.join(', ')}`
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: sanitizedData.email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User already exists with this email'
            });
        }

        // Get client IP and user agent (password will be hashed by pre-save middleware)
        const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';

        // Create user
        const newUser = await User.create({
            fullName: sanitizedData.fullName,
            email: sanitizedData.email,
            phoneNumber: sanitizedData.phoneNumber,
            password: password, // Let the pre-save middleware handle hashing
            role: sanitizedData.role,
            isActive: true,
            metadata: {
                registrationIp: clientIp,
                userAgent: userAgent,
                referralSource: 'direct'
            }
        });

        let profileData = null;

        // Create role-specific profile
        if (sanitizedData.role === 'company') {
            profileData = await Company.create({
                userId: newUser._id,
                companyName: sanitizedData.fullName,
                companyEmail: sanitizedData.email,
                companyPhoneNumber: sanitizedData.phoneNumber,
                registrationNumber: 'Pending',
                companyAddress: 'Not provided',
                ceoName: 'Not provided',
                ceoContactNumber: 'Not provided',
                ceoEmail: 'Not provided',
                companyType: 'Other',
                numberOfEmployees: 1,
                companyLogo: '',
                isActive: true
            });
        } else if (sanitizedData.role === 'ngo') {
            profileData = await NGO.create({
                userId: newUser._id,
                ngoName: sanitizedData.fullName,
                email: sanitizedData.email,
                contactNumber: sanitizedData.phoneNumber,
                registrationNumber: 'Pending',
                registeredYear: new Date().getFullYear(),
                address: {
                    street: '',
                    city: '',
                    state: '',
                    postalCode: '',
                    country: 'India'
                },
                website: '', // Empty string is valid, "Not provided" fails validation
                authorizedPerson: {
                    name: 'Not provided',
                    phone: '9999999999', // Valid phone format instead of "Not provided"
                    email: 'not-provided@example.com', // Valid email format
                    designation: 'Director'
                },
                panNumber: 'Not provided',
                tanNumber: 'Not provided',
                gstNumber: 'Not provided',
                numberOfEmployees: 1,
                ngoType: 'Trust',
                is80GCertified: false,
                is12ACertified: false,
                fcraRegistered: false,
                bankDetails: {
                    accountHolderName: 'Not provided',
                    accountNumber: 'Not provided',
                    ifscCode: 'Not provided',
                    bankName: 'Not provided',
                    branchName: 'Not provided',
                    accountType: 'Current'
                },
                workingAreas: [],
                targetBeneficiaries: [],
                logo: '',
                isActive: true
            });
        }

        logger.info(`User registered successfully: ${sanitizedData.email} (${sanitizedData.role})`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: newUser._id,
                    fullName: newUser.fullName,
                    email: newUser.email,
                    phoneNumber: newUser.phoneNumber,
                    role: newUser.role,
                    createdAt: newUser.createdAt
                },
                profile: profileData
            }
        });

    } catch (error) {
        logger.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * User login
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Sanitize inputs
        const sanitizedEmail = sanitizeInput(email).toLowerCase();

        // Validate inputs
        if (!sanitizedEmail || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        if (!validateEmail(sanitizedEmail)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Find user (include password for login verification)
        const user = await User.findOne({ email: sanitizedEmail }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
        );

        // Update last login
        await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

        logger.info(`User logged in successfully: ${sanitizedEmail}`);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                user: {
                    id: user._id,
                    fullName: user.fullName,
                    email: user.email,
                    phoneNumber: user.phoneNumber,
                    role: user.role,
                    createdAt: user.createdAt,
                    lastLogin: new Date()
                }
            }
        });

    } catch (error) {
        logger.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Get user profile
 */
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        let profileData = null;

        // Get role-specific profile
        if (user.role === 'company') {
            profileData = await Company.findOne({ userId });
        } else if (user.role === 'ngo') {
            profileData = await NGO.findOne({ userId });
        }

        res.status(200).json({
            success: true,
            data: {
                user,
                profile: profileData
            }
        });

    } catch (error) {
        logger.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Update user profile
 */
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const updates = req.body;

        // Remove sensitive fields
        delete updates.password;
        delete updates.role;
        delete updates.email;
        delete updates.createdAt;
        delete updates.updatedAt;

        // Sanitize inputs
        const sanitizedUpdates = {};
        for (const key in updates) {
            if (updates[key] !== undefined && updates[key] !== null) {
                sanitizedUpdates[key] = sanitizeInput(updates[key]);
            }
        }

        // Validate phone number if provided
        if (sanitizedUpdates.phoneNumber && !validatePhone(sanitizedUpdates.phoneNumber)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number format'
            });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { ...sanitizedUpdates, updatedAt: new Date() },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        logger.info(`Profile updated for user: ${userId}`);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            data: user
        });

    } catch (error) {
        logger.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Change password
 */
exports.changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        // Validate inputs
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (!validatePassword(newPassword)) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 8 characters long and contain uppercase, lowercase, number, and special character'
            });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Verify current password
        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Hash new password
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Update password
        await User.findByIdAndUpdate(userId, { 
            password: hashedNewPassword,
            updatedAt: new Date()
        });

        logger.info(`Password changed for user: ${userId}`);

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        logger.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to change password',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Logout user (client-side token invalidation)
 */
exports.logout = async (req, res) => {
    try {
        const userId = req.user.id;

        // Update last logout time
        await User.findByIdAndUpdate(userId, { lastLogout: new Date() });

        logger.info(`User logged out: ${userId}`);

        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });

    } catch (error) {
        logger.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
