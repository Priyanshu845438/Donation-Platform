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
const rateLimiter = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const campaignRoutes = require('./routes/campaignRoutes');
const donationRoutes = require('./routes/donationRoutes');
const companyRoutes = require('./routes/companyRoutes');
const statsRoutes = require('./routes/statsRoutes');
const adminDashboard = require('./routes/adminDashboard');
const ngoDashboard = require('./routes/ngoDashboard');
const paymentRoutes = require('./routes/payment');
const protectedRoutes = require('./routes/protected');

const app = express();

// Helmet security
// app.use(helmet({
//     crossOriginEmbedderPolicy: false,
//     contentSecurityPolicy: {
//         directives: {
//             defaultSrc: ["'self'"],
//             styleSrc: ["'self'", "'unsafe-inline'"],
//             scriptSrc: ["'self'"],
//             imgSrc: ["'self'", "data:", "https:"],
//         },
//     },
// }));
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false, // ❗ disable CSP to prevent local frontend blocking
  })
);

const PORT = 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
});
// ✅ Dynamic and safe CORS config
// ✅ FIX: Allow CORS before any security middleware like helmet
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
app.use(cors(corsOptions)); // ✅ Apply BEFORE anything else
app.options('*', cors(corsOptions)); // ✅ Allow all OPTIONS preflight
app.use((req, res, next) => {
  console.log(`Request from ${req.headers.origin} → ${req.method} ${req.originalUrl}`);
  next();
});




// 🔒 Rate Limiter (fixed trust proxy warning)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    trustProxy: false, // fixes trust proxy warning
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
        version: process.env.npm_package_version || '1.0.0'
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
                    <p><strong>MongoDB:</strong> Connected on port 27017</p>
                    <p><strong>Express API:</strong> Running on port 5000</p>

                    <h2>🔗 API Endpoints</h2>
                    <div class="endpoint"><span class="method">GET</span> <a href="/health">/health</a> - Health check</div>
                    <div class="endpoint"><span class="method">GET</span> <a href="/api/campaigns">/api/campaigns</a> - Get campaigns</div>
                    <div class="endpoint"><span class="method">POST</span> /api/auth/login - User login</div>
                    <div class="endpoint"><span class="method">POST</span> /api/auth/register - User registration</div>
                    <div class="endpoint"><span class="method">GET</span> /api/admin/dashboard/analytics - Admin analytics (requires auth)</div>

                    <h2>⚠️ Important Note</h2>
                    <p>Make sure to access the API on <strong>port 5000</strong> (this page), not port 27017 (MongoDB).</p>
                    <p>For frontend development, connect to: <code>http://localhost:5000</code></p>
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
            mongodb: 'connected',
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

// MongoDB connection and server startup
const startServer = async () => {
    try {
        await connectDB(); // from ./config/database.js

        const PORT = process.env.PORT || 5000;
        const server = app.listen(PORT, '0.0.0.0', () =>
            logger.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`)
        );

        process.on('SIGTERM', () => {
            logger.info('SIGTERM received, shutting down');
            server.close(() => process.exit(0));
        });

        process.on('SIGINT', () => {
            logger.info('SIGINT received, shutting down');
            server.close(() => process.exit(0));
        });

    } catch (err) {
        logger.error('❌ Failed to start server:', err);
        process.exit(1);
    }
};

startServer();

module.exports = app;