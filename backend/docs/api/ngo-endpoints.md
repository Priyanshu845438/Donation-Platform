
# NGO API Endpoints

Base URL: `/api/ngo`

**Required Role:** NGO

## 📊 NGO Dashboard

### 1. Get NGO Dashboard
```http
GET /api/ngo/dashboard
Authorization: Bearer <ngo_token>
```

**Response (200):**
```json
{
  "profile": {
    "_id": "ngo_id",
    "ngoName": "Hope Foundation",
    "registrationNumber": "REG123456",
    "totalCampaigns": 5,
    "totalDonations": 25000
  },
  "campaigns": [...],
  "recentDonations": [...],
  "analytics": {
    "activeCampaigns": 3,
    "completedCampaigns": 2,
    "totalRaised": 25000,
    "monthlyTarget": 50000
  }
}
```

## 🏢 Profile Management

### 2. Get NGO Profile
```http
GET /api/ngo/profile
Authorization: Bearer <ngo_token>
```

### 3. Update NGO Profile
```http
PUT /api/ngo/profile
Authorization: Bearer <ngo_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `ngoName`: string
- `registrationNumber`: string
- `registeredYear`: number
- `address`: string
- `contactNumber`: string
- `email`: string
- `website`: string
- `authorizedPerson.name`: string
- `authorizedPerson.phone`: string
- `authorizedPerson.email`: string
- `panNumber`: string
- `tanNumber`: string
- `gstNumber`: string
- `numberOfEmployees`: number
- `ngoType`: string
- `is80GCertified`: boolean
- `is12ACertified`: boolean
- `bankDetails.accountHolderName`: string
- `bankDetails.accountNumber`: string
- `bankDetails.ifscCode`: string
- `bankDetails.bankName`: string
- `bankDetails.branchName`: string
- `logo`: File (optional)

## 🎯 Campaign Management

### 4. Create Campaign
```http
POST /api/ngo/campaigns
Authorization: Bearer <ngo_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `title`: string (required)
- `description`: string (required)
- `category`: string (required)
- `targetAmount`: number (required)
- `startDate`: string (ISO date)
- `endDate`: string (ISO date)
- `location`: string
- `beneficiaries`: string
- `images`: File[] (multiple images)
- `documents`: File[] (supporting documents)

### 5. Get NGO Campaigns
```http
GET /api/ngo/campaigns
Authorization: Bearer <ngo_token>
```

**Query Parameters:**
- `status`: Filter by status (active, completed, paused)
- `page`: Page number
- `limit`: Items per page

### 6. Get Campaign by ID
```http
GET /api/ngo/campaigns/:id
Authorization: Bearer <ngo_token>
```

### 7. Update Campaign
```http
PUT /api/ngo/campaigns/:id
Authorization: Bearer <ngo_token>
Content-Type: multipart/form-data
```

### 8. Delete Campaign
```http
DELETE /api/ngo/campaigns/:id
Authorization: Bearer <ngo_token>
```

### 9. Upload Campaign Proof
```http
POST /api/ngo/campaigns/:id/proof
Authorization: Bearer <ngo_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `proofImages`: File[]
- `description`: string

## 💰 Donation Management

### 10. Get Campaign Donations
```http
GET /api/ngo/campaigns/:id/donations
Authorization: Bearer <ngo_token>
```

### 11. Get All NGO Donations
```http
GET /api/ngo/donations
Authorization: Bearer <ngo_token>
```

**Query Parameters:**
- `campaignId`: Filter by campaign
- `startDate`: Start date filter
- `endDate`: End date filter
- `page`: Page number
- `limit`: Items per page

## 📊 Analytics & Reports

### 12. Get NGO Analytics
```http
GET /api/ngo/analytics
Authorization: Bearer <ngo_token>
```

**Response:**
```json
{
  "totalCampaigns": 10,
  "activeCampaigns": 5,
  "totalRaised": 125000,
  "totalDonors": 250,
  "monthlyStats": [...],
  "campaignPerformance": [...],
  "topCampaigns": [...]
}
```

### 13. Get Campaign Analytics
```http
GET /api/ngo/campaigns/:id/analytics
Authorization: Bearer <ngo_token>
```

## 📝 Activity & Logs

### 14. Get NGO Activities
```http
GET /api/ngo/activities
Authorization: Bearer <ngo_token>
```

### 15. Log Campaign Activity
```http
POST /api/ngo/activities
Authorization: Bearer <ngo_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "action": "Campaign updated",
  "details": "Updated campaign description",
  "campaignId": "campaign_id"
}
```

## 🔗 Share & Export

### 16. Generate Campaign Share Link
```http
POST /api/ngo/campaigns/:id/share
Authorization: Bearer <ngo_token>
```

### 17. Generate Profile Share Link
```http
POST /api/ngo/profile/share
Authorization: Bearer <ngo_token>
```

### 18. Export Campaign Data
```http
GET /api/ngo/campaigns/:id/export
Authorization: Bearer <ngo_token>
```

### 19. Export NGO Report
```http
GET /api/ngo/reports/export
Authorization: Bearer <ngo_token>
```

**Query Parameters:**
- `format`: csv, pdf, excel
- `type`: campaigns, donations, analytics

## 🔔 Notifications

### 20. Get NGO Notifications
```http
GET /api/ngo/notifications
Authorization: Bearer <ngo_token>
```

### 21. Mark Notification as Read
```http
PUT /api/ngo/notifications/:id/read
Authorization: Bearer <ngo_token>
```

## 📋 Validation Rules

### Campaign Creation:
- `title`: Required, min 5 characters
- `description`: Required, min 20 characters
- `targetAmount`: Required, minimum 1000
- `category`: Required, valid category
- `endDate`: Must be future date

### Profile Update:
- `registrationNumber`: Required, unique
- `email`: Valid email format
- `contactNumber`: Valid phone number
- `panNumber`: Valid PAN format
- `bankDetails`: Complete bank information required

## 🚨 Error Handling

Standard HTTP status codes with descriptive error messages for validation, authorization, and server errors.
