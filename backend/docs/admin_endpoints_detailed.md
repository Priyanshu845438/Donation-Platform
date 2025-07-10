
# Admin Panel API Endpoints - Detailed Documentation

## Authentication
All admin endpoints require JWT token with admin role:
```
Authorization: Bearer <jwt_token>
```

## Base URL
```
http://localhost:5000/api/admin
```

---

## Dashboard Analytics

### Get Platform Analytics
**GET** `/dashboard/analytics`

**Description**: Get comprehensive platform statistics

**Response**:
```json
{
  "success": true,
  "data": {
    "overview": {
      "totalDonations": 150000,
      "activeCampaigns": 25,
      "totalUsers": 1200,
      "totalCompanies": 15,
      "totalNGOs": 30
    },
    "topDonors": [
      {
        "email": "donor@example.com",
        "totalDonated": 5000,
        "donationCount": 10
      }
    ],
    "recentDonations": [...],
    "campaignStats": {...},
    "monthlyDonations": [...]
  }
}
```

---

## User Management

### Get All Users
**GET** `/dashboard/users`

**Query Parameters**:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search by name or email
- `role` (string): Filter by role (user, company, ngo)
- `status` (string): Filter by status (active, inactive)

**Response**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id",
        "fullName": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "status": "active",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

### Get Specific User
**GET** `/dashboard/users/:userId`

### Update User Profile
**PATCH** `/dashboard/users/:userId`

**Body**:
```json
{
  "fullName": "Updated Name",
  "phoneNumber": "1234567890"
}
```

### Update User Status
**PATCH** `/dashboard/users/:userId/status`

**Body**:
```json
{
  "isActive": true,
  "reason": "Admin approval"
}
```

### Delete User
**DELETE** `/dashboard/users/:userId`

---

## Campaign Management

### Get All Campaigns
**GET** `/dashboard/campaigns`

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status

**Response**:
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "id": "campaign_id",
        "title": "Help Education",
        "creator": {
          "name": "NGO Name"
        },
        "goal": 10000,
        "raised": 5000,
        "status": "active",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {...}
  }
}
```

### Get Specific Campaign
**GET** `/dashboard/campaigns/:campaignId`

### Update Campaign
**PATCH** `/dashboard/campaigns/:campaignId`

**Body**:
```json
{
  "title": "Updated Title",
  "description": "Updated description",
  "goal": 15000
}
```

### Update Campaign Status
**PATCH** `/dashboard/campaigns/:campaignId/status`

**Body**:
```json
{
  "status": "active",
  "reason": "Approved by admin"
}
```

**Allowed Status Values**:
- `active` - Campaign is live
- `inactive` - Campaign is paused
- `completed` - Campaign finished
- `suspended` - Campaign suspended by admin
- `pending` - Awaiting approval
- `rejected` - Rejected by admin

### Delete Campaign
**DELETE** `/dashboard/campaigns/:campaignId`

---

## Reports

### Get Donations Report
**GET** `/reports/donations`

**Query Parameters**:
- `startDate` (string): Start date (YYYY-MM-DD)
- `endDate` (string): End date (YYYY-MM-DD)
- `status` (string): Filter by status
- `export` (string): Export format (csv, excel)

### Get Users Report
**GET** `/reports/users`

### Get Campaigns Report
**GET** `/reports/campaigns`

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error",
  "error": "Field 'status' must be one of: active, inactive, completed"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Insufficient permissions."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error",
  "error": "Database connection failed"
}
```

---

## Rate Limiting

Admin endpoints have the following rate limits:
- Analytics: 100 requests per 15 minutes
- User operations: 200 requests per 15 minutes
- Bulk operations: 50 requests per 15 minutes

## Security Notes

1. All admin actions are logged with activity tracking
2. Sensitive operations require additional verification
3. Admin tokens have shorter expiration times (4 hours)
4. Failed admin operations trigger security alerts
5. IP restrictions can be applied for admin access
