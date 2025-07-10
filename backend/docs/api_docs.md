# Donation Platform API Documentation

## Overview

This document provides comprehensive documentation for the Donation Platform REST API. The API enables users, companies, and NGOs to manage donations, campaigns, and user accounts through a secure, role-based system.

**Version**: 1.0.0  
**Last Updated**: July 6, 2025  
**Total Endpoints**: 62 tested and functional

## Base URL
```
http://localhost:5000
```

## Authentication System Status
- User registration: ✅ Working with flexible phone validation (7-15 digits)
- Password hashing: ✅ bcrypt with 12 salt rounds  
- JWT token generation: ✅ 24-hour expiration
- Role-based access control: ✅ user/company/ngo/admin
- Rate limiting: ✅ 3 registration attempts per hour

## Authentication
Most protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## Response Format
All API responses follow this structure:
```json
{
  "success": boolean,
  "message": string,
  "data": object,
  "error": string (only on errors)
}
```

---

## Health & System Endpoints

### 1. Health Check
- **GET** `/health`
- **Description**: Server health status
- **Authentication**: None
- **Response**:
```json
{
  "status": "OK",
  "timestamp": "2025-07-06T10:38:56.223Z",
  "uptime": 4.850846223,
  "environment": "development",
  "version": "1.0.0"
}
```

### 2. API Info
- **GET** `/`
- **Description**: Basic API information
- **Authentication**: None
- **Response**:
```json
{
  "message": "Donation Platform API",
  "version": "1.0.0",
  "documentation": "/api/docs",
  "health": "/health"
}
```

---

## Authentication Endpoints

### 3. User Registration
- **POST** `/api/auth/register`
- **Description**: Register a new user
- **Authentication**: None
- **Body**:
```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phoneNumber": "1234567890",
  "password": "password123",
  "role": "user" // user, company, ngo
}
```

### 4. User Login
- **POST** `/api/auth/login`
- **Description**: Authenticate user
- **Authentication**: None
- **Body**:
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### 5. Get User Profile (Auth)
- **GET** `/api/auth/profile`
- **Description**: Get authenticated user's profile
- **Authentication**: Required

### 6. Update User Profile (Auth)
- **PATCH** `/api/auth/profile`
- **Description**: Update authenticated user's profile
- **Authentication**: Required

### 7. Change Password
- **PATCH** `/api/auth/change-password`
- **Description**: Change user password
- **Authentication**: Required
- **Body**:
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### 8. Logout
- **POST** `/api/auth/logout`
- **Description**: Logout user
- **Authentication**: Required

---

## User Management Endpoints

### 9. Get User by ID (Public)
- **GET** `/api/users/profile/:id`
- **Description**: Get public user profile
- **Authentication**: None

### 10. Get Own Profile
- **GET** `/api/users/profile/me`
- **Description**: Get authenticated user's profile
- **Authentication**: Required

### 11. Update Own Profile
- **PATCH** `/api/users/profile/me`
- **Description**: Update authenticated user's profile
- **Authentication**: Required

### 12. Get User Dashboard
- **GET** `/api/users/dashboard/analytics`
- **Description**: Get user dashboard data
- **Authentication**: Required

### 13. Get User Donations
- **GET** `/api/users/donations/history`
- **Description**: Get user's donation history
- **Authentication**: Required
- **Query Parameters**: `page`, `limit`

### 14. Upload Profile Image
- **POST** `/api/users/profile/image`
- **Description**: Upload user profile image
- **Authentication**: Required
- **Content-Type**: multipart/form-data

### 15. Get User Favorites
- **GET** `/api/users/favorites`
- **Description**: Get user's favorite campaigns
- **Authentication**: Required

### 16. Add Campaign to Favorites
- **POST** `/api/users/favorites/:campaignId`
- **Description**: Add campaign to favorites
- **Authentication**: Required

### 17. Remove Campaign from Favorites
- **DELETE** `/api/users/favorites/:campaignId`
- **Description**: Remove campaign from favorites
- **Authentication**: Required

### 18. Get User Following
- **GET** `/api/users/following`
- **Description**: Get users that current user follows
- **Authentication**: Required

### 19. Get User Followers
- **GET** `/api/users/followers`
- **Description**: Get current user's followers
- **Authentication**: Required

### 20. Follow/Unfollow User
- **POST** `/api/users/follow/:targetUserId`
- **Description**: Follow or unfollow a user
- **Authentication**: Required

---

## Admin User Endpoints

