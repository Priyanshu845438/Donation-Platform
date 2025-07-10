const helmet = require('helmet');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const logger = require('../utils/logger');

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:5000'];
        
        // Allow requests with no origin (mobile apps, etc.)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            logger.warn(`CORS blocked origin: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

// Security middleware configuration
const securityMiddleware = (app) => {
    // Enable trust proxy for accurate IP addresses
    app.set('trust proxy', 1);

    // Helmet for security headers
    app.use(helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                fontSrc: ["'self'", "https://fonts.gstatic.com"],
                imgSrc: ["'self'", "data:", "https:"],
                scriptSrc: ["'self'"],
                connectSrc: ["'self'"]
            }
        },
        crossOriginEmbedderPolicy: false
    }));

    // CORS
    app.use(cors(corsOptions));

    // Data sanitization against NoSQL query injection
    app.use(mongoSanitize());

    // Data sanitization against XSS
    app.use(xss());

    // Prevent parameter pollution
    app.use(hpp({
        whitelist: ['sort', 'fields', 'page', 'limit', 'category', 'status']
    }));

    // Body parsing middleware with size limits
    app.use(require('express').json({ limit: '10mb' }));
    app.use(require('express').urlencoded({ extended: true, limit: '10mb' }));

    // Request logging
    app.use((req, res, next) => {
        logger.info(`${req.method} ${req.originalUrl} - ${req.ip}`);
        next();
    });
};

module.exports = { securityMiddleware, corsOptions };
