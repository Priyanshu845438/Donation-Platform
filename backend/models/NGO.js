const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ngoName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    contactNumber: { type: String, required: true },

    registrationNumber: { type: String, default: null },
    registeredYear: { type: Number, default: null },
    address: { type: String, default: null },
    website: { type: String, default: null },

    authorizedPerson: {
        name: { type: String, default: null },
        phone: { type: String, default: null },
        email: { type: String, default: null }
    },

    // ✅ Apply `{ unique: true, sparse: true }` to allow multiple `null` values
    panNumber: { type: String, default: null, unique: true, sparse: true },
    tanNumber: { type: String, default: null, unique: true, sparse: true },
    gstNumber: { type: String, default: null, unique: true, sparse: true },

    numberOfEmployees: { type: Number, default: null },

    ngoType: {
        type: String,
        enum: ["Trust", "Society", "Section 8 Company", "Other"],
        default: null
    },

    is80GCertified: { type: Boolean, default: false },
    is12ACertified: { type: Boolean, default: false },

    bankDetails: {
        accountHolderName: { type: String, default: null },
        accountNumber: { type: String, default: null, unique: true, sparse: true },
        ifscCode: { type: String, default: null },
        bankName: { type: String, default: null },
        branchName: { type: String, default: null }
    },

    logo: { type: String, default: null },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("NGO", ngoSchema);
