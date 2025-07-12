
const { spawn, exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

async function setupForTesting() {
    console.log('🔧 Setting up environment for testing...\n');
    
    try {
        // Check if MongoDB is installed
        await execAsync('mongod --version');
        console.log('✅ MongoDB is installed');
    } catch (error) {
        console.log('❌ MongoDB not found. Please install MongoDB first.');
        console.log('For Replit, use MongoDB Atlas or install MongoDB manually.');
        return;
    }
    
    // Create data directory
    await execAsync('mkdir -p data/db');
    console.log('✅ Created data directory');
    
    // Start MongoDB
    console.log('🔄 Starting MongoDB...');
    const mongod = spawn('mongod', [
        '--dbpath', './data/db',
        '--port', '27017',
        '--bind_ip', '127.0.0.1',
        '--fork',
        '--logpath', './data/mongodb.log'
    ]);
    
    // Wait for MongoDB to start
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Start the server
    console.log('🔄 Starting server...');
    const server = spawn('npm', ['run', 'dev'], {
        stdio: 'inherit',
        detached: true
    });
    
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('✅ Setup complete! You can now run tests.');
    console.log('Run: npm test');
}

setupForTesting().catch(console.error);
