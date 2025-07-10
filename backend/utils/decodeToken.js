const jwt = require('jsonwebtoken');
const logger = require('./logger');

const SECRET_KEY = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';

/**
 * Decode JWT token without verification
 * @param {string} token - JWT token to decode
 * @returns {object|null} - Decoded token payload or null if invalid
 */
const decodeToken = (token) => {
    try {
        if (!token) {
            return null;
        }

        // Remove 'Bearer ' prefix if present
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

        // Decode without verification
        const decoded = jwt.decode(cleanToken);
        return decoded;
    } catch (error) {
        logger.error('Token decode error:', error);
        return null;
    }
};

/**
 * Verify and decode JWT token
 * @param {string} token - JWT token to verify and decode
 * @returns {object|null} - Verified token payload or null if invalid
 */
const verifyToken = (token) => {
    try {
        if (!token) {
            return null;
        }

        // Remove 'Bearer ' prefix if present
        const cleanToken = token.startsWith('Bearer ') ? token.slice(7) : token;

        // Verify and decode
        const decoded = jwt.verify(cleanToken, SECRET_KEY);
        return decoded;
    } catch (error) {
        logger.error('Token verification error:', error);
        return null;
    }
};

/**
 * Generate JWT token
 * @param {object} payload - Payload to encode in token
 * @param {string} expiresIn - Token expiration time
 * @returns {string} - Generated JWT token
 */
const generateToken = (payload, expiresIn = '24h') => {
    try {
        const token = jwt.sign(payload, SECRET_KEY, { expiresIn });
        return token;
    } catch (error) {
        logger.error('Token generation error:', error);
        throw new Error('Failed to generate token');
    }
};

/**
 * Check if token is expired
 * @param {string} token - JWT token to check
 * @returns {boolean} - True if token is expired, false otherwise
 */
const isTokenExpired = (token) => {
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) {
            return true;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        return decoded.exp < currentTime;
    } catch (error) {
        logger.error('Token expiration check error:', error);
        return true;
    }
};

/**
 * Get token expiration date
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiration date or null if invalid
 */
const getTokenExpiration = (token) => {
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) {
            return null;
        }

        return new Date(decoded.exp * 1000);
    } catch (error) {
        logger.error('Get token expiration error:', error);
        return null;
    }
};

/**
 * Get time remaining until token expires
 * @param {string} token - JWT token
 * @returns {number|null} - Time remaining in seconds or null if invalid
 */
const getTokenTimeRemaining = (token) => {
    try {
        const decoded = decodeToken(token);
        if (!decoded || !decoded.exp) {
            return null;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const timeRemaining = decoded.exp - currentTime;
        
        return timeRemaining > 0 ? timeRemaining : 0;
    } catch (error) {
        logger.error('Get token time remaining error:', error);
        return null;
    }
};

/**
 * Extract user ID from token
 * @param {string} token - JWT token
 * @returns {string|null} - User ID or null if invalid
 */
const getUserIdFromToken = (token) => {
    try {
        const decoded = decodeToken(token);
        return decoded?.userId || decoded?.id || null;
    } catch (error) {
        logger.error('Get user ID from token error:', error);
        return null;
    }
};

/**
 * Extract user role from token
 * @param {string} token - JWT token
 * @returns {string|null} - User role or null if invalid
 */
const getUserRoleFromToken = (token) => {
    try {
        const decoded = decodeToken(token);
        return decoded?.role || null;
    } catch (error) {
        logger.error('Get user role from token error:', error);
        return null;
    }
};

/**
 * Refresh token if it's about to expire
 * @param {string} token - Current JWT token
 * @param {number} refreshThreshold - Time in seconds before expiration to refresh
 * @returns {string|null} - New token if refreshed, null otherwise
 */
const refreshTokenIfNeeded = (token, refreshThreshold = 3600) => {
    try {
        const timeRemaining = getTokenTimeRemaining(token);
        
        if (timeRemaining && timeRemaining <= refreshThreshold) {
            const decoded = decodeToken(token);
            if (decoded) {
                // Remove exp and iat from payload for new token
                const { exp, iat, ...payload } = decoded;
                return generateToken(payload);
            }
        }
        
        return null;
    } catch (error) {
        logger.error('Refresh token error:', error);
        return null;
    }
};

module.exports = {
    decodeToken,
    verifyToken,
    generateToken,
    isTokenExpired,
    getTokenExpiration,
    getTokenTimeRemaining,
    getUserIdFromToken,
    getUserRoleFromToken,
    refreshTokenIfNeeded
};
