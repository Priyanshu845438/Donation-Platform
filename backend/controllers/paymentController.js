
const Razorpay = require('razorpay');
const crypto = require('crypto');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const User = require('../models/User');
const NGO = require('../models/NGO');
const Company = require('../models/Company');
const { createErrorResponse, createSuccessResponse } = require('../utils/errorHandler');

// Initialize Razorpay (use dummy credentials for testing)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_1a2b3c4d5e6f7g',
    key_secret: process.env.RAZORPAY_KEY_SECRET || '1234567890abcdef12345678'
});

class PaymentController {
    // Create payment order
    static async createPaymentOrder(req, res) {
        try {
            const { campaignId, amount, donorName, donorEmail, donorPhone, paymentMethod = "razorpay" } = req.body;

            // Validate required fields
            if (!campaignId || !amount || !donorName || !donorEmail || !donorPhone) {
                return createErrorResponse(res, 400, "All fields are required");
            }

            // Validate amount
            if (amount < 1) {
                return createErrorResponse(res, 400, "Amount must be at least ₹1");
            }

            // Check if campaign exists
            const campaign = await Campaign.findById(campaignId).populate('ngoId');
            if (!campaign) {
                return createErrorResponse(res, 404, "Campaign not found");
            }

            if (!campaign.isActive) {
                return createErrorResponse(res, 400, "Campaign is not active");
            }

            // Create Razorpay order
            const orderOptions = {
                amount: amount * 100, // Amount in paise
                currency: 'INR',
                receipt: `receipt_${Date.now()}`,
                notes: {
                    campaignId,
                    donorName,
                    donorEmail,
                    donorPhone
                }
            };

            const order = await razorpay.orders.create(orderOptions);

            // Create pending donation record
            const donation = new Donation({
                donorId: req.user ? (req.user._id || req.user.id) : null,
                campaignId,
                amount,
                paymentMethod,
                transactionId: order.id,
                donationDate: new Date(),
                status: "Pending",
                donorName,
                donorEmail,
                donorPhone,
                razorpayOrderId: order.id
            });

            await donation.save();

            return createSuccessResponse(res, 201, {
                message: "Payment order created successfully",
                order: {
                    id: order.id,
                    amount: order.amount,
                    currency: order.currency,
                    receipt: order.receipt
                },
                donation: {
                    id: donation._id,
                    amount: donation.amount,
                    campaignId: donation.campaignId
                },
                campaign: {
                    name: campaign.campaignName,
                    ngoName: campaign.ngoId?.ngoName
                }
            });

        } catch (error) {
            console.error("Create payment order error:", error);
            return createErrorResponse(res, 500, "Failed to create payment order", error.message);
        }
    }

