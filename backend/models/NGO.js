const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        ngoName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        contactNumber: { type: String, required: true },

        registrationNumber: { type: String, default: null },
        registeredYear: { type: Number, default: null },
        address: { type: String, default: null },
        website: { type: String, default: null },

        authorizedPerson: {
            name: { type: String, default: "Not provided" },
            phone: { type: String, default: "Not provided" },
            email: { type: String, default: "" }, // Use empty string instead of null
        },

        // Remove unique constraints and use proper defaults
        panNumber: { type: String, default: "" }, // PAN number - use empty string
        tanNumber: { type: String, default: "" }, // Drop this constraint  
        gstNumber: { type: String, default: "" }, // Optional for NGO

        numberOfEmployees: { type: Number, default: null },

        ngoType: {
            type: String,
            enum: ["Trust", "Society", "Section 8 Company", "Other"],
            default: null,
        },

        is80GCertified: { type: Boolean, default: false },
        is12ACertified: { type: Boolean, default: false },

        bankDetails: {
            accountHolderName: { type: String, default: "Not provided" },
            accountNumber: { type: String, default: "" }, // Optional - no unique constraint
            ifscCode: { type: String, default: "Not provided" },
            bankName: { type: String, default: "Not provided" },
            branchName: { type: String, default: "Not provided" },
        },

        logo: { type: String, default: null },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true },
);

module.exports = mongoose.model("NGO", ngoSchema);
