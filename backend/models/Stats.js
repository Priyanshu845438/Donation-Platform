const mongoose = require('mongoose');

const statsSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        index: true
    },
    type: {
        type: String,
        required: true,
        enum: ['daily', 'weekly', 'monthly', 'yearly'],
        index: true
    },
    donations: {
        count: {
            type: Number,
            default: 0,
            min: [0, 'Donation count cannot be negative']
        },
        amount: {
            type: Number,
            default: 0,
            min: [0, 'Donation amount cannot be negative']
        },
        averageAmount: {
            type: Number,
            default: 0,
            min: [0, 'Average donation amount cannot be negative']
        },
        maxAmount: {
            type: Number,
            default: 0,
            min: [0, 'Max donation amount cannot be negative']
        },
        minAmount: {
            type: Number,
            default: 0,
            min: [0, 'Min donation amount cannot be negative']
        },
        uniqueDonors: {
            type: Number,
            default: 0,
            min: [0, 'Unique donors count cannot be negative']
        }
    },
    campaigns: {
        total: {
            type: Number,
            default: 0,
            min: [0, 'Total campaigns cannot be negative']
        },
        active: {
            type: Number,
            default: 0,
            min: [0, 'Active campaigns cannot be negative']
        },
        completed: {
            type: Number,
            default: 0,
            min: [0, 'Completed campaigns cannot be negative']
        },
        successful: {
            type: Number,
            default: 0,
            min: [0, 'Successful campaigns cannot be negative']
        },
        created: {
            type: Number,
            default: 0,
            min: [0, 'Created campaigns cannot be negative']
        },
        goalAmountTotal: {
            type: Number,
            default: 0,
            min: [0, 'Goal amount total cannot be negative']
        },
        raisedAmountTotal: {
            type: Number,
            default: 0,
            min: [0, 'Raised amount total cannot be negative']
        }
    },
    users: {
        total: {
            type: Number,
            default: 0,
            min: [0, 'Total users cannot be negative']
        },
        active: {
            type: Number,
            default: 0,
            min: [0, 'Active users cannot be negative']
        },
        new: {
            type: Number,
            default: 0,
            min: [0, 'New users cannot be negative']
        },
        donors: {
            type: Number,
            default: 0,
            min: [0, 'Donors count cannot be negative']
        },
        campaignCreators: {
            type: Number,
            default: 0,
            min: [0, 'Campaign creators count cannot be negative']
        }
    },
    organizations: {
        companies: {
            total: {
                type: Number,
                default: 0,
                min: [0, 'Total companies cannot be negative']
            },
            active: {
                type: Number,
                default: 0,
                min: [0, 'Active companies cannot be negative']
            },
            verified: {
                type: Number,
                default: 0,
                min: [0, 'Verified companies cannot be negative']
            },
            new: {
                type: Number,
                default: 0,
                min: [0, 'New companies cannot be negative']
            }
        },
        ngos: {
            total: {
                type: Number,
                default: 0,
                min: [0, 'Total NGOs cannot be negative']
            },
            active: {
                type: Number,
                default: 0,
                min: [0, 'Active NGOs cannot be negative']
            },
            verified: {
                type: Number,
                default: 0,
                min: [0, 'Verified NGOs cannot be negative']
            },
            certified80G: {
                type: Number,
                default: 0,
                min: [0, '80G certified NGOs cannot be negative']
            },
            certified12A: {
                type: Number,
                default: 0,
                min: [0, '12A certified NGOs cannot be negative']
            },
            new: {
                type: Number,
                default: 0,
                min: [0, 'New NGOs cannot be negative']
            }
        }
    },
    categories: [{
        name: {
            type: String,
            required: true,
            enum: ['education', 'healthcare', 'environment', 'poverty', 'disaster-relief', 'animal-welfare', 'other']
        },
        campaignCount: {
            type: Number,
            default: 0,
            min: [0, 'Campaign count cannot be negative']
        },
        donationAmount: {
            type: Number,
            default: 0,
            min: [0, 'Donation amount cannot be negative']
        },
        donationCount: {
            type: Number,
            default: 0,
            min: [0, 'Donation count cannot be negative']
        },
        averageGoal: {
            type: Number,
            default: 0,
            min: [0, 'Average goal cannot be negative']
        },
        successRate: {
            type: Number,
            default: 0,
            min: [0, 'Success rate cannot be negative'],
            max: [100, 'Success rate cannot exceed 100']
        }
    }],
    paymentMethods: [{
        method: {
            type: String,
            required: true,
            enum: ['credit_card', 'debit_card', 'upi', 'net_banking', 'wallet', 'bank_transfer', 'cash']
        },
        count: {
            type: Number,
            default: 0,
            min: [0, 'Payment method count cannot be negative']
        },
        amount: {
            type: Number,
            default: 0,
            min: [0, 'Payment method amount cannot be negative']
        },
        percentage: {
            type: Number,
            default: 0,
            min: [0, 'Percentage cannot be negative'],
            max: [100, 'Percentage cannot exceed 100']
        }
    }],
    geography: {
        countries: [{
            name: {
                type: String,
                required: true
            },
            donationAmount: {
                type: Number,
                default: 0,
                min: [0, 'Donation amount cannot be negative']
            },
            donationCount: {
                type: Number,
                default: 0,
                min: [0, 'Donation count cannot be negative']
            },
            userCount: {
                type: Number,
                default: 0,
                min: [0, 'User count cannot be negative']
            }
        }],
        states: [{
            name: {
                type: String,
                required: true
            },
            donationAmount: {
                type: Number,
                default: 0,
                min: [0, 'Donation amount cannot be negative']
            },
            donationCount: {
                type: Number,
                default: 0,
                min: [0, 'Donation count cannot be negative']
            },
            userCount: {
                type: Number,
                default: 0,
                min: [0, 'User count cannot be negative']
            }
        }]
    },
    growth: {
        donationGrowth: {
            type: Number,
            default: 0
        },
        userGrowth: {
            type: Number,
            default: 0
        },
        campaignGrowth: {
            type: Number,
            default: 0
        },
        organizationGrowth: {
            type: Number,
            default: 0
        }
    },
    engagement: {
        averageSessionDuration: {
            type: Number,
            default: 0,
            min: [0, 'Average session duration cannot be negative']
        },
        pageViews: {
            type: Number,
            default: 0,
            min: [0, 'Page views cannot be negative']
        },
        uniqueVisitors: {
            type: Number,
            default: 0,
            min: [0, 'Unique visitors cannot be negative']
        },
        bounceRate: {
            type: Number,
            default: 0,
            min: [0, 'Bounce rate cannot be negative'],
            max: [100, 'Bounce rate cannot exceed 100']
        },
        conversionRate: {
            type: Number,
            default: 0,
            min: [0, 'Conversion rate cannot be negative'],
            max: [100, 'Conversion rate cannot exceed 100']
        }
    },
    revenue: {
        totalRevenue: {
            type: Number,
            default: 0,
            min: [0, 'Total revenue cannot be negative']
        },
        platformFees: {
            type: Number,
            default: 0,
            min: [0, 'Platform fees cannot be negative']
        },
        processingFees: {
            type: Number,
            default: 0,
            min: [0, 'Processing fees cannot be negative']
        },
        refunds: {
            type: Number,
            default: 0,
            min: [0, 'Refunds cannot be negative']
        },
        netRevenue: {
            type: Number,
            default: 0
        }
    },
    performance: {
        averageLoadTime: {
            type: Number,
            default: 0,
            min: [0, 'Average load time cannot be negative']
        },
        uptime: {
            type: Number,
            default: 100,
            min: [0, 'Uptime cannot be negative'],
            max: [100, 'Uptime cannot exceed 100']
        },
        errorRate: {
            type: Number,
            default: 0,
            min: [0, 'Error rate cannot be negative'],
            max: [100, 'Error rate cannot exceed 100']
        },
        apiResponseTime: {
            type: Number,
            default: 0,
            min: [0, 'API response time cannot be negative']
        }
    }
}, {
    timestamps: true
});

