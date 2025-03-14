const mongoose = require("mongoose");

const ngoSchema = new mongoose.Schema(
  {
    ngoName: { type: String, required: true, unique: true }, // NGO Name
    registrationNumber: { type: String, required: true, unique: true }, // Govt. Registration Number
    registeredYear: { type: Number, required: true }, // Year of Registration
    address: { type: String, required: true }, // Registered Address
    contactNumber: { type: String, required: true }, // NGO Contact Number
    email: { type: String, required: true, unique: true }, // Official Email
    website: { type: String, required: false }, // NGO Website (Optional)
    authorizedPerson: {
      name: { type: String, required: true }, // Authorized Representative Name
      phone: { type: String, required: true }, // Authorized Person Contact
      email: { type: String, required: true, unique: true } // Authorized Person Email
    },
    panNumber: { type: String, required: true, unique: true }, // PAN Card for Govt. Compliance
    tanNumber: { type: String, required: false, unique: true }, // TAN Number (If applicable)
    gstNumber: { type: String, required: false, unique: true }, // GST Number (If applicable)
    numberOfEmployees: { type: Number, required: true }, // Total Number of Employees
    ngoType: {
      type: String,
      enum: ["Trust", "Society", "Section 8 Company", "Other"],
      required: true
    }, // NGO Type Dropdown
    is80GCertified: { type: Boolean, default: false }, // 80G Tax Exemption Eligibility
    is12ACertified: { type: Boolean, default: false }, // 12A Tax Exemption Eligibility
    bankDetails: {
      accountHolderName: { type: String, required: true },
      accountNumber: { type: String, required: true, unique: true },
      ifscCode: { type: String, required: true },
      bankName: { type: String, required: true },
      branchName: { type: String, required: true }
    }, // Bank Account Details for Donations
    logo: { type: String, required: false }, // NGO Logo/Profile Image
    isActive: { type: Boolean, default: true } // Active Status
  },
  { timestamps: true }
);

module.exports = mongoose.model("NGO", ngoSchema);
