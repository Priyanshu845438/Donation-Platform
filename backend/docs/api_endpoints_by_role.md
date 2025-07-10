
# Donation Platform API - Endpoints by Role

## Public Endpoints (No Authentication Required)

### Health & System
- `GET /health` - Server health status
- `GET /` - Basic API information

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Campaigns (Public View)
- `GET /api/campaigns` - Get all public campaigns
- `GET /api/campaigns/:id` - Get campaign details

### Donations (Public)
- `POST /api/donations` - Create donation (no auth required)

---

## User Role Endpoints

### Profile Management
- `GET /api/auth/profile` - Get own profile
- `PATCH /api/auth/profile` - Update own profile
- `PATCH /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout

### User Specific
- `GET /api/users/profile/me` - Get authenticated user's profile
- `PATCH /api/users/profile/me` - Update authenticated user's profile
- `GET /api/users/dashboard/analytics` - Get user dashboard data
- `GET /api/users/donations/history` - Get user's donation history
- `POST /api/users/profile/image` - Upload profile image

### Donations
- `GET /api/donations/my-donations` - Get user's donations
- `GET /api/donations/:id` - Get donation details

---

## Company Role Endpoints

### All User Endpoints Plus:

### Campaign Management
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/user/my-campaigns` - Get company's campaigns
- `PATCH /api/campaigns/:id` - Update own campaign
- `DELETE /api/campaigns/:id` - Delete own campaign
- `GET /api/campaigns/:id/stats` - Get campaign statistics

### Company Profile
- `GET /api/company/profile` - Get company profile
- `PATCH /api/company/profile` - Update company profile
- `POST /api/company/upload-documents` - Upload company documents

---

## NGO Role Endpoints

### All User Endpoints Plus:

### Campaign Management
- `POST /api/campaigns` - Create new campaign
- `GET /api/campaigns/user/my-campaigns` - Get NGO's campaigns
- `PATCH /api/campaigns/:id` - Update own campaign
- `DELETE /api/campaigns/:id` - Delete own campaign
- `GET /api/campaigns/:id/stats` - Get campaign statistics

### NGO Profile
- `GET /api/ngo/profile` - Get NGO profile
- `PATCH /api/ngo/profile` - Update NGO profile
- `POST /api/ngo/upload-documents` - Upload NGO documents
- `GET /api/ngo/dashboard/analytics` - Get NGO dashboard analytics

---

## Admin Role Endpoints

### All Previous Endpoints Plus:

### Admin Dashboard
- `GET /api/admin/dashboard/analytics` - Get platform analytics
- `GET /api/admin/dashboard/stats` - Get platform statistics

### User Management
- `GET /api/admin/dashboard/users` - Get all users with pagination
- `GET /api/admin/dashboard/users/:userId` - Get specific user
- `PATCH /api/admin/dashboard/users/:userId` - Update user profile
- `PATCH /api/admin/dashboard/users/:userId/status` - Update user status
- `DELETE /api/admin/dashboard/users/:userId` - Delete user

### Campaign Management
- `GET /api/admin/dashboard/campaigns` - Get all campaigns
- `GET /api/admin/dashboard/campaigns/:campaignId` - Get specific campaign
- `PATCH /api/admin/dashboard/campaigns/:campaignId` - Update campaign
- `PATCH /api/admin/dashboard/campaigns/:campaignId/status` - Update campaign status
- `DELETE /api/admin/dashboard/campaigns/:campaignId` - Delete campaign

### Reports & Analytics
- `GET /api/admin/reports/donations` - Get donations report
- `GET /api/admin/reports/users` - Get users report
- `GET /api/admin/reports/campaigns` - Get campaigns report

---

## Protected Endpoints Summary

### Authentication Levels:
1. **Public** - No authentication required
2. **User** - Basic user authentication (user, company, ngo, admin)
3. **Company** - Company role access
4. **NGO** - NGO role access  
5. **Admin** - Admin role access only

### Query Parameters:
- **Pagination**: `page`, `limit` (default: page=1, limit=10)
- **Filtering**: `status`, `category`, `role`, `search`
- **Sorting**: `sortBy`, `sortOrder` (asc/desc)

### Common Response Format:
```json
{
  "success": boolean,
  "message": string,
  "data": object,
  "error": string (only on errors),
  "pagination": {
    "page": number,
    "limit": number,
    "total": number,
    "pages": number
  }
}
```

### Error Codes:
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (no token or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error
