const mongoose = require("mongoose");

const CompanySchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    description: String,
    verified: { type: Boolean, default: false }
});

module.exports = mongoose.model("Company", CompanySchema);