// Compound indexes for better query performance
statsSchema.index({ date: 1, type: 1 }, { unique: true });
statsSchema.index({ type: 1, date: -1 });
statsSchema.index({ 'donations.amount': -1 });
statsSchema.index({ 'campaigns.total': -1 });
statsSchema.index({ 'users.total': -1 });

// Virtual for donation conversion rate
statsSchema.virtual('donationConversionRate').get(function() {
    if (this.users.total === 0) return 0;
    return ((this.users.donors / this.users.total) * 100).toFixed(2);
});

// Virtual for campaign success rate
statsSchema.virtual('campaignSuccessRate').get(function() {
    if (this.campaigns.total === 0) return 0;
    return ((this.campaigns.successful / this.campaigns.total) * 100).toFixed(2);
});

// Virtual for average donation per user
statsSchema.virtual('averageDonationPerUser').get(function() {
    if (this.users.donors === 0) return 0;
    return (this.donations.amount / this.users.donors).toFixed(2);
});

// Virtual for growth metrics
statsSchema.virtual('growthMetrics').get(function() {
    return {
        donations: this.growth.donationGrowth,
        users: this.growth.userGrowth,
        campaigns: this.growth.campaignGrowth,
        organizations: this.growth.organizationGrowth
    };
});

// Method to calculate growth compared to previous period
statsSchema.methods.calculateGrowth = async function(previousStats) {
    if (!previousStats) return;
    
    this.growth.donationGrowth = this.calculatePercentageGrowth(
        this.donations.amount,
        previousStats.donations.amount
    );
    
    this.growth.userGrowth = this.calculatePercentageGrowth(
        this.users.total,
        previousStats.users.total
    );
    
    this.growth.campaignGrowth = this.calculatePercentageGrowth(
        this.campaigns.total,
        previousStats.campaigns.total
    );
    
    this.growth.organizationGrowth = this.calculatePercentageGrowth(
        this.organizations.companies.total + this.organizations.ngos.total,
        previousStats.organizations.companies.total + previousStats.organizations.ngos.total
    );
    
    await this.save();
};

