
const express = require("express");
const { profileUpload, brandingUpload } = require("../../middleware/upload");
const AdminController = require("../../controllers/adminController");
const authMiddleware = require("../../middleware/auth");

const router = express.Router();

// Admin profile image upload
router.put(
    "/profile-image",
    authMiddleware(["admin"]),
    profileUpload.single("profileImage"),
    AdminController.uploadAdminProfileImage
);

// User profile image upload by admin
router.put(
    "/users/:userId/profile-image",
    authMiddleware(["admin"]),
    profileUpload.single("profileImage"),
    AdminController.uploadUserProfileImage
);

// Branding uploads
router.put(
    "/branding/logo",
    authMiddleware(["admin"]),
    brandingUpload.single("logo"),
    AdminController.uploadLogo
);

router.put(
    "/branding/favicon",
    authMiddleware(["admin"]),
    brandingUpload.single("favicon"),
    AdminController.uploadFavicon
);

module.exports = router;
