const express = require('express');
const {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout
} = require('../controllers/authController');
const { userMiddleware } = require('../middleware/auth');
const {
    validateRegistration,
    validateLogin,
    validatePasswordChange
} = require('../middleware/validation');
const {
    registrationActivityLogger,
    loginActivityLogger,
    logoutActivityLogger,
    profileUpdateActivityLogger,
    passwordChangeActivityLogger
} = require('../middleware/activityLogger');
const { registrationLimiter, authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Public routes
router.post('/register',
    registrationLimiter,
    validateRegistration,
    registrationActivityLogger,
    register
);

router.post('/login',
    authLimiter,
    validateLogin,
    loginActivityLogger,
    login
);

// Protected routes
router.use(userMiddleware);

router.get('/profile', getProfile);

router.patch('/profile',
    profileUpdateActivityLogger,
    updateProfile
);

router.patch('/change-password',
    validatePasswordChange,
    passwordChangeActivityLogger,
    changePassword
);

router.post('/logout',
    logoutActivityLogger,
    logout
);

module.exports = router;
