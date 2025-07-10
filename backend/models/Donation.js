const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true,
        index: true
    },
    donorId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    amount: {
        type: Number,
        required: [true, 'Donation amount is required'],
        min: [1, 'Donation amount must be at least 1'],
        max: [10000000, 'Donation amount cannot exceed 10,000,000']
    },
    donorName: {
        type: String,
        required: [true, 'Donor name is required'],
        trim: true,
        minlength: [2, 'Donor name must be at least 2 characters'],
        maxlength: [100, 'Donor name cannot exceed 100 characters']
    },
    donorEmail: {
        type: String,
        required: [true, 'Donor email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
        index: true
    },
    donorPhone: {
        type: String,
        trim: true,
        match: [/^[0-9+\-\s()]*$/, 'Please provide a valid phone number format']
    },
    message: {
        type: String,
        default: '',
        trim: true,
        maxlength: [500, 'Message cannot exceed 500 characters']
    },
    isAnonymous: {
        type: Boolean,
        default: false,
        index: true
    },
    paymentMethod: {
        type: String,
        required: [true, 'Payment method is required'],
        enum: {
            values: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'bank_transfer', 'cash'],
            message: 'Invalid payment method'
        },
        index: true
    },
    orderId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    paymentId: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: {
            values: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'],
            message: 'Invalid donation status'
        },
        default: 'pending',
        index: true
    },
    currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR', 'GBP'],
        index: true
    },
    exchangeRate: {
        type: Number,
        default: 1,
        min: [0.01, 'Exchange rate must be positive']
    },
    amountInBaseCurrency: {
        type: Number,
        min: [0.01, 'Amount in base currency must be positive']
    },
    paidAt: {
        type: Date,
        index: true
    },
    refundedAt: {
        type: Date
    },
    refundAmount: {
        type: Number,
        default: 0,
        min: [0, 'Refund amount cannot be negative']
    },
    refundReason: {
        type: String,
        trim: true,
        maxlength: [500, 'Refund reason cannot exceed 500 characters']
    },
    paymentGateway: {
        type: String,
        default: 'razorpay',
        enum: ['razorpay', 'stripe', 'paypal', 'paytm', 'phonepe', 'gpay', 'manual'],
        index: true
    },
    gatewayTransactionId: {
        type: String,
        trim: true
    },
    gatewayResponse: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    processingFee: {
        type: Number,
        default: 0,
        min: [0, 'Processing fee cannot be negative']
    },
    netAmount: {
        type: Number,
        min: [0, 'Net amount cannot be negative']
    },
    taxAmount: {
        type: Number,
        default: 0,
        min: [0, 'Tax amount cannot be negative']
    },
    receiptUrl: {
        type: String,
        trim: true
    },
    certificateUrl: {
        type: String,
        trim: true
    },
    isTaxDeductible: {
        type: Boolean,
        default: true
    },
    taxDeductionCertificate: {
        issued: {
            type: Boolean,
            default: false
        },
        issuedAt: {
            type: Date
        },
        certificateNumber: {
            type: String,
            trim: true
        },
        downloadUrl: {
            type: String,
            trim: true
        }
    },
    metadata: {
        ipAddress: {
            type: String,
            required: true
        },
        userAgent: {
            type: String,
            required: true
        },
        source: {
            type: String,
            default: 'web',
            enum: ['web', 'mobile', 'api']
        },
        campaign: {
            type: String,
            default: 'direct'
        }
    },
    notifications: {
        emailSent: {
            type: Boolean,
            default: false
        },
        smsSent: {
            type: Boolean,
            default: false
        },
        pushNotificationSent: {
            type: Boolean,
            default: false
        }
    },
    recurring: {
        isRecurring: {
            type: Boolean,
            default: false
        },
        frequency: {
            type: String,
            enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
            default: 'monthly'
        },
        nextDonationDate: {
            type: Date
        },
        recurringId: {
            type: String,
            trim: true
        },
        isActive: {
            type: Boolean,
            default: true
        }
    },
    reviewAndRating: {
        rating: {
            type: Number,
            min: [1, 'Rating must be between 1 and 5'],
            max: [5, 'Rating must be between 1 and 5']
        },
        review: {
            type: String,
            trim: true,
            maxlength: [1000, 'Review cannot exceed 1000 characters']
        },
        reviewedAt: {
            type: Date
        }
    }
}, {
    timestamps: true
});

// Indexes for better query performance
donationSchema.index({ campaignId: 1, status: 1 });
donationSchema.index({ donorId: 1, createdAt: -1 });
donationSchema.index({ donorEmail: 1, createdAt: -1 });
donationSchema.index({ status: 1, createdAt: -1 });
donationSchema.index({ paymentId: 1 });
// OrderId uniqueness handled by schema definition
donationSchema.index({ gatewayTransactionId: 1 });
donationSchema.index({ amount: -1 });
donationSchema.index({ paidAt: -1 });
donationSchema.index({ 'recurring.isRecurring': 1, 'recurring.nextDonationDate': 1 });

// Virtual for formatted amount
donationSchema.virtual('formattedAmount').get(function() {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: this.currency || 'INR'
    }).format(this.amount);
});

