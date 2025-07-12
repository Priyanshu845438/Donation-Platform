
# Admin API Endpoints

Base URL: `/api/admin`

**Required Role:** Admin only

## 👥 User Management

### 1. Create User
```http
POST /api/admin/create-user
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "Jane Smith",
  "email": "jane@example.com",
  "password": "password123",
  "phoneNumber": "+1234567890",
  "role": "NGO"
}
```

### 2. Get All Users
```http
GET /api/admin/users
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `role`: Filter by role (NGO, Company, Donor)
- `status`: Filter by approval status
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### 3. Get User by ID
```http
GET /api/admin/users/:id
Authorization: Bearer <admin_token>
```

### 4. Update User
```http
PUT /api/admin/users/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

### 5. Enable/Disable User
```http
PUT /api/admin/users/:id/toggle-status
Authorization: Bearer <admin_token>
```

### 6. Delete User
```http
DELETE /api/admin/users/:id
Authorization: Bearer <admin_token>
```

### 7. Approve/Reject User
```http
PUT /api/admin/users/:id/approval
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "approved"
}
```

### 8. Edit User Details
```http
PUT /api/admin/users/:id/details
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "fullName": "Updated Name",
  "email": "newemail@example.com",
  "phoneNumber": "+1234567890",
  "role": "ngo",
  "isActive": true,
  "approvalStatus": "approved"
}
```

### 9. Delete User Completely
```http
DELETE /api/admin/users/:id/complete
Authorization: Bearer <admin_token>
```

**Note:** This deletes the user and all associated data (profile, campaigns, donations, activities).

### 10. View User Profile
```http
GET /api/admin/users/:id/profile
Authorization: Bearer <admin_token>
```

**Response includes:**
- User details
- Role-specific profile (NGO/Company)
- User's campaigns
- User's donations
- Recent activities
- Statistics

### 11. Edit User Profile
```http
PUT /api/admin/users/:id/profile
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**For NGO Profile:**
```json
{
  "ngoName": "Updated NGO Name",
  "registrationNumber": "REG123456",
  "address": "Updated Address",
  "contactNumber": "+1234567890",
  "website": "https://updatedngo.org"
}
```

**For Company Profile:**
```json
{
  "companyName": "Updated Company Name",
  "registrationNumber": "COMP123456",
  "companyAddress": "Updated Address",
  "companyPhoneNumber": "+1234567890",
  "ceoName": "CEO Name"
}
```

### 12. Toggle User Status
```http
PUT /api/admin/users/:id/toggle-status
Authorization: Bearer <admin_token>
```

## 🏢 Organization Management

### 8. Edit Company Profile
```http
PUT /api/admin/edit-company/:id
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

### 9. Edit NGO Profile
```http
PUT /api/admin/edit-ngo/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

## 📊 Campaign Management

### 10. Get All Campaigns
```http
GET /api/admin/campaigns
Authorization: Bearer <admin_token>
```

### 11. Create Campaign
```http
POST /api/admin/campaigns
Authorization: Bearer <admin_token>
Content-Type: multipart/form-data
```

### 12. Update Campaign
```http
PUT /api/admin/campaigns/:id
Authorization: Bearer <admin_token>
```

### 13. Delete Campaign
```http
DELETE /api/admin/campaigns/:id
Authorization: Bearer <admin_token>
```

### 14. Toggle Campaign Status
```http
PUT /api/admin/campaigns/:id/toggle-status
Authorization: Bearer <admin_token>
```

## 📋 Notice System

### 15. Create Notice
```http
POST /api/admin/notices
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Important Notice",
  "message": "Notice content here",
  "type": "info",
  "targetRole": "all",
  "targetUsers": ["user_id_1", "user_id_2"],
  "sendEmail": true
}
```

### 16. Get All Notices
```http
GET /api/admin/notices
Authorization: Bearer <admin_token>
```

### 17. Update Notice
```http
PUT /api/admin/notices/:id
Authorization: Bearer <admin_token>
```

### 18. Delete Notice
```http
DELETE /api/admin/notices/:id
Authorization: Bearer <admin_token>
```

## ⚙️ Settings Management

### 19. Get Settings
```http
GET /api/admin/settings/:category
Authorization: Bearer <admin_token>
```

### 20. Update Settings
```http
PUT /api/admin/settings/:category
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "settings": {
    "smtp_host": "smtp.example.com",
    "smtp_port": 587,
    "from_email": "noreply@example.com"
  }
}
```

## 🔗 Share Link Management

### 21. Generate Share Link
```http
POST /api/admin/share-links
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "entityType": "profile",
  "entityId": "profile_id",
  "expiresAt": "2024-12-31T23:59:59.000Z"
}
```

### 22. Get Share Links
```http
GET /api/admin/share-links
Authorization: Bearer <admin_token>
```

## 📊 Dashboard Analytics

### 23. Get Dashboard Stats
```http
GET /api/admin/dashboard/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "totalUsers": 150,
  "totalCampaigns": 45,
  "totalDonations": 1250,
  "totalAmount": 125000,
  "roleStats": {
    "NGO": 50,
    "Company": 30,
    "Donor": 70
  },
  "recentActivities": [...],
  "campaignStats": {...},
  "donationTrends": [...]
}
```

## 📈 Reports

### 24. User Report
```http
GET /api/admin/reports/users
Authorization: Bearer <admin_token>
```

### 25. Campaign Report
```http
GET /api/admin/reports/campaigns
Authorization: Bearer <admin_token>
```

### 26. Donation Report
```http
GET /api/admin/reports/donations
Authorization: Bearer <admin_token>
```

### 27. Activity Log Report
```http
GET /api/admin/reports/activities
Authorization: Bearer <admin_token>
```

## 🚨 Error Responses

All admin endpoints return standard HTTP status codes with appropriate error messages for unauthorized access, validation errors, and server errors.
