const mongoose = require("mongoose");

const campaignSchema = new mongoose.Schema(
    {
        campaignName: { 
            type: String, 
            required: [true, "Campaign name is required"],
            trim: true,
            minlength: [3, "Campaign name must be at least 3 characters long"]
        },
        contactNumber: { 
            type: String, 
            required: [true, "Contact number is required"],
            match: [/^\+?[\d\s-]{10,}$/, "Please enter a valid contact number"]
        },
        campaignImage: { 
            type: String, 
            required: [true, "Campaign image is required"]
        },
        proofDocs: [{
            type: String,
            validate: {
                validator: function(v) {
                    return v && v.length > 0;
                },
                message: "At least one proof document is required"
            }
        }],
        explainStory: { 
            type: String, 
            required: [true, "Campaign story is required"],
            minlength: [100, "Story must be at least 100 characters long"]
        },
        importance: { 
            type: String, 
            required: [true, "Campaign importance is required"]
        },
        createdBy: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "NGO", 
            required: true 
        },
        goalAmount: { 
            type: Number, 
            required: [true, "Goal amount is required"],
            min: [1000, "Goal amount must be at least 1000"]
        },
        collectedAmount: { 
            type: Number, 
            default: 0,
            min: 0
        },
        isActive: { 
            type: Boolean, 
            default: true 
        },
        status: {
            type: String,
            enum: ['pending', 'active', 'completed', 'rejected'],
            default: 'pending'
        },
        endDate: {
            type: Date,
            required: [true, "Campaign end date is required"]
        }
    },
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual for campaign progress percentage
campaignSchema.virtual('progress').get(function() {
    return ((this.collectedAmount / this.goalAmount) * 100).toFixed(2);
});

// Index for better query performance
campaignSchema.index({ createdBy: 1, status: 1 });

// Pre-save middleware to validate endDate
campaignSchema.pre('save', function(next) {
    if (this.endDate && this.endDate < new Date()) {
        next(new Error('End date cannot be in the past'));
    }
    next();
});

module.exports = mongoose.model("Campaign", campaignSchema);
