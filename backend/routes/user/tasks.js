
const express = require("express");
const TaskController = require("../../controllers/taskController");
const authMiddleware = require("../../middleware/auth");

const router = express.Router();

// All routes require authentication but allow all user roles
const userAuth = authMiddleware(["admin", "ngo", "company", "donor"]);

// Get user's tasks
router.get("/", userAuth, TaskController.getUserTasks);

// Create new task
router.post("/", userAuth, TaskController.createTask);

// Get single task
router.get("/:id", userAuth, TaskController.getTask);

// Update task
router.put("/:id", userAuth, TaskController.updateTask);

// Delete task
router.delete("/:id", userAuth, TaskController.deleteTask);

// Mark task as completed
router.patch("/:id/complete", userAuth, TaskController.markTaskCompleted);

// Calendar view
router.get("/calendar/view", userAuth, TaskController.getCalendarView);

// Today's tasks
router.get("/today/list", userAuth, TaskController.getTodaysTasks);

// Upcoming tasks
router.get("/upcoming/list", userAuth, TaskController.getUpcomingTasks);

module.exports = router;
