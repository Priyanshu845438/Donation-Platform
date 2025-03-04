const mongoose = require("mongoose");

const NGOSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true },
    description: String,
    verified: { type: Boolean, default: false }
});

module.exports = mongoose.model("NGO", NGOSchema);
