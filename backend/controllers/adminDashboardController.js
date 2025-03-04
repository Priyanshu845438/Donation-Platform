const Campaign = require('../models/Campaign'); // Assuming Campaign model is defined
const Donation = require('../models/Donation'); // Assuming Donation model is defined

// Controller for fetching analytics
exports.getAnalytics = async (req, res) => {
  try {
    // Get total donations
    const totalDonations = await Donation.aggregate([
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // Get total number of active campaigns
    const activeCampaignsCount = await Campaign.countDocuments({ status: 'active' });

    // Get top donors using orderId (group by orderId)
    const topDonors = await Donation.aggregate([
      { $group: { _id: "$orderId", totalDonated: { $sum: "$amount" } } },
      { $sort: { totalDonated: -1 } },
      { $limit: 5 }
    ]);

    // Prepare the response data
    const response = {
      totalDonations: totalDonations[0]?.total || 0,
      activeCampaigns: activeCampaignsCount,
      topDonors: topDonors,
    };

    res.status(200).json(response);

  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
