
const validator = require('validator');

class Validators {
    static validateEmail(email) {
        if (!email || !validator.isEmail(email)) {
            throw new Error('Please provide a valid email address');
        }
        return true;
    }

    static validatePassword(password) {
        if (!password || password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        return true;
    }

    static validatePhoneNumber(phone) {
        if (!phone || !validator.isMobilePhone(phone, 'any')) {
            throw new Error('Please provide a valid phone number');
        }
        return true;
    }

    static validateObjectId(id) {
        if (!id || !validator.isMongoId(id)) {
            throw new Error('Please provide a valid ID');
        }
        return true;
    }

    static validateRole(role) {
        const validRoles = ['ngo', 'company', 'admin', 'donor'];
        if (!role || !validRoles.includes(role.toLowerCase())) {
            throw new Error('Please provide a valid role');
        }
        return true;
    }

    static sanitizeInput(input) {
        if (typeof input === 'string') {
            return validator.escape(input.trim());
        }
        return input;
    }
}

module.exports = Validators;
