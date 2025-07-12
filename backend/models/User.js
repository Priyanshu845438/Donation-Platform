const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        role: { type: String, required: true, enum: ["ngo", "company", "admin", "donor"] },
        isVerified: { type: Boolean, default: false },
        isActive: {
        type: Boolean,
        default: true
    },
        approvalStatus: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
        lastLogin: { type: Date },
        profileImage: { type: String },
        resetPasswordToken: { type: String },
        resetPasswordExpires: { type: Date },
        emailVerificationToken: { type: String },
        emailVerificationExpires: { type: Date }
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);