
const mongoose = require("mongoose");

const NoticeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["info", "warning", "success", "error"], default: "info" },
    priority: { type: String, enum: ["low", "medium", "high", "urgent"], default: "medium" },
    targetRole: { type: String, enum: ["all", "ngo", "company", "donor", "admin"] },
    targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
    sendEmail: { type: Boolean, default: false },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    readBy: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        readAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model("Notice", NoticeSchema);
