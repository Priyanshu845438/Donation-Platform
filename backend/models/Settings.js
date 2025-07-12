
const mongoose = require("mongoose");

const SettingsSchema = new mongoose.Schema({
    category: { type: String, required: true, unique: true },
    settings: {
        type: Map,
        of: mongoose.Schema.Types.Mixed
    },
    isActive: { type: Boolean, default: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

// Default settings
SettingsSchema.statics.getDefaultSettings = function() {
    return {
        email: {
            smtp_host: "smtp.hostinger.com",
            smtp_port: 465,
            smtp_secure: true,
            from_email: process.env.EMAIL_ID,
            from_name: "Donation Platform"
        },
        payment: {
            gateway: "razorpay",
            test_mode: true,
            currency: "INR"
        },
        general: {
            site_name: "Donation Platform",
            maintenance_mode: false,
            registration_enabled: true,
            auto_approve_users: false
        },
        notifications: {
            email_notifications: true,
            push_notifications: false,
            sms_notifications: false
        }
    };
};

module.exports = mongoose.model("Settings", SettingsSchema);
