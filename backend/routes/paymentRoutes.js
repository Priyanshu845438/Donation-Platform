const express = require('express');
const crypto = require('crypto');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');
const { optionalAuthMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

const router = express.Router();

/**
 * Initialize payment
 */
router.post('/initialize', optionalAuthMiddleware, async (req, res) => {
    try {
        const { donationId, amount, currency = 'INR' } = req.body;

        if (!donationId || !amount) {
            return res.status(400).json({
                success: false,
                message: 'Donation ID and amount are required'
            });
        }

        // Find the donation
        const donation = await Donation.findById(donationId);
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        if (donation.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Donation is not in pending status'
            });
        }

        // In a real implementation, this would integrate with a payment gateway
        // For demonstration, we'll simulate a payment initialization
        const paymentData = {
            orderId: donation.orderId,
            amount: amount,
            currency: currency,
            paymentGateway: 'razorpay', // or whatever gateway you're using
            gatewayOrderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback`,
            cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`
        };

        // Update donation with gateway order ID
        donation.gatewayResponse = { gatewayOrderId: paymentData.gatewayOrderId };
        await donation.save();

        logger.info(`Payment initialized for donation: ${donationId}`);

        res.status(200).json({
            success: true,
            message: 'Payment initialized successfully',
            data: paymentData
        });

    } catch (error) {
        logger.error('Payment initialization error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize payment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Handle payment callback/webhook
 */
router.post('/callback', async (req, res) => {
    try {
        const { orderId, paymentId, status, gatewayResponse } = req.body;

        if (!orderId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID is required'
            });
        }

        // Find the donation by order ID
        const donation = await Donation.findOne({ orderId });
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        // Verify payment signature (if using real payment gateway)
        // const isSignatureValid = verifyPaymentSignature(req.body);
        // if (!isSignatureValid) {
        //     return res.status(400).json({
        //         success: false,
        //         message: 'Invalid payment signature'
        //     });
        // }

        if (status === 'success' || status === 'completed') {
            // Mark donation as completed
            await donation.markAsPaid(paymentId, gatewayResponse);

            // Update campaign raised amount
            await Campaign.findByIdAndUpdate(donation.campaignId, {
                $inc: {
                    raisedAmount: donation.amount,
                    donorCount: 1
                }
            });

            logger.info(`Payment completed for donation: ${donation._id}`);

            res.status(200).json({
                success: true,
                message: 'Payment processed successfully',
                data: {
                    donationId: donation._id,
                    orderId: donation.orderId,
                    paymentId: paymentId,
                    amount: donation.amount,
                    status: 'completed'
                }
            });
        } else {
            // Mark donation as failed
            await donation.markAsFailed(gatewayResponse?.failure_reason || 'Payment failed', gatewayResponse);

            logger.warn(`Payment failed for donation: ${donation._id}`);

            res.status(400).json({
                success: false,
                message: 'Payment failed',
                data: {
                    donationId: donation._id,
                    orderId: donation.orderId,
                    status: 'failed'
                }
            });
        }

    } catch (error) {
        logger.error('Payment callback error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process payment callback',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Get payment status
 */
router.get('/status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;

        const donation = await Donation.findOne({ orderId });
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                orderId: donation.orderId,
                paymentId: donation.paymentId,
                status: donation.status,
                amount: donation.amount,
                currency: donation.currency,
                paidAt: donation.paidAt,
                paymentMethod: donation.paymentMethod
            }
        });

    } catch (error) {
        logger.error('Get payment status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment status',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Verify payment (for client-side verification)
 */
router.post('/verify', async (req, res) => {
    try {
        const { orderId, paymentId, signature } = req.body;

        if (!orderId || !paymentId) {
            return res.status(400).json({
                success: false,
                message: 'Order ID and Payment ID are required'
            });
        }

        // In a real implementation, you would verify the payment with the gateway
        // For demonstration, we'll just check if the donation exists and is completed
        const donation = await Donation.findOne({ orderId, paymentId });
        
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Payment not found'
            });
        }

        const isVerified = donation.status === 'completed';

        res.status(200).json({
            success: true,
            data: {
                verified: isVerified,
                orderId: donation.orderId,
                paymentId: donation.paymentId,
                status: donation.status,
                amount: donation.amount
            }
        });

    } catch (error) {
        logger.error('Payment verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Process refund
 */
router.post('/refund', optionalAuthMiddleware, async (req, res) => {
    try {
        const { donationId, amount, reason } = req.body;

        if (!donationId || !reason) {
            return res.status(400).json({
                success: false,
                message: 'Donation ID and reason are required'
            });
        }

        const donation = await Donation.findById(donationId);
        if (!donation) {
            return res.status(404).json({
                success: false,
                message: 'Donation not found'
            });
        }

        if (!donation.canBeRefunded) {
            return res.status(400).json({
                success: false,
                message: 'This donation cannot be refunded'
            });
        }

        // Process refund
        await donation.processRefund(amount, reason);

        // Update campaign stats
        await Campaign.findByIdAndUpdate(donation.campaignId, {
            $inc: {
                raisedAmount: -(amount || donation.amount),
                donorCount: -1
            }
        });

        logger.info(`Refund processed for donation: ${donationId}`);

        res.status(200).json({
            success: true,
            message: 'Refund processed successfully',
            data: {
                donationId: donation._id,
                refundAmount: donation.refundAmount,
                status: donation.status
            }
        });

    } catch (error) {
        logger.error('Refund processing error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process refund',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Get supported payment methods
 */
router.get('/methods', (req, res) => {
    try {
        const paymentMethods = [
            {
                id: 'credit_card',
                name: 'Credit Card',
                description: 'Visa, MasterCard, American Express',
                icon: 'credit-card',
                isActive: true
            },
            {
                id: 'debit_card',
                name: 'Debit Card',
                description: 'All major debit cards',
                icon: 'debit-card',
                isActive: true
            },
            {
                id: 'upi',
                name: 'UPI',
                description: 'PhonePe, Google Pay, Paytm',
                icon: 'upi',
                isActive: true
            },
            {
                id: 'net_banking',
                name: 'Net Banking',
                description: 'All major banks',
                icon: 'bank',
                isActive: true
            },
            {
                id: 'wallet',
                name: 'Digital Wallet',
                description: 'Paytm, Mobikwik, Freecharge',
                icon: 'wallet',
                isActive: true
            }
        ];

        res.status(200).json({
            success: true,
            data: paymentMethods
        });

    } catch (error) {
        logger.error('Get payment methods error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payment methods',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

module.exports = router;
