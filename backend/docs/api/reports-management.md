
# Reports Management System API Documentation

## Overview
The Reports Management System provides comprehensive reporting capabilities for the donation platform, including government compliance reports, financial summaries, user analytics, and export functionality in PDF and Excel formats.

## Features
- ✅ User management reports with role and status analytics
- ✅ NGO performance reports with campaign statistics
- ✅ Campaign reports with donation tracking
- ✅ Comprehensive donation reports with payment analytics
- ✅ Financial summary reports with trends
- ✅ Government compliance reports (80G/12A certificates)
- ✅ Platform activity reports
- ✅ Dashboard summary reports
- ✅ PDF and Excel export functionality
- ✅ Advanced filtering options
- ✅ Real-time data aggregation

## Report Types

### 1. User Management Reports
Track user registrations, approvals, and role distributions.

### 2. NGO Reports
Monitor NGO performance, campaign success rates, and certification status.

### 3. Campaign Reports
Analyze campaign performance, funding goals, and category distributions.

### 4. Donation Reports
Comprehensive donation tracking with payment method analytics.

### 5. Financial Reports
Financial summaries with NGO-wise collections and monthly trends.

### 6. Compliance Reports
Government compliance reports for tax exemption certificates.

### 7. Activity Reports
Platform activity monitoring with user action tracking.

### 8. Dashboard Reports
Overall platform performance summaries.

## Authentication
All report endpoints require admin authentication:
```
Authorization: Bearer <admin_token>
```

## API Endpoints

### User Management Reports

#### Get User Report
```http
GET /api/admin/reports/users
```

**Query Parameters:**
- `startDate` (string): Start date filter (YYYY-MM-DD)
- `endDate` (string): End date filter (YYYY-MM-DD)
- `role` (string): Filter by user role (ngo, company, donor, admin)
- `status` (string): Filter by status (active, inactive)
- `approvalStatus` (string): Filter by approval status (pending, approved, rejected)
- `export` (string): Export format (pdf, excel)

**Response:**
```json
{
  "success": true,
  "message": "User report generated successfully",
  "users": [
    {
      "_id": "user_id",
      "fullName": "John Doe",
      "email": "john@example.com",
      "role": "ngo",
      "isActive": true,
      "approvalStatus": "approved",
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "stats": {
    "totalUsers": 150,
    "roleDistribution": {
      "ngo": 45,
      "company": 30,
      "donor": 70,
      "admin": 5
    },
    "statusDistribution": {
      "active": 140,
      "inactive": 10
    },
    "approvalDistribution": {
      "approved": 120,
      "pending": 25,
      "rejected": 5
    },
    "monthlyRegistrations": {
      "2024-01": 25,
      "2024-02": 30
    }
  },
  "generatedAt": "2024-01-20T10:00:00.000Z"
}
```

### NGO Reports

#### Get NGO Report
```http
GET /api/admin/reports/ngos
```

**Query Parameters:**
- `startDate` (string): Start date filter
- `endDate` (string): End date filter
- `status` (string): Filter by status (active, inactive)
- `ngoType` (string): Filter by NGO type (Trust, Society, etc.)
- `certification` (string): Filter by certification (80G, 12A)
- `export` (string): Export format (pdf, excel)

**Response:**
```json
{
  "success": true,
  "message": "NGO report generated successfully",
  "ngos": [
    {
      "_id": "ngo_id",
      "ngoName": "Education Foundation",
      "email": "contact@education.org",
      "ngoType": "Trust",
      "is80GCertified": true,
      "is12ACertified": true,
      "isActive": true,
      "campaigns": {
        "totalCampaigns": 5,
        "activeCampaigns": 3,
        "totalTargetAmount": 500000,
        "totalRaisedAmount": 350000
      }
    }
  ],
  "summary": {
    "totalNGOs": 45,
    "activeNGOs": 42,
    "certifiedNGOs": 35,
    "totalCampaigns": 150,
    "totalFundsRaised": 2500000
  }
}
```

### Campaign Reports

#### Get Campaign Report
```http
GET /api/admin/reports/campaigns
```

**Query Parameters:**
- `startDate` (string): Start date filter
- `endDate` (string): End date filter
- `status` (string): Filter by status (active, inactive)
- `category` (string): Filter by campaign category
- `approvalStatus` (string): Filter by approval status
- `ngoId` (string): Filter by specific NGO
- `minAmount` (number): Minimum target amount
- `maxAmount` (number): Maximum target amount
- `export` (string): Export format (pdf, excel)

