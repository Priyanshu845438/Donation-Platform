const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
    campaignName: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    category: { type: String },
    contactNumber: { type: String, required: true },
    explainStory: { type: String, required: true },
    importance: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    targetAmount: { type: Number },
    raisedAmount: { type: Number, default: 0 },
    endDate: { type: Date, required: true },
    location: { type: String },
    beneficiaries: { type: String },
    campaignImages: { type: [String], required: false },
    proofDocs: { type: [String], required: false },
    documents: { type: [String], required: false },
    image: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ngoId: { type: mongoose.Schema.Types.ObjectId, ref: "NGO" },
    donationLink: { type: String, unique: true, required: true, default: null },
    isActive: { type: Boolean, default: false },
    approvalStatus: { 
        type: String, 
        enum: ["pending", "approved", "rejected"], 
        default: "pending" 
    },
    adminNote: { type: String },
    updatedAt: { type: Date, default: Date.now }
}, {
    timestamps: true
});

// Ensure a unique `donationLink` is generated before saving
campaignSchema.pre("save", async function (next) {
    if (!this.donationLink) {
        this.donationLink = `${this.campaignName.replace(/\s+/g, "-").toLowerCase()}-${Math.random().toString(36).substring(7)}`;
    }
    next();
});

const Campaign = mongoose.model("Campaign", campaignSchema);
module.exports = Campaign;
