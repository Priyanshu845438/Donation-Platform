const bcrypt = require('bcryptjs');
const logger = require('./logger');

/**
 * Hash a password using bcrypt
 * @param {string} password - Plain text password to hash
 * @param {number} saltRounds - Number of salt rounds (default: 12)
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password, saltRounds = 12) => {
    try {
        if (!password) {
            throw new Error('Password is required');
        }

        if (typeof password !== 'string') {
            throw new Error('Password must be a string');
        }

        if (password.length < 8) {
            throw new Error('Password must be at least 8 characters long');
        }

        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        return hashedPassword;
    } catch (error) {
        logger.error('Password hashing error:', error);
        throw error;
    }
};

/**
 * Compare a plain text password with a hashed password
 * @param {string} password - Plain text password
 * @param {string} hashedPassword - Hashed password to compare against
 * @returns {Promise<boolean>} - True if passwords match, false otherwise
 */
const comparePassword = async (password, hashedPassword) => {
    try {
        if (!password || !hashedPassword) {
            return false;
        }

        if (typeof password !== 'string' || typeof hashedPassword !== 'string') {
            return false;
        }

        const isMatch = await bcrypt.compare(password, hashedPassword);
        return isMatch;
    } catch (error) {
        logger.error('Password comparison error:', error);
        return false;
    }
};

/**
 * Generate a secure random password
 * @param {number} length - Length of the password (default: 12)
 * @param {object} options - Options for password generation
 * @returns {string} - Generated password
 */
const generateSecurePassword = (length = 12, options = {}) => {
    try {
        const {
            includeUppercase = true,
            includeLowercase = true,
            includeNumbers = true,
            includeSymbols = true,
            excludeSimilar = true,
            excludeAmbiguous = true
        } = options;

        let charset = '';
        
        if (includeLowercase) {
            charset += excludeSimilar ? 'abcdefghjkmnpqrstuvwxyz' : 'abcdefghijklmnopqrstuvwxyz';
        }
        
        if (includeUppercase) {
            charset += excludeSimilar ? 'ABCDEFGHJKMNPQRSTUVWXYZ' : 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        }
        
        if (includeNumbers) {
            charset += excludeSimilar ? '23456789' : '0123456789';
        }
        
        if (includeSymbols) {
            charset += excludeAmbiguous ? '!@#$%^&*-_=+[]{}|;:,.<>?' : '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';
        }

        if (charset === '') {
            throw new Error('At least one character type must be included');
        }

        let password = '';
        for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * charset.length);
            password += charset[randomIndex];
        }

        return password;
    } catch (error) {
        logger.error('Password generation error:', error);
        throw error;
    }
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {object} - Validation result with score and feedback
 */
const validatePasswordStrength = (password) => {
    try {
        if (!password || typeof password !== 'string') {
            return {
                isValid: false,
                score: 0,
                feedback: ['Password is required']
            };
        }

        const feedback = [];
        let score = 0;

        // Length check
        if (password.length < 8) {
            feedback.push('Password must be at least 8 characters long');
        } else if (password.length >= 8) {
            score += 1;
        }

        if (password.length >= 12) {
            score += 1;
        }

        // Character type checks
        const hasLowercase = /[a-z]/.test(password);
        const hasUppercase = /[A-Z]/.test(password);
        const hasNumbers = /\d/.test(password);
        const hasSymbols = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password);

        if (!hasLowercase) {
            feedback.push('Password must contain at least one lowercase letter');
        } else {
            score += 1;
        }

        if (!hasUppercase) {
            feedback.push('Password must contain at least one uppercase letter');
        } else {
            score += 1;
        }

        if (!hasNumbers) {
            feedback.push('Password must contain at least one number');
        } else {
            score += 1;
        }

        if (!hasSymbols) {
            feedback.push('Password must contain at least one special character');
        } else {
            score += 1;
        }

        // Common patterns check
        const commonPatterns = [
            /(.)\1{2,}/, // Repeated characters
            /123456|abcdef|qwerty|password/i, // Common sequences
        ];

        const hasCommonPattern = commonPatterns.some(pattern => pattern.test(password));
        if (hasCommonPattern) {
            feedback.push('Password contains common patterns or sequences');
            score = Math.max(0, score - 1);
        }

        // Dictionary words check (basic)
        const commonWords = ['password', 'admin', 'user', 'login', 'welcome', 'test'];
        const hasCommonWord = commonWords.some(word => 
            password.toLowerCase().includes(word.toLowerCase())
        );
        if (hasCommonWord) {
            feedback.push('Password contains common words');
            score = Math.max(0, score - 1);
        }

        const isValid = feedback.length === 0;
        
        let strength;
        if (score <= 2) {
            strength = 'weak';
        } else if (score <= 4) {
            strength = 'medium';
        } else {
            strength = 'strong';
        }

        return {
            isValid,
            score,
            strength,
            feedback
        };
    } catch (error) {
        logger.error('Password validation error:', error);
        return {
            isValid: false,
            score: 0,
            strength: 'weak',
            feedback: ['Error validating password']
        };
    }
};

/**
 * Generate salt for password hashing
 * @param {number} rounds - Number of rounds for salt generation
 * @returns {Promise<string>} - Generated salt
 */
const generateSalt = async (rounds = 12) => {
    try {
        const salt = await bcrypt.genSalt(rounds);
        return salt;
    } catch (error) {
        logger.error('Salt generation error:', error);
        throw error;
    }
};

/**
 * Hash password with provided salt
 * @param {string} password - Plain text password
 * @param {string} salt - Salt to use for hashing
 * @returns {Promise<string>} - Hashed password
 */
const hashPasswordWithSalt = async (password, salt) => {
    try {
        if (!password || !salt) {
            throw new Error('Password and salt are required');
        }

        const hashedPassword = await bcrypt.hash(password, salt);
        return hashedPassword;
    } catch (error) {
        logger.error('Password hashing with salt error:', error);
        throw error;
    }
};

/**
 * Check if a string is already hashed
 * @param {string} password - Password string to check
 * @returns {boolean} - True if already hashed, false otherwise
 */
const isPasswordHashed = (password) => {
    try {
        if (!password || typeof password !== 'string') {
            return false;
        }

        // bcrypt hashes start with $2a$, $2b$, $2x$, or $2y$
        const bcryptPattern = /^\$2[abxy]\$\d{2}\$.{53}$/;
        return bcryptPattern.test(password);
    } catch (error) {
        logger.error('Password hash check error:', error);
        return false;
    }
};

module.exports = {
    hashPassword,
    comparePassword,
    generateSecurePassword,
    validatePasswordStrength,
    generateSalt,
    hashPasswordWithSalt,
    isPasswordHashed
};