**Response:**
```json
{
  "success": true,
  "message": "Campaign report generated successfully",
  "campaigns": [
    {
      "_id": "campaign_id",
      "title": "Education for Rural Children",
      "category": "Education",
      "targetAmount": 100000,
      "raisedAmount": 75000,
      "isActive": true,
      "approvalStatus": "approved",
      "ngoId": {
        "ngoName": "Education Foundation",
        "email": "contact@education.org"
      },
      "donations": {
        "totalDonations": 25,
        "totalAmount": 75000,
        "uniqueDonors": 20
      }
    }
  ],
  "summary": {
    "totalCampaigns": 150,
    "activeCampaigns": 75,
    "approvedCampaigns": 120,
    "totalTargetAmount": 5000000,
    "totalRaisedAmount": 3500000,
    "categoryDistribution": {
      "Education": 45,
      "Healthcare": 35,
      "Environment": 25
    }
  }
}
```

### Donation Reports

#### Get Donation Report
```http
GET /api/admin/reports/donations
```

**Query Parameters:**
- `startDate` (string): Start date filter
- `endDate` (string): End date filter
- `status` (string): Filter by status (Pending, Completed, Failed)
- `paymentMethod` (string): Filter by payment method
- `minAmount` (number): Minimum donation amount
- `maxAmount` (number): Maximum donation amount
- `donorId` (string): Filter by specific donor
- `campaignId` (string): Filter by specific campaign
- `export` (string): Export format (pdf, excel)

**Response:**
```json
{
  "success": true,
  "message": "Donation report generated successfully",
  "donations": [
    {
      "_id": "donation_id",
      "amount": 5000,
      "paymentMethod": "UPI",
      "status": "Completed",
      "transactionId": "TXN123456789",
      "donationDate": "2024-01-15T10:00:00.000Z",
      "donorId": {
        "fullName": "Jane Smith",
        "email": "jane@example.com",
        "role": "donor"
      },
      "campaignId": {
        "title": "Clean Water Initiative",
        "ngoId": {
          "ngoName": "Water Foundation"
        }
      }
    }
  ],
  "summary": {
    "totalDonations": 500,
    "totalAmount": 2500000,
    "averageAmount": 5000,
    "uniqueDonors": 350,
    "uniqueCampaigns": 75,
    "paymentMethodDistribution": {
      "UPI": 200,
      "Net Banking": 150,
      "Credit Card": 100,
      "Debit Card": 50
    },
    "statusDistribution": {
      "Completed": 480,
      "Pending": 15,
      "Failed": 5
    },
    "monthlyTrends": {
      "2024-01": {
        "count": 50,
        "amount": 250000
      }
    }
  }
}
```

### Financial Reports

#### Get Financial Summary Report
```http
GET /api/admin/reports/financial
```

**Query Parameters:**
- `startDate` (string): Financial period start date
- `endDate` (string): Financial period end date
- `export` (string): Export format (pdf, excel)

**Response:**
```json
{
  "success": true,
  "message": "Financial report generated successfully",
  "summary": {
    "totalAmount": 2500000,
    "totalDonations": 500,
    "averageAmount": 5000
  },
  "ngoWiseCollection": [
    {
      "_id": "ngo_id",
      "ngoName": "Education Foundation",
      "totalAmount": 500000,
      "totalDonations": 100,
      "campaignCount": 5
    }
  ],
  "monthlyTrends": [
    {
      "_id": {
        "year": 2024,
        "month": 1
      },
      "totalAmount": 250000,
      "totalDonations": 50
    }
  ],
  "categoryWiseDistribution": [
    {
      "_id": "Education",
      "totalAmount": 800000,
      "totalDonations": 160
    }
  ],
  "reportPeriod": {
    "startDate": "2024-01-01",
    "endDate": "2024-12-31"
  }
}
```

### Government Compliance Reports

#### Get Tax Compliance Report
```http
GET /api/admin/reports/compliance
```

**Query Parameters:**
- `startDate` (string): Financial year start date
- `endDate` (string): Financial year end date
- `export` (string): Export format (pdf, excel)

**Response:**
```json
{
  "success": true,
  "message": "Compliance report generated successfully",
  "eligibleDonations": [
    {
      "donorName": "John Doe",
      "panNumber": "ABCDE1234F",
      "amount": 10000,
      "ngoName": "Education Foundation",
      "ngoRegistrationNumber": "NGO123456",
      "is80GCertified": true,
      "is12ACertified": true,
      "transactionId": "TXN123456789",
      "donationDate": "2024-01-15T10:00:00.000Z"
    }
  ],
  "panWiseSummary": [
    {
      "panNumber": "ABCDE1234F",
      "donorName": "John Doe",
      "donorEmail": "john@example.com",
      "totalAmount": 25000,
      "totalDonations": 3
    }
  ],
  "summary": {
    "totalEligibleDonations": 400,
    "totalEligibleAmount": 2000000,
    "uniquePANs": 300,
    "certified80GNGOs": 35,
    "certified12ANGOs": 30
  }
}
```

### Activity Reports

#### Get Activity Report
```http
GET /api/admin/reports/activities
```

**Query Parameters:**
- `startDate` (string): Start date filter
- `endDate` (string): End date filter
- `action` (string): Filter by action type
- `userId` (string): Filter by specific user
- `export` (string): Export format (pdf, excel)

