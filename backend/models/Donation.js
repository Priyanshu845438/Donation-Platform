
const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false }, // Optional for guest donations
    campaignId: { type: mongoose.Schema.Types.ObjectId, ref: "Campaign", required: true },
    amount: { type: Number, required: true, min: 1 },
    paymentMethod: { 
      type: String, 
      enum: ["UPI", "Net Banking", "Credit Card", "Debit Card", "Wallet", "Cheque", "Bank Transfer", "razorpay"], 
      default: "razorpay"
    },
    transactionId: { type: String, required: true },
    donationDate: { type: Date, default: Date.now },
    isAnonymous: { type: Boolean, default: false },
    receiptUrl: { type: String, required: false },
    panNumber: { type: String, required: false }, // Optional for small donations
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed", "Refunded"],
      default: "Pending"
    },
    
    // Payment Gateway Fields
    razorpayOrderId: { type: String, required: false },
    razorpayPaymentId: { type: String, required: false },
    razorpaySignature: { type: String, required: false },
    
    // Donor Information (for guest donations)
    donorName: { type: String, required: false },
    donorEmail: { type: String, required: false },
    donorPhone: { type: String, required: false },
    
    // Additional Fields
    message: { type: String, required: false }, // Optional message from donor
    completedAt: { type: Date, required: false },
    refundedAt: { type: Date, required: false },
    refundReason: { type: String, required: false },
    
    // Company/Organization donations
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: false },
    
    // Tax exemption
    is80GEligible: { type: Boolean, default: false },
    certificateUrl: { type: String, required: false }
  },
  { timestamps: true }
);

// Index for better query performance
donationSchema.index({ campaignId: 1, status: 1 });
donationSchema.index({ donorId: 1, status: 1 });
donationSchema.index({ donationDate: -1 });
donationSchema.index({ transactionId: 1 }, { unique: true });

// Virtual for formatted amount
donationSchema.virtual('formattedAmount').get(function() {
    return `₹${this.amount.toLocaleString('en-IN')}`;
});

module.exports = mongoose.model("Donation", donationSchema);
