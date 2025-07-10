const validator = require('validator');
const logger = require('./logger');

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateEmail = (email) => {
    try {
        if (!email || typeof email !== 'string') {
            return false;
        }

        // Basic format validation
        if (!validator.isEmail(email)) {
            return false;
        }

        // Additional checks
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(email)) {
            return false;
        }

        // Check for common invalid patterns
        const invalidPatterns = [
            /\.{2,}/, // Multiple consecutive dots
            /^\./, // Starting with dot
            /\.$/, // Ending with dot
            /@\./, // @ followed by dot
            /\.@/, // Dot followed by @
        ];

        return !invalidPatterns.some(pattern => pattern.test(email));
    } catch (error) {
        logger.error('Email validation error:', error);
        return false;
    }
};

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @param {string} country - Country code (default: 'IN')
 * @returns {boolean} - True if valid, false otherwise
 */
const validatePhone = (phone, country = 'IN') => {
    try {
        if (!phone || typeof phone !== 'string') {
            return false;
        }

        // Remove all non-digit characters for validation
        const digitsOnly = phone.replace(/\D/g, '');

        // Flexible validation for development and testing
        // Allow any phone number with 7-15 digits for international compatibility
        return digitsOnly.length >= 7 && digitsOnly.length <= 15;
    } catch (error) {
        logger.error('Phone validation error:', error);
        return false;
    }
};

/**
 * Validate password strength
 * @param {string} password - Password to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validatePassword = (password) => {
    try {
        if (!password || typeof password !== 'string') {
            return false;
        }

        // Minimum 8 characters
        if (password.length < 8) {
            return false;
        }

        // Must contain at least one lowercase letter
        if (!/[a-z]/.test(password)) {
            return false;
        }

        // Must contain at least one uppercase letter
        if (!/[A-Z]/.test(password)) {
            return false;
        }

        // Must contain at least one number
        if (!/\d/.test(password)) {
            return false;
        }

        // Must contain at least one special character
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
            return false;
        }

        return true;
    } catch (error) {
        logger.error('Password validation error:', error);
        return false;
    }
};

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @param {object} options - Validation options
 * @returns {boolean} - True if valid, false otherwise
 */
const validateUrl = (url, options = {}) => {
    try {
        if (!url || typeof url !== 'string') {
            return false;
        }

        const {
            requireProtocol = false,
            protocols = ['http', 'https'],
            allowLocalhost = true,
            allowIP = true
        } = options;

        // Use validator.js for basic URL validation
        const validatorOptions = {
            protocols,
            require_protocol: requireProtocol,
            allow_underscores: true,
            allow_trailing_dot: false,
            allow_protocol_relative_urls: false
        };

        if (!validator.isURL(url, validatorOptions)) {
            return false;
        }

        // Additional checks
        try {
            const urlObj = new URL(url);
            
            // Check localhost restriction
            if (!allowLocalhost && (
                urlObj.hostname === 'localhost' ||
                urlObj.hostname === '127.0.0.1' ||
                urlObj.hostname.endsWith('.local')
            )) {
                return false;
            }

            // Check IP address restriction
            if (!allowIP && validator.isIP(urlObj.hostname)) {
                return false;
            }

            return true;
        } catch (urlError) {
            return false;
        }
    } catch (error) {
        logger.error('URL validation error:', error);
        return false;
    }
};

/**
 * Validate MongoDB ObjectId
 * @param {string} id - ObjectId to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const validateObjectId = (id) => {
    try {
        if (!id || typeof id !== 'string') {
            return false;
        }

        // MongoDB ObjectId is 24 character hex string
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        return objectIdRegex.test(id);
    } catch (error) {
        logger.error('ObjectId validation error:', error);
        return false;
    }
};

/**
 * Validate date
 * @param {string|Date} date - Date to validate
 * @param {object} options - Validation options
 * @returns {boolean} - True if valid, false otherwise
 */
const validateDate = (date, options = {}) => {
    try {
        if (!date) {
            return false;
        }

        const {
            allowPast = true,
            allowFuture = true,
            minDate = null,
            maxDate = null,
            format = null
        } = options;

        let dateObj;

        if (date instanceof Date) {
            dateObj = date;
        } else if (typeof date === 'string') {
            if (format) {
                // Validate against specific format if provided
                if (!validator.isDate(date, { format })) {
                    return false;
                }
            }
            dateObj = new Date(date);
        } else {
            return false;
        }

        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
            return false;
        }

        const now = new Date();

        // Check past/future restrictions
        if (!allowPast && dateObj < now) {
            return false;
        }

        if (!allowFuture && dateObj > now) {
            return false;
        }

        // Check min/max date restrictions
        if (minDate && dateObj < new Date(minDate)) {
            return false;
        }

        if (maxDate && dateObj > new Date(maxDate)) {
            return false;
        }

        return true;
    } catch (error) {
        logger.error('Date validation error:', error);
        return false;
    }
};

