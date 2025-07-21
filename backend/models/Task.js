
const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String,
        trim: true
    },
    dueDate: { 
        type: Date, 
        required: true
    },
    dueTime: {
        type: String, // Format: "HH:MM"
        default: "09:00"
    },
    priority: { 
        type: String, 
        enum: ["low", "medium", "high", "urgent"], 
        default: "medium" 
    },
    status: { 
        type: String, 
        enum: ["pending", "in-progress", "completed", "cancelled"], 
        default: "pending" 
    },
    category: {
        type: String,
        enum: ["meeting", "review", "approval", "maintenance", "deadline", "other"],
        default: "other"
    },
    reminderBefore: {
        type: Number, // Minutes before due time
        default: 30
    },
    isRecurring: {
        type: Boolean,
        default: false
    },
    recurringType: {
        type: String,
        enum: ["daily", "weekly", "monthly", "yearly"],
        required: function() { return this.isRecurring; }
    },
    recurringEndDate: {
        type: Date,
        required: function() { return this.isRecurring; }
    },
    notes: {
        type: String,
        trim: true
    },
    createdBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    reminderSent: {
        type: Boolean,
        default: false
    },
    completedAt: {
        type: Date
    }
}, { 
    timestamps: true 
});

// Index for efficient querying
TaskSchema.index({ createdBy: 1, dueDate: 1 });
TaskSchema.index({ status: 1, dueDate: 1 });
TaskSchema.index({ dueDate: 1, reminderSent: 1 });

// Virtual for checking if task is overdue
TaskSchema.virtual('isOverdue').get(function() {
    return this.status !== 'completed' && this.dueDate < new Date();
});

// Method to mark task as completed
TaskSchema.methods.markCompleted = function() {
    this.status = 'completed';
    this.completedAt = new Date();
    return this.save();
};

module.exports = mongoose.model("Task", TaskSchema);
