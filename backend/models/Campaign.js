const mongoose = require("mongoose");
const NGO = require("./NGO");

const campaignSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    goalAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    donationLink: { type: String, required: true, unique: true },
    images: [{ type: String }], // Array of image URLs
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: "NGO" }, // Change here to 'NGO'
    createdByAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model("Campaign", campaignSchema);
