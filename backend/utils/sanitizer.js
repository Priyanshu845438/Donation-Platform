const validator = require('validator');
const logger = require('./logger');

/**
 * Sanitize input string by removing/escaping potentially harmful content
 * @param {string} input - Input string to sanitize
 * @param {object} options - Sanitization options
 * @returns {string} - Sanitized string
 */
const sanitizeInput = (input, options = {}) => {
    try {
        if (typeof input !== 'string') {
            return '';
        }

        const {
            removeHTML = true,
            removeSQLKeywords = true,
            removeJSKeywords = true,
            allowEmptyString = true,
            maxLength = null,
            normalizeSpaces = true,
            removeSpecialChars = false,
            allowedChars = null
        } = options;

        let sanitized = input;

        // Remove HTML tags and entities
        if (removeHTML) {
            sanitized = validator.stripLow(sanitized);
            sanitized = validator.escape(sanitized);
            // Remove remaining HTML tags
            sanitized = sanitized.replace(/<[^>]*>/g, '');
            // Decode HTML entities
            sanitized = sanitized
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&amp;/g, '&')
                .replace(/&quot;/g, '"')
                .replace(/&#x27;/g, "'")
                .replace(/&#x2F;/g, '/');
        }

        // Remove SQL injection keywords
        if (removeSQLKeywords) {
            const sqlKeywords = [
                'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'DROP', 'CREATE', 'ALTER',
                'EXEC', 'EXECUTE', 'UNION', 'SCRIPT', 'JAVASCRIPT', 'VBSCRIPT',
                'ONLOAD', 'ONERROR', 'ONCLICK', 'EVAL', 'EXPRESSION'
            ];
            
            const sqlPattern = new RegExp(`\\b(${sqlKeywords.join('|')})\\b`, 'gi');
            sanitized = sanitized.replace(sqlPattern, '');
        }

        // Remove JavaScript keywords and patterns
        if (removeJSKeywords) {
            const jsPatterns = [
                /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
                /javascript:/gi,
                /vbscript:/gi,
                /data:/gi,
                /onload=/gi,
                /onerror=/gi,
                /onclick=/gi,
                /onmouseover=/gi,
                /eval\s*\(/gi,
                /setTimeout\s*\(/gi,
                /setInterval\s*\(/gi,
                /Function\s*\(/gi
            ];
            
            jsPatterns.forEach(pattern => {
                sanitized = sanitized.replace(pattern, '');
            });
        }

        // Normalize whitespace
        if (normalizeSpaces) {
            sanitized = sanitized.replace(/\s+/g, ' ').trim();
        }

        // Remove special characters
        if (removeSpecialChars) {
            sanitized = sanitized.replace(/[^\w\s.-]/g, '');
        }

        // Apply allowed characters filter
        if (allowedChars) {
            const allowedPattern = new RegExp(`[^${allowedChars}]`, 'g');
            sanitized = sanitized.replace(allowedPattern, '');
        }

        // Apply length limit
        if (maxLength && sanitized.length > maxLength) {
            sanitized = sanitized.substring(0, maxLength);
        }

        // Handle empty string
        if (!allowEmptyString && sanitized.trim() === '') {
            return '';
        }

        return sanitized;
    } catch (error) {
        logger.error('Input sanitization error:', error);
        return '';
    }
};

/**
 * Sanitize email address
 * @param {string} email - Email to sanitize
 * @returns {string} - Sanitized email
 */
const sanitizeEmail = (email) => {
    try {
        if (typeof email !== 'string') {
            return '';
        }

        let sanitized = email.trim().toLowerCase();
        
        // Remove potential harmful characters
        sanitized = sanitized.replace(/[<>"\\']/g, '');
        
        // Validate and normalize
        if (validator.isEmail(sanitized)) {
            return validator.normalizeEmail(sanitized);
        }
        
        return '';
    } catch (error) {
        logger.error('Email sanitization error:', error);
        return '';
    }
};

/**
 * Sanitize phone number
 * @param {string} phone - Phone number to sanitize
 * @returns {string} - Sanitized phone number
 */
const sanitizePhone = (phone) => {
    try {
        if (typeof phone !== 'string') {
            return '';
        }

        // Remove all non-digit characters except + and spaces
        let sanitized = phone.replace(/[^\d\+\s\-\(\)]/g, '');
        
        // Remove excessive spaces and normalize
        sanitized = sanitized.replace(/\s+/g, ' ').trim();
        
        return sanitized;
    } catch (error) {
        logger.error('Phone sanitization error:', error);
        return '';
    }
};

/**
 * Sanitize URL
 * @param {string} url - URL to sanitize
 * @returns {string} - Sanitized URL
 */
const sanitizeUrl = (url) => {
    try {
        if (typeof url !== 'string') {
            return '';
        }

        let sanitized = url.trim();
        
        // Remove javascript: and data: protocols
        if (/^(javascript|data|vbscript):/i.test(sanitized)) {
            return '';
        }
        
        // Add protocol if missing
        if (!/^https?:\/\//i.test(sanitized) && !sanitized.startsWith('//')) {
            sanitized = 'https://' + sanitized;
        }
        
        try {
            const urlObj = new URL(sanitized);
            return urlObj.toString();
        } catch (urlError) {
            return '';
        }
    } catch (error) {
        logger.error('URL sanitization error:', error);
        return '';
    }
};

/**
 * Sanitize filename for file uploads
 * @param {string} filename - Filename to sanitize
 * @returns {string} - Sanitized filename
 */
const sanitizeFilename = (filename) => {
    try {
        if (typeof filename !== 'string') {
            return 'file';
        }

        let sanitized = filename.trim();
        
        // Remove path traversal attempts
        sanitized = sanitized.replace(/\.\./g, '');
        sanitized = sanitized.replace(/[\/\\]/g, '');
        
        // Remove potentially harmful characters
        sanitized = sanitized.replace(/[<>:"|?*]/g, '');
        
        // Remove control characters
        sanitized = sanitized.replace(/[\x00-\x1f\x80-\x9f]/g, '');
        
        // Limit length
        if (sanitized.length > 255) {
            const extension = sanitized.substring(sanitized.lastIndexOf('.'));
            const baseName = sanitized.substring(0, 255 - extension.length);
            sanitized = baseName + extension;
        }
        
        // Ensure not empty
        if (sanitized === '') {
            sanitized = 'file';
        }
        
        return sanitized;
    } catch (error) {
        logger.error('Filename sanitization error:', error);
        return 'file';
    }
};

/**
 * Sanitize search query
 * @param {string} query - Search query to sanitize
 * @returns {string} - Sanitized search query
 */
const sanitizeSearchQuery = (query) => {
    try {
        if (typeof query !== 'string') {
            return '';
        }

        let sanitized = query.trim();
        
        // Remove SQL injection attempts
        const sqlPatterns = [
            /['"`;\\]/g,
            /(select|insert|update|delete|drop|create|alter|exec|execute|union)/gi
        ];
        
        sqlPatterns.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        
        // Remove excessive whitespace
        sanitized = sanitized.replace(/\s+/g, ' ').trim();
        
        // Limit length
        if (sanitized.length > 100) {
            sanitized = sanitized.substring(0, 100);
        }
        
        return sanitized;
    } catch (error) {
        logger.error('Search query sanitization error:', error);
        return '';
    }
};

/**
 * Sanitize object recursively
 * @param {object} obj - Object to sanitize
 * @param {object} options - Sanitization options
 * @returns {object} - Sanitized object
 */
const sanitizeObject = (obj, options = {}) => {
    try {
        if (obj === null || obj === undefined) {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => sanitizeObject(item, options));
        }

        if (typeof obj === 'object') {
            const sanitizedObj = {};
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    const sanitizedKey = sanitizeInput(key, { removeHTML: true, maxLength: 100 });
                    sanitizedObj[sanitizedKey] = sanitizeObject(obj[key], options);
                }
            }
            return sanitizedObj;
        }

        if (typeof obj === 'string') {
            return sanitizeInput(obj, options);
        }

        return obj;
    } catch (error) {
        logger.error('Object sanitization error:', error);
        return {};
    }
};

/**
 * Sanitize HTML content (for rich text)
 * @param {string} html - HTML content to sanitize
 * @param {object} options - Sanitization options
 * @returns {string} - Sanitized HTML
 */
const sanitizeHTML = (html, options = {}) => {
    try {
        if (typeof html !== 'string') {
            return '';
        }

        const {
            allowedTags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
            allowedAttributes = {},
            removeScripts = true,
            removeStyles = true
        } = options;

        let sanitized = html;

        // Remove script tags
        if (removeScripts) {
            sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        }

        // Remove style tags
        if (removeStyles) {
            sanitized = sanitized.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
        }

        // Remove event handlers
        sanitized = sanitized.replace(/\s*on\w+\s*=\s*"[^"]*"/gi, '');
        sanitized = sanitized.replace(/\s*on\w+\s*=\s*'[^']*'/gi, '');

        // Remove javascript: and data: protocols
        sanitized = sanitized.replace(/href\s*=\s*["']javascript:[^"']*["']/gi, '');
        sanitized = sanitized.replace(/src\s*=\s*["']data:[^"']*["']/gi, '');

        return sanitized;
    } catch (error) {
        logger.error('HTML sanitization error:', error);
        return '';
    }
};

/**
 * Sanitize number input
 * @param {string|number} input - Number input to sanitize
 * @param {object} options - Sanitization options
 * @returns {number|null} - Sanitized number or null if invalid
 */
const sanitizeNumber = (input, options = {}) => {
    try {
        const {
            allowFloat = true,
            min = null,
            max = null,
            defaultValue = null
        } = options;

        let num;

        if (typeof input === 'number') {
            num = input;
        } else if (typeof input === 'string') {
            // Remove non-numeric characters except decimal point and negative sign
            const cleaned = input.replace(/[^\d.-]/g, '');
            
            if (allowFloat) {
                num = parseFloat(cleaned);
            } else {
                num = parseInt(cleaned, 10);
            }
        } else {
            return defaultValue;
        }

        if (isNaN(num) || !isFinite(num)) {
            return defaultValue;
        }

        // Apply min/max constraints
        if (min !== null && num < min) {
            num = min;
        }
        
        if (max !== null && num > max) {
            num = max;
        }

        return num;
    } catch (error) {
        logger.error('Number sanitization error:', error);
        return defaultValue || null;
    }
};

module.exports = {
    sanitizeInput,
    sanitizeEmail,
    sanitizePhone,
    sanitizeUrl,
    sanitizeFilename,
    sanitizeSearchQuery,
    sanitizeObject,
    sanitizeHTML,
    sanitizeNumber
};
