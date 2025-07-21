
# Complete Admin API Reference

**Base URL:** `/api/admin`  
**Required Role:** Admin only  
**Authentication:** Bearer token required

## Table of Contents

1. [Authentication & Setup](#authentication--setup)
2. [User Management](#user-management)
3. [Campaign Management](#campaign-management)
4. [Dashboard & Analytics](#dashboard--analytics)
5. [Settings Management](#settings-management)
6. [Notice System](#notice-system)
7. [Share Link Management](#share-link-management)

---

## Authentication & Setup

### Admin Login
```http
POST /api/auth/login
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "acadify.online@gmail.com",
  "password": "Acadify@123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt_token_here",
  "user": {
    "_id": "admin_id",
    "fullName": "Admin User",
    "email": "acadify.online@gmail.com",
    "role": "admin"
  }
}
```

---

## User Management

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
  "role": "NGO",
  "approvalStatus": "approved"
}
```

### 2. Get All Users

```http
GET /api/admin/users
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Users per page
- `role` (string) - Filter by role: "NGO", "Company", "Admin"
- `status` (string) - Filter by approval status
- `search` (string) - Search in name/email

### 3. Approve/Reject User

```http
PUT /api/admin/users/:id/approval
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "approvalStatus": "approved"
}
```

### 4. Edit User Details

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

### 5. View User Profile

```http
GET /api/admin/users/:id/profile
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "userProfile": {
    "user": {
      "_id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "ngo",
      "isActive": true,
      "approvalStatus": "approved"
    },
    "profile": {
      "ngoName": "Education Foundation",
      "registrationNumber": "NGO123456",
      "address": "123 Main St"
    },
    "campaigns": [
      {
        "_id": "campaign_id",
        "title": "Education Campaign",
        "targetAmount": 100000,
        "isActive": true
      }
    ],
    "donations": [
      {
        "_id": "donation_id",
        "amount": 5000,
        "campaignId": "campaign_id"
      }
    ],
    "stats": {
      "totalDonations": 5,
      "totalDonationAmount": 25000,
      "totalCampaigns": 3,
      "activeCampaigns": 2
    }
  }
}
```

### 6. Edit User Profile

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

### 7. Toggle User Status

```http
PUT /api/admin/users/:id/toggle-status
Authorization: Bearer <admin_token>
```

### 8. Delete User

```http
DELETE /api/admin/users/:id/complete
Authorization: Bearer <admin_token>
```

---

## Campaign Management

### 1. Get All Campaigns

```http
GET /api/admin/campaigns
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (number) - Page number
- `limit` (number) - Campaigns per page
- `status` (string) - "active", "inactive"
- `approvalStatus` (string) - "pending", "approved", "rejected"
- `search` (string) - Search in title/description

**Response:**
```json
{
  "success": true,
  "message": "Campaigns retrieved successfully",
  "campaigns": [
    {
      "_id": "campaign_id",
      "title": "Education Campaign",
      "campaignName": "Rural Education",
      "category": "Education",
      "targetAmount": 100000,
      "raisedAmount": 25000,
      "approvalStatus": "approved",
      "isActive": true,
      "ngoId": {
        "ngoName": "Education NGO",
        "email": "ngo@example.com"
      },
      "createdBy": {
        "fullName": "John Doe",
        "email": "john@example.com"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "approvalStats": [
    { "_id": "pending", "count": 5 },
    { "_id": "approved", "count": 18 },
    { "_id": "rejected", "count": 2 }
  ]
}
```

### 2. Create Campaign (Admin)

```http
POST /api/admin/campaigns
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Education for Rural Children",
  "campaignName": "Rural Education Initiative",
  "description": "Providing quality education to underprivileged children",
  "category": "Education",
  "goalAmount": 500000,
  "targetAmount": 500000,
  "endDate": "2024-12-31",
  "location": "Rural Maharashtra",
  "beneficiaries": "200 children",
  "importance": "Education is fundamental for breaking poverty cycle",
  "explainStory": "This campaign aims to establish schools...",
  "contactNumber": "9876543210",
  "createdBy": "6871e77eee061f384becdc35",
  "ngoId": "6871e77eee061f384becdc37",
  "approvalStatus": "approved",
  "isActive": true
}
```

### 3. Get Campaign Details

```http
GET /api/admin/campaigns/:id
Authorization: Bearer <admin_token>
```

### 4. Update Campaign

```http
PUT /api/admin/campaigns/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

### 5. Delete Campaign

```http
DELETE /api/admin/campaigns/:id
Authorization: Bearer <admin_token>
```

### 6. Approve/Reject Campaign

```http
PUT /api/admin/campaigns/:id/approval
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "status": "approved",
  "adminNote": "Campaign approved. Well-documented objectives."
}
```

**For Rejection:**
```json
{
  "status": "rejected",
  "adminNote": "Please provide more documentation about fund usage."
}
```

---

## Dashboard & Analytics

### 1. Get Dashboard Stats

```http
GET /api/admin/dashboard/stats
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Dashboard data retrieved successfully",
  "dashboard": {
    "overview": {
      "totalUsers": 150,
      "totalNGOs": 45,
      "totalCompanies": 30,
      "totalCampaigns": 75,
      "totalDonations": 25,
      "pendingApprovals": 5
    },
    "roleStats": [
      { "_id": "ngo", "count": 45 },
      { "_id": "company", "count": 30 },
      { "_id": "admin", "count": 2 }
    ],
    "donationStats": {
      "totalAmount": 125000,
      "averageAmount": 5000,
      "count": 25
    },
    "recentActivities": [
      {
        "_id": "activity_id",
        "action": "user_registration",
        "description": "New NGO registered",
        "userId": {
          "fullName": "John Doe",
          "email": "john@example.com"
        },
        "createdAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

### 2. Get Analytics

```http
GET /api/admin/analytics
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `period` (string) - "day", "month", "year"

---

## Settings Management

### 1. Get Settings

```http
GET /api/admin/settings
Authorization: Bearer <admin_token>
```

### 2. Update Settings

```http
PUT /api/admin/settings
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "category": "email",
  "settings": {
    "smtp_host": "smtp.example.com",
    "smtp_port": 587,
    "from_email": "noreply@example.com"
  }
}
```

---

## Notice System

### 1. Create Notice

```http
POST /api/admin/notices
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Important Notice",
  "content": "Notice content here",
  "type": "info",
  "priority": "high",
  "targetRole": "all",
  "targetUsers": ["user_id_1", "user_id_2"],
  "sendEmail": true,
  "scheduledAt": "2024-01-20T10:00:00.000Z"
}
```

### 2. Get All Notices

```http
GET /api/admin/notices
Authorization: Bearer <admin_token>
```

---

## Share Link Management

### 1. Generate Profile Share Link

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
  "customDesign": {
    "theme": "default",
    "layout": "standard"
  },
  "expiresAt": "2024-12-31T23:59:59.000Z"
}
```

### 2. Get Share Links

```http
GET /api/admin/share-links
Authorization: Bearer <admin_token>
```

---

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Authentication Notes

- All admin endpoints require a valid JWT token with admin role
- Tokens are obtained through the login endpoint
- Include token in Authorization header: `Bearer <token>`
- Tokens expire after configured time period

## Rate Limiting

- Admin endpoints have higher rate limits than public endpoints
- Bulk operations may have additional restrictions
- Monitor response headers for rate limit information

## Testing

Use the Postman collection at [`docs/testing/api-collection.json`](../testing/api-collection.json) for comprehensive testing of all admin endpoints.

## Security Best Practices

1. Always use HTTPS in production
2. Store admin credentials securely
3. Implement proper session management
4. Log all admin activities
5. Regular security audits
6. Monitor for suspicious activities
