# API Testing Guide for Donation Platform

This guide provides comprehensive testing instructions for all API endpoints in the Donation Platform.

## 🔧 Prerequisites

1. **Server Running**: Ensure your Node.js server is running on `http://0.0.0.0:5000`
2. **Database Connected**: MongoDB should be properly connected
3. **Testing Tools**: Use curl, Postman, or the provided test scripts

## 🏃‍♂️ Quick Start

### Method 1: Automated Testing Script
```bash
node docs/testing/api-tests.js
```

### Method 2: Manual Testing with curl

## 🔥 Step 1: Health Check

```bash
curl --location 'http://0.0.0.0:5000/health'
```
**Expected Response**: Status 200 with server health information

---

## 🔐 Step 2: Authentication Routes Testing

### 2.1 Setup Admin (First Time Only)

```bash
curl --location 'http://0.0.0.0:5000/api/auth/setup-admin' \
--header 'Content-Type: application/json' \
--request POST
```
**Expected Response**: Status 201 - "Default admin created successfully"

### 2.2 Admin Login

```bash
curl --location 'http://0.0.0.0:5000/api/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "acadify.online@gmail.com",
  "password": "Acadify@123"
}'
```
**Expected Response**: Status 200 with JWT token

**Note**: Save the token from the response for subsequent requests!

### 2.3 User Registration (NGO)

```bash
curl --location 'http://0.0.0.0:5000/api/auth/signup' \
--header 'Content-Type: application/json' \
--data-raw '{
  "fullName": "Test NGO Organization",
  "email": "test.ngo@example.com",
  "password": "TestPassword123!",
  "phoneNumber": "+1234567890",
  "role": "NGO"
}'
```
**Expected Response**: Status 201 with user and NGO profile created

### 2.4 User Registration (Company)

```bash
curl --location 'http://0.0.0.0:5000/api/auth/signup' \
--header 'Content-Type: application/json' \
--data-raw '{
  "fullName": "Test Company Inc",
  "email": "test.company@example.com", 
  "password": "TestPassword123!",
  "phoneNumber": "+1234567891",
  "role": "Company"
}'
```
**Expected Response**: Status 201 with user and company profile created

### 2.5 Alternative Registration Endpoint

```bash
curl --location 'http://0.0.0.0:5000/api/auth/register' \
--header 'Content-Type: application/json' \
--data-raw '{
  "fullName": "Another Test User",
  "email": "another.test@example.com",
  "password": "TestPassword123!",
  "phoneNumber": "+1234567892",
  "role": "Donor"
}'
```

### 2.6 NGO/Company Login

```bash
curl --location 'http://0.0.0.0:5000/api/auth/login' \
--header 'Content-Type: application/json' \
--data-raw '{
  "email": "test.ngo@example.com",
  "password": "TestPassword123!",
  "role": "NGO"
}'
```

### 2.7 Get User Profile (Authenticated)

```bash
curl --location 'http://0.0.0.0:5000/api/auth/profile' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN_HERE'
```
**Expected Response**: Status 200 with user profile data

### 2.8 User Activity Log (Authenticated)

```bash
curl --location 'http://0.0.0.0:5000/api/auth/activity' \
--header 'Authorization: Bearer YOUR_JWT_TOKEN_HERE'
```
**Expected Response**: Status 200 with user activity history

---

## 🏢 Step 3: Admin Routes Testing

### 3.1 Admin Dashboard

```bash
curl --location 'http://0.0.0.0:5000/api/admin/dashboard' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE'
```
**Expected Response**: Status 200 with dashboard statistics

### 3.2 Get All Users

```bash
curl --location 'http://0.0.0.0:5000/api/admin/users' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE'
```
**Expected Response**: Status 200 with list of all users

### 3.3 Get All NGOs

```bash
curl --location 'http://0.0.0.0:5000/api/admin/ngos' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE'
```
**Expected Response**: Status 200 with list of all NGOs

### 3.4 Get All Companies

```bash
curl --location 'http://0.0.0.0:5000/api/admin/companies' \
--header 'Authorization: Bearer YOUR_ADMIN_TOKEN_HERE'
```
**Expected Response**: Status 200 with list of all companies

---

## 👥 Step 4: NGO Routes Testing

