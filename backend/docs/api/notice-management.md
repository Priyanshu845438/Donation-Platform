
# Notice Management System API Documentation

## Overview
The Notice Management System provides comprehensive functionality for creating, managing, and delivering notifications to users. It supports both in-app notifications and email notifications with advanced targeting and scheduling capabilities.

## Features
- ✅ Create and manage notices with different types and priorities
- ✅ Target specific user roles or individual users
- ✅ Schedule notices for future delivery
- ✅ Send email notifications
- ✅ Track read/unread status
- ✅ Filter and search notices
- ✅ Comprehensive statistics and analytics

## Notice Types
- **info**: General information notices
- **warning**: Important warnings or alerts
- **success**: Success confirmations and positive updates
- **error**: Error notifications and critical issues

## Priority Levels
- **low**: Non-urgent information
- **medium**: Standard notices
- **high**: Important notices requiring attention
- **urgent**: Critical notices requiring immediate attention

## Target Roles
- **all**: All users on the platform
- **ngo**: NGO users only
- **company**: Company users only
- **donor**: Donor users only
- **admin**: Admin users only

## Admin Endpoints

### Authentication Required
All admin endpoints require `Authorization: Bearer <admin_token>` header.

### 1. Get All Notices
```http
GET /api/admin/notices
```

**Query Parameters:**
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Number of notices per page (default: 10)
- `type` (string): Filter by type (info, warning, success, error)
- `priority` (string): Filter by priority (low, medium, high, urgent)
- `targetRole` (string): Filter by target role (all, ngo, company, donor, admin)
- `status` (string): Filter by status (active, inactive)
- `search` (string): Search in title and content

**Response:**
```json
{
  "success": true,
  "notices": [
    {
      "_id": "notice_id",
      "title": "Notice Title",
      "content": "Notice content...",
      "type": "info",
      "priority": "medium",
      "targetRole": "all",
      "isActive": true,
      "createdBy": {
        "_id": "user_id",
        "fullName": "Admin Name",
        "email": "admin@example.com"
      },
      "readBy": [],
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "pages": 3
  },
  "stats": [
    { "_id": "info", "count": 15 },
    { "_id": "warning", "count": 8 }
  ]
}
```

### 2. Create Notice
```http
POST /api/admin/notices
```

**Request Body:**
```json
{
  "title": "Notice Title",
  "content": "Detailed notice content...",
  "type": "info",
  "priority": "medium",
  "targetRole": "all",
  "targetUsers": ["user_id_1", "user_id_2"],
  "sendEmail": true,
  "scheduledAt": "2024-02-01T10:00:00.000Z"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Notice created successfully",
  "notice": {
    "_id": "notice_id",
    "title": "Notice Title",
    "content": "Detailed notice content...",
    "type": "info",
    "priority": "medium",
    "targetRole": "all",
    "sendEmail": true,
    "createdBy": "admin_id",
    "createdAt": "2024-01-15T10:00:00.000Z"
  }
}
```

### 3. Get Notice by ID
```http
GET /api/admin/notices/:id
```

### 4. Update Notice
```http
PUT /api/admin/notices/:id
```

**Request Body:**
```json
{
  "title": "Updated Title",
  "content": "Updated content...",
  "type": "warning",
  "priority": "high",
  "isActive": true
}
```

### 5. Delete Notice
```http
DELETE /api/admin/notices/:id
```

### 6. Send Notice to Additional Users
```http
POST /api/admin/notices/:id/send
```

**Request Body:**
```json
{
  "userIds": ["user_id_1", "user_id_2"]
}
```

### 7. Get Notice Statistics
```http
GET /api/admin/notices/stats/overview
```

**Response:**
```json
{
  "success": true,
  "stats": {
    "totalNotices": 50,
    "activeNotices": 45,
    "scheduledNotices": 5,
    "typeStats": [
      { "_id": "info", "count": 25 },
      { "_id": "warning", "count": 15 }
    ],
    "priorityStats": [
      { "_id": "medium", "count": 30 },
      { "_id": "high", "count": 15 }
    ],
    "recentNotices": []
  }
}
```

## User Endpoints

### Authentication Required
User endpoints require `Authorization: Bearer <user_token>` header.

### 1. Get My Notices
```http
GET /api/public/notices/my-notices
```

**Query Parameters:**
- `page` (number): Page number for pagination
- `limit` (number): Number of notices per page
- `type` (string): Filter by notice type
- `unread` (boolean): Show only unread notices (true/false)

### 2. Mark Notice as Read
```http
PUT /api/public/notices/:id/read
```

### 3. Get Unread Count
```http
GET /api/public/notices/unread-count
```

**Response:**
```json
{
  "success": true,
  "unreadCount": 3
}
```

## Public Endpoints

### 1. Get Public Notices
```http
GET /api/public/notices/public
```

Returns notices targeted to "all" users that are active and not scheduled for future delivery.

## Email Configuration

To enable email notifications, set up the following environment variables:

```env
EMAIL_ID=your-email@gmail.com
EMAIL_PASS=your-app-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

## Use Cases

### 1. System Maintenance Announcement
```json
{
  "title": "Scheduled Maintenance",
  "content": "The platform will undergo maintenance from 2:00 AM to 4:00 AM IST.",
  "type": "warning",
  "priority": "high",
  "targetRole": "all",
  "sendEmail": true
}
```

### 2. NGO Account Approval
```json
{
  "title": "Account Approved",
  "content": "Your NGO registration has been approved!",
  "type": "success",
  "priority": "medium",
  "targetUsers": ["ngo_user_id"],
  "sendEmail": true
}
```

### 3. Monthly Newsletter
```json
{
  "title": "Monthly Newsletter",
  "content": "Check out this month's success stories...",
  "type": "info",
  "priority": "low",
  "targetRole": "all",
  "sendEmail": true,
  "scheduledAt": "2024-02-01T10:00:00.000Z"
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- `200`: Success
- `201`: Created successfully
- `400`: Bad request (validation errors)
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not found
- `500`: Internal server error

Error responses follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

## Best Practices

1. **Use appropriate notice types** - Choose the correct type (info, warning, success, error) based on the content
2. **Set proper priorities** - Use urgent priority sparingly for critical issues only
3. **Target appropriately** - Use specific targeting to avoid spamming users with irrelevant notices
4. **Schedule wisely** - Use scheduling for newsletters and non-urgent announcements
5. **Keep content concise** - Users prefer short, clear messages
6. **Test email delivery** - Ensure email configuration is working before sending to large groups

## Integration Examples

### Frontend Integration
```javascript
// Get user notices
const getNotices = async () => {
  const response = await fetch('/api/public/notices/my-notices?unread=true', {
    headers: {
      'Authorization': `Bearer ${userToken}`
    }
  });
  const data = await response.json();
  return data.notices;
};

// Mark notice as read
const markAsRead = async (noticeId) => {
  await fetch(`/api/public/notices/${noticeId}/read`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${userToken}`
    }
  });
};
```

### Admin Dashboard Integration
```javascript
// Create urgent notice
const createUrgentNotice = async (title, content, targetRole) => {
  const response = await fetch('/api/admin/notices', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${adminToken}`
    },
    body: JSON.stringify({
      title,
      content,
      type: 'warning',
      priority: 'urgent',
      targetRole,
      sendEmail: true
    })
  });
  return response.json();
};
```
