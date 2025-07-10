const jwt = require('jsonwebtoken');
const User = require('../models/User');
const logger = require('../utils/logger');

const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

/**
 * Authentication middleware
 */
const authMiddleware = (allowedRoles = []) => async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.'
            });
        }

        // Extract the token
        const token = authHeader.split(' ')[1];

        // Verify the token
        const decoded = jwt.verify(token, SECRET_KEY);

        // Fetch user from database to ensure user still exists and is active
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.'
            });
        }

        if (!user.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Account is deactivated. Please contact support.'
            });
        }

        // Check if user role is allowed
        if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Insufficient permissions.'
            });
        }

        // Attach user data to request
        req.user = {
            id: user._id.toString(),
            email: user.email,
            role: user.role,
            fullName: user.fullName
        };

        next();
    } catch (error) {
        logger.error('Authentication error:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired.'
            });
        }

        return res.status(500).json({
            success: false,
            message: 'Authentication failed.'
        });
    }
};

/**
 * Optional authentication middleware (doesn't require token)
 */
const optionalAuthMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, SECRET_KEY);

        const user = await User.findById(decoded.userId).select('-password');

        if (user && user.isActive) {
            req.user = {
                id: user._id.toString(),
                email: user.email,
                role: user.role,
                fullName: user.fullName
            };
        }

        next();
    } catch (error) {
        // Continue without authentication for optional middleware
        next();
    }
};

/**
 * Admin only middleware
 */
const adminMiddleware = authMiddleware(['admin']);

/**
 * Company or Admin middleware
 */
const companyMiddleware = authMiddleware(['company', 'admin']);

/**
 * NGO or Admin middleware
 */
const ngoMiddleware = authMiddleware(['ngo', 'admin']);

/**
 * User, Company, NGO or Admin middleware (authenticated users)
 */
const userMiddleware = authMiddleware(['user', 'company', 'ngo', 'admin']);

module.exports = {
    authMiddleware,
    optionalAuthMiddleware,
    adminMiddleware,
    companyMiddleware,
    ngoMiddleware,
    userMiddleware
};