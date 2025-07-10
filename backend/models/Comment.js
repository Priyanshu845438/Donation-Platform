const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    content: {
        type: String,
        required: [true, 'Comment content is required'],
        trim: true,
        minlength: [1, 'Comment must be at least 1 character'],
        maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    campaignId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campaign',
        required: true,
        index: true
    },
    parentCommentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null
    },
    replies: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    likes: {
        type: Number,
        default: 0,
        min: [0, 'Likes cannot be negative']
    },
    likedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isEdited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    },
    isApproved: {
        type: Boolean,
        default: true
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    approvedAt: {
        type: Date
    },
    reportCount: {
        type: Number,
        default: 0,
        min: [0, 'Report count cannot be negative']
    },
    reportedBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reason: {
            type: String,
            enum: ['spam', 'inappropriate', 'offensive', 'fake', 'other'],
            required: true
        },
        reportedAt: {
            type: Date,
            default: Date.now
        }
    }],
    metadata: {
        ipAddress: {
            type: String,
            required: true
        },
        userAgent: {
            type: String,
            required: true
        }
    }
}, {
    timestamps: true
});

// Indexes for better query performance
commentSchema.index({ campaignId: 1, createdAt: -1 });
commentSchema.index({ userId: 1, createdAt: -1 });
commentSchema.index({ parentCommentId: 1 });
commentSchema.index({ isDeleted: 1, isApproved: 1 });

// Virtual for reply count
commentSchema.virtual('replyCount').get(function() {
    return this.replies.length;
});

// Virtual for formatted creation date
commentSchema.virtual('formattedCreatedAt').get(function() {
    return this.createdAt.toLocaleDateString();
});

// Virtual for time since creation
commentSchema.virtual('timeAgo').get(function() {
    const now = new Date();
    const diffTime = now - this.createdAt;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffDays > 0) {
        return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else if (diffHours > 0) {
        return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffMinutes > 0) {
        return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
    } else {
        return 'Just now';
    }
});

// Method to like/unlike comment
commentSchema.methods.toggleLike = async function(userId) {
    const userIndex = this.likedBy.indexOf(userId);
    
    if (userIndex === -1) {
        // User hasn't liked the comment, add like
        this.likedBy.push(userId);
        this.likes += 1;
    } else {
        // User has liked the comment, remove like
        this.likedBy.splice(userIndex, 1);
        this.likes -= 1;
    }
    
    await this.save();
    return this;
};

// Method to add reply
commentSchema.methods.addReply = async function(replyId) {
    if (!this.replies.includes(replyId)) {
        this.replies.push(replyId);
        await this.save();
    }
    return this;
};

// Method to report comment
commentSchema.methods.reportComment = async function(userId, reason) {
    // Check if user has already reported this comment
    const existingReport = this.reportedBy.find(report => 
        report.userId.toString() === userId.toString()
    );
    
    if (!existingReport) {
        this.reportedBy.push({
            userId,
            reason,
            reportedAt: new Date()
        });
        this.reportCount += 1;
        
        // Auto-hide comment if it receives too many reports
        if (this.reportCount >= 5) {
            this.isApproved = false;
        }
        
        await this.save();
    }
    
    return this;
};

// Method to edit comment
commentSchema.methods.editComment = async function(newContent) {
    this.content = newContent;
    this.isEdited = true;
    this.editedAt = new Date();
    await this.save();
    return this;
};

// Method to soft delete comment
commentSchema.methods.softDelete = async function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.content = '[This comment has been deleted]';
    await this.save();
    return this;
};

// Static method to get comments for a campaign
commentSchema.statics.getCampaignComments = async function(campaignId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    return await this.find({
        campaignId,
        parentCommentId: null,
        isDeleted: false,
        isApproved: true
    })
    .populate('userId', 'fullName profileImage')
    .populate({
        path: 'replies',
        match: { isDeleted: false, isApproved: true },
        populate: {
            path: 'userId',
            select: 'fullName profileImage'
        }
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Static method to get user's comments
commentSchema.statics.getUserComments = async function(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    return await this.find({
        userId,
        isDeleted: false
    })
    .populate('campaignId', 'title')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);
};

// Pre-save middleware to validate parent comment
commentSchema.pre('save', async function(next) {
    if (this.parentCommentId) {
        const parentComment = await this.constructor.findById(this.parentCommentId);
        if (!parentComment) {
            throw new Error('Parent comment not found');
        }
        if (parentComment.campaignId.toString() !== this.campaignId.toString()) {
            throw new Error('Parent comment must belong to the same campaign');
        }
    }
    next();
});

module.exports = mongoose.model('Comment', commentSchema);
