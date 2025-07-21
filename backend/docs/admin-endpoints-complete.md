
# Complete Admin Panel Endpoints

## Base URL: `/api/admin`

### Authentication Required: Admin Role

## 📊 Dashboard & Analytics
- `GET /dashboard` - Get complete dashboard overview
- `GET /dashboard/stats` - Get dashboard statistics  
- `GET /dashboard/analytics` - Get advanced analytics
- `GET /dashboard/widgets` - Get dashboard widgets
- `GET /dashboard/real-time` - Get real-time updates
- `GET /analytics/dashboard` - Get comprehensive analytics
- `GET /analytics/realtime` - Get real-time metrics

## 👥 User Management
- `POST /create-user` - Create new user
- `GET /users` - Get all users (with filtering)
- `GET /users/:id` - Get specific user
- `PUT /users/:id` - Update user
- `DELETE /users/:id` - Delete user
- `PUT /users/:id/approval` - Approve/reject user
- `PUT /users/:id/details` - Edit user details
- `PUT /users/:id/profile` - Edit user profile
- `DELETE /users/:id/complete` - Delete user completely
- `PUT /users/:id/toggle-status` - Toggle user status
- `PUT /users/:userId/password` - Change user password
- `PUT /users/:userId/profile-image` - Upload user profile image

## 🏢 Organization Management
- `GET /ngos` - Get all NGOs
- `GET /ngos/:id` - Get specific NGO
- `PUT /ngos/:id` - Update NGO
- `DELETE /ngos/:id` - Delete NGO
- `PUT /ngos/:id/status` - Toggle NGO status
- `POST /ngos/:id/share` - Generate NGO share link

- `GET /companies` - Get all companies
- `GET /companies/:id` - Get specific company
- `PUT /companies/:id` - Update company
- `DELETE /companies/:id` - Delete company
- `PUT /companies/:id/status` - Toggle company status
- `POST /companies/:id/share` - Generate company share link

## 📋 Campaign Management
- `GET /campaigns` - Get all campaigns
- `GET /campaigns/:id` - Get campaign details
- `POST /campaigns` - Create campaign
- `PUT /campaigns/:id` - Update campaign
- `DELETE /campaigns/:id` - Delete campaign
- `PUT /campaigns/:id/status` - Toggle campaign status
- `POST /campaigns/:id/share` - Generate campaign share link
- `POST /campaigns/:campaignId/images` - Upload campaign images
- `POST /campaigns/:campaignId/documents` - Upload campaign documents
- `POST /campaigns/:campaignId/proof` - Upload campaign proof
- `GET /campaigns/:campaignId/files` - Get campaign files
- `GET /campaigns/:campaignId/images` - Get campaign images
- `GET /campaigns/:campaignId/documents` - Get campaign documents
- `GET /campaigns/:campaignId/proof` - Get campaign proof

## 📢 Notice Management
- `GET /notices` - Get all notices (with filtering)
- `POST /notices` - Create notice
- `GET /notices/:id` - Get specific notice
- `PUT /notices/:id` - Update notice
- `DELETE /notices/:id` - Delete notice
- `POST /notices/:id/send` - Send notice to users
- `PUT /notices/:id/read` - Mark notice as read
- `GET /notices/stats/overview` - Get notice statistics

## ⚙️ Settings Management
- `GET /settings` - Get all settings
- `GET /settings/:category` - Get settings by category
- `PUT /settings` - Update settings
- `PUT /settings/bulk` - Update multiple settings
- `PUT /settings/:category/reset` - Reset settings to defaults

## 🔗 Share Link Management
- `GET /share/:shareId/customize` - Get share link customization
- `PUT /share/:shareId/customize` - Update share link customization
- `PUT /users/:id/customize` - Customize user profile share link
- `GET /users/:id/customize` - Get user profile customization

## 📈 Reports & Analytics  
- `GET /reports/users` - Get user reports
- `GET /reports/ngos` - Get NGO reports
- `GET /reports/companies` - Get company reports
- `GET /reports/campaigns` - Get campaign reports
- `GET /reports/donations` - Get donation reports
- `GET /reports/financial` - Get financial reports
- `GET /reports/compliance` - Get compliance reports
- `GET /reports/activities` - Get activity reports
- `GET /reports/dashboard` - Get dashboard reports

## 📊 System Management
- `GET /system/info` - Get system information
- `GET /system/health` - Get system health
- `GET /system/performance` - Get performance metrics

## 🔍 Activity Management
- `GET /activities` - Get all activities (with filtering)
- `GET /activities/:id` - Get specific activity
- `DELETE /activities/:id` - Delete activity
- `DELETE /activities/bulk/delete` - Bulk delete activities
- `GET /activities/stats/overview` - Get activity statistics

## 🔧 File Upload Management
- `PUT /profile-image` - Upload admin profile image
- `PUT /branding/logo` - Upload logo
- `PUT /branding/favicon` - Upload favicon

## 🧪 Test Endpoints
- `POST /test-uploads/test-profile-upload` - Test profile upload
- `POST /test-uploads/test-campaign-images` - Test campaign images upload
- `POST /test-uploads/test-campaign-documents` - Test campaign documents upload
- `POST /test-uploads/test-campaign-proof` - Test campaign proof upload
- `POST /test-uploads/test-branding-logo` - Test branding logo upload

## 📤 Data Export
- `GET /dashboard/export/:type` - Export data (users, campaigns, activities, analytics)
- `POST /dashboard/generate-report` - Generate automated reports
- `GET /dashboard/database-health` - Get database health status
- `GET /dashboard/performance` - Get performance dashboard

All endpoints return JSON responses with standard success/error format:

```json
{
  "success": true/false,
  "message": "Description",
  "data": {} // Response data
}
```

### Authentication
All endpoints require JWT token with admin role:
```
Authorization: Bearer <admin_jwt_token>
```

### Query Parameters
Most list endpoints support:
- `page` - Page number
- `limit` - Items per page  
- `search` - Search term
- `status` - Filter by status
- `startDate` - Filter from date
- `endDate` - Filter to date
