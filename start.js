
const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Donation Platform...');

// Start backend server
console.log('📦 Starting backend server...');
const backend = spawn('npm', ['start'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
});

// Wait a bit for backend to start, then start frontend
setTimeout(() => {
    console.log('🎨 Starting frontend development server...');
    const frontend = spawn('npm', ['run', 'dev'], {
        cwd: path.join(__dirname, 'frontend'),
        stdio: 'inherit',
        shell: true
    });

    frontend.on('error', (err) => {
        console.error('Frontend error:', err);
    });
}, 3000);

backend.on('error', (err) => {
    console.error('Backend error:', err);
});

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    backend.kill();
    process.exit(0);
});