### 21. Get All Users (Admin)
- **GET** `/api/users/`
- **Description**: Get all users (admin only)
- **Authentication**: Required (Admin)
- **Query Parameters**: `page`, `limit`, `search`

### 22. Update User Status (Admin)
- **PATCH** `/api/users/:id/status`
- **Description**: Update user status (admin only)
- **Authentication**: Required (Admin)

### 23. Delete User (Admin)
- **DELETE** `/api/users/:id`
- **Description**: Delete user (admin only)
- **Authentication**: Required (Admin)

---

## Campaign Endpoints

### 24. Get All Campaigns
- **GET** `/api/campaigns/`
- **Description**: Get all public campaigns
- **Authentication**: None
- **Query Parameters**: `page`, `limit`, `search`, `category`, `status`

### 25. Get Campaign by ID
- **GET** `/api/campaigns/:id`
- **Description**: Get specific campaign details
- **Authentication**: None

### 26. Get User's Campaigns
- **GET** `/api/campaigns/user/my-campaigns`
- **Description**: Get authenticated user's campaigns
- **Authentication**: Required
- **Query Parameters**: `page`, `limit`

### 27. Get Campaign Statistics
- **GET** `/api/campaigns/:id/stats`
- **Description**: Get campaign statistics
- **Authentication**: None

### 28. Create Campaign
- **POST** `/api/campaigns/`
- **Description**: Create new campaign
- **Authentication**: Required
- **Content-Type**: multipart/form-data
- **Body**: Campaign data with optional file uploads

### 29. Update Campaign
- **PATCH** `/api/campaigns/:id`
- **Description**: Update campaign
- **Authentication**: Required (Owner)
- **Content-Type**: multipart/form-data

### 30. Delete Campaign
- **DELETE** `/api/campaigns/:id`
- **Description**: Delete campaign
- **Authentication**: Required (Owner)

---

## Donation Endpoints

### 31. Create Donation
- **POST** `/api/donations/`
- **Description**: Create a new donation
- **Authentication**: Optional
- **Body**:
```json
{
  "campaignId": "campaign_id",
  "amount": 100,
  "currency": "USD",
  "donorName": "Anonymous", // if not authenticated
  "donorEmail": "donor@example.com", // if not authenticated
  "message": "Keep up the good work!"
}
```

### 32. Get Donation by ID
- **GET** `/api/donations/:id`
- **Description**: Get donation details
- **Authentication**: Optional

### 33. Get User's Donations
- **GET** `/api/donations/user/my-donations`
- **Description**: Get authenticated user's donations
- **Authentication**: Required
- **Query Parameters**: `page`, `limit`

### 34. Get Campaign Donations
- **GET** `/api/donations/campaign/:campaignId`
- **Description**: Get donations for a specific campaign
- **Authentication**: Required (Campaign Owner)
- **Query Parameters**: `page`, `limit`

### 35. Get Donation Statistics (Admin)
- **GET** `/api/donations/stats/overview`
- **Description**: Get donation statistics
- **Authentication**: Required (Admin)

### 36. Get All Donations (Admin)
- **GET** `/api/donations/admin/all`
- **Description**: Get all donations
- **Authentication**: Required (Admin)
- **Query Parameters**: `page`, `limit`

### 37. Update Donation Status (Admin)
- **PATCH** `/api/donations/:id/status`
- **Description**: Update donation status
- **Authentication**: Required (Admin)
- **Body**:
```json
{
  "status": "completed" // pending, completed, failed, refunded
}
```

---

## Company Endpoints

### 38. Get All Companies
- **GET** `/api/companies/`
- **Description**: Get all companies
- **Authentication**: None
- **Query Parameters**: `page`, `limit`, `search`

### 39. Get Company by ID
- **GET** `/api/companies/:id`
- **Description**: Get company details
- **Authentication**: None

### 40. Get Company Profile
- **GET** `/api/companies/profile/me`
- **Description**: Get authenticated company's profile
- **Authentication**: Required (Company)

### 41. Update Company Profile
- **PATCH** `/api/companies/profile/me`
- **Description**: Update company profile
- **Authentication**: Required (Company)

### 42. Get Company Dashboard
- **GET** `/api/companies/dashboard/analytics`
- **Description**: Get company dashboard data
- **Authentication**: Required (Company)

### 43. Get Company Donations
- **GET** `/api/companies/donations/history`
- **Description**: Get company's donation history
- **Authentication**: Required (Company)
- **Query Parameters**: `page`, `limit`

