const { runAllTests } = require('./docs/testing/api-tests.js');

// Run the complete test suite
async function runTests() {
    console.log('🚀 Starting API Test Suite for Donation Platform...\n');
    await runAllTests();
}

// Only run if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { runTests };