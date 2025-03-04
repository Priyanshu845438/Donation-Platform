const express = require("express");
const router = express.Router();
const axios = require("axios");
require("dotenv").config();

// Create Payment Session Route
router.post("/create-payment-session", async (req, res) => {
  try {
    const { campaignId, amount, donorName, donorEmail, donorPhone } = req.body;

    if (!campaignId || !amount || !donorName || !donorEmail || !donorPhone) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Call Cashfree API to create a payment session
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
      },
      {
        headers: {
          "x-client-id": process.env.CASHFREE_CLIENT_ID,
          "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
          "x-api-version": "2022-01-01",
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ paymentSessionId: response.data.payment_session_id });

  } catch (error) {
    console.error("Cashfree API Error:", error.response?.data || error.message);
    res.status(500).json({ error: "Payment session creation failed" });
  }
});

// Export Router
module.exports = router;
