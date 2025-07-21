
const express = require("express");
const router = express.Router();

// Task management routes
router.use("/tasks", require("./tasks"));

module.exports = router;
