
const express = require("express");
const Settings = require("../../models/Settings");
const authMiddleware = require("../../middleware/auth");
const Activity = require("../../models/Activity");
const { createSuccessResponse, createErrorResponse } = require("../../utils/errorHandler");

const router = express.Router();

// Get all settings
router.get("/", authMiddleware(["admin"]), async (req, res) => {
    try {
        const settings = await Settings.find().sort({ category: 1 });
        
        const settingsMap = {};
        settings.forEach(setting => {
            settingsMap[setting.category] = Object.fromEntries(setting.settings || new Map());
        });

        return createSuccessResponse(res, 200, {
            message: "Settings retrieved successfully",
            settings: settingsMap
        });
    } catch (error) {
        console.error("Get settings error:", error);
        return createErrorResponse(res, 500, "Failed to retrieve settings", error.message);
    }
});

// Get settings by category
router.get("/:category", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { category } = req.params;
        const settings = await Settings.findOne({ category });

        if (!settings) {
            return createErrorResponse(res, 404, "Settings category not found");
        }

        return createSuccessResponse(res, 200, {
            message: "Settings retrieved successfully",
            category,
            settings: Object.fromEntries(settings.settings || new Map())
        });
    } catch (error) {
        console.error("Get category settings error:", error);
        return createErrorResponse(res, 500, "Failed to retrieve settings", error.message);
    }
});

// Update settings
router.put("/", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { category, settings } = req.body;

        if (!category || !settings) {
            return createErrorResponse(res, 400, "Category and settings are required");
        }

        const updatedSettings = await Settings.findOneAndUpdate(
            { category },
            { 
                settings: new Map(Object.entries(settings)),
                updatedBy: req.user.id,
                lastModified: new Date()
            },
            { new: true, upsert: true }
        );

        await Activity.create({
            userId: req.user.id,
            action: "admin_update_settings",
            description: `Admin updated ${category} settings`,
            metadata: { category, settingsKeys: Object.keys(settings) }
        });

        return createSuccessResponse(res, 200, {
            message: "Settings updated successfully",
            category,
            settings: Object.fromEntries(updatedSettings.settings)
        });
    } catch (error) {
        console.error("Update settings error:", error);
        return createErrorResponse(res, 500, "Failed to update settings", error.message);
    }
});

// Update multiple settings
router.put("/bulk", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { settingsData } = req.body;

        if (!settingsData || typeof settingsData !== 'object') {
            return createErrorResponse(res, 400, "Settings data is required");
        }

        const updatePromises = [];
        const updatedCategories = [];

        for (const [category, settings] of Object.entries(settingsData)) {
            updatePromises.push(
                Settings.findOneAndUpdate(
                    { category },
                    { 
                        settings: new Map(Object.entries(settings)),
                        updatedBy: req.user.id,
                        lastModified: new Date()
                    },
                    { new: true, upsert: true }
                )
            );
            updatedCategories.push(category);
        }

        await Promise.all(updatePromises);

        await Activity.create({
            userId: req.user.id,
            action: "admin_bulk_update_settings",
            description: `Admin updated multiple settings categories: ${updatedCategories.join(', ')}`,
            metadata: { categories: updatedCategories }
        });

        return createSuccessResponse(res, 200, {
            message: "Settings updated successfully",
            updatedCategories
        });
    } catch (error) {
        console.error("Update multiple settings error:", error);
        return createErrorResponse(res, 500, "Failed to update settings", error.message);
    }
});

// Reset settings to defaults
router.put("/:category/reset", authMiddleware(["admin"]), async (req, res) => {
    try {
        const { category } = req.params;

        // Default settings for different categories
        const defaultSettings = {
            email: {
                smtp_host: "smtp.gmail.com",
                smtp_port: 587,
                smtp_secure: false,
                from_email: "noreply@example.com",
                enable_notifications: true
            },
            security: {
                password_min_length: 8,
                password_require_uppercase: true,
                password_require_lowercase: true,
                password_require_numbers: true,
                password_require_symbols: false,
                session_timeout: 3600,
                max_login_attempts: 5
            },
            general: {
                site_name: "Donation Platform",
                site_description: "A platform for charitable donations",
                maintenance_mode: false,
                registration_enabled: true
            },
            branding: {
                logo_url: "",
                favicon_url: "",
                primary_color: "#007bff",
                secondary_color: "#6c757d"
            }
        };

        if (!defaultSettings[category]) {
            return createErrorResponse(res, 404, "Settings category not found");
        }

        await Settings.findOneAndUpdate(
            { category },
            { 
                settings: new Map(Object.entries(defaultSettings[category])),
                updatedBy: req.user.id,
                lastModified: new Date()
            },
            { upsert: true }
        );

        await Activity.create({
            userId: req.user.id,
            action: "admin_reset_settings",
            description: `Admin reset ${category} settings to defaults`,
            metadata: { category }
        });

        return createSuccessResponse(res, 200, {
            message: `${category} settings reset to defaults successfully`,
            settings: defaultSettings[category]
        });
    } catch (error) {
        console.error("Reset settings error:", error);
        return createErrorResponse(res, 500, "Failed to reset settings", error.message);
    }
});

module.exports = router;
