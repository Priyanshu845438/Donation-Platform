const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        phoneNumber: { type: String, required: true },
        role: { type: String, required: true, enum: ["NGO", "Company", "Admin", "Donor"] },
        isVerified: { type: Boolean, default: false },
        isActive: { type: Boolean, default: true },
        approvalStatus: { type: String, default: "Pending" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
