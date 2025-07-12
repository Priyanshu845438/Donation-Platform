const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Donor Reference
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true }, // Campaign Reference
    amount: { type: Number, required: true, min: 1 }, // Donation amount
    paymentMethod: { 
      type: String, 
      enum: ["UPI", "Net Banking", "Credit Card", "Debit Card", "Wallet", "Cheque", "Bank Transfer"], 
      required: true 
    }, // Payment Method Dropdown
    transactionId: { type: String, required: true, unique: true }, // Unique Transaction ID
    donationDate: { type: Date, default: Date.now }, // Donation Date
    isAnonymous: { type: Boolean, default: false }, // Whether donor wants to stay anonymous
    receiptUrl: { type: String, required: false }, // Receipt (for 80G tax exemption)
    panNumber: { type: String, required: true }, // PAN Card (Govt. requirement)
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending"
    }, // Donation status
  },
  { timestamps: true }
);

module.exports = mongoose.model("Donation", donationSchema);
