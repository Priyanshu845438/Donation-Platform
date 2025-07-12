
# Company API Endpoints

Base URL: `/api/company`

**Required Role:** Company

## 📊 Company Dashboard

### 1. Get Company Dashboard
```http
GET /api/company/dashboard
Authorization: Bearer <company_token>
```

**Response (200):**
```json
{
  "profile": {
    "_id": "company_id",
    "companyName": "Tech Corp",
    "registrationNumber": "COMP123456",
    "totalDonations": 15,
    "totalAmount": 50000
  },
  "donations": [...],
  "favoriteCampaigns": [...],
  "analytics": {
    "totalDonated": 50000,
    "campaignsSupported": 8,
    "averageDonation": 3333,
    "monthlyGiving": 10000
  }
}
```

## 🏢 Profile Management

### 2. Get Company Profile
```http
GET /api/company/profile
Authorization: Bearer <company_token>
```

### 3. Update Company Profile
```http
PUT /api/company/profile
Authorization: Bearer <company_token>
Content-Type: multipart/form-data
```

**Form Data:**
- `companyName`: string (required)
- `registrationNumber`: string (required)
- `companyType`: string (required)
- `industry`: string
- `foundedYear`: number
- `address`: string
- `city`: string
- `state`: string
- `pincode`: string
- `country`: string
- `contactNumber`: string (required)
- `email`: string (required)
- `website`: string
- `description`: string
- `numberOfEmployees`: number
- `annualRevenue`: number
- `csr.hasCsrPolicy`: boolean
- `csr.csrBudget`: number
- `csr.focusAreas`: string[]
- `bankDetails.accountHolderName`: string
- `bankDetails.accountNumber`: string
- `bankDetails.ifscCode`: string
- `bankDetails.bankName`: string
- `bankDetails.branchName`: string
- `companyLogo`: File (optional)
- `panNumber`: string
- `gstNumber`: string
- `tanNumber`: string

## 💰 Donation Management

### 4. Make Donation
```http
POST /api/company/donate
Authorization: Bearer <company_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "campaignId": "campaign_id",
  "amount": 5000,
  "donationType": "one-time",
  "isAnonymous": false,
  "message": "Supporting this great cause",
  "paymentMethod": "razorpay"
}
```

### 5. Get Donation History
```http
GET /api/company/donations
Authorization: Bearer <company_token>
```

**Query Parameters:**
- `campaignId`: Filter by campaign
- `startDate`: Start date filter (YYYY-MM-DD)
- `endDate`: End date filter (YYYY-MM-DD)
- `status`: Filter by status (pending, completed, failed)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### 6. Get Donation by ID
```http
GET /api/company/donations/:id
Authorization: Bearer <company_token>
```

### 7. Cancel Pending Donation
```http
PUT /api/company/donations/:id/cancel
Authorization: Bearer <company_token>
```

## 🎯 Campaign Interaction

### 8. Browse Campaigns
```http
GET /api/company/campaigns
Authorization: Bearer <company_token>
```

**Query Parameters:**
- `category`: Filter by category
- `location`: Filter by location
- `status`: Filter by status
- `sortBy`: Sort by (newest, target, raised)
- `search`: Search in title/description
- `page`: Page number
- `limit`: Items per page

### 9. Get Campaign Details
```http
GET /api/company/campaigns/:id
Authorization: Bearer <company_token>
```

### 10. Add Campaign to Favorites
```http
POST /api/company/campaigns/:id/favorite
Authorization: Bearer <company_token>
```

### 11. Remove from Favorites
```http
DELETE /api/company/campaigns/:id/favorite
Authorization: Bearer <company_token>
```

### 12. Get Favorite Campaigns
```http
GET /api/company/favorites
Authorization: Bearer <company_token>
```

## 📊 Analytics & Reports

### 13. Get Company Analytics
```http
GET /api/company/analytics
Authorization: Bearer <company_token>
```

**Response:**
```json
{
  "totalDonations": 25,
  "totalAmount": 125000,
  "averageDonation": 5000,
  "campaignsSupported": 15,
  "monthlyGiving": [...],
  "categoryWiseGiving": [...],
  "impactMetrics": {
    "beneficiariesReached": 1500,
    "projectsSupported": 12,
    "averageImpact": "High"
  }
}
```

### 14. Get Donation Analytics
```http
GET /api/company/analytics/donations
Authorization: Bearer <company_token>
```

**Query Parameters:**
- `period`: monthly, quarterly, yearly
- `year`: Specific year

### 15. Get Impact Report
```http
GET /api/company/impact-report
Authorization: Bearer <company_token>
```

## 📝 CSR Management

### 16. Get CSR Dashboard
```http
GET /api/company/csr/dashboard
Authorization: Bearer <company_token>
```

### 17. Update CSR Policy
```http
PUT /api/company/csr/policy
Authorization: Bearer <company_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "hasCsrPolicy": true,
  "csrBudget": 500000,
  "focusAreas": ["education", "healthcare", "environment"],
  "complianceDetails": {
    "previousYearSpent": 450000,
    "currentYearBudget": 500000,
    "mandatorySpending": 475000
  }
}
```

### 18. Get CSR Report
```http
GET /api/company/csr/report
Authorization: Bearer <company_token>
```

## 🔔 Notifications & Communications

### 19. Get Company Notifications
```http
GET /api/company/notifications
Authorization: Bearer <company_token>
```

### 20. Mark Notification as Read
```http
PUT /api/company/notifications/:id/read
Authorization: Bearer <company_token>
```

### 21. Get Campaign Updates
```http
GET /api/company/campaign-updates
Authorization: Bearer <company_token>
```

## 🔗 Sharing & Export

### 22. Generate Profile Share Link
```http
POST /api/company/profile/share
Authorization: Bearer <company_token>
```

### 23. Export Donation Report
```http
GET /api/company/reports/export
Authorization: Bearer <company_token>
```

**Query Parameters:**
- `format`: csv, pdf, excel
- `type`: donations, analytics, csr
- `period`: monthly, quarterly, yearly

### 24. Download Tax Receipt
```http
GET /api/company/donations/:id/receipt
Authorization: Bearer <company_token>
```

## 🎨 Company Portfolio

### 25. Create Portfolio Page
```http
POST /api/company/portfolio
Authorization: Bearer <company_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "Our CSR Journey",
  "description": "Company's social responsibility initiatives",
  "template": "corporate",
  "customCSS": "/* Custom styles */",
  "sections": [
    {
      "type": "hero",
      "content": {...}
    },
    {
      "type": "donations",
      "content": {...}
    }
  ],
  "isPublic": true
}
```

### 26. Update Portfolio
```http
PUT /api/company/portfolio
Authorization: Bearer <company_token>
```

### 27. Get Portfolio
```http
GET /api/company/portfolio
Authorization: Bearer <company_token>
```

## 📋 Validation Rules

### Profile Update:
- `companyName`: Required, min 2 characters
- `registrationNumber`: Required, unique format
- `email`: Valid email format
- `contactNumber`: Valid phone number
- `website`: Valid URL format
- `panNumber`: Valid PAN format (if provided)
- `gstNumber`: Valid GST format (if provided)

### Donation:
- `amount`: Minimum 100, maximum based on CSR budget
- `campaignId`: Must be valid and active campaign
- `paymentMethod`: Must be supported payment gateway

## 🚨 Error Handling

### 400 - Validation Error
```json
{
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be at least 100"
    }
  ]
}
```

### 402 - Payment Required
```json
{
  "message": "Insufficient CSR budget for this donation"
}
```

### 404 - Campaign Not Found
```json
{
  "message": "Campaign not found or no longer active"
}
```
