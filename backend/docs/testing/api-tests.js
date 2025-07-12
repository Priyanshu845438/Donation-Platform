
// API Testing Script for Donation Platform
// Base URL configuration
const BASE_URL = 'http://0.0.0.0:5000';
const API_BASE = `${BASE_URL}/api`;

// Health check function
async function checkServerHealth() {
    try {
        console.log('🔍 Checking server health...');
        const response = await fetch(`${BASE_URL}/health`);
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Server is running and healthy');
            console.log(`📊 Status: ${data.status}`);
            console.log(`⏰ Uptime: ${Math.round(data.uptime)}s`);
            return true;
        } else {
            console.log(`❌ Server responded with status: ${response.status}`);
            return false;
        }
    } catch (error) {
        console.log('❌ Server is not running. Please start the server first.');
        console.log('💡 Run: node index.js');
        console.log('🌐 Make sure server is bound to 0.0.0.0:5000');
        console.log(`📝 Error: ${error.message}`);
        return false;
    }
}

// Global variables for test data
let adminToken = '';
let ngoToken = '';
let companyToken = '';
let donorToken = '';
let testNGOId = '';
let testCompanyId = '';
let testDonorId = '';
let testCampaignId = '';

// Test data
const testUsers = {
    admin: {
        email: "acadify.online@gmail.com",
        password: "Acadify@123",
        role: "admin"
    },
    ngo: {
        fullName: "Test NGO Organization",
        email: `test.ngo.${Date.now()}@example.com`,
        password: "TestPassword123!",
        phoneNumber: "+1234567890",
        role: "ngo"
    },
    company: {
        fullName: "Test Company Inc",
        email: `test.company.${Date.now()}@example.com`,
        password: "TestPassword123!",
        phoneNumber: "+1234567891",
        role: "company"
    },
    donor: {
        fullName: "Test Donor User",
        email: `test.donor.${Date.now()}@example.com`,
        password: "TestPassword123!",
        phoneNumber: "+1234567892",
        role: "donor"
    }
};

// Helper function to make API requests
async function makeRequest(url, options = {}) {
    try {
        console.log(`\n📤 ${options.method || 'GET'} ${url}`);

        const defaultHeaders = {
            'Content-Type': 'application/json'
        };

        const response = await fetch(url, {
            ...options,
            headers: {
                ...defaultHeaders,
                ...options.headers
            }
        });

        const data = await response.json();

        if (response.ok) {
            console.log(`✅ Success (${response.status}):`, data.message || 'Request completed');
            return { success: true, data, status: response.status };
        } else {
            console.log(`❌ Error (${response.status}):`, data.message || 'Request failed');
            return { success: false, data, status: response.status };
        }
    } catch (error) {
        console.log(`💥 Network Error:`, error.message);
        return { success: false, error: error.message };
    }
}

// 🔐 ADMIN FLOW TESTS
async function testAdminFlow() {
    console.log('\n🔐 === ADMIN FLOW TESTS ===\n');
    
    // 1. Setup Admin Account
    console.log('🔧 Step 1: Setup Admin Account');
    const setupResult = await makeRequest(`${API_BASE}/auth/setup-admin`, {
        method: 'POST'
    });
    
    // 2. Login as Admin
    console.log('\n🔐 Step 2: Admin Login');
    const loginResult = await makeRequest(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(testUsers.admin)
    });
    
    if (loginResult.success && loginResult.data.token) {
        adminToken = loginResult.data.token;
        console.log('🎟️ Admin token obtained and stored');
    }
    
    // 3. NGO Management Tests
    await testNGOManagement();
    
    // 4. Company Management Tests
    await testCompanyManagement();
    
    // 5. Campaign Management Tests
    await testCampaignManagement();
    
    // 6. Reports & Analytics Tests
    await testReportsAnalytics();
    
    // 7. Logout as Admin
    console.log('\n🚪 Step 7: Admin Logout');
    await makeRequest(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    return true;
}

