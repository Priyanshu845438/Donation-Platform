
const express = require("express");
const PaymentController = require("../../controllers/paymentController");
const { createSuccessResponse } = require("../../utils/errorHandler");

const router = express.Router();

// Test payment flow endpoint
router.post("/test-flow", async (req, res) => {
    try {
        const testData = {
            campaignId: req.body.campaignId || "TEST_CAMPAIGN_ID",
            amount: req.body.amount || 100,
            donorName: "Test Donor",
            donorEmail: "test@example.com",
            donorPhone: "+919876543210"
        };

        // Create order
        const orderResponse = await PaymentController.createPaymentOrder(
            { body: testData, user: null },
            {
                status: (code) => ({
                    json: (data) => ({ statusCode: code, ...data })
                })
            }
        );

        return createSuccessResponse(res, 200, {
            message: "Test payment flow initiated",
            testData,
            orderResponse,
            instructions: [
                "1. Use the order ID from the response to simulate payment",
                "2. Call /api/payment/simulate-success with the donation ID",
                "3. Or use the verify endpoint with dummy payment data"
            ]
        });

    } catch (error) {
        return createErrorResponse(res, 500, "Test flow failed", error.message);
    }
});

// Get Razorpay configuration for testing
router.get("/config", (req, res) => {
    return createSuccessResponse(res, 200, {
        message: "Payment configuration for testing",
        config: {
            razorpay_key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1DP5mmOlF5G5ag',
            currency: 'INR',
            test_mode: true,
            notes: "These are dummy keys for testing purposes only"
        }
    });
});

module.exports = router;