/**
 * Validate number within range
 * @param {number|string} value - Value to validate
 * @param {object} options - Validation options
 * @returns {boolean} - True if valid, false otherwise
 */
const validateNumber = (value, options = {}) => {
    try {
        const {
            min = null,
            max = null,
            allowFloat = true,
            allowNegative = true
        } = options;

        let num;

        if (typeof value === 'number') {
            num = value;
        } else if (typeof value === 'string') {
            if (allowFloat) {
                num = parseFloat(value);
            } else {
                num = parseInt(value, 10);
            }
        } else {
            return false;
        }

        // Check if number is valid
        if (isNaN(num) || !isFinite(num)) {
            return false;
        }

        // Check negative restriction
        if (!allowNegative && num < 0) {
            return false;
        }

        // Check float restriction
        if (!allowFloat && num % 1 !== 0) {
            return false;
        }

        // Check min/max restrictions
        if (min !== null && num < min) {
            return false;
        }

        if (max !== null && num > max) {
            return false;
        }

        return true;
    } catch (error) {
        logger.error('Number validation error:', error);
        return false;
    }
};

/**
 * Validate string length and content
 * @param {string} str - String to validate
 * @param {object} options - Validation options
 * @returns {boolean} - True if valid, false otherwise
 */
const validateString = (str, options = {}) => {
    try {
        if (typeof str !== 'string') {
            return false;
        }

        const {
            minLength = 0,
            maxLength = null,
            allowEmpty = true,
            trim = false,
            pattern = null,
            blacklist = null,
            whitelist = null
        } = options;

        let validationStr = trim ? str.trim() : str;

        // Check empty restriction
        if (!allowEmpty && validationStr.length === 0) {
            return false;
        }

        // Check length restrictions
        if (validationStr.length < minLength) {
            return false;
        }

        if (maxLength !== null && validationStr.length > maxLength) {
            return false;
        }

        // Check pattern
        if (pattern && !pattern.test(validationStr)) {
            return false;
        }

        // Check blacklist
        if (blacklist && blacklist.some(item => validationStr.includes(item))) {
            return false;
        }

        // Check whitelist
        if (whitelist && !whitelist.every(item => validationStr.includes(item))) {
            return false;
        }

        return true;
    } catch (error) {
        logger.error('String validation error:', error);
        return false;
    }
};

/**
 * Validate file upload
 * @param {object} file - File object to validate
 * @param {object} options - Validation options
 * @returns {boolean} - True if valid, false otherwise
 */
const validateFile = (file, options = {}) => {
    try {
        if (!file || typeof file !== 'object') {
            return false;
        }

        const {
            allowedMimeTypes = [],
            allowedExtensions = [],
            maxSize = null,
            minSize = 0
        } = options;

        // Check if file has required properties
        if (!file.mimetype || !file.originalname || file.size === undefined) {
            return false;
        }

        // Check mime type
        if (allowedMimeTypes.length > 0 && !allowedMimeTypes.includes(file.mimetype)) {
            return false;
        }

        // Check file extension
        if (allowedExtensions.length > 0) {
            const extension = file.originalname.toLowerCase().split('.').pop();
            if (!allowedExtensions.includes(`.${extension}`)) {
                return false;
            }
        }

        // Check file size
        if (file.size < minSize) {
            return false;
        }

        if (maxSize !== null && file.size > maxSize) {
            return false;
        }

        return true;
    } catch (error) {
        logger.error('File validation error:', error);
        return false;
    }
};

/**
 * Validate array
 * @param {array} arr - Array to validate
 * @param {object} options - Validation options
 * @returns {boolean} - True if valid, false otherwise
 */
const validateArray = (arr, options = {}) => {
    try {
        if (!Array.isArray(arr)) {
            return false;
        }

        const {
            minLength = 0,
            maxLength = null,
            itemValidator = null,
            allowDuplicates = true,
            allowEmpty = true
        } = options;

        // Check empty restriction
        if (!allowEmpty && arr.length === 0) {
            return false;
        }

        // Check length restrictions
        if (arr.length < minLength) {
            return false;
        }

        if (maxLength !== null && arr.length > maxLength) {
            return false;
        }

        // Check duplicates
        if (!allowDuplicates) {
            const uniqueItems = new Set(arr);
            if (uniqueItems.size !== arr.length) {
                return false;
            }
        }

        // Validate each item
        if (itemValidator && typeof itemValidator === 'function') {
            return arr.every(item => itemValidator(item));
        }

        return true;
    } catch (error) {
        logger.error('Array validation error:', error);
        return false;
    }
};

module.exports = {
    validateEmail,
    validatePhone,
    validatePassword,
    validateUrl,
    validateObjectId,
    validateDate,
    validateNumber,
    validateString,
    validateFile,
    validateArray
};