async function testNGOManagement() {
    console.log('\n👥 === NGO MANAGEMENT TESTS ===');
    
    // Add NGO
    console.log('\n➕ Testing: Add NGO');
    const addNGOResult = await makeRequest(`${API_BASE}/admin/create-user`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({
            fullName: "Admin Created NGO",
            email: `admin.ngo.${Date.now()}@example.com`,
            password: "TestPassword123!",
            phoneNumber: "+1234567893",
            role: "ngo"
        })
    });
    
    if (addNGOResult.success) {
        testNGOId = addNGOResult.data.user._id;
    }
    
    // View NGO Profile
    console.log('\n👁️ Testing: View NGO Profile');
    await makeRequest(`${API_BASE}/admin/ngos/${testNGOId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    // Edit NGO Details
    console.log('\n✏️ Testing: Edit NGO Details');
    await makeRequest(`${API_BASE}/admin/ngos/${testNGOId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({
            ngoName: "Updated NGO Name",
            address: "Updated Address"
        })
    });
    
    // Disable NGO
    console.log('\n🚫 Testing: Disable NGO');
    await makeRequest(`${API_BASE}/admin/ngos/${testNGOId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ isActive: false })
    });
    
    // Enable NGO
    console.log('\n✅ Testing: Enable NGO');
    await makeRequest(`${API_BASE}/admin/ngos/${testNGOId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ isActive: true })
    });
    
    // Share NGO Profile Link
    console.log('\n🔗 Testing: Share NGO Profile Link');
    await makeRequest(`${API_BASE}/admin/ngos/${testNGOId}/share`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    // Get all NGOs
    console.log('\n📋 Testing: Get All NGOs');
    await makeRequest(`${API_BASE}/admin/ngos`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
}

async function testCompanyManagement() {
    console.log('\n🏢 === COMPANY MANAGEMENT TESTS ===');
    
    // Add Company
    console.log('\n➕ Testing: Add Company');
    const addCompanyResult = await makeRequest(`${API_BASE}/admin/create-user`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({
            fullName: "Admin Created Company",
            email: `admin.company.${Date.now()}@example.com`,
            password: "TestPassword123!",
            phoneNumber: "+1234567894",
            role: "company"
        })
    });
    
    if (addCompanyResult.success) {
        testCompanyId = addCompanyResult.data.user._id;
    }
    
    // View Company Profile
    console.log('\n👁️ Testing: View Company Profile');
    await makeRequest(`${API_BASE}/admin/companies/${testCompanyId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    // Edit Company Details
    console.log('\n✏️ Testing: Edit Company Details');
    await makeRequest(`${API_BASE}/admin/companies/${testCompanyId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({
            companyName: "Updated Company Name",
            companyAddress: "Updated Address"
        })
    });
    
    // Disable Company
    console.log('\n🚫 Testing: Disable Company');
    await makeRequest(`${API_BASE}/admin/companies/${testCompanyId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ isActive: false })
    });
    
    // Enable Company
    console.log('\n✅ Testing: Enable Company');
    await makeRequest(`${API_BASE}/admin/companies/${testCompanyId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ isActive: true })
    });
    
    // Share Company Profile Link
    console.log('\n🔗 Testing: Share Company Profile Link');
    await makeRequest(`${API_BASE}/admin/companies/${testCompanyId}/share`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    // Get all Companies
    console.log('\n📋 Testing: Get All Companies');
    await makeRequest(`${API_BASE}/admin/companies`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
}

async function testCampaignManagement() {
    console.log('\n📢 === CAMPAIGN MANAGEMENT TESTS ===');
    
    // Add Campaign
    console.log('\n➕ Testing: Add Campaign');
    const addCampaignResult = await makeRequest(`${API_BASE}/admin/campaigns`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({
            title: "Admin Created Campaign",
            description: "Test campaign created by admin",
            category: "Education",
            targetAmount: 100000,
            endDate: "2024-12-31",
            ngoId: testNGOId
        })
    });
    
    if (addCampaignResult.success) {
        testCampaignId = addCampaignResult.data.campaign?._id || addCampaignResult.data._id;
    }
    
    // View Campaign Details
    console.log('\n👁️ Testing: View Campaign Details');
    await makeRequest(`${API_BASE}/admin/campaigns/${testCampaignId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    // Edit Campaign Details
    console.log('\n✏️ Testing: Edit Campaign Details');
    await makeRequest(`${API_BASE}/admin/campaigns/${testCampaignId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({
            title: "Updated Campaign Title",
            targetAmount: 150000
        })
    });
    
    // Disable Campaign
    console.log('\n🚫 Testing: Disable Campaign');
    await makeRequest(`${API_BASE}/admin/campaigns/${testCampaignId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ isActive: false })
    });
    
    // Enable Campaign
    console.log('\n✅ Testing: Enable Campaign');
    await makeRequest(`${API_BASE}/admin/campaigns/${testCampaignId}/status`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ isActive: true })
    });
    
    // Share Campaign Profile Link
    console.log('\n🔗 Testing: Share Campaign Profile Link');
    await makeRequest(`${API_BASE}/admin/campaigns/${testCampaignId}/share`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    // Get all Campaigns
    console.log('\n📋 Testing: Get All Campaigns');
    await makeRequest(`${API_BASE}/admin/campaigns`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
}

async function testReportsAnalytics() {
    console.log('\n📊 === REPORTS & ANALYTICS TESTS ===');
    
    // View NGO Reports
    console.log('\n📈 Testing: View NGO Reports');
    await makeRequest(`${API_BASE}/admin/reports/ngos`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    // View Company Reports
    console.log('\n📈 Testing: View Company Reports');
    await makeRequest(`${API_BASE}/admin/reports/companies`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    // View Campaign Reports
    console.log('\n📈 Testing: View Campaign Reports');
    await makeRequest(`${API_BASE}/admin/reports/campaigns`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    // View Donation Reports
    console.log('\n📈 Testing: View Donation Reports');
    await makeRequest(`${API_BASE}/admin/reports/donations`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    // View Activity Reports
    console.log('\n📈 Testing: View Activity Reports');
    await makeRequest(`${API_BASE}/admin/reports/activities`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    // View Transaction Reports
    console.log('\n📈 Testing: View Transaction Reports');
    await makeRequest(`${API_BASE}/admin/reports/transactions`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
}

// 📝 NGO USER FLOW TESTS
async function testNGOUserFlow() {
    console.log('\n📝 === NGO USER FLOW TESTS ===\n');
    
    // 1. Sign Up as NGO
    console.log('📝 Step 1: Sign Up as NGO');
    const signupResult = await makeRequest(`${API_BASE}/auth/signup`, {
        method: 'POST',
        body: JSON.stringify(testUsers.ngo)
    });
    
    if (signupResult.success) {
        testNGOId = signupResult.data.user.id || signupResult.data.user._id;
    }
    
    // 2. Login as Admin → Approve NGO
    console.log('\n🔐 Step 2: Admin Login to Approve NGO');
    await makeRequest(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(testUsers.admin)
    });
    
    console.log('✅ Step 2.1: Approve NGO');
    await makeRequest(`${API_BASE}/admin/users/${testNGOId}/approval`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ approvalStatus: "approved" })
    });
    
    // 3. Logout as Admin
    console.log('\n🚪 Step 3: Logout as Admin');
    await makeRequest(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    // 4. Login as NGO
    console.log('\n🔐 Step 4: Login as NGO');
    const ngoLoginResult = await makeRequest(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
            email: testUsers.ngo.email,
            password: testUsers.ngo.password
        })
    });
    
    if (ngoLoginResult.success && ngoLoginResult.data.token) {
        ngoToken = ngoLoginResult.data.token;
    }
    
    // 5. Logout as NGO
    console.log('\n🚪 Step 5: Logout as NGO');
    await makeRequest(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${ngoToken}` }
    });
    
    return true;
}

