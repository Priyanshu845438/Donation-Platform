
const mongoose = require("mongoose");

const connectDB = async (retries = 5) => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/donation_platform';
        
        if (!process.env.MONGO_URI) {
            console.log('⚠️ MONGO_URI not found in environment variables, using default local MongoDB');
        }
        
        const conn = await mongoose.connect(mongoUri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            bufferCommands: false,
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Connection event handlers
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Attempting to reconnect...');
            if (retries > 0) {
                setTimeout(() => connectDB(retries - 1), 5000);
            }
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected successfully');
        });

        return conn;

    } catch (error) {
        console.error("❌ MongoDB Connection Error:", error);
        if (retries > 0) {
            console.log(`Retrying connection... (${retries} attempts remaining)`);
            setTimeout(() => connectDB(retries - 1), 5000);
        } else {
            console.error("❌ Failed to connect to MongoDB after all retries");
            process.exit(1);
        }
    }
};

const gracefulShutdown = async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed gracefully');
    } catch (error) {
        console.error('Error closing MongoDB connection:', error);
    }
};

module.exports = { connectDB, gracefulShutdown };
