
# Routes Structure Documentation

## Overview
The routes are now organized in a clean, role-based structure that's easy to understand and maintain.

## Directory Structure

```
routes/
├── auth/
│   └── index.js          # Authentication & user management
├── admin/
│   └── index.js          # Admin operations & dashboard
├── ngo/
│   └── index.js          # NGO-specific operations
├── company/
│   └── index.js          # Company-specific operations
├── public/
│   └── index.js          # Public endpoints (no auth required)
├── campaigns/
│   └── index.js          # Campaign management (cross-role)
└── donations/
    └── index.js          # Donation management (cross-role)
```

## Route Categories

### 1. Authentication Routes (`/api/auth/`)
- User registration, login, logout
- Profile management
- Password management
- Activity tracking
- Setup admin account

### 2. Admin Routes (`/api/admin/`)
- Dashboard analytics
- User management (CRUD)
- NGO management
- Company management
- Campaign management
- Notice system
- Settings management

### 3. NGO Routes (`/api/ngo/`)
- NGO dashboard
- Profile management
- Campaign creation/management
- View companies
- View donations received

### 4. Company Routes (`/api/company/`)
- Company dashboard
- Profile management
- View NGOs and campaigns
- Make donations
- View donation history

### 5. Public Routes (`/api/public/`)
- Public campaign listings
- Public NGO listings
- Shareable profile links
- Public campaign/NGO details

### 6. Campaign Routes (`/api/campaigns/`)
- Cross-role campaign operations
- Public campaign access
- Campaign CRUD operations

### 7. Donation Routes (`/api/donations/`)
- Cross-role donation operations
- Donation processing
- Donation history

## API Endpoints Base URLs

- Authentication: `/api/auth/`
- Admin Panel: `/api/admin/`
- NGO Operations: `/api/ngo/`
- Company Operations: `/api/company/`
- Public Access: `/api/public/`
- Campaign Management: `/api/campaigns/`
- Donation Management: `/api/donations/`

## Key Features

1. **Consistent Authentication**: All protected routes use the same auth middleware
2. **Role-Based Access**: Each route validates user roles appropriately
3. **Clean File Structure**: Each role has its dedicated route file
4. **Error Handling**: Consistent error responses across all routes
5. **File Upload Support**: Proper file handling for profiles and campaigns
6. **Cross-Role Operations**: Campaigns and donations can be accessed by multiple roles

## Fixed Issues

- ✅ Removed duplicate route imports
- ✅ Fixed JWT token consistency
- ✅ Corrected user ID references across all routes
- ✅ Updated authentication middleware
- ✅ Cleaned up index.js imports
- ✅ Standardized error responses
- ✅ Fixed file upload paths
