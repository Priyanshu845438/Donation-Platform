const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Campaign title is required'],
        trim: true,
        minlength: [10, 'Title must be at least 10 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters'],
        index: true
    },
    description: {
        type: String,
        required: [true, 'Campaign description is required'],
        trim: true,
        minlength: [50, 'Description must be at least 50 characters'],
        maxlength: [5000, 'Description cannot exceed 5000 characters']
    },
    goalAmount: {
        type: Number,
        required: [true, 'Goal amount is required'],
        min: [1, 'Goal amount must be at least 1'],
        max: [10000000, 'Goal amount cannot exceed 10,000,000']
    },
    raisedAmount: {
        type: Number,
        default: 0,
        min: [0, 'Raised amount cannot be negative']
    },
    donorCount: {
        type: Number,
        default: 0,
        min: [0, 'Donor count cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        enum: {
            values: ['education', 'healthcare', 'environment', 'poverty', 'disaster-relief', 'animal-welfare', 'other'],
            message: 'Invalid category'
        },
        index: true
    },
    status: {
        type: String,
        enum: {
            values: ['active', 'inactive', 'completed', 'suspended'],
            message: 'Invalid status'
        },
        default: 'active',
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    endDate: {
        type: Date,
        required: [true, 'End date is required'],
        validate: {
            validator: function(value) {
                return value > Date.now();
            },
            message: 'End date must be in the future'
        }
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [50, 'Tag cannot exceed 50 characters']
    }],
    images: [{
        url: {
            type: String,
            required: true
        },
        caption: {
            type: String,
            maxlength: [200, 'Caption cannot exceed 200 characters']
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    documents: [{
        url: {
            type: String,
            required: true
        },
        name: {
            type: String,
            required: true,
            maxlength: [100, 'Document name cannot exceed 100 characters']
        },
        type: {
            type: String,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],
    location: {
        country: {
            type: String,
            default: 'India'
        },
        state: {
            type: String,
            default: ''
        },
        city: {
            type: String,
            default: ''
        },
        address: {
            type: String,
            default: ''
        }
    },
    featuredImage: {
        type: String,
        default: ''
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verificationDate: {
        type: Date
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    priority: {
        type: Number,
        default: 0,
        min: [0, 'Priority cannot be negative'],
        max: [10, 'Priority cannot exceed 10']
    },
    views: {
        type: Number,
        default: 0,
        min: [0, 'Views cannot be negative']
    },
    likes: {
        type: Number,
        default: 0,
        min: [0, 'Likes cannot be negative']
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    updates: [{
        title: {
            type: String,
            required: true,
            maxlength: [200, 'Update title cannot exceed 200 characters']
        },
        description: {
            type: String,
            required: true,
            maxlength: [2000, 'Update description cannot exceed 2000 characters']
        },
        images: [{
            type: String
        }],
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    milestones: [{
        amount: {
            type: Number,
            required: true,
            min: [1, 'Milestone amount must be at least 1']
        },
        description: {
            type: String,
            required: true,
            maxlength: [500, 'Milestone description cannot exceed 500 characters']
        },
        isAchieved: {
            type: Boolean,
            default: false
        },
        achievedAt: {
            type: Date
        }
    }]
}, {
    timestamps: true
});

// Indexes for better query performance
campaignSchema.index({ status: 1, endDate: 1 });
campaignSchema.index({ category: 1, status: 1 });
campaignSchema.index({ createdBy: 1, status: 1 });
campaignSchema.index({ raisedAmount: -1 });
campaignSchema.index({ createdAt: -1 });
campaignSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual for progress percentage
campaignSchema.virtual('progressPercentage').get(function() {
    return this.goalAmount > 0 ? Math.round((this.raisedAmount / this.goalAmount) * 100) : 0;
});

// Virtual for days remaining
campaignSchema.virtual('daysRemaining').get(function() {
    const now = new Date();
    const end = new Date(this.endDate);
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
});

// Virtual for campaign status based on end date
campaignSchema.virtual('isActive').get(function() {
    return this.status === 'active' && new Date() < this.endDate;
});

// Virtual for campaign URL slug
campaignSchema.virtual('slug').get(function() {
    return this.title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
});

// Method to update raised amount
campaignSchema.methods.updateRaisedAmount = async function(amount) {
    this.raisedAmount += amount;
    this.donorCount += 1;
    
    // Check if goal is achieved
    if (this.raisedAmount >= this.goalAmount && this.status === 'active') {
        this.status = 'completed';
    }
    
    // Update milestones
    this.milestones.forEach(milestone => {
        if (!milestone.isAchieved && this.raisedAmount >= milestone.amount) {
            milestone.isAchieved = true;
            milestone.achievedAt = new Date();
        }
    });
    
    await this.save();
};

// Method to add campaign update
campaignSchema.methods.addUpdate = async function(title, description, images = []) {
    this.updates.push({
        title,
        description,
        images,
        createdAt: new Date()
    });
    await this.save();
};

// Method to increment views
campaignSchema.methods.incrementViews = async function() {
    this.views += 1;
    await this.save();
};

// Static method to get trending campaigns
campaignSchema.statics.getTrendingCampaigns = async function(limit = 10) {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    return await this.find({
        status: 'active',
        endDate: { $gt: new Date() },
        createdAt: { $gte: oneWeekAgo }
    })
    .sort({ views: -1, likes: -1, raisedAmount: -1 })
    .limit(limit)
    .populate('createdBy', 'fullName email');
};

// Static method to get campaigns by category
campaignSchema.statics.getCampaignsByCategory = async function(category, limit = 10) {
    return await this.find({
        category,
        status: 'active',
        endDate: { $gt: new Date() }
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('createdBy', 'fullName email');
};

// Pre-save middleware to update campaign status based on end date
campaignSchema.pre('save', function(next) {
    if (this.status === 'active' && new Date() >= this.endDate) {
        this.status = 'completed';
    }
    next();
});

module.exports = mongoose.model('Campaign', campaignSchema);