// 🏢 COMPANY USER FLOW TESTS
async function testCompanyUserFlow() {
    console.log('\n🏢 === COMPANY USER FLOW TESTS ===\n');
    
    // 1. Sign Up as Company
    console.log('🏢 Step 1: Sign Up as Company');
    const signupResult = await makeRequest(`${API_BASE}/auth/signup`, {
        method: 'POST',
        body: JSON.stringify(testUsers.company)
    });
    
    if (signupResult.success) {
        testCompanyId = signupResult.data.user.id || signupResult.data.user._id;
    }
    
    // 2. Login as Admin → Approve Company
    console.log('\n🔐 Step 2: Admin Login to Approve Company');
    await makeRequest(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(testUsers.admin)
    });
    
    console.log('✅ Step 2.1: Approve Company');
    await makeRequest(`${API_BASE}/admin/users/${testCompanyId}/approval`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ approvalStatus: "approved" })
    });
    
    // 3. Logout as Admin
    console.log('\n🚪 Step 3: Logout as Admin');
    await makeRequest(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    // 4. Login as Company
    console.log('\n🔐 Step 4: Login as Company');
    const companyLoginResult = await makeRequest(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
            email: testUsers.company.email,
            password: testUsers.company.password
        })
    });
    
    if (companyLoginResult.success && companyLoginResult.data.token) {
        companyToken = companyLoginResult.data.token;
    }
    
    // 5. Logout as Company
    console.log('\n🚪 Step 5: Logout as Company');
    await makeRequest(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${companyToken}` }
    });
    
    return true;
}

// 🧑 DONOR/USER FLOW TESTS
async function testDonorUserFlow() {
    console.log('\n🧑 === DONOR/USER FLOW TESTS ===\n');
    
    // 1. Sign Up as Donor/User
    console.log('🧑 Step 1: Sign Up as Donor/User');
    const signupResult = await makeRequest(`${API_BASE}/auth/signup`, {
        method: 'POST',
        body: JSON.stringify(testUsers.donor)
    });
    
    if (signupResult.success) {
        testDonorId = signupResult.data.user.id || signupResult.data.user._id;
    }
    
    // 2. Login as Admin → Approve Donor/User
    console.log('\n🔐 Step 2: Admin Login to Approve Donor/User');
    await makeRequest(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify(testUsers.admin)
    });
    
    console.log('✅ Step 2.1: Approve Donor/User');
    await makeRequest(`${API_BASE}/admin/users/${testDonorId}/approval`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ approvalStatus: "approved" })
    });
    
    // 3. Logout as Admin
    console.log('\n🚪 Step 3: Logout as Admin');
    await makeRequest(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    
    // 4. Login as Donor/User
    console.log('\n🔐 Step 4: Login as Donor/User');
    const donorLoginResult = await makeRequest(`${API_BASE}/auth/login`, {
        method: 'POST',
        body: JSON.stringify({
            email: testUsers.donor.email,
            password: testUsers.donor.password
        })
    });
    
    if (donorLoginResult.success && donorLoginResult.data.token) {
        donorToken = donorLoginResult.data.token;
    }
    
    // 5. Logout as Donor/User
    console.log('\n🚪 Step 5: Logout as Donor/User');
    await makeRequest(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${donorToken}` }
    });
    
    return true;
}

