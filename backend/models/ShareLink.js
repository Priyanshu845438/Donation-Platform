
const mongoose = require("mongoose");
const crypto = require("crypto");

const ShareLinkSchema = new mongoose.Schema({
    shareId: { type: String, unique: true },
    resourceType: { type: String, enum: ["profile", "campaign", "portfolio"], required: true },
    resourceId: { type: mongoose.Schema.Types.ObjectId, required: true },
    customDesign: {
        type: mongoose.Schema.Types.Mixed,
        default: function() { return {}; }
    },
    isActive: { type: Boolean, default: true },
    viewCount: { type: Number, default: 0 },
    lastViewed: { type: Date },
    expiresAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
}, { 
    timestamps: true,
    minimize: false // Ensure empty objects are saved
});

// Add index for faster lookups
ShareLinkSchema.index({ resourceType: 1, resourceId: 1 }, { unique: true });

ShareLinkSchema.pre("save", function(next) {
    if (!this.shareId) {
        this.shareId = crypto.randomBytes(16).toString("hex");
    }
    next();
});

ShareLinkSchema.pre("validate", function(next) {
    if (!this.shareId) {
        this.shareId = crypto.randomBytes(16).toString("hex");
    }
    next();
});

module.exports = mongoose.model("ShareLink", ShareLinkSchema);