// Helper method to calculate percentage growth
statsSchema.methods.calculatePercentageGrowth = function(current, previous) {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(2);
};

// Method to update category stats
statsSchema.methods.updateCategoryStats = async function(categoryName, campaignCount, donationAmount, donationCount) {
    let category = this.categories.find(cat => cat.name === categoryName);
    
    if (!category) {
        category = {
            name: categoryName,
            campaignCount: 0,
            donationAmount: 0,
            donationCount: 0,
            averageGoal: 0,
            successRate: 0
        };
        this.categories.push(category);
    }
    
    category.campaignCount += campaignCount;
    category.donationAmount += donationAmount;
    category.donationCount += donationCount;
    
    await this.save();
};

// Method to update payment method stats
statsSchema.methods.updatePaymentMethodStats = async function(method, count, amount) {
    let paymentMethod = this.paymentMethods.find(pm => pm.method === method);
    
    if (!paymentMethod) {
        paymentMethod = {
            method: method,
            count: 0,
            amount: 0,
            percentage: 0
        };
        this.paymentMethods.push(paymentMethod);
    }
    
    paymentMethod.count += count;
    paymentMethod.amount += amount;
    
    // Recalculate percentages
    const totalAmount = this.paymentMethods.reduce((sum, pm) => sum + pm.amount, 0);
    this.paymentMethods.forEach(pm => {
        pm.percentage = totalAmount > 0 ? ((pm.amount / totalAmount) * 100).toFixed(2) : 0;
    });
    
    await this.save();
};

// Static method to get stats for date range
statsSchema.statics.getStatsForDateRange = async function(startDate, endDate, type = 'daily') {
    return await this.find({
        date: { $gte: startDate, $lte: endDate },
        type: type
    }).sort({ date: 1 });
};

// Static method to get latest stats
statsSchema.statics.getLatestStats = async function(type = 'daily') {
    return await this.findOne({ type: type }).sort({ date: -1 });
};

// Static method to aggregate stats
statsSchema.statics.aggregateStats = async function(startDate, endDate) {
    return await this.aggregate([
        {
            $match: {
                date: { $gte: startDate, $lte: endDate }
            }
        },
        {
            $group: {
                _id: null,
                totalDonations: { $sum: '$donations.amount' },
                totalDonationCount: { $sum: '$donations.count' },
                totalUsers: { $sum: '$users.new' },
                totalCampaigns: { $sum: '$campaigns.created' },
                averageDonation: { $avg: '$donations.averageAmount' }
            }
        }
    ]);
};

