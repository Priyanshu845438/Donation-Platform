const mongoose = require('mongoose');

const StatsSchema = new mongoose.Schema({
  totalReceived: { type: Number, default: 0 },
  successfulCampaigns: { type: Number, default: 0 },
  totalPartnerships: { type: Number, default: 0 },
  totalCompanies: { type: Number, default: 0 }
});

const Stats = mongoose.model('Stats', StatsSchema);
module.exports = Stats;
