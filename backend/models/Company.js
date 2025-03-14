const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    companyName: { type: String, required: true },
    companyEmail: { type: String, required: true, unique: true },
    registrationNumber: { type: String, default: "Pending" },
    companyAddress: { type: String, default: "Not provided" },
    companyPhoneNumber: { type: String, required: true },
    ceoName: { type: String, default: "Not provided" },
    ceoContactNumber: { type: String, default: "Not provided" },
    ceoEmail: { type: String, default: "Not provided" },
    companyType: { type: String, default: "IT" },
    numberOfEmployees: { type: Number, default: 1 },
    companyLogo: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model("Company", CompanySchema);
