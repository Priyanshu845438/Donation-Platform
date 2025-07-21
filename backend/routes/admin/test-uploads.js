
const express = require("express");
const { profileUpload, campaignImageUpload, campaignDocumentUpload, campaignProofUpload, brandingUpload } = require("../../middleware/upload");
const authMiddleware = require("../../middleware/auth");
const { createSuccessResponse, createErrorResponse } = require("../../utils/errorHandler");

const router = express.Router();

// Test profile image upload
router.post("/test-profile-upload",
    authMiddleware(["admin"]),
    profileUpload.single("profileImage"),
    (req, res) => {
        if (!req.file) {
            return createErrorResponse(res, 400, "No file uploaded");
        }
        return createSuccessResponse(res, 200, {
            message: "Profile image upload test successful",
            file: {
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size
            }
        });
    }
);

// Test campaign image upload
router.post("/test-campaign-images",
    authMiddleware(["admin"]),
    campaignImageUpload.array("campaignImages", 5),
    (req, res) => {
        if (!req.files || req.files.length === 0) {
            return createErrorResponse(res, 400, "No files uploaded");
        }
        return createSuccessResponse(res, 200, {
            message: "Campaign images upload test successful",
            files: req.files.map(file => ({
                filename: file.filename,
                path: file.path,
                size: file.size
            }))
        });
    }
);

// Test campaign documents upload
router.post("/test-campaign-documents",
    authMiddleware(["admin"]),
    campaignDocumentUpload.array("documents", 5),
    (req, res) => {
        if (!req.files || req.files.length === 0) {
            return createErrorResponse(res, 400, "No files uploaded");
        }
        return createSuccessResponse(res, 200, {
            message: "Campaign documents upload test successful",
            files: req.files.map(file => ({
                filename: file.filename,
                path: file.path,
                size: file.size
            }))
        });
    }
);

// Test campaign proof upload
router.post("/test-campaign-proof",
    authMiddleware(["admin"]),
    campaignProofUpload.array("proofDocs", 5),
    (req, res) => {
        if (!req.files || req.files.length === 0) {
            return createErrorResponse(res, 400, "No files uploaded");
        }
        return createSuccessResponse(res, 200, {
            message: "Campaign proof upload test successful",
            files: req.files.map(file => ({
                filename: file.filename,
                path: file.path,
                size: file.size
            }))
        });
    }
);

// Test branding upload
router.post("/test-branding-logo",
    authMiddleware(["admin"]),
    brandingUpload.single("logo"),
    (req, res) => {
        if (!req.file) {
            return createErrorResponse(res, 400, "No file uploaded");
        }
        return createSuccessResponse(res, 200, {
            message: "Branding logo upload test successful",
            file: {
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size
            }
        });
    }
);

module.exports = router;
