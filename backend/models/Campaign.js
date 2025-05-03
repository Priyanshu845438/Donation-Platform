const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema({
    campaignName: { type: String, required: true },
    contactNumber: { type: String, required: true },
    explainStory: { type: String, required: true },
    importance: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    endDate: { type: Date, required: true },
    campaignImages: { type: [String], required: false },
    proofDocs: { type: [String], required: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    donationLink: { type: String, unique: true, required: true, default: null }
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
