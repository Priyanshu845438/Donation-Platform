
const { spawn } = require('child_process');
const { connectDB } = require('./config/database');

async function startDatabase() {
    console.log('🔄 Starting MongoDB...');
    
    // Start MongoDB daemon
    const mongod = spawn('mongod', [
        '--dbpath', './data/db',
        '--port', '27017',
        '--bind_ip', '127.0.0.1'
    ], {
        stdio: 'inherit'
    });

    // Wait a bit for MongoDB to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test connection
    try {
        await connectDB();
        console.log('✅ Database started successfully');
        process.exit(0);
    } catch (error) {
        console.error('❌ Failed to start database:', error.message);
        process.exit(1);
    }
}

startDatabase();
