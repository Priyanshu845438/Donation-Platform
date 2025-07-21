
const Task = require("../models/Task");
const User = require("../models/User");

// Get user's tasks with filtering and pagination
const getUserTasks = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, priority, category, search, startDate, endDate } = req.query;
        const userId = req.user.id;

        // Build filter object
        let filter = { createdBy: userId };

        if (status && status !== 'all') {
            filter.status = status;
        }

        if (priority && priority !== 'all') {
            filter.priority = priority;
        }

        if (category && category !== 'all') {
            filter.category = category;
        }

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { notes: { $regex: search, $options: 'i' } }
            ];
        }

        // Date range filter
        if (startDate || endDate) {
            filter.dueDate = {};
            if (startDate) filter.dueDate.$gte = new Date(startDate);
            if (endDate) filter.dueDate.$lte = new Date(endDate);
        }

        const skip = (page - 1) * limit;
        const tasks = await Task.find(filter)
            .sort({ dueDate: 1, priority: -1 })
            .skip(skip)
            .limit(parseInt(limit))
            .populate('createdBy', 'fullName email');

        const total = await Task.countDocuments(filter);

        // Get task statistics
        const stats = await Task.aggregate([
            { $match: { createdBy: userId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        const taskStats = {
            total,
            pending: stats.find(s => s._id === 'pending')?.count || 0,
            'in-progress': stats.find(s => s._id === 'in-progress')?.count || 0,
            completed: stats.find(s => s._id === 'completed')?.count || 0,
            cancelled: stats.find(s => s._id === 'cancelled')?.count || 0,
            overdue: tasks.filter(task => task.isOverdue).length
        };

        res.json({
            success: true,
            message: "Tasks retrieved successfully",
            tasks,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalTasks: total,
                hasNext: page * limit < total,
                hasPrev: page > 1
            },
            stats: taskStats
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve tasks",
            error: error.message
        });
    }
};

// Create new task
const createTask = async (req, res) => {
    try {
        const {
            title,
            description,
            dueDate,
            dueTime,
            priority,
            category,
            reminderBefore,
            isRecurring,
            recurringType,
            recurringEndDate,
            notes
        } = req.body;

        // Validation
        if (!title || !dueDate) {
            return res.status(400).json({
                success: false,
                message: "Title and due date are required"
            });
        }

        if (isRecurring && (!recurringType || !recurringEndDate)) {
            return res.status(400).json({
                success: false,
                message: "Recurring type and end date are required for recurring tasks"
            });
        }

        const task = new Task({
            title,
            description,
            dueDate: new Date(dueDate),
            dueTime: dueTime || "09:00",
            priority: priority || "medium",
            category: category || "other",
            reminderBefore: reminderBefore || 30,
            isRecurring: isRecurring || false,
            recurringType,
            recurringEndDate: recurringEndDate ? new Date(recurringEndDate) : null,
            notes,
            createdBy: req.user.id
        });

        await task.save();
        await task.populate('createdBy', 'fullName email');

        res.status(201).json({
            success: true,
            message: "Task created successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to create task",
            error: error.message
        });
    }
};

// Get single task
const getTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const task = await Task.findOne({ _id: id, createdBy: userId })
            .populate('createdBy', 'fullName email');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.json({
            success: true,
            message: "Task retrieved successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve task",
            error: error.message
        });
    }
};

// Update task
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const updateData = req.body;

        // Remove fields that shouldn't be updated directly
        delete updateData.createdBy;
        delete updateData._id;

        const task = await Task.findOneAndUpdate(
            { _id: id, createdBy: userId },
            updateData,
            { new: true, runValidators: true }
        ).populate('createdBy', 'fullName email');

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.json({
            success: true,
            message: "Task updated successfully",
            task
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to update task",
            error: error.message
        });
    }
};

// Delete task
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const task = await Task.findOneAndDelete({ _id: id, createdBy: userId });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        res.json({
            success: true,
            message: "Task deleted successfully"
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to delete task",
            error: error.message
        });
    }
};

// Mark task as completed
const markTaskCompleted = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const task = await Task.findOne({ _id: id, createdBy: userId });

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found"
            });
        }

        await task.markCompleted();
        await task.populate('createdBy', 'fullName email');

        res.json({
            success: true,
            message: "Task marked as completed",
            task
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to mark task as completed",
            error: error.message
        });
    }
};

// Get calendar view (monthly)
const getCalendarView = async (req, res) => {
    try {
        const { year, month } = req.query;
        const userId = req.user.id;

        // Default to current month if not provided
        const currentDate = new Date();
        const targetYear = year ? parseInt(year) : currentDate.getFullYear();
        const targetMonth = month ? parseInt(month) - 1 : currentDate.getMonth();

        // Get start and end of month
        const startOfMonth = new Date(targetYear, targetMonth, 1);
        const endOfMonth = new Date(targetYear, targetMonth + 1, 0);

        const tasks = await Task.find({
            createdBy: userId,
            dueDate: {
                $gte: startOfMonth,
                $lte: endOfMonth
            }
        }).sort({ dueDate: 1, dueTime: 1 });

        // Group tasks by date
        const tasksByDate = {};
        tasks.forEach(task => {
            const dateKey = task.dueDate.toISOString().split('T')[0];
            if (!tasksByDate[dateKey]) {
                tasksByDate[dateKey] = [];
            }
            tasksByDate[dateKey].push(task);
        });

        res.json({
            success: true,
            message: "Calendar view retrieved successfully",
            calendar: {
                year: targetYear,
                month: targetMonth + 1,
                monthName: startOfMonth.toLocaleString('default', { month: 'long' }),
                startDate: startOfMonth,
                endDate: endOfMonth,
                tasksByDate,
                totalTasks: tasks.length
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve calendar view",
            error: error.message
        });
    }
};

// Get today's tasks
const getTodaysTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const tasks = await Task.find({
            createdBy: userId,
            dueDate: {
                $gte: startOfDay,
                $lt: endOfDay
            }
        }).sort({ dueTime: 1, priority: -1 });

        const overdueTasks = await Task.find({
            createdBy: userId,
            dueDate: { $lt: startOfDay },
            status: { $nin: ['completed', 'cancelled'] }
        }).sort({ dueDate: -1 });

        res.json({
            success: true,
            message: "Today's tasks retrieved successfully",
            todaysTasks: tasks,
            overdueTasks,
            summary: {
                totalToday: tasks.length,
                completedToday: tasks.filter(t => t.status === 'completed').length,
                pendingToday: tasks.filter(t => t.status === 'pending').length,
                overdueCount: overdueTasks.length
            }
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve today's tasks",
            error: error.message
        });
    }
};

// Get upcoming tasks (next 7 days)
const getUpcomingTasks = async (req, res) => {
    try {
        const userId = req.user.id;
        const today = new Date();
        const nextWeek = new Date(today.getTime() + (7 * 24 * 60 * 60 * 1000));

        const tasks = await Task.find({
            createdBy: userId,
            dueDate: {
                $gte: today,
                $lte: nextWeek
            },
            status: { $nin: ['completed', 'cancelled'] }
        }).sort({ dueDate: 1, dueTime: 1 });

        res.json({
            success: true,
            message: "Upcoming tasks retrieved successfully",
            upcomingTasks: tasks,
            count: tasks.length
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to retrieve upcoming tasks",
            error: error.message
        });
    }
};

module.exports = {
    getUserTasks,
    createTask,
    getTask,
    updateTask,
    deleteTask,
    markTaskCompleted,
    getCalendarView,
    getTodaysTasks,
    getUpcomingTasks
};
