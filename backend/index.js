const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require('path');

// Import routes
const authRoutes = require("./routes/auth");
const ngoRoutes = require("./routes/ngo");
const paymentRoutes = require("./routes/payment");
const adminRoutes = require("./routes/admin");
const campaignRoutes = require("./routes/campaignRoutes");
const companyRoutes = require("./routes/company");
const donationRoutes = require("./routes/donation");
const adminDashboardRoute = require('./routes/adminDashboard');
const userRoutes = require('./routes/userRoutes');
const statsRoutes = require('./routes/stats');


const app = express();
const PORT = process.env.PORT || 5000;

// Security and parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors({
    origin: process.env.NODE_ENV === 'production' 
        ? process.env.FRONTEND_URL 
        : "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

// Static file serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'healthy',
        timestamp: new Date(),
        uptime: process.uptime()
    });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/ngo", ngoRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/campaign", campaignRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/donation", donationRoutes);
app.use('/api/admin', adminDashboardRoute);
app.use('/api/users', userRoutes);
app.use('/api/stats', statsRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'development' 
            ? err.message 
            : "Internal server error",
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

// MongoDB connection with retry logic
const connectDB = async (retries = 5) => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log("✅ MongoDB Connected Successfully");
        
        mongoose.connection.on('error', err => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
            if (retries > 0) {
                setTimeout(() => connectDB(retries - 1), 5000);
            }
        });

    } catch (err) {
        console.error("❌ MongoDB Connection Error:", err);
        if (retries > 0) {
            console.log(`Retrying connection... (${retries} attempts remaining)`);
            setTimeout(() => connectDB(retries - 1), 5000);
        }
    }
};

// Graceful shutdown handling
const gracefulShutdown = () => {
    console.log('Received shutdown signal. Starting graceful shutdown...');
    server.close(async () => {
        console.log('HTTP server closed.');
        try {
            await mongoose.connection.close();
            console.log('MongoDB connection closed.');
            process.exit(0);
        } catch (err) {
            console.error('Error during shutdown:', err);
            process.exit(1);
        }
    });
};

// Initialize server
const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
    connectDB();
});

// Handle various shutdown signals
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    gracefulShutdown();
});
process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    gracefulShutdown();
});