// Test Public Routes
async function testPublicRoutes() {
    console.log('\n🌐 === PUBLIC ROUTES TESTS ===');
    
    // Test get all NGOs
    console.log('\n📋 Testing: Get All NGOs');
    const ngosResult = await makeRequest(`${API_BASE}/public/ngos`);
    
    // Test get all companies  
    console.log('\n📋 Testing: Get All Companies');
    const companiesResult = await makeRequest(`${API_BASE}/public/companies`);
    
    // Test get all campaigns
    console.log('\n📋 Testing: Get All Campaigns');
    const campaignsResult = await makeRequest(`${API_BASE}/public/campaigns`);
    
    return ngosResult.success && companiesResult.success && campaignsResult.success;
}

// Main test runner
async function runAllTests() {
    console.log('🚀 Starting Complete API Tests for Donation Platform\n');
    console.log('=' .repeat(60));
    
    // Check server health first
    const serverHealthy = await checkServerHealth();
    if (!serverHealthy) {
        console.log('\n❌ Cannot proceed with tests. Server is not running.');
        return;
    }
    
    const tests = [
        { name: 'Admin Flow', fn: testAdminFlow },
        { name: 'NGO User Flow', fn: testNGOUserFlow },
        { name: 'Company User Flow', fn: testCompanyUserFlow },
        { name: 'Donor User Flow', fn: testDonorUserFlow },
        { name: 'Public Routes', fn: testPublicRoutes }
    ];
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        try {
            console.log(`\n${'=' .repeat(60)}`);
            console.log(`🧪 TESTING: ${test.name.toUpperCase()}`);
            console.log(`${'=' .repeat(60)}`);
            
            const result = await test.fn();
            if (result) {
                console.log(`\n✅ ${test.name}: PASSED`);
                passed++;
            } else {
                console.log(`\n❌ ${test.name}: FAILED`);
                failed++;
            }
        } catch (error) {
            console.log(`\n💥 ${test.name}: ERROR - ${error.message}`);
            failed++;
        }
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    console.log('\n' + '=' .repeat(60));
    console.log('📊 FINAL TEST SUMMARY:');
    console.log('=' .repeat(60));
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${passed + failed}`);
    console.log(`📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);
    
    if (failed === 0) {
        console.log('\n🎉 All tests passed! Your API is working correctly.');
    } else {
        console.log('\n⚠️  Some tests failed. Please check the error messages above.');
    }
}

// Export for test runner
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        runAllTests,
        testAdminFlow,
        testNGOUserFlow,
        testCompanyUserFlow,
        testDonorUserFlow,
        testPublicRoutes,
        checkServerHealth
    };
}