**Response:**
```json
{
  "success": true,
  "message": "Activity report generated successfully",
  "activities": [
    {
      "_id": "activity_id",
      "action": "donation",
      "description": "Donation made to campaign",
      "userId": {
        "fullName": "Jane Smith",
        "email": "jane@example.com",
        "role": "donor"
      },
      "metadata": {
        "amount": 5000,
        "campaignId": "campaign_id"
      },
      "createdAt": "2024-01-15T10:00:00.000Z"
    }
  ],
  "summary": {
    "totalActivities": 1000,
    "actionDistribution": {
      "donation": 400,
      "campaign_creation": 50,
      "user_registration": 150
    },
    "userDistribution": {
      "user_id_1": 25,
      "user_id_2": 30
    },
    "dailyTrends": {
      "2024-01-15": 45,
      "2024-01-16": 52
    }
  }
}
```

### Dashboard Reports

#### Get Dashboard Summary Report
```http
GET /api/admin/reports/dashboard
```

**Query Parameters:**
- `export` (string): Export format (pdf, excel)

**Response:**
```json
{
  "success": true,
  "message": "Dashboard report generated successfully",
  "overview": {
    "totalUsers": 500,
    "totalNGOs": 45,
    "totalCompanies": 30,
    "totalCampaigns": 150,
    "totalDonations": 500,
    "totalDonationAmount": 2500000
  },
  "generatedAt": "2024-01-20T10:00:00.000Z"
}
```

## Export Functionality

### PDF Export
Add `?export=pdf` to any report endpoint to download as PDF:
```http
GET /api/admin/reports/users?export=pdf
```

### Excel Export
Add `?export=excel` to any report endpoint to download as Excel:
```http
GET /api/admin/reports/donations?export=excel&startDate=2024-01-01
```

## Advanced Filtering

### Date Range Filtering
```http
GET /api/admin/reports/donations?startDate=2024-01-01&endDate=2024-12-31
```

### Multiple Filters
```http
GET /api/admin/reports/campaigns?status=active&category=Education&minAmount=10000&maxAmount=100000
```

### NGO-Specific Reports
```http
GET /api/admin/reports/campaigns?ngoId=NGO_ID_HERE
```

## Government Compliance Features

### 80G Certificate Tracking
- Tracks donations to 80G certified NGOs
- Generates donor-wise tax exemption reports
- PAN number validation and reporting

### 12A Certificate Monitoring
- Monitors 12A certified organizations
- Compliance status tracking
- Annual reporting capabilities

### Financial Year Reports
```http
GET /api/admin/reports/compliance?startDate=2024-04-01&endDate=2025-03-31
```

## Error Handling

All endpoints return standard error responses:
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Rate Limiting

- Report generation endpoints are rate-limited to prevent system overload
- Large data exports may take additional processing time
- Recommend using date filters for better performance

## Best Practices

1. **Use Date Filters**: Always apply appropriate date ranges for better performance
2. **Specific Filtering**: Use specific filters to reduce data volume
3. **Export Limitations**: Large datasets may have export size limitations
4. **Regular Monitoring**: Schedule regular report generation for compliance
5. **Data Retention**: Consider data retention policies for historical reports

## Integration Examples

### Frontend Integration
```javascript
// Generate donation report
const generateDonationReport = async (filters) => {
  const queryParams = new URLSearchParams(filters);
  const response = await fetch(`/api/admin/reports/donations?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  return response.json();
};

// Export to Excel
const exportToExcel = async (reportType, filters) => {
  const queryParams = new URLSearchParams({...filters, export: 'excel'});
  const response = await fetch(`/api/admin/reports/${reportType}?${queryParams}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  
  if (response.ok) {
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report.xlsx`;
    a.click();
  }
};
```

### Admin Dashboard Integration
```javascript
// Dashboard summary
const getDashboardReport = async () => {
  const response = await fetch('/api/admin/reports/dashboard', {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  return response.json();
};

// Financial summary for current month
const getMonthlyFinancials = async () => {
  const startDate = new Date();
  startDate.setDate(1);
  const endDate = new Date();
  
  const response = await fetch(`/api/admin/reports/financial?startDate=${startDate.toISOString().split('T')[0]}&endDate=${endDate.toISOString().split('T')[0]}`, {
    headers: {
      'Authorization': `Bearer ${adminToken}`
    }
  });
  return response.json();
};
```

## Compliance Requirements

### Indian Government Requirements
- **PAN Card Tracking**: All donations above ₹2000 require PAN verification
- **80G Certificates**: Track tax-exempt donations
- **12A Registration**: Monitor NGO compliance status
- **Annual Returns**: Generate data for annual compliance reports

### Data Privacy
- Personal information is handled according to privacy policies
- PAN numbers are tracked for compliance but protected
- Anonymous donation options available

### Audit Trail
- All report generation activities are logged
- User access to reports is tracked
- Export activities are monitored

This comprehensive reports system ensures full compliance with government requirements while providing powerful analytics for platform management.