### 4.1 NGO Dashboard

```bash
curl --location 'http://0.0.0.0:5000/api/ngo/dashboard' \
--header 'Authorization: Bearer YOUR_NGO_TOKEN_HERE'
```
**Expected Response**: Status 200 with NGO dashboard data

### 4.2 Get NGO Campaigns

```bash
curl --location 'http://0.0.0.0:5000/api/ngo/campaigns' \
--header 'Authorization: Bearer YOUR_NGO_TOKEN_HERE'
```
**Expected Response**: Status 200 with NGO's campaigns

### 4.3 Create Campaign

```bash
curl --location 'http://0.0.0.0:5000/api/ngo/campaigns' \
--header 'Authorization: Bearer YOUR_NGO_TOKEN_HERE' \
--header 'Content-Type: application/json' \
--data-raw '{
  "title": "Education for Rural Children",
  "description": "Providing quality education to underprivileged children in rural areas",
  "category": "Education",
  "targetAmount": 100000,
  "endDate": "2024-12-31"
}'
```
**Expected Response**: Status 201 with created campaign details

---

## 🏢 Step 5: Company Routes Testing

### 5.1 Company Dashboard

```bash
curl --location 'http://0.0.0.0:5000/api/company/dashboard' \
--header 'Authorization: Bearer YOUR_COMPANY_TOKEN_HERE'
```
**Expected Response**: Status 200 with company dashboard data

### 5.2 Get Available NGOs

```bash
curl --location 'http://0.0.0.0:5000/api/company/ngos' \
--header 'Authorization: Bearer YOUR_COMPANY_TOKEN_HERE'
```
**Expected Response**: Status 200 with list of NGOs available for partnerships

### 5.3 Get Available Campaigns

```bash
curl --location 'http://0.0.0.0:5000/api/company/campaigns' \
--header 'Authorization: Bearer YOUR_COMPANY_TOKEN_HERE'
```
**Expected Response**: Status 200 with list of campaigns available for donations

---

## 🌐 Step 6: Public Routes Testing

### 6.1 Get All Public NGOs

```bash
curl --location 'http://0.0.0.0:5000/api/public/ngos'
```
**Expected Response**: Status 200 with list of active NGOs

### 6.2 Get All Public Companies

```bash
curl --location 'http://0.0.0.0:5000/api/public/companies'
```
**Expected Response**: Status 200 with list of active companies

### 6.3 Get All Public Campaigns

```bash
curl --location 'http://0.0.0.0:5000/api/public/campaigns'
```
**Expected Response**: Status 200 with list of active campaigns

### 6.4 Get NGO by ID

```bash
curl --location 'http://0.0.0.0:5000/api/public/ngos/NGO_ID_HERE'
```
**Expected Response**: Status 200 with specific NGO details

### 6.5 Get Campaign by ID

```bash
curl --location 'http://0.0.0.0:5000/api/public/campaigns/CAMPAIGN_ID_HERE'
```
**Expected Response**: Status 200 with specific campaign details

---

## 📢 Step 7: Campaign Routes Testing

### 7.1 Get All Campaigns

```bash
curl --location 'http://0.0.0.0:5000/api/campaigns'
```
**Expected Response**: Status 200 with campaigns list

### 7.2 Get Campaign by ID

```bash
curl --location 'http://0.0.0.0:5000/api/campaigns/CAMPAIGN_ID_HERE'
```
**Expected Response**: Status 200 with campaign details

### 7.3 Create Campaign (Authenticated)

```bash
curl --location 'http://0.0.0.0:5000/api/campaigns' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE' \
--header 'Content-Type: application/json' \
--data-raw '{
  "title": "New Campaign",
  "description": "Campaign description",
  "category": "Education",
  "targetAmount": 50000,
  "endDate": "2024-12-31"
}'
```
**Expected Response**: Status 201 with created campaign

---

## 💰 Step 8: Donation Routes Testing

### 8.1 Get All Donations (Authenticated)

```bash
curl --location 'http://0.0.0.0:5000/api/donations' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE'
```
**Expected Response**: Status 200 with donations list

### 8.2 Create Donation

