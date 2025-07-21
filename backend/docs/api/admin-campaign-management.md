
# Admin Campaign Management API

**Base URL:** `/api/admin`  
**Required Role:** Admin only  
**Authentication:** Bearer token required

## Overview

The Admin Campaign Management API provides comprehensive tools for administrators to manage campaigns, including creation, approval workflows, status management, and analytics tracking.

## Endpoints

### 1. Get All Campaigns

```http
GET /api/admin/campaigns
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `page` (number, default: 1) - Page number for pagination
- `limit` (number, default: 10) - Number of campaigns per page
- `status` (string) - Filter by status: "active", "inactive"
- `approvalStatus` (string) - Filter by approval: "pending", "approved", "rejected"
- `search` (string) - Search in title, campaignName, description

**Response:**
```json
{
  "success": true,
  "message": "Campaigns retrieved successfully",
  "campaigns": [
    {
      "_id": "campaign_id",
      "title": "Campaign Title",
      "campaignName": "Campaign Name",
      "description": "Campaign description",
      "category": "Education",
      "goalAmount": 100000,
      "targetAmount": 100000,
      "raisedAmount": 25000,
      "endDate": "2024-12-31T00:00:00.000Z",
      "location": "Mumbai, India",
      "beneficiaries": "500 children",
      "isActive": true,
      "approvalStatus": "approved",
      "createdBy": {
        "fullName": "John Doe",
        "email": "john@example.com"
      },
      "ngoId": {
        "ngoName": "Education NGO",
        "email": "ngo@example.com"
      },
      "createdAt": "2024-01-15T10:30:00.000Z"
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

### 2. Create Campaign (Admin Direct)

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
  "description": "Providing quality education to underprivileged children in rural areas",
  "category": "Education",
  "goalAmount": 500000,
  "targetAmount": 500000,
  "endDate": "2024-12-31",
  "location": "Rural Maharashtra",
  "beneficiaries": "200 children",
  "importance": "Education is fundamental for breaking the poverty cycle",
  "explainStory": "This campaign aims to establish schools and provide educational resources...",
  "contactNumber": "9876543210",
  "donationLink": "https://example.com/donate/campaign-123",
  "createdBy": "6871e77eee061f384becdc35",
  "ngoId": "6871e77eee061f384becdc37",
  "approvalStatus": "approved",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign created successfully",
  "campaign": {
    "_id": "new_campaign_id",
    "title": "Education for Rural Children",
    "campaignName": "Rural Education Initiative",
    "approvalStatus": "approved",
    "isActive": true,
    "donationLink": "rural-education-initiative-abc123",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. Get Campaign Details

```http
GET /api/admin/campaigns/:id
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign details retrieved successfully",
  "campaign": {
    "_id": "campaign_id",
    "title": "Campaign Title",
    "description": "Detailed description",
    "ngoId": {
      "ngoName": "Education NGO",
      "email": "ngo@example.com",
      "contactNumber": "+91-9876543210"
    },
    "createdBy": {
      "fullName": "John Doe",
      "email": "john@example.com",
      "phoneNumber": "+91-9876543210"
    }
  },
  "donations": [
    {
      "_id": "donation_id",
      "amount": 5000,
      "donorId": {
        "fullName": "Jane Smith",
        "email": "jane@example.com"
      },
      "createdAt": "2024-01-10T15:20:00.000Z"
    }
  ],
  "donationStats": {
    "totalDonations": 15,
    "totalAmount": 75000,
    "averageAmount": 5000
  }
}
```

### 4. Update Campaign

```http
PUT /api/admin/campaigns/:id
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body (any campaign fields to update):**
```json
{
  "title": "Updated Campaign Title",
  "targetAmount": 150000,
  "endDate": "2024-12-31",
  "location": "Updated Location",
  "isActive": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign updated successfully",
  "campaign": {
    "_id": "campaign_id",
    "title": "Updated Campaign Title",
    "targetAmount": 150000,
    "updatedAt": "2024-01-15T11:45:00.000Z"
  }
}
```

### 5. Delete Campaign

```http
DELETE /api/admin/campaigns/:id
Authorization: Bearer <admin_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign and associated data deleted successfully"
}
```

**Note:** This deletes the campaign and all associated donations.

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
  "adminNote": "Campaign approved. Well-documented objectives and clear beneficiary details."
}
```

**For Rejection:**
```json
{
  "status": "rejected",
  "adminNote": "Please provide more detailed documentation about fund usage and beneficiary verification."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign approved successfully",
  "campaign": {
    "_id": "campaign_id",
    "title": "Campaign Title",
    "approvalStatus": "approved",
    "isActive": true,
    "adminNote": "Campaign approved. Well-documented objectives and clear beneficiary details.",
    "updatedAt": "2024-01-15T12:00:00.000Z"
  }
}
```

### 7. Toggle Campaign Status

```http
PUT /api/admin/campaigns/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "isActive": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Campaign status updated successfully",
  "campaign": {
    "_id": "campaign_id",
    "isActive": false,
    "updatedAt": "2024-01-15T12:15:00.000Z"
  }
}
```

## Campaign Approval Workflow

### Status Flow
1. **pending** → Campaign submitted, awaiting admin review
   - `isActive`: false
   - `publicVisible`: false

2. **approved** → Campaign approved and active
   - `isActive`: true
   - `publicVisible`: true

3. **rejected** → Campaign rejected with admin note
   - `isActive`: false
   - `publicVisible`: false
   - `adminNote`: required

### Common Rejection Reasons
- Insufficient documentation
- Unclear campaign objectives
- Duplicate campaign
- Inappropriate content
- Verification issues
- Policy violation
- Other (specify in adminNote)

## Share Link Management

### Generate Campaign Share Link

```http
POST /api/admin/campaigns/:id/share
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body (optional):**
```json
{
  "customDesign": {
    "theme": "default",
    "layout": "standard"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Share link generated successfully",
  "shareLink": "http://0.0.0.0:5173/share/campaign/d515fd83a97f59f2188163e13c29bdfe",
  "shareId": "d515fd83a97f59f2188163e13c29bdfe"
}
```

### Bulk Share Link Generation

```http
POST /api/admin/campaigns/bulk/share
Authorization: Bearer <admin_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "campaignIds": ["campaign_id_1", "campaign_id_2"],
  "customDesign": {
    "theme": "modern",
    "layout": "compact"
  }
}
```

## Analytics & Reporting

### Get Share Analytics

```http
GET /api/admin/campaigns/analytics/shares
Authorization: Bearer <admin_token>
```

**Query Parameters:**
- `startDate` (date) - Start date for analytics
- `endDate` (date) - End date for analytics
- `campaignId` (ObjectId, optional) - Specific campaign analytics

**Response:**
```json
{
  "success": true,
  "analytics": {
    "totalViews": 1250,
    "uniqueVisitors": 890,
    "shareClicks": 340,
    "conversionRate": 12.5,
    "campaignBreakdown": [
      {
        "campaignId": "campaign_id",
        "views": 150,
        "clicks": 45,
        "conversions": 8
      }
    ]
  }
}
```

## Error Responses

All endpoints return standardized error responses:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created successfully
- `400` - Bad request / Validation error
- `401` - Unauthorized / Invalid token
- `403` - Forbidden / Insufficient permissions
- `404` - Resource not found
- `500` - Internal server error

## Sample Request Examples

### Using cURL

**Get All Campaigns:**
```bash
curl -X GET "http://0.0.0.0:5000/api/admin/campaigns?page=1&limit=5&status=active" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Approve Campaign:**
```bash
curl -X PUT "http://0.0.0.0:5000/api/admin/campaigns/CAMPAIGN_ID/approval" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "approved",
    "adminNote": "Campaign meets all requirements"
  }'
```

### Using Postman Collection

Import the provided Postman collection from [`docs/testing/api-collection.json`](../testing/api-collection.json) for complete admin endpoints testing.

## Validation Rules

### Campaign Creation
- `title`: Required, max 200 characters
- `campaignName`: Required, unique
- `description`: Required
- `category`: Required
- `goalAmount`: Required, positive number
- `targetAmount`: Required, positive number
- `endDate`: Required, future date
- `contactNumber`: Required, valid phone format
- `importance`: Required
- `explainStory`: Required
- `createdBy`: Required, valid ObjectId
- `ngoId`: Required, valid ObjectId

### Campaign Updates
- All fields are optional for updates
- `endDate` must be future date if provided
- `goalAmount` and `targetAmount` must be positive if provided

## Security Notes

- All endpoints require admin authentication
- Input validation is performed on all request bodies
- File uploads are scanned and validated
- Activity logging tracks all admin actions
- Rate limiting applies to all endpoints

## Related Documentation

- [Authentication API](./auth-endpoints.md)
- [NGO Campaign Management](./ngo-endpoints.md)
- [Public Campaign Access](./public-endpoints.md)
- [Testing Guide](../testing/testing-guide.md)
