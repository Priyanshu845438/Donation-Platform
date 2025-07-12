
const readline = require('readline');
const { 
    makeRequest, 
    authTests, 
    publicTests, 
    ngoTests, 
    companyTests, 
    adminTests,
    APITestSuite 
} = require('./docs/testing/api-tests.js');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function showMenu() {
    console.log('\n🧪 API Testing Menu:');
    console.log('1. Run All Tests');
    console.log('2. Test Authentication');
    console.log('3. Test Public APIs');
    console.log('4. Test NGO APIs');
    console.log('5. Test Company APIs');
    console.log('6. Test Admin APIs');
    console.log('7. Test Single Endpoint');
    console.log('8. Exit');
    console.log('');
}

async function runInteractiveTest() {
    console.log('🚀 Welcome to Interactive API Testing\n');
    
    showMenu();
    
    rl.on('line', async (input) => {
        const choice = input.trim();
        
        switch (choice) {
            case '1':
                console.log('Running all tests...');
                const testSuite = new APITestSuite();
                await testSuite.runAllTests();
                break;
                
            case '2':
                console.log('Testing Authentication...');
                await authTests.testUserLogin();
                await authTests.testGetProfile();
                break;
                
            case '3':
                console.log('Testing Public APIs...');
                await publicTests.testGetAllCampaigns();
                await publicTests.testGetPlatformStats();
                break;
                
            case '4':
                console.log('Testing NGO APIs...');
                await ngoTests.testCreateCampaign();
                await ngoTests.testGetNGOCampaigns();
                break;
                
            case '5':
                console.log('Testing Company APIs...');
                await companyTests.testCompanyLogin();
                await companyTests.testGetCompanyDashboard();
                break;
                
            case '6':
                console.log('Testing Admin APIs...');
                await adminTests.testAdminLogin();
                await adminTests.testGetAllUsers();
                break;
                
            case '7':
                console.log('Testing single endpoint...');
                const response = await makeRequest('GET', '/health');
                console.log('Health Check Response:', response);
                break;
                
            case '8':
                console.log('Goodbye!');
                rl.close();
                return;
                
            default:
                console.log('Invalid choice. Please try again.');
        }
        
        showMenu();
    });
}

runInteractiveTest();