    // Verify payment
    static async verifyPayment(req, res) {
        try {
            const { razorpay_order_id, razorpay_payment_id, razorpay_signature, donationId } = req.body;

            if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !donationId) {
                return createErrorResponse(res, 400, "Missing required payment verification data");
            }

            // Verify signature
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummy_secret')
                .update(body.toString())
                .digest("hex");

            const isAuthentic = expectedSignature === razorpay_signature;

            // Find donation
            const donation = await Donation.findById(donationId).populate('campaignId');
            if (!donation) {
                return createErrorResponse(res, 404, "Donation not found");
            }

            if (isAuthentic) {
                // Update donation status
                donation.status = "Completed";
                donation.razorpayPaymentId = razorpay_payment_id;
                donation.razorpaySignature = razorpay_signature;
                donation.completedAt = new Date();
                await donation.save();

                // Update campaign raised amount
                await Campaign.findByIdAndUpdate(donation.campaignId._id, {
                    $inc: { raisedAmount: donation.amount }
                });

                // Generate receipt URL (dummy implementation)
                const receiptUrl = `/api/payment/receipt/${donation._id}`;
                donation.receiptUrl = receiptUrl;
                await donation.save();

                return createSuccessResponse(res, 200, {
                    message: "Payment verified successfully",
                    donation: {
                        id: donation._id,
                        amount: donation.amount,
                        status: donation.status,
                        receiptUrl: donation.receiptUrl,
                        campaignName: donation.campaignId.campaignName
                    }
                });

            } else {
                // Payment verification failed
                donation.status = "Failed";
                await donation.save();

                return createErrorResponse(res, 400, "Payment verification failed");
            }

        } catch (error) {
            console.error("Verify payment error:", error);
            return createErrorResponse(res, 500, "Payment verification failed", error.message);
        }
    }

    // Simulate payment success (for testing without actual Razorpay)
    static async simulatePaymentSuccess(req, res) {
        try {
            const { donationId } = req.body;

            const donation = await Donation.findById(donationId).populate('campaignId');
            if (!donation) {
                return createErrorResponse(res, 404, "Donation not found");
            }

            // Simulate successful payment
            donation.status = "Completed";
            donation.razorpayPaymentId = `pay_${Date.now()}`;
            donation.completedAt = new Date();
            await donation.save();

            // Update campaign raised amount
            await Campaign.findByIdAndUpdate(donation.campaignId._id, {
                $inc: { raisedAmount: donation.amount }
            });

            return createSuccessResponse(res, 200, {
                message: "Payment simulated successfully",
                donation
            });

        } catch (error) {
            console.error("Simulate payment error:", error);
            return createErrorResponse(res, 500, "Payment simulation failed", error.message);
        }
    }

    // Get donation receipt
    static async getDonationReceipt(req, res) {
        try {
            const { donationId } = req.params;

            const donation = await Donation.findById(donationId)
                .populate('campaignId', 'campaignName')
                .populate('donorId', 'fullName email');

            if (!donation) {
                return createErrorResponse(res, 404, "Donation not found");
            }

            if (donation.status !== "Completed") {
                return createErrorResponse(res, 400, "Receipt not available for incomplete donations");
            }

            const receipt = {
                receiptNumber: `RCP${donation._id.toString().slice(-8).toUpperCase()}`,
                donationId: donation._id,
                donorName: donation.donorName || donation.donorId?.fullName,
                donorEmail: donation.donorEmail || donation.donorId?.email,
                amount: donation.amount,
                donationDate: donation.donationDate,
                campaignName: donation.campaignId.campaignName,
                transactionId: donation.transactionId,
                paymentMethod: donation.paymentMethod,
                status: donation.status
            };

            return createSuccessResponse(res, 200, {
                message: "Receipt retrieved successfully",
                receipt
            });

        } catch (error) {
            console.error("Get receipt error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve receipt", error.message);
        }
    }

    // Get donation statistics
    static async getDonationStats(req, res) {
        try {
            const stats = await Donation.aggregate([
                {
                    $group: {
                        _id: null,
                        totalDonations: { $sum: 1 },
                        totalAmount: { $sum: "$amount" },
                        completedDonations: {
                            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
                        },
                        completedAmount: {
                            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, "$amount", 0] }
                        },
                        pendingDonations: {
                            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] }
                        },
                        failedDonations: {
                            $sum: { $cond: [{ $eq: ["$status", "Failed"] }, 1, 0] }
                        }
                    }
                }
            ]);

            const monthlyStats = await Donation.aggregate([
                {
                    $match: { status: "Completed" }
                },
                {
                    $group: {
                        _id: {
                            year: { $year: "$donationDate" },
                            month: { $month: "$donationDate" }
                        },
                        amount: { $sum: "$amount" },
                        count: { $sum: 1 }
                    }
                },
                { $sort: { "_id.year": -1, "_id.month": -1 } },
                { $limit: 12 }
            ]);

            return createSuccessResponse(res, 200, {
                message: "Donation statistics retrieved successfully",
                stats: stats[0] || {
                    totalDonations: 0,
                    totalAmount: 0,
                    completedDonations: 0,
                    completedAmount: 0,
                    pendingDonations: 0,
                    failedDonations: 0
                },
                monthlyStats
            });

        } catch (error) {
            console.error("Get donation stats error:", error);
            return createErrorResponse(res, 500, "Failed to retrieve donation statistics", error.message);
        }
    }
}

module.exports = PaymentController;
