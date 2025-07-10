const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full name is required'],
        trim: true,
        minlength: [2, 'Full name must be at least 2 characters'],
        maxlength: [100, 'Full name cannot exceed 100 characters'],
        match: [/^[a-zA-Z\s]+$/, 'Full name can only contain letters and spaces'],
        index: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phoneNumber: {
        type: String,
        required: [true, 'Phone number is required'],
        trim: true,
        match: [/^[0-9]{10,15}$/, 'Please provide a valid phone number']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false // Don't include password in queries by default
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        enum: {
            values: ['user', 'company', 'ngo', 'admin'],
            message: 'Role must be either user, company, ngo, or admin'
        },
        default: 'user',
        index: true
    },
    profileImage: {
        type: String,
        default: '',
        maxlength: [500, 'Profile image URL cannot exceed 500 characters']
    },
    dateOfBirth: {
        type: Date,
        validate: {
            validator: function(date) {
                if (!date) return true; // Optional field
                const today = new Date();
                const minAge = new Date(today.getFullYear() - 13, today.getMonth(), today.getDate());
                return date <= minAge;
            },
            message: 'User must be at least 13 years old'
        }
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other', 'prefer-not-to-say'],
        default: 'prefer-not-to-say'
    },
    address: {
        street: {
            type: String,
            default: '',
            maxlength: [200, 'Street address cannot exceed 200 characters']
        },
        city: {
            type: String,
            default: '',
            maxlength: [100, 'City cannot exceed 100 characters']
        },
        state: {
            type: String,
            default: '',
            maxlength: [100, 'State cannot exceed 100 characters']
        },
        postalCode: {
            type: String,
            default: '',
            maxlength: [20, 'Postal code cannot exceed 20 characters']
        },
        country: {
            type: String,
            default: 'India',
            maxlength: [100, 'Country cannot exceed 100 characters']
        }
    },
    preferences: {
        newsletter: {
            type: Boolean,
            default: true
        },
        emailNotifications: {
            type: Boolean,
            default: true
        },
        smsNotifications: {
            type: Boolean,
            default: false
        },
        pushNotifications: {
            type: Boolean,
            default: true
        },
        language: {
            type: String,
            default: 'english',
            enum: ['english', 'hindi', 'tamil', 'telugu', 'bengali', 'marathi', 'gujarati', 'kannada', 'malayalam', 'punjabi']
        },
        currency: {
            type: String,
            default: 'INR',
            enum: ['INR', 'USD', 'EUR', 'GBP']
        },
        donationCategories: [{
            type: String,
            enum: ['education', 'healthcare', 'environment', 'poverty', 'disaster-relief', 'animal-welfare', 'other']
        }]
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    },
    isVerified: {
        type: Boolean,
        default: false,
        index: true
    },
    verificationToken: {
        type: String,
        select: false
    },
    verificationTokenExpires: {
        type: Date,
        select: false
    },
    passwordResetToken: {
        type: String,
        select: false
    },
    passwordResetExpires: {
        type: Date,
        select: false
    },
    emailVerifiedAt: {
        type: Date
    },
    phoneVerifiedAt: {
        type: Date
    },
    lastLogin: {
        type: Date,
        index: true
    },
    lastLogout: {
        type: Date
    },
    loginCount: {
        type: Number,
        default: 0,
        min: [0, 'Login count cannot be negative']
    },
    failedLoginAttempts: {
        type: Number,
        default: 0,
        min: [0, 'Failed login attempts cannot be negative']
    },
    accountLockedUntil: {
        type: Date
    },
    twoFactorAuth: {
        enabled: {
            type: Boolean,
            default: false
        },
        secret: {
            type: String,
            select: false
        },
        backupCodes: [{
            type: String,
            select: false
        }]
    },
    socialLogins: {
        google: {
            id: String,
            email: String,
            verified: Boolean
        },
        facebook: {
            id: String,
            email: String,
            verified: Boolean
        },
        twitter: {
            id: String,
            username: String,
            verified: Boolean
        }
    },
    donationStats: {
        totalDonated: {
            type: Number,
            default: 0,
            min: [0, 'Total donated cannot be negative']
        },
        donationCount: {
            type: Number,
            default: 0,
            min: [0, 'Donation count cannot be negative']
        },
        lastDonationDate: {
            type: Date
        },
        favoriteCauses: [{
            type: String,
            enum: ['education', 'healthcare', 'environment', 'poverty', 'disaster-relief', 'animal-welfare', 'other']
        }],
        averageDonation: {
            type: Number,
            default: 0,
            min: [0, 'Average donation cannot be negative']
        }
    },
    campaignStats: {
        campaignsCreated: {
            type: Number,
            default: 0,
            min: [0, 'Campaigns created cannot be negative']
        },
        activeCampaigns: {
            type: Number,
            default: 0,
            min: [0, 'Active campaigns cannot be negative']
        },
        successfulCampaigns: {
            type: Number,
            default: 0,
            min: [0, 'Successful campaigns cannot be negative']
        },
        totalFundsRaised: {
            type: Number,
            default: 0,
            min: [0, 'Total funds raised cannot be negative']
        }
    },
    metadata: {
        registrationIp: {
            type: String,
            required: false,
            default: 'unknown'
        },
        lastLoginIp: {
            type: String
        },
        userAgent: {
            type: String
        },
        referralSource: {
            type: String,
            default: 'direct'
        },
        utm: {
            source: String,
            medium: String,
            campaign: String,
            term: String,
            content: String
        }
    },
    privacy: {
        profileVisibility: {
            type: String,
            enum: ['public', 'private', 'friends'],
            default: 'public'
        },
        showDonations: {
            type: Boolean,
            default: true
        },
        showEmail: {
            type: Boolean,
            default: false
        },
        showPhone: {
            type: Boolean,
            default: false
        },
        allowMessages: {
            type: Boolean,
            default: true
        }
    },
    badges: [{
        name: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        icon: {
            type: String,
            required: true
        },
        earnedAt: {
            type: Date,
            default: Date.now
        },
        isVisible: {
            type: Boolean,
            default: true
        }
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    blockedUsers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    deviceTokens: [{
        token: {
            type: String,
            required: true
        },
        platform: {
            type: String,
            enum: ['ios', 'android', 'web'],
            required: true
        },
        isActive: {
            type: Boolean,
            default: true
        },
        lastUsed: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
// Email uniqueness handled by schema definition
userSchema.index({ phoneNumber: 1 });
userSchema.index({ role: 1, isActive: 1 });
userSchema.index({ 'donationStats.totalDonated': -1 });
userSchema.index({ lastLogin: -1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ fullName: 'text', email: 'text' });

// Virtual for full address
userSchema.virtual('fullAddress').get(function() {
    const address = this.address;
    const parts = [address.street, address.city, address.state, address.postalCode, address.country];
    return parts.filter(part => part && part !== '').join(', ');
});

// Virtual for age
userSchema.virtual('age').get(function() {
    if (!this.dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(this.dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
});

// Virtual for account status
userSchema.virtual('accountStatus').get(function() {
    if (!this.isActive) return 'inactive';
    if (this.accountLockedUntil && this.accountLockedUntil > Date.now()) return 'locked';
    if (!this.isVerified) return 'unverified';
    return 'active';
});

// Virtual for donation level
userSchema.virtual('donationLevel').get(function() {
    const total = this.donationStats.totalDonated;
    if (total >= 100000) return 'platinum';
    if (total >= 50000) return 'gold';
    if (total >= 10000) return 'silver';
    if (total >= 1000) return 'bronze';
    return 'starter';
});

// Virtual for membership duration
userSchema.virtual('membershipDuration').get(function() {
    const now = new Date();
    const diffTime = now - this.createdAt;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
});

// Instance method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Instance method to update login info
userSchema.methods.updateLoginInfo = async function(ipAddress, userAgent) {
    this.lastLogin = new Date();
    this.loginCount += 1;
    this.metadata.lastLoginIp = ipAddress;
    this.metadata.userAgent = userAgent;
    this.failedLoginAttempts = 0; // Reset failed attempts on successful login
    await this.save();
};

// Instance method to handle failed login
userSchema.methods.handleFailedLogin = async function() {
    this.failedLoginAttempts += 1;
    
    // Lock account after 5 failed attempts for 30 minutes
    if (this.failedLoginAttempts >= 5) {
        this.accountLockedUntil = new Date(Date.now() + 30 * 60 * 1000);
    }
    
    await this.save();
};

// Instance method to check if account is locked
userSchema.methods.isAccountLocked = function() {
    return this.accountLockedUntil && this.accountLockedUntil > Date.now();
};

// Instance method to update donation stats
userSchema.methods.updateDonationStats = async function(amount) {
    this.donationStats.totalDonated += amount;
    this.donationStats.donationCount += 1;
    this.donationStats.lastDonationDate = new Date();
    this.donationStats.averageDonation = this.donationStats.totalDonated / this.donationStats.donationCount;
    
    // Award badges based on donation milestones
    await this.checkAndAwardBadges();
    
    await this.save();
};

// Instance method to update campaign stats
userSchema.methods.updateCampaignStats = async function(type, amount = 0) {
    switch (type) {
        case 'created':
            this.campaignStats.campaignsCreated += 1;
            this.campaignStats.activeCampaigns += 1;
            break;
        case 'completed':
            this.campaignStats.activeCampaigns -= 1;
            this.campaignStats.successfulCampaigns += 1;
            this.campaignStats.totalFundsRaised += amount;
            break;
        case 'cancelled':
            this.campaignStats.activeCampaigns -= 1;
            break;
    }
    
    await this.checkAndAwardBadges();
    await this.save();
};

// Instance method to check and award badges
userSchema.methods.checkAndAwardBadges = async function() {
    const newBadges = [];
    
    // Donation badges
    const totalDonated = this.donationStats.totalDonated;
    if (totalDonated >= 1000 && !this.hasBadge('First Thousand')) {
        newBadges.push({
            name: 'First Thousand',
            description: 'Donated ₹1,000 or more',
            icon: 'trophy-bronze'
        });
    }
    
    if (totalDonated >= 10000 && !this.hasBadge('Generous Donor')) {
        newBadges.push({
            name: 'Generous Donor',
            description: 'Donated ₹10,000 or more',
            icon: 'trophy-silver'
        });
    }
    
    if (totalDonated >= 100000 && !this.hasBadge('Super Donor')) {
        newBadges.push({
            name: 'Super Donor',
            description: 'Donated ₹1,00,000 or more',
            icon: 'trophy-gold'
        });
    }
    
    // Campaign badges
    const campaignsCreated = this.campaignStats.campaignsCreated;
    if (campaignsCreated >= 1 && !this.hasBadge('Campaign Creator')) {
        newBadges.push({
            name: 'Campaign Creator',
            description: 'Created first campaign',
            icon: 'campaign'
        });
    }
    
    if (campaignsCreated >= 5 && !this.hasBadge('Active Creator')) {
        newBadges.push({
            name: 'Active Creator',
            description: 'Created 5 or more campaigns',
            icon: 'campaigns-multiple'
        });
    }
    
    // Add new badges
    this.badges.push(...newBadges);
};

// Instance method to check if user has a specific badge
userSchema.methods.hasBadge = function(badgeName) {
    return this.badges.some(badge => badge.name === badgeName);
};

// Instance method to follow another user
userSchema.methods.followUser = async function(userId) {
    if (!this.following.includes(userId) && userId.toString() !== this._id.toString()) {
        this.following.push(userId);
        await this.save();
        
        // Add this user to the target user's followers
        const targetUser = await this.constructor.findById(userId);
        if (targetUser && !targetUser.followers.includes(this._id)) {
            targetUser.followers.push(this._id);
            await targetUser.save();
        }
    }
};

// Instance method to unfollow another user
userSchema.methods.unfollowUser = async function(userId) {
    this.following = this.following.filter(id => id.toString() !== userId.toString());
    await this.save();
    
    // Remove this user from the target user's followers
    const targetUser = await this.constructor.findById(userId);
    if (targetUser) {
        targetUser.followers = targetUser.followers.filter(id => id.toString() !== this._id.toString());
        await targetUser.save();
    }
};

// Instance method to block another user
userSchema.methods.blockUser = async function(userId) {
    if (!this.blockedUsers.includes(userId) && userId.toString() !== this._id.toString()) {
        this.blockedUsers.push(userId);
        
        // Remove from following/followers
        this.following = this.following.filter(id => id.toString() !== userId.toString());
        this.followers = this.followers.filter(id => id.toString() !== userId.toString());
        
        await this.save();
    }
};

// Static method to find users by donation level
userSchema.statics.findByDonationLevel = async function(level, limit = 10) {
    let minAmount, maxAmount;
    
    switch (level) {
        case 'starter':
            minAmount = 0;
            maxAmount = 999;
            break;
        case 'bronze':
            minAmount = 1000;
            maxAmount = 9999;
            break;
        case 'silver':
            minAmount = 10000;
            maxAmount = 49999;
            break;
        case 'gold':
            minAmount = 50000;
            maxAmount = 99999;
            break;
        case 'platinum':
            minAmount = 100000;
            maxAmount = Number.MAX_SAFE_INTEGER;
            break;
        default:
            return [];
    }
    
    return await this.find({
        'donationStats.totalDonated': { $gte: minAmount, $lte: maxAmount },
        isActive: true
    })
    .sort({ 'donationStats.totalDonated': -1 })
    .limit(limit);
};

// Static method to get top donors
userSchema.statics.getTopDonors = async function(limit = 10) {
    return await this.find({
        'donationStats.totalDonated': { $gt: 0 },
        isActive: true
    })
    .sort({ 'donationStats.totalDonated': -1 })
    .limit(limit)
    .select('fullName email donationStats profileImage');
};

// Static method to get user statistics
userSchema.statics.getUserStatistics = async function() {
    return await this.aggregate([
        {
            $group: {
                _id: null,
                totalUsers: { $sum: 1 },
                activeUsers: { $sum: { $cond: ['$isActive', 1, 0] } },
                verifiedUsers: { $sum: { $cond: ['$isVerified', 1, 0] } },
                totalDonationsAmount: { $sum: '$donationStats.totalDonated' },
                totalDonationsCount: { $sum: '$donationStats.donationCount' },
                totalCampaigns: { $sum: '$campaignStats.campaignsCreated' }
            }
        }
    ]);
};

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Hash password with cost of 12
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Pre-save middleware to normalize email
userSchema.pre('save', function(next) {
    if (this.isModified('email')) {
        this.email = this.email.toLowerCase().trim();
    }
    next();
});

// Post-save middleware to create user profile
userSchema.post('save', async function(doc, next) {
    if (doc.isNew && (doc.role === 'company' || doc.role === 'ngo')) {
        try {
            if (doc.role === 'company') {
                const Company = mongoose.model('Company');
                await Company.create({
                    userId: doc._id,
                    companyName: doc.fullName,
                    companyEmail: doc.email,
                    companyPhoneNumber: doc.phoneNumber,
                    registrationNumber: 'Pending',
                    companyAddress: {
                        street: doc.address.street || '',
                        city: doc.address.city || '',
                        state: doc.address.state || '',
                        postalCode: doc.address.postalCode || '',
                        country: doc.address.country || 'India'
                    }
                });
            } else if (doc.role === 'ngo') {
                const NGO = mongoose.model('NGO');
                await NGO.create({
                    userId: doc._id,
                    ngoName: doc.fullName,
                    email: doc.email,
                    contactNumber: doc.phoneNumber,
                    registrationNumber: 'Pending',
                    registeredYear: new Date().getFullYear(),
                    address: {
                        street: doc.address.street || '',
                        city: doc.address.city || '',
                        state: doc.address.state || '',
                        postalCode: doc.address.postalCode || '',
                        country: doc.address.country || 'India'
                    }
                });
            }
        } catch (error) {
            console.error('Error creating profile:', error);
        }
    }
    next();
});

module.exports = mongoose.model('User', userSchema);
