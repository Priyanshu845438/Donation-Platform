const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    settings: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        default: new Map()
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    lastModified: {
        type: Date,
        default: Date.now
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: 'settings'
});

// Index for faster queries
settingsSchema.index({ category: 1 });
settingsSchema.index({ updatedBy: 1 });

// Static method to get default settings
settingsSchema.statics.getDefaultSettings = function() {
    return {
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
        },
        payment: {
            gateway: "razorpay",
            test_mode: true,
            currency: "INR",
            razorpay_key_id: "",
            razorpay_key_secret: "",
            minimum_donation: 1,
            maximum_donation: 100000
        },
        notifications: {
            email_notifications: true,
            push_notifications: false,
            sms_notifications: false,
            admin_notifications: true,
            user_notifications: true,
            campaign_notifications: true
        },
        rate_limiting: {
            enabled: true,
            window_minutes: 15,
            max_requests: 100,
            auth_attempts_limit: 5,
            auth_window_minutes: 15,
            upload_limit_mb: 50,
            api_rate_limit: 1000
        },
        legal: {
            company_name: "Donation Platform Pvt Ltd",
            copyright_text: "© 2024 Donation Platform. All rights reserved.",
            terms_url: "/terms",
            privacy_url: "/privacy",
            contact_email: "support@donationplatform.com",
            contact_phone: "+91-9999999999",
            contact_address: "123 Main Street, City, State - 123456",
            registration_number: "CIN123456789",
            gst_number: "",
            pan_number: ""
        },
        social: {
            facebook_url: "",
            twitter_url: "",
            instagram_url: "",
            linkedin_url: "",
            youtube_url: "",
            enable_social_login: false,
            google_client_id: "",
            facebook_app_id: ""
        },
        environment: {
            node_env: "development",
            port: 5000,
            frontend_url: "http://localhost:5173",
            backend_url: "http://localhost:5000",
            database_url: "",
            jwt_secret: "",
            jwt_expires_in: "7d",
            cloudinary_cloud_name: "",
            cloudinary_api_key: "",
            cloudinary_api_secret: ""
        },
        features: {
            enable_campaigns: true,
            enable_donations: true,
            enable_comments: true,
            enable_sharing: true,
            enable_analytics: true,
            enable_reports: true,
            enable_notifications: true,
            enable_file_uploads: true,
            max_campaign_images: 10,
            max_file_size_mb: 50
        }
    };
};

// Initialize default settings
settingsSchema.statics.initializeDefaults = async function() {
    try {
        const defaults = this.getDefaultSettings();
        
        for (const [category, settings] of Object.entries(defaults)) {
            const existingSetting = await this.findOne({ category });
            
            if (!existingSetting) {
                await this.create({
                    category,
                    settings: new Map(Object.entries(settings))
                });
            }
        }
    } catch (error) {
        console.error("Error initializing default settings:", error);
    }
};

module.exports = mongoose.model('Settings', settingsSchema);