// Static method to create daily stats
statsSchema.statics.createDailyStats = async function(date) {
    const User = mongoose.model('User');
    const Campaign = mongoose.model('Campaign');
    const Donation = mongoose.model('Donation');
    const Company = mongoose.model('Company');
    const NGO = mongoose.model('NGO');
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Calculate all stats for the day
    const [
        donationStats,
        userStats,
        campaignStats,
        companyStats,
        ngoStats
    ] = await Promise.all([
        Donation.aggregate([
            {
                $match: {
                    createdAt: { $gte: startOfDay, $lte: endOfDay },
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    count: { $sum: 1 },
                    amount: { $sum: '$amount' },
                    averageAmount: { $avg: '$amount' },
                    maxAmount: { $max: '$amount' },
                    minAmount: { $min: '$amount' },
                    uniqueDonors: { $addToSet: '$donorEmail' }
                }
            }
        ]),
        
        User.aggregate([
            {
                $facet: {
                    total: [
                        { $match: { createdAt: { $lte: endOfDay } } },
                        { $count: 'count' }
                    ],
                    new: [
                        { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
                        { $count: 'count' }
                    ],
                    active: [
                        { $match: { isActive: true, createdAt: { $lte: endOfDay } } },
                        { $count: 'count' }
                    ]
                }
            }
        ]),
        
        Campaign.aggregate([
            {
                $facet: {
                    total: [
                        { $match: { createdAt: { $lte: endOfDay } } },
                        { $count: 'count' }
                    ],
                    created: [
                        { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
                        { $count: 'count' }
                    ],
                    active: [
                        { $match: { status: 'active', createdAt: { $lte: endOfDay } } },
                        { $count: 'count' }
                    ],
                    completed: [
                        { $match: { status: 'completed', createdAt: { $lte: endOfDay } } },
                        { $count: 'count' }
                    ]
                }
            }
        ]),
        
        Company.aggregate([
            {
                $facet: {
                    total: [
                        { $match: { createdAt: { $lte: endOfDay } } },
                        { $count: 'count' }
                    ],
                    new: [
                        { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
                        { $count: 'count' }
                    ],
                    active: [
                        { $match: { isActive: true, createdAt: { $lte: endOfDay } } },
                        { $count: 'count' }
                    ],
                    verified: [
                        { $match: { isVerified: true, createdAt: { $lte: endOfDay } } },
                        { $count: 'count' }
                    ]
                }
            }
        ]),
        
        NGO.aggregate([
            {
                $facet: {
                    total: [
                        { $match: { createdAt: { $lte: endOfDay } } },
                        { $count: 'count' }
                    ],
                    new: [
                        { $match: { createdAt: { $gte: startOfDay, $lte: endOfDay } } },
                        { $count: 'count' }
                    ],
                    active: [
                        { $match: { isActive: true, createdAt: { $lte: endOfDay } } },
                        { $count: 'count' }
                    ],
                    verified: [
                        { $match: { isVerified: true, createdAt: { $lte: endOfDay } } },
                        { $count: 'count' }
                    ],
                    certified80G: [
                        { $match: { is80GCertified: true, createdAt: { $lte: endOfDay } } },
                        { $count: 'count' }
                    ],
                    certified12A: [
                        { $match: { is12ACertified: true, createdAt: { $lte: endOfDay } } },
                        { $count: 'count' }
                    ]
                }
            }
        ])
    ]);
    
    // Create stats document
    const stats = new this({
        date: startOfDay,
        type: 'daily',
        donations: {
            count: donationStats[0]?.count || 0,
            amount: donationStats[0]?.amount || 0,
            averageAmount: donationStats[0]?.averageAmount || 0,
            maxAmount: donationStats[0]?.maxAmount || 0,
            minAmount: donationStats[0]?.minAmount || 0,
            uniqueDonors: donationStats[0]?.uniqueDonors?.length || 0
        },
        users: {
            total: userStats[0].total[0]?.count || 0,
            new: userStats[0].new[0]?.count || 0,
            active: userStats[0].active[0]?.count || 0
        },
        campaigns: {
            total: campaignStats[0].total[0]?.count || 0,
            created: campaignStats[0].created[0]?.count || 0,
            active: campaignStats[0].active[0]?.count || 0,
            completed: campaignStats[0].completed[0]?.count || 0
        },
        organizations: {
            companies: {
                total: companyStats[0].total[0]?.count || 0,
                new: companyStats[0].new[0]?.count || 0,
                active: companyStats[0].active[0]?.count || 0,
                verified: companyStats[0].verified[0]?.count || 0
            },
            ngos: {
                total: ngoStats[0].total[0]?.count || 0,
                new: ngoStats[0].new[0]?.count || 0,
                active: ngoStats[0].active[0]?.count || 0,
                verified: ngoStats[0].verified[0]?.count || 0,
                certified80G: ngoStats[0].certified80G[0]?.count || 0,
                certified12A: ngoStats[0].certified12A[0]?.count || 0
            }
        }
    });
    
    // Calculate growth from previous day
    const previousDayStats = await this.findOne({
        date: { $lt: startOfDay },
        type: 'daily'
    }).sort({ date: -1 });
    
    if (previousDayStats) {
        await stats.calculateGrowth(previousDayStats);
    }
    
    await stats.save();
    return stats;
};

module.exports = mongoose.model('Stats', statsSchema);
