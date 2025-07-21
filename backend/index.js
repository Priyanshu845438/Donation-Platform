const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const path = require('path');
const { connectDB, gracefulShutdown } = require('./config/database');
const corsOptions = require('./config/corsConfig');
const { globalErrorHandler } = require('./utils/errorHandler');

const app = express();

// CORS configuration - Apply BEFORE anything else
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Allow all OPTIONS preflight

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`Request from ${req.headers.origin} → ${req.method} ${req.originalUrl}`);
    next();
});

// Other middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use("/api/auth", require("./routes/auth/index"));
app.use("/api/admin", require("./routes/admin/index"));
app.use("/api/ngo", require("./routes/ngo/index"));
app.use("/api/company", require("./routes/company/index"));
app.use("/api/donations", require("./routes/donations/index"));
app.use("/api/campaigns", require("./routes/campaigns/index"));
app.use("/api/payment", require("./routes/payment/index"));
app.use("/api/public", require("./routes/public/index"));
app.use("/api/user", require("./routes/user/index"));

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        status: 'fail',
        message: `Route ${req.originalUrl} not found`
    });
});

// Global error handler
app.use(globalErrorHandler);

const PORT = process.env.PORT || 5000;

// Initialize server
const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(`🔗 Health check: http://0.0.0.0:${PORT}/health`);
    console.log(`🔗 Local access: http://localhost:${PORT}/health`);
    connectDB();
});

// Graceful shutdown handling
const shutdown = async () => {
    console.log('Received shutdown signal. Starting graceful shutdown...');
    server.close(async () => {
        console.log('HTTP server closed.');
        await gracefulShutdown();
        process.exit(0);
    });
};

// Handle various shutdown signals
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    shutdown();
});
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    shutdown();
});

module.exports = app;