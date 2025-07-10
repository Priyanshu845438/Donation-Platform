
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const logger = require('../utils/logger');
const Donation = require('../models/Donation');
const Campaign = require('../models/Campaign');

// Optional auth middleware for routes that can work with or without authentication
const optionalAuth = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        return next();
    }
    
    try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
    } catch (error) {
        // Invalid token, but continue without user
    }
    
    next();
};

/**
 * Initialize Payment
 */
router.post('/initialize', optionalAuth, async (req, res) => {
    try {
        const { donationId, amount, currency = 'INR', paymentMethod } = req.body;

        if (!donationId || !amount || !paymentMethod) {
            return res.status(400).json({
                success: false,
                message: 'Donation ID, amount, and payment method are required'
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

        // Generate payment order
        const paymentOrder = {
            orderId: donation.orderId,
            amount: amount,
            currency: currency,
            paymentMethod: paymentMethod,
            donationId: donationId,
            gatewayOrderId: `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            status: 'pending',
            createdAt: new Date(),
            redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/callback`,
            cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/payment/cancel`
        };

        // Update donation with gateway order ID
        donation.gatewayResponse = { gatewayOrderId: paymentOrder.gatewayOrderId };
        await donation.save();

        logger.info(`Payment initialized for donation: ${donationId}`);

        res.status(200).json({
            success: true,
            message: 'Payment initialized successfully',
            data: paymentOrder
        });

    } catch (error) {
        logger.error('Initialize payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initialize payment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Payment Callback
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

        if (status === 'success' || status === 'completed') {
            // Mark donation as completed
            donation.status = 'completed';
            donation.paymentId = paymentId;
            donation.paidAt = new Date();
            donation.gatewayResponse = gatewayResponse || {};
            await donation.save();

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
            donation.status = 'failed';
            donation.gatewayResponse = gatewayResponse || { failure_reason: 'Payment failed' };
            await donation.save();

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
 * Get Payment Status
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
 * Verify Payment
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

        // Find the donation
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
        logger.error('Verify payment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Process Refund
 */
router.post('/refund', authenticateToken, async (req, res) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Admin access required'
            });
        }

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

        if (donation.status !== 'completed') {
            return res.status(400).json({
                success: false,
                message: 'Only completed donations can be refunded'
            });
        }

        const refundAmount = amount || donation.amount;
        
        // Process refund
        donation.status = 'refunded';
        donation.refundAmount = refundAmount;
        donation.refundReason = reason;
        donation.refundedAt = new Date();
        await donation.save();

        // Update campaign stats
        await Campaign.findByIdAndUpdate(donation.campaignId, {
            $inc: {
                raisedAmount: -refundAmount,
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
                status: donation.status,
                refundId: `refund_${Date.now()}`
            }
        });

    } catch (error) {
        logger.error('Process refund error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to process refund',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

/**
 * Get Payment Methods
 */
router.get('/methods', async (req, res) => {
    try {
        const paymentMethods = [
            {
                id: 'credit_card',
                name: 'Credit Card',
                description: 'Visa, MasterCard, American Express',
                icon: 'credit-card',
                enabled: true
            },
            {
                id: 'debit_card',
                name: 'Debit Card',
                description: 'All major debit cards',
                icon: 'debit-card',
                enabled: true
            },
            {
                id: 'upi',
                name: 'UPI',
                description: 'PhonePe, Google Pay, Paytm',
                icon: 'upi',
                enabled: true
            },
            {
                id: 'net_banking',
                name: 'Net Banking',
                description: 'All major banks',
                icon: 'bank',
                enabled: true
            },
            {
                id: 'wallet',
                name: 'Digital Wallet',
                description: 'Paytm, Mobikwik, Freecharge',
                icon: 'wallet',
                enabled: true
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
