const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        enum: [
            'LOGIN',
            'LOGOUT',
            'REGISTER',
            'UPDATE_PROFILE',
            'CHANGE_PASSWORD',
            'CREATE_CAMPAIGN',
            'UPDATE_CAMPAIGN',
            'DELETE_CAMPAIGN',
            'DONATE',
            'FILE_UPLOAD',
            'VIEW_CAMPAIGN',
            'VIEW_PROFILE',
            'ADMIN_LOGIN',
            'ADMIN_UPDATE_USER',
            'ADMIN_UPDATE_CAMPAIGN',
            'ADMIN_DELETE_USER',
            'ADMIN_DELETE_CAMPAIGN',
            'OTHER'
        ],
        index: true
    },
    details: {
        type: String,
        required: true,
        maxlength: 500
    },
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String,
        required: true
    },
    requestData: {
        type: mongoose.Schema.Types.Mixed,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes for better query performance
activitySchema.index({ userId: 1, timestamp: -1 });
activitySchema.index({ action: 1, timestamp: -1 });
activitySchema.index({ timestamp: -1 });

// TTL index to automatically delete old activities after 90 days
activitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Virtual for formatted timestamp
activitySchema.virtual('formattedTimestamp').get(function() {
    return this.timestamp.toISOString();
});

// Method to get activity summary
activitySchema.statics.getActivitySummary = async function(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await this.aggregate([
        {
            $match: {
                userId: new mongoose.Types.ObjectId(userId),
                timestamp: { $gte: startDate }
            }
        },
        {
            $group: {
                _id: '$action',
                count: { $sum: 1 },
                lastActivity: { $max: '$timestamp' }
            }
        },
        {
            $sort: { count: -1 }
        }
    ]);
};

module.exports = mongoose.model('Activity', activitySchema);
