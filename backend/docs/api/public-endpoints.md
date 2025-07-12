
# Public API Endpoints

Base URL: `/api/public`

**Authentication:** Not required for most endpoints

## 🌐 Public Campaign Access

### 1. Get All Public Campaigns
```http
GET /api/public/campaigns
```

**Query Parameters:**
- `category`: Filter by category
- `location`: Filter by location
- `status`: active, completed
- `sortBy`: newest, ending_soon, most_funded, target_amount
- `search`: Search in title/description
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 12, max: 50)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "campaigns": [
      {
        "_id": "campaign_id",
        "title": "Education for Rural Children",
        "description": "Providing quality education...",
        "category": "Education",
        "targetAmount": 100000,
        "raisedAmount": 45000,
        "percentage": 45,
        "startDate": "2024-01-01",
        "endDate": "2024-12-31",
        "location": "Rural India",
        "images": ["image1.jpg", "image2.jpg"],
        "ngo": {
          "name": "Education Foundation",
          "logo": "logo.jpg"
        },
        "donorCount": 150,
        "daysLeft": 180,
        "status": "active"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalCampaigns": 60,
      "hasNext": true,
      "hasPrev": false
    },
    "filters": {
      "categories": ["Education", "Healthcare", "Environment"],
      "locations": ["Mumbai", "Delhi", "Bangalore"]
    }
  }
}
```

### 2. Get Campaign by ID
```http
GET /api/public/campaigns/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "campaign": {
      "_id": "campaign_id",
      "title": "Education for Rural Children",
      "description": "Detailed description...",
      "category": "Education",
      "targetAmount": 100000,
      "raisedAmount": 45000,
      "percentage": 45,
      "startDate": "2024-01-01",
      "endDate": "2024-12-31",
      "location": "Rural India",
      "beneficiaries": "500 children",
      "images": ["image1.jpg", "image2.jpg"],
      "documents": ["doc1.pdf", "doc2.pdf"],
      "ngo": {
        "_id": "ngo_id",
        "name": "Education Foundation",
        "logo": "logo.jpg",
        "registrationNumber": "REG123456",
        "website": "https://example.org"
      },
      "donations": [
        {
          "amount": 5000,
          "donorName": "Anonymous",
          "donatedAt": "2024-01-15",
          "message": "Great cause!"
        }
      ],
      "donorCount": 150,
      "daysLeft": 180,
      "status": "active",
      "updates": [
        {
          "title": "Progress Update",
          "description": "We've reached 45% of our goal!",
          "date": "2024-01-20",
          "images": ["update1.jpg"]
        }
      ]
    }
  }
}
```

### 3. Get Campaign Categories
```http
GET /api/public/campaigns/categories
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "categories": [
      {
        "name": "Education",
        "count": 25,
        "icon": "education-icon.svg"
      },
      {
        "name": "Healthcare",
        "count": 18,
        "icon": "healthcare-icon.svg"
      },
      {
        "name": "Environment",
        "count": 12,
        "icon": "environment-icon.svg"
      }
    ]
  }
}
```

### 4. Get Featured Campaigns
```http
GET /api/public/campaigns/featured
```

### 5. Get Trending Campaigns
```http
GET /api/public/campaigns/trending
```

### 6. Get Urgent Campaigns
```http
GET /api/public/campaigns/urgent
```

## 🏢 Public Organization Profiles

### 7. Get Public NGO Profile
```http
GET /api/public/ngo/:id
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "ngo": {
      "_id": "ngo_id",
      "ngoName": "Hope Foundation",
      "description": "Working for social welfare...",
      "logo": "logo.jpg",
      "registrationNumber": "REG123456",
      "registeredYear": 2010,
      "website": "https://hope.org",
      "is80GCertified": true,
      "is12ACertified": true,
      "campaigns": [
        {
          "_id": "campaign_id",
          "title": "Campaign Title",
          "raisedAmount": 25000,
          "targetAmount": 50000
        }
      ],
      "totalCampaigns": 15,
      "totalRaised": 500000,
      "completedProjects": 8,
      "beneficiariesReached": 2500
    }
  }
}
```

### 8. Get Public Company Profile
```http
GET /api/public/company/:id
```

## 🔗 Shared Links

### 9. Access Shared Profile
```http
GET /api/public/share/profile/:token
```

### 10. Access Shared Campaign
```http
GET /api/public/share/campaign/:token
```

### 11. Access Custom Portfolio
```http
GET /api/public/portfolio/:token
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "portfolio": {
      "title": "Our CSR Journey",
      "description": "Company's social responsibility initiatives",
      "template": "corporate",
      "customCSS": "/* Custom styles */",
      "sections": [...],
      "organization": {
        "name": "Tech Corp",
        "logo": "logo.jpg",
        "type": "Company"
      },
      "stats": {
        "totalDonated": 500000,
        "projectsSupported": 25,
        "beneficiariesReached": 5000
      }
    }
  }
}
```

## 📊 Public Statistics

### 12. Get Platform Statistics
```http
GET /api/public/stats
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalCampaigns": 150,
      "activeCampaigns": 75,
      "totalRaised": 5000000,
      "totalDonors": 2500,
      "totalNGOs": 50,
      "totalCompanies": 30,
      "beneficiariesReached": 25000,
      "completedProjects": 85
    },
    "recentDonations": [
      {
        "amount": 10000,
        "campaignTitle": "Education for All",
        "donorType": "Company",
        "donatedAt": "2024-01-20"
      }
    ],
    "topCampaigns": [
      {
        "title": "Healthcare for Rural Areas",
        "raisedAmount": 85000,
        "targetAmount": 100000,
        "percentage": 85
      }
    ]
  }
}
```

### 13. Get Campaign Statistics
```http
GET /api/public/campaigns/:id/stats
```

## 🔍 Search & Discovery

### 14. Search Campaigns
```http
GET /api/public/search
```

**Query Parameters:**
- `q`: Search query (required)
- `type`: campaigns, ngos, companies
- `category`: Filter by category
- `location`: Filter by location
- `page`: Page number
- `limit`: Items per page

### 15. Get Similar Campaigns
```http
GET /api/public/campaigns/:id/similar
```

### 16. Get NGO Campaigns
```http
GET /api/public/ngo/:id/campaigns
```

### 17. Get Company Donations
```http
GET /api/public/company/:id/donations
```

## 📱 Mobile App Support

### 18. Get Mobile App Config
```http
GET /api/public/mobile/config
```

### 19. Check App Version
```http
GET /api/public/mobile/version
```

## 🌍 Location & Regional

### 20. Get Campaigns by Location
```http
GET /api/public/location/:state/campaigns
```

### 21. Get Available Locations
```http
GET /api/public/locations
```

## 📧 Contact & Support

### 22. Submit Contact Form
```http
POST /api/public/contact
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Partnership Inquiry",
  "message": "I would like to partner with your platform...",
  "type": "partnership"
}
```

### 23. Subscribe to Newsletter
```http
POST /api/public/newsletter/subscribe
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "interests": ["education", "healthcare"]
}
```

## 📋 Validation & Constraints

### Query Limits:
- `limit`: Maximum 50 items per page
- `search`: Minimum 3 characters
- Caching applied for frequently accessed data

### Rate Limiting:
- General endpoints: 100 requests per minute
- Search endpoints: 50 requests per minute
- Contact form: 5 submissions per hour

## 🚨 Error Responses

### 404 - Not Found
```json
{
  "success": false,
  "message": "Campaign not found"
}
```

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Invalid query parameters",
  "errors": [
    {
      "param": "limit",
      "message": "Limit cannot exceed 50"
    }
  ]
}
```

### 429 - Rate Limited
```json
{
  "success": false,
  "message": "Too many requests, please try again later"
}
```
