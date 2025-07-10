
# Company & NGO Role Endpoints Documentation

## Company Role Endpoints

### Base URL
```
http://localhost:5000/api
```

### Authentication
All company endpoints require JWT token with company role:
```
Authorization: Bearer <jwt_token>
```

---

## Company Profile Management

### Get Company Profile
**GET** `/company/profile`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "company_id",
    "companyName": "Tech Corp",
    "email": "contact@techcorp.com",
    "industry": "Technology",
    "website": "https://techcorp.com",
    "description": "Leading tech company",
    "address": {...},
    "documents": [...],
    "isVerified": true
  }
}
```

### Update Company Profile
**PATCH** `/company/profile`

**Body**:
```json
{
  "companyName": "Updated Corp",
  "industry": "Technology",
  "website": "https://updated.com",
  "description": "Updated description"
}
```

### Upload Company Documents
**POST** `/company/upload-documents`

**Content-Type**: `multipart/form-data`

**Fields**:
- `incorporationCertificate` (file)
- `panCard` (file)
- `gstCertificate` (file)
- `companyLogo` (file)

---

## Company Campaign Management

### Create Company Campaign
**POST** `/campaigns`

**Body**:
```json
{
  "title": "Corporate Social Initiative",
  "description": "Supporting education in rural areas",
  "goalAmount": 100000,
  "category": "education",
  "endDate": "2025-12-31",
  "tags": ["education", "rural", "csr"],
  "images": ["image1.jpg", "image2.jpg"]
}
```

### Get Company Campaigns
**GET** `/campaigns/user/my-campaigns`

**Query Parameters**:
- `page` (number): Page number
- `limit` (number): Items per page
- `status` (string): Filter by status

---

## NGO Role Endpoints

### Authentication
All NGO endpoints require JWT token with NGO role:
```
Authorization: Bearer <jwt_token>
```

---

## NGO Profile Management

### Get NGO Profile
**GET** `/ngo/profile`

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "ngo_id",
    "organizationName": "Help Foundation",
    "email": "contact@helpfoundation.org",
    "registrationNumber": "NGO123456",
    "established": "2010-01-01",
    "focusAreas": ["education", "healthcare"],
    "website": "https://helpfoundation.org",
    "description": "Helping communities grow",
    "address": {...},
    "documents": [...],
    "certifications": {
      "80g": true,
      "12a": true,
      "fcra": false
    },
    "isVerified": true
  }
}
```

### Update NGO Profile
**PATCH** `/ngo/profile`

**Body**:
```json
{
  "organizationName": "Updated Foundation",
  "focusAreas": ["education", "environment"],
  "website": "https://updated.org",
  "description": "Updated mission statement"
}
```

### Upload NGO Documents
**POST** `/ngo/upload-documents`

**Content-Type**: `multipart/form-data`

**Fields**:
- `registrationCertificate` (file)
- `panCard` (file)
- `80gCertificate` (file)
- `12aCertificate` (file)
- `fcraCertificate` (file)
- `auditReport` (file)
- `annualReport` (file)

---

## NGO Dashboard Analytics

### Get NGO Analytics
**GET** `/ngo/dashboard/analytics`

**Response**:
```json
{
  "success": true,
  "data": {
    "campaignStats": {
      "total": 15,
      "active": 8,
      "completed": 7,
      "totalRaised": 250000
    },
    "donationStats": {
      "totalDonations": 1500,
      "averageDonation": 167,
      "monthlyTrend": [...]
    },
    "impactMetrics": {
      "beneficiariesReached": 5000,
      "projectsCompleted": 12,
      "partnershipsFormed": 8
    }
  }
}
```

---

## Campaign Management (Both Company & NGO)

### Get Campaign Statistics
**GET** `/campaigns/:id/stats`

**Response**:
```json
{
  "success": true,
  "data": {
    "campaign": {
      "id": "campaign_id",
      "title": "Campaign Title",
      "goalAmount": 50000,
      "raisedAmount": 30000,
      "donorCount": 150,
      "progress": "60.00",
      "status": "active"
    },
    "donations": {
      "total": 150,
      "average": 200,
      "byDay": [...],
      "topDonors": [...]
    }
  }
}
```

### Update Campaign
**PATCH** `/campaigns/:id`

**Body**:
```json
{
  "title": "Updated Campaign Title",
  "description": "Updated description",
  "goalAmount": 75000,
  "tags": ["updated", "tags"]
}
```

### Delete Campaign
**DELETE** `/campaigns/:id`

**Note**: Only campaigns with no donations can be deleted

---

## Common Features

### File Upload Restrictions
- **Max file size**: 5MB per file
- **Allowed formats**: PDF, JPG, PNG, DOC, DOCX
- **Multiple files**: Supported for document uploads

### Validation Rules

#### Company Validation:
- Company name: 3-100 characters
- Industry: Must be from predefined list
- Website: Valid URL format
- GST number: Valid format if provided

#### NGO Validation:
- Organization name: 3-100 characters
- Registration number: Required and unique
- Focus areas: Must be from predefined categories
- Certifications: Boolean values

### Error Responses

#### Validation Error (400):
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "companyName",
      "message": "Company name must be at least 3 characters"
    }
  ]
}
```

#### Unauthorized (401):
```json
{
  "success": false,
  "message": "Access denied. Company role required."
}
```

#### File Upload Error (400):
```json
{
  "success": false,
  "message": "File upload failed",
  "error": "File size exceeds 5MB limit"
}
```

### Rate Limiting
- Profile updates: 10 requests per hour
- Document uploads: 5 requests per hour
- Campaign creation: 5 requests per day
- Campaign updates: 20 requests per hour
