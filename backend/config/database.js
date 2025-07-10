const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
    try {
        // ✅ Use environment variable or fallback to localhost
        const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/backend';

        const options = {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        };

        const conn = await mongoose.connect(mongoURI, options);
        logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Connection events
        mongoose.connection.on('error', (err) => {
            logger.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            logger.warn('⚠️ MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            logger.info('🔁 MongoDB reconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            try {
                await mongoose.connection.close();
                logger.info('🔌 MongoDB connection closed through app termination');
                process.exit(0);
            } catch (error) {
                logger.error('❌ Error closing MongoDB connection:', error);
                process.exit(1);
            }
        });

        return conn;

    } catch (error) {
        logger.error('❌ Database connection failed:', error);
        logger.info('📌 Note: Make sure MongoDB is running on your local system.');
        process.exit(1);
    }
};

module.exports = connectDB;