// Virtual for donation age
donationSchema.virtual('donationAge').get(function() {
    const now = new Date();
    const diffTime = now - this.createdAt;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Virtual for processing status
donationSchema.virtual('isProcessed').get(function() {
    return ['completed', 'refunded'].includes(this.status);
});

// Virtual for can be refunded
donationSchema.virtual('canBeRefunded').get(function() {
    if (this.status !== 'completed') return false;
    if (this.refundAmount > 0) return false;
    
    // Allow refund within 30 days
    const refundDeadline = new Date(this.paidAt);
    refundDeadline.setDate(refundDeadline.getDate() + 30);
    return new Date() <= refundDeadline;
});

// Method to mark as paid
donationSchema.methods.markAsPaid = async function(paymentId, gatewayResponse = {}) {
    this.status = 'completed';
    this.paymentId = paymentId;
    this.paidAt = new Date();
    this.gatewayResponse = gatewayResponse;
    
    // Calculate net amount after processing fee
    this.netAmount = this.amount - this.processingFee - this.taxAmount;
    
    await this.save();
    return this;
};

// Method to mark as failed
donationSchema.methods.markAsFailed = async function(reason, gatewayResponse = {}) {
    this.status = 'failed';
    this.gatewayResponse = { ...this.gatewayResponse, failure_reason: reason, ...gatewayResponse };
    await this.save();
    return this;
};

// Method to process refund
donationSchema.methods.processRefund = async function(amount, reason) {
    if (!this.canBeRefunded) {
        throw new Error('This donation cannot be refunded');
    }
    
    const refundAmount = amount || this.amount;
    if (refundAmount > this.amount) {
        throw new Error('Refund amount cannot exceed donation amount');
    }
    
    this.status = 'refunded';
    this.refundAmount = refundAmount;
    this.refundReason = reason;
    this.refundedAt = new Date();
    
    await this.save();
    return this;
};

// Method to generate receipt
donationSchema.methods.generateReceipt = async function() {
    // This would integrate with a receipt generation service
    const receiptData = {
        donationId: this._id,
        orderId: this.orderId,
        donorName: this.donorName,
        donorEmail: this.donorEmail,
        amount: this.amount,
        currency: this.currency,
        paidAt: this.paidAt,
        paymentMethod: this.paymentMethod
    };
    
    // In a real implementation, this would generate a PDF receipt
    // and upload it to cloud storage, then return the URL
    this.receiptUrl = `/receipts/${this.orderId}.pdf`;
    await this.save();
    
    return this.receiptUrl;
};

// Method to issue tax deduction certificate
donationSchema.methods.issueTaxCertificate = async function() {
    if (!this.isTaxDeductible || this.status !== 'completed') {
        throw new Error('Tax certificate cannot be issued for this donation');
    }
    
    const certificateNumber = `80G-${new Date().getFullYear()}-${this.orderId}`;
    
    this.taxDeductionCertificate = {
        issued: true,
        issuedAt: new Date(),
        certificateNumber: certificateNumber,
        downloadUrl: `/certificates/${certificateNumber}.pdf`
    };
    
    await this.save();
    return this.taxDeductionCertificate;
};

// Method to add review and rating
donationSchema.methods.addReview = async function(rating, review) {
    if (this.status !== 'completed') {
        throw new Error('Can only review completed donations');
    }
    
    this.reviewAndRating = {
        rating: rating,
        review: review,
        reviewedAt: new Date()
    };
    
    await this.save();
    return this;
};

// Static method to get donation statistics
donationSchema.statics.getStatistics = async function(filters = {}) {
    const matchStage = { status: 'completed', ...filters };
    
    return await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: null,
                totalAmount: { $sum: '$amount' },
                totalCount: { $sum: 1 },
                averageAmount: { $avg: '$amount' },
                maxAmount: { $max: '$amount' },
                minAmount: { $min: '$amount' }
            }
        }
    ]);
};

// Static method to get top donors
donationSchema.statics.getTopDonors = async function(limit = 10) {
    return await this.aggregate([
        { $match: { status: 'completed' } },
        {
            $group: {
                _id: '$donorEmail',
                totalAmount: { $sum: '$amount' },
                donationCount: { $sum: 1 },
                donorName: { $first: '$donorName' },
                lastDonation: { $max: '$paidAt' }
            }
        },
        { $sort: { totalAmount: -1 } },
        { $limit: limit }
    ]);
};

// Static method to get donations by date range
donationSchema.statics.getDonationsByDateRange = async function(startDate, endDate, campaignId = null) {
    const matchStage = {
        status: 'completed',
        paidAt: { $gte: startDate, $lte: endDate }
    };
    
    if (campaignId) {
        matchStage.campaignId = new mongoose.Types.ObjectId(campaignId);
    }
    
    return await this.aggregate([
        { $match: matchStage },
        {
            $group: {
                _id: { $dateToString: { format: '%Y-%m-%d', date: '$paidAt' } },
                totalAmount: { $sum: '$amount' },
                count: { $sum: 1 }
            }
        },
        { $sort: { '_id': 1 } }
    ]);
};

// Pre-save middleware to calculate net amount
donationSchema.pre('save', function(next) {
    if (this.isModified('amount') || this.isModified('processingFee') || this.isModified('taxAmount')) {
        this.netAmount = this.amount - (this.processingFee || 0) - (this.taxAmount || 0);
    }
    
    if (this.isModified('amount') && this.exchangeRate) {
        this.amountInBaseCurrency = this.amount * this.exchangeRate;
    }
    
    next();
});

module.exports = mongoose.model('Donation', donationSchema);
