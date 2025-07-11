const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

// Create Payment Session Route
router.post("/create-payment-session", async (req, res) => {
  try {
    const { campaignId, amount, donorName, donorEmail, donorPhone } = req.body;

    // Enhanced input validation
    if (!campaignId || !mongoose.Types.ObjectId.isValid(campaignId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid campaign ID"
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid donation amount"
      });
    }

    if (!donorName || !donorEmail || !donorPhone) {
      return res.status(400).json({
        success: false,
        message: "Donor details are required"
      });
    }

    // Validate email format
    if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(donorEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format"
      });
    }

    // Create payment session with Cashfree
    const response = await axios.post(
      "https://sandbox.cashfree.com/pg/orders",
      {
        order_amount: amount,
        order_currency: "INR",
        customer_details: {
          customer_name: donorName,
          customer_email: donorEmail,
          customer_phone: donorPhone,
        },
        order_meta: {
          campaign_id: campaignId
        }
      },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-api-version": "2022-01-01",
          "Content-Type": "application/json",
        }
      }
    );

    res.status(200).json({
      success: true,
      message: "Payment session created successfully",
      paymentSessionId: response.data.payment_session_id,
      orderId: response.data.order_id
    });

  } catch (error) {
    console.error("Payment Session Error:", error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create payment session",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Export Router
module.exports = router;