```bash
curl --location 'http://0.0.0.0:5000/api/donations' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE' \
--header 'Content-Type: application/json' \
--data-raw '{
  "campaignId": "CAMPAIGN_ID_HERE",
  "amount": 1000,
  "donorName": "Test Donor",
  "donorEmail": "donor@example.com",
  "donorPhone": "+1234567890"
}'
```
**Expected Response**: Status 201 with donation details

### 8.3 Get Donation by ID

```bash
curl --location 'http://0.0.0.0:5000/api/donations/DONATION_ID_HERE' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE'
```
**Expected Response**: Status 200 with donation details

---

## 🚨 Common Error Responses

### 400 Bad Request
```json
{
  "message": "Validation error message"
}
```

### 401 Unauthorized
```json
{
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "status": "fail",
  "message": "Route /api/endpoint not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Internal server error",
  "error": "Error details"
}
```

---

## 📝 Testing Checklist

- [ ] Server health check passes
- [ ] Admin setup and login successful
- [ ] User registration works for all roles
- [ ] Authentication tokens are properly generated
- [ ] Protected routes require valid tokens
- [ ] Role-based access control works correctly
- [ ] CRUD operations work for all entities
- [ ] Public routes are accessible without authentication
- [ ] File uploads work (if applicable)
- [ ] Error handling returns appropriate status codes

---

## 🔧 Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**: Ensure MongoDB is running and accessible
2. **Token Expired**: Re-login to get a fresh token
3. **Route Not Found**: Check the exact URL and HTTP method
4. **Validation Errors**: Ensure all required fields are provided
5. **Permission Denied**: Verify user role and token validity

### Database Issues:
```bash
# Check if MongoDB is running (if using local MongoDB)
sudo systemctl status mongod

# Start MongoDB (if using local MongoDB)
sudo systemctl start mongod
```

### Server Issues:
```bash
# Check if server is running on correct port
netstat -tlnp | grep :5000

# Start the server
node index.js
```

---

## 🎯 Performance Testing

For load testing, consider using tools like:
- Apache Bench (ab)
- Postman Collection Runner
- Artillery.io
- k6

Example with Apache Bench:
```bash
ab -n 100 -c 10 http://0.0.0.0:5000/api/public/campaigns
```

This will send 100 requests with 10 concurrent connections to test the public campaigns endpoint.

## 🧪 Prerequisites

Before starting the testing process, ensure you have:

1. **Server Running**: The backend server should be running on `http://0.0.0.0:5000`
2. **Database Connected**: MongoDB should be connected and accessible
3. **Testing Tools**: 
   - Postman (recommended) or any API testing tool
   - Import the [API Collection](./api-collection.json) into Postman
   - Or use the [JavaScript Test Suite](./api-tests.js)

## 📋 Testing Checklist Overview

- [ ] Health Check & Setup
- [ ] Authentication Tests
- [ ] Public API Tests
- [ ] Admin Role Tests
- [ ] NGO Role Tests
- [ ] Company Role Tests
- [ ] Campaign Routes Tests
- [ ] Donation Routes Tests
- [ ] Error Handling Tests
- [ ] Security Tests

---

## ✅ Testing Completion Checklist

After completing all tests, verify:

- [ ] All endpoints return expected status codes
- [ ] Authentication and authorization work correctly
- [ ] Data validation prevents invalid inputs
- [ ] File uploads handle different file types and sizes
- [ ] Error messages are informative and consistent
- [ ] No sensitive information leaked in responses
- [ ] Database operations complete successfully
- [ ] Role-based access control is properly enforced
- [ ] All route structures match implementation

---

## 🐛 Bug Reporting Template

When you find issues during testing, use this template:

```
**Bug ID**: BUG-001
**Test Case**: Test 2.1.1 - Register NGO User
**Expected Result**: Status 201 with user created
**Actual Result**: Status 500 - Internal server error
**Steps to Reproduce**:
1. Send POST request to /api/auth/register
2. Include valid NGO registration data
3. Observe response

**Environment**: Development
**Severity**: High/Medium/Low
**Additional Notes**: Error occurs only with specific email formats
```

---

## 📈 Test Metrics

Track these metrics during testing:

- **Total Tests Executed**: ___
- **Tests Passed**: ___
- **Tests Failed**: ___
- **Bugs Found**: ___
- **Coverage Percentage**: ___%
- **Average Response Time**: ___ms