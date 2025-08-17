
const express = require("express");
const Settings = require("../../models/Settings");
const { createSuccessResponse, createErrorResponse } = require("../../utils/errorHandler");

const router = express.Router();

// Get public settings (theme, branding, etc.)
router.get("/", async (req, res) => {
    try {
        // Get public settings that don't require authentication
        const settings = await Settings.findOne({});
        
        const publicSettings = {
            theme: settings?.theme || {
                primaryColor: "#3B82F6",
                secondaryColor: "#10B981",
                accentColor: "#F59E0B",
                backgroundColor: "#F9FAFB",
                textColor: "#111827",
                mode: "light"
            },
            branding: settings?.branding || {
                siteName: "Donation Platform",
                logo: "",
                favicon: "",
                tagline: "Making a difference together"
            },
            features: settings?.features || {
                enableRegistration: true,
                enableDonations: true,
                enableCampaigns: true
            },
            contact: settings?.contact || {
                email: "contact@donationplatform.com",
                phone: "",
                address: ""
            }
        };

        return createSuccessResponse(res, 200, {
            message: "Public settings retrieved successfully",
            settings: publicSettings
        });
    } catch (error) {
        console.error("Get public settings error:", error);
        return createErrorResponse(res, 500, "Failed to retrieve settings", error.message);
    }
});

module.exports = router;
