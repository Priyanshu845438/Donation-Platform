const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const donationSchema = new mongoose.Schema({

    orderId: {
        type: String,
        required: true,
        unique: true,
        default: () => uuidv4() // Generate a unique orderId when a donation is created
    },

    amount: {
        type: Number,
        required: true,
    },
    donorName: {
        type: String,
        required: true,
    },
    donorEmail: {
        type: String,
        required: true,
    },
    donorPhone: {
        type: String,
        required: true,
    },
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campaign",
        required: true,
    },
    status: {
        type: String,
        default: "PENDING",
    },
    donationLink: {
        type: String,
        required: true,
    }
    
}, { timestamps: true });

module.exports = mongoose.model("Donation", donationSchema);
