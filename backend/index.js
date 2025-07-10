const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const morgan = require('morgan');
const helmet = require('helmet');
require('dotenv').config();

// Import utilities
const logger = require('./utils/logger');
const connectDB = require('./config/database');

// Import middleware
const { errorHandler } = require('./middleware/errorHandler');
const rateLimit = require('express-rate-limit');

// Routes
const authRoutes = require('./routes/authRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const donationRoutes = require('./routes/donationRoutes');
const userRoutes = require('./routes/userRoutes');
const companyRoutes = require('./routes/companyRoutes');
const statsRoutes = require('./routes/statsRoutes');
const paymentRoutes = require('./routes/payment');
const ngoDashboardRoutes = require('./routes/ngoDashboard');
const protectedRoutes = require('./routes/protectedRoutes');
const adminRoutes = require('./routes/admin');
const ngoRoutes = require('./routes/ngo');
const companyRoutesAlt = require('./routes/company');
const adminDashboardRoutes = require('./routes/adminDashboard');
const donationAltRoutes = require('./routes/donation');
const statsAltRoutes = require('./routes/stats');
const authAltRoutes = require('./routes/auth');
const protectedAltRoutes = require('./routes/protected');

const app = express();

// Helmet security with proper configuration
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
  })
);

// CORS configuration
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://192.168.56.1:5173',
      'http://10.200.168.97:5173',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Trust proxy for accurate IP detection
app.set('trust proxy', 1);

// Rate Limiter
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logger
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
}

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV,
        version: '1.0.0'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/campaigns', campaignRoutes);
app.use('/api/donations', donationRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/admin/dashboard', adminDashboard);
app.use('/api/ngo', ngoDashboard);
app.use('/api/payments', paymentRoutes);
app.use('/api/protected', protectedRoutes);

// Welcome page for browsers
app.get('/', (req, res) => {
    const isBrowser = /Mozilla|Chrome|Safari/.test(req.get('User-Agent') || '');
    if (isBrowser) {
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Donation Platform API</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 40px; }
                    .container { max-width: 800px; margin: 0 auto; }
                    .endpoint { background: #f5f5f5; padding: 10px; margin: 5px 0; border-radius: 5px; }
                    .method { color: #007acc; font-weight: bold; }
                    .status { color: green; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🎯 Donation Platform API</h1>
                    <p class="status">✅ Backend is running successfully!</p>
                    <p><strong>MongoDB:</strong> Connected</p>
                    <p><strong>Express API:</strong> Running on port ${process.env.PORT || 5000}</p>
                    <h2>🔗 API Endpoints</h2>
                    <div class="endpoint"><span class="method">GET</span> <a href="/health">/health</a> - Health check</div>
                    <div class="endpoint"><span class="method">POST</span> /api/auth/login - User login</div>
                    <div class="endpoint"><span class="method">POST</span> /api/auth/register - User registration</div>
                    <div class="endpoint"><span class="method">GET</span> /api/campaigns - Get campaigns</div>
                </div>
            </body>
            </html>
        `);
    } else {
        res.json({
            message: 'Donation Platform API',
            version: '1.0.0',
            health: '/health',
            status: 'running',
            port: process.env.PORT || 5000
        });
    }
});

// 404 Fallback
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl,
    });
});

// Global error handler
app.use(errorHandler);

// Initialize cron jobs
const { startCronJobs } = require('./utils/cronJobs');

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`🔗 API URL: http://localhost:${PORT}`);

    // Start cron jobs
    startCronJobs();
});

module.exports = app;