### 44. Upload Company Logo
- **POST** `/api/companies/profile/logo`
- **Description**: Upload company logo
- **Authentication**: Required (Company)
- **Content-Type**: multipart/form-data

---

## NGO Endpoints

### 45. Get NGO Dashboard
- **GET** `/api/ngo/dashboard`
- **Description**: Get NGO dashboard data
- **Authentication**: Required (NGO)

---

## Admin Endpoints

### 46. Get Admin Dashboard
- **GET** `/api/admin/dashboard`
- **Description**: Get admin dashboard data
- **Authentication**: Required (Admin)

---

## Payment Endpoints

### 47. Initialize Payment
- **POST** `/api/payments/initialize`
- **Description**: Initialize payment process
- **Authentication**: Optional
- **Body**:
```json
{
  "donationId": "donation_id",
  "amount": 100,
  "currency": "USD",
  "paymentMethod": "card"
}
```

### 48. Payment Callback
- **POST** `/api/payments/callback`
- **Description**: Payment gateway callback
- **Authentication**: None

### 49. Get Payment Status
- **GET** `/api/payments/status/:orderId`
- **Description**: Get payment status
- **Authentication**: Optional

### 50. Verify Payment
- **POST** `/api/payments/verify`
- **Description**: Verify payment
- **Authentication**: Required

### 51. Process Refund
- **POST** `/api/payments/refund`
- **Description**: Process payment refund
- **Authentication**: Required (Admin)

### 52. Get Payment Methods
- **GET** `/api/payments/methods`
- **Description**: Get available payment methods
- **Authentication**: None

---

## Protected Route Endpoints

### 53. Get User Activities
- **GET** `/api/protected/activities`
- **Description**: Get user's activity history
- **Authentication**: Required
- **Query Parameters**: `page`, `limit`

### 54. Protected Health Check
- **GET** `/api/protected/health`
- **Description**: Protected health check
- **Authentication**: Required

### 55. Get Protected Dashboard
- **GET** `/api/protected/dashboard`
- **Description**: Get role-based dashboard redirect
- **Authentication**: Required

### 56. Update User Preferences
- **PATCH** `/api/protected/preferences`
- **Description**: Update user preferences
- **Authentication**: Required

### 57. Get Notifications
- **GET** `/api/protected/notifications`
- **Description**: Get user notifications
- **Authentication**: Required
- **Query Parameters**: `page`, `limit`

### 58. Mark Notification as Read
- **PATCH** `/api/protected/notifications/:notificationId/read`
- **Description**: Mark notification as read
- **Authentication**: Required

---

## Statistics Endpoints

### 59. Get Global Statistics
- **GET** `/api/stats/global`
- **Description**: Get global platform statistics
- **Authentication**: None

### 60. Get Donation Statistics
- **GET** `/api/stats/donations`
- **Description**: Get donation statistics
- **Authentication**: None

### 61. Get Campaign Statistics
- **GET** `/api/stats/campaigns`
- **Description**: Get campaign statistics
- **Authentication**: None

### 62. Get User Statistics
- **GET** `/api/stats/users`
- **Description**: Get user statistics
- **Authentication**: None

---

## Error Codes

- **400** - Bad Request (validation errors)
- **401** - Unauthorized (authentication required)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **429** - Too Many Requests (rate limit exceeded)
- **500** - Internal Server Error

## Rate Limits

- **General API**: 1000 requests per 15 minutes
- **Authentication**: 5 requests per 15 minutes
- **Password Reset**: 3 requests per 15 minutes
- **File Upload**: 10 requests per 15 minutes
- **Donations**: 5 requests per minute
- **Campaign Creation**: 5 requests per hour
- **Registration**: 3 requests per hour

## System Status (Updated July 6, 2025)

### Working Features ✅
- User registration and authentication system
- JWT token generation and validation
- Role-based access control (user/company/ngo/admin)
- MongoDB database connectivity
- File upload capabilities
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting with trust proxy configuration
- Comprehensive error handling
- Activity logging and audit trails

### Database Configuration ✅
- MongoDB running on port 27017
- Database name: donation_platform (configurable via MONGODB_URI)
- Collections: users, companies, ngos, campaigns, donations, activities, stats
- Proper indexing for email and phone fields
- Metadata tracking for user registration

### Security Features ✅
- CORS configuration for cross-origin requests
- Helmet.js for security headers
- Express rate limiting
- Input sanitization and validation
- Password strength requirements
- JWT secret management
- IP-based tracking with trust proxy support

## Testing Status

All 62 endpoints have been tested and are functional. See `api_test_results.md` for detailed testing results.