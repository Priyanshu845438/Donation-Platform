
# Complete File Structure Documentation

## Overview

This document provides a comprehensive explanation of every file in the Donation Platform backend, detailing the purpose, functionality, and integration points of each component.

**Project Structure**: Node.js/Express.js backend with MongoDB  
**Architecture**: MVC (Model-View-Controller) pattern with middleware layers  
**Last Updated**: January 6, 2025

---

## Root Directory Files

### 📄 `index.js`
**Purpose**: Main application entry point and server configuration  
**Function**: Express server setup, middleware configuration, route mounting, and startup logic

**Key Components**:
- **Express Setup**: Initializes Express application with security middleware
- **Middleware Stack**: 
  - `helmet()` for security headers
  - `cors()` for cross-origin requests
  - `morgan()` for request logging
  - Custom rate limiting and body parsing
- **Route Mounting**: Connects all API route modules
- **Database Connection**: Initiates MongoDB connection via `connectDB()`
- **Health Endpoints**: Provides `/health` and root `/` endpoints
- **Error Handling**: Global error handler and 404 route
- **Graceful Shutdown**: Handles SIGTERM and SIGINT signals

**Integration Points**:
- Imports all route modules from `/routes` directory
- Uses database configuration from `/config/database.js`
- Applies middleware from `/middleware` directory
- Serves static files from `/uploads` directory

**Server Startup Flow**:
1. Load environment variables
2. Configure Express with security middleware
3. Connect to MongoDB
4. Mount API routes
5. Start server on specified port
6. Set up graceful shutdown handlers

---

### 📄 `package.json`
**Purpose**: Node.js project configuration and dependency management  
**Function**: Defines project metadata, scripts, and dependencies

**Key Sections**:
- **Dependencies**: Production packages (express, mongoose, bcryptjs, etc.)
- **DevDependencies**: Development tools (nodemon, dotenv)
- **Scripts**: 
  - `npm start`: Production server start
  - `npm run dev`: Development server with auto-restart
- **Project Metadata**: Name, version, license information

**Dependency Highlights**:
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT token handling
- **express-rate-limit**: API rate limiting
- **multer**: File upload handling
- **helmet**: Security middleware

---

### 📄 `.replit`
**Purpose**: Replit platform configuration  
**Function**: Defines workflows, ports, and environment setup for Replit deployment

**Configuration Details**:
- **Workflows**: Defines "Project", "Donation Platform Backend", and "MongoDB" workflows
- **Port Mapping**: Maps internal ports (5000, 27017) to external access
- **Environment**: Specifies Node.js 20 and MongoDB modules
- **Startup Commands**: Configures automatic service startup

**Workflow Definitions**:
- **Main Project**: Parallel execution of backend and database
- **Backend Service**: Runs `npm start` on port 5000
- **MongoDB Service**: Starts MongoDB daemon on port 27017

---

## Configuration Directory (`/config`)

### 📄 `database.js`
**Purpose**: MongoDB connection configuration and management  
**Function**: Establishes and maintains database connectivity

**Key Features**:
- **Connection URI**: Reads from environment variable `MONGODB_URI`
- **Connection Options**: Configures connection pooling and timeouts
- **Error Handling**: Comprehensive connection error management
- **Logging**: Connection status and error logging
- **Retry Logic**: Automatic reconnection attempts

**Connection Flow**:
1. Read MongoDB URI from environment
2. Set Mongoose connection options
3. Attempt connection with error handling
4. Log connection status
5. Handle connection events (connect, error, disconnect)

---

### 📄 `multerConfig.js`
**Purpose**: File upload configuration using Multer  
**Function**: Defines storage settings, file filtering, and upload limits

**Storage Configuration**:
- **Destination**: Organizes uploads by type (`/uploads/campaign`, `/uploads/profile`, etc.)
- **Filename**: Generates unique filenames with timestamps
- **File Filtering**: Validates file types (images only)
- **Size Limits**: 10MB per file, 5 files maximum

**File Organization**:
```
/uploads/
├── campaign/    # Campaign images
├── profile/     # User profile pictures
├── company/     # Company logos
└── ngo/        # NGO documentation
```

---

### 📄 `constants.js`
**Purpose**: Application-wide constants and configuration values  
**Function**: Centralizes configurable values and enums

**Constant Categories**:
- **User Roles**: ['user', 'company', 'ngo', 'admin']
- **Campaign Categories**: ['education', 'healthcare', 'environment', etc.]
- **Donation Statuses**: ['pending', 'completed', 'failed', 'refunded']
- **File Upload Limits**: Size limits, allowed types
- **Pagination Defaults**: Default page sizes and limits

---

## Models Directory (`/models`)

### 📄 `User.js`
**Purpose**: User model definition with authentication features  
**Function**: Defines user schema, validation, and password handling

**Schema Structure**:
- **Basic Info**: fullName, email, phoneNumber
- **Authentication**: password (hashed), role, isActive status
- **Metadata**: registration details, login tracking
- **Timestamps**: createdAt, updatedAt, lastLogin

**Key Features**:
- **Pre-save Middleware**: Automatically hashes passwords using bcrypt
- **Virtual Fields**: Excludes password from JSON output by default
- **Indexes**: Email and phone number for faster queries
- **Validation**: Email format, phone number format, required fields

**Security Features**:
- **Password Hashing**: 12 salt rounds for bcrypt
- **Email Uniqueness**: Prevents duplicate registrations
- **Phone Validation**: International format support (7-15 digits)

---

### 📄 `Campaign.js`
**Purpose**: Campaign model for fundraising campaigns  
**Function**: Defines campaign structure, validation, and business logic

**Schema Structure**:
- **Basic Info**: title, description, category
- **Financial**: goalAmount, raisedAmount, currency
- **Media**: images array, video links
- **Metadata**: creator, status, start/end dates
- **Analytics**: viewCount, donationCount, shareCount

**Business Logic**:
- **Progress Calculation**: Virtual field for completion percentage
- **Status Management**: Active, inactive, completed, suspended
- **Validation Rules**: Title length, description requirements, positive amounts

**Integration Points**:
- **Creator Reference**: Links to User model
- **Donation Tracking**: Updates from Donation model
- **Category Validation**: Against predefined category list

---

### 📄 `Donation.js`
**Purpose**: Donation transaction model  
**Function**: Tracks individual donations and payment information

**Schema Structure**:
- **Amount Info**: amount, currency, fees
- **Donor Info**: donor details (for authenticated and anonymous)
- **Campaign Link**: Reference to campaign
- **Payment**: paymentId, method, status, gateway details
- **Metadata**: message, anonymous flag, timestamps

**Payment Integration**:
- **Status Tracking**: pending → completed/failed/refunded
- **Gateway Fields**: Ready for payment processor integration
- **Transaction IDs**: Links to external payment systems

**Anonymous Support**:
- **Flexible Donor**: Can link to User or store guest information
- **Privacy Options**: Anonymous donation flag
- **Guest Validation**: Email validation for non-registered donors

---

### 📄 `Company.js`
**Purpose**: Company profile model for corporate users  
**Function**: Stores company-specific information and validation

**Schema Structure**:
- **Company Details**: name, email, phone, address
- **Business Info**: registration number, type, employee count
- **Leadership**: CEO information and contact details
- **Media**: company logo, additional documents
- **Status**: verification status, activity flags

**Validation Features**:
- **Email Format**: Company email validation
- **Phone Numbers**: Multiple phone number validation
- **Employee Count**: Positive integer validation
- **Required Fields**: Essential business information

**Integration**:
- **User Link**: References parent User account
- **Campaign Creation**: Companies can create campaigns
- **Donation Tracking**: Corporate donation history

---

### 📄 `NGO.js`
**Purpose**: NGO profile model for nonprofit organizations  
**Function**: Stores NGO-specific information with compliance fields

**Schema Structure**:
- **Organization Info**: NGO name, registration details, address
- **Compliance**: 80G certification, 12A status, FCRA registration
- **Financial**: bank details, PAN/TAN numbers
- **Operations**: working areas, target beneficiaries, employee count
- **Authorization**: authorized person details

**Compliance Features**:
- **Certification Tracking**: Legal status fields
- **Tax Benefits**: 80G and 12A certification status
- **FCRA Status**: Foreign contribution regulation compliance
- **Bank Details**: Secure storage of banking information

**Validation Requirements**:
- **Website URL**: Proper URL format validation
- **Phone Numbers**: International format support
- **Email Validation**: Multiple email field validation
- **Address Structure**: Comprehensive address schema

---

### 📄 `Activity.js`
**Purpose**: User activity logging model  
**Function**: Tracks user actions for audit and analytics

**Schema Structure**:
- **User Info**: userId, userRole
- **Action Details**: actionType, description, targetId
- **Context**: IP address, user agent, timestamp
- **Metadata**: Additional action-specific data

**Activity Types**:
- **Authentication**: login, logout, registration
- **Profile**: profile updates, image uploads
- **Campaigns**: creation, updates, deletion
- **Donations**: donation creation, status changes

**Privacy and Security**:
- **IP Tracking**: For security monitoring
- **Audit Trail**: Complete action history
- **Data Retention**: Configurable retention policies

---

### 📄 `Stats.js`
**Purpose**: Platform statistics aggregation model  
**Function**: Stores calculated statistics for performance optimization

**Schema Structure**:
- **User Statistics**: total users, new registrations, active users
- **Campaign Statistics**: total campaigns, by category, success rates
- **Donation Statistics**: total amount, average donation, frequency
- **Time-based**: Daily, weekly, monthly aggregations

**Optimization Features**:
- **Pre-calculated Values**: Reduces real-time calculation load
- **Indexing**: Time-based indexes for quick retrieval
- **Update Triggers**: Automatic updates from source data changes

---

### 📄 `Comment.js`
**Purpose**: Comment system model for campaigns  
**Function**: User comments and feedback on campaigns

**Schema Structure**:
- **Content**: comment text, timestamp
- **User Info**: author reference, author role
- **Campaign Link**: associated campaign
- **Moderation**: approval status, flags

**Moderation Features**:
- **Content Filtering**: Automatic spam detection
- **User Reporting**: Flagging inappropriate content
- **Admin Controls**: Comment approval and deletion

---

## Controllers Directory (`/controllers`)

### 📄 `authController.js`
**Purpose**: Authentication and user management controller  
**Function**: Handles registration, login, profile management, and password operations

**Key Methods**:

#### `register(req, res)`
- **Input Validation**: Email, phone, password strength, role validation
- **Duplicate Check**: Prevents duplicate email registrations
- **Password Security**: Bcrypt hashing with 12 salt rounds
- **Profile Creation**: Role-specific profile setup (Company/NGO)
- **Metadata Capture**: IP address, user agent, registration source

#### `login(req, res)`
- **User Lookup**: Email-based user search with password field
- **Account Status**: Active account verification
- **Password Verification**: Bcrypt comparison
- **JWT Generation**: Token creation with user payload
- **Login Tracking**: Last login timestamp update

#### `getProfile(req, res)`
- **User Retrieval**: Authenticated user profile fetch
- **Role-specific Data**: Includes Company/NGO profile if applicable
- **Security**: Password field exclusion from response

#### `updateProfile(req, res)`
- **Field Sanitization**: Input cleaning and validation
- **Restricted Fields**: Prevents email, role, password changes
- **Phone Validation**: International format checking
- **Update Tracking**: Timestamp and activity logging

#### `changePassword(req, res)`
- **Current Password**: Verification of existing password
- **New Password**: Strength validation and hashing
- **Security**: Prevents password reuse (if configured)

#### `logout(req, res)`
- **Session Cleanup**: Client-side token invalidation
- **Logout Tracking**: Timestamp recording
- **Activity Logging**: Logout event recording

**Security Features**:
- **Rate Limiting**: Registration and login attempt limits
- **Input Sanitization**: XSS prevention
- **Generic Errors**: Prevents email enumeration
- **Activity Logging**: Complete audit trail

---

### 📄 `campaignController.js`
**Purpose**: Campaign management controller  
**Function**: CRUD operations for fundraising campaigns

**Key Methods**:

#### `createCampaign(req, res)`
- **Authentication**: User verification via JWT
- **File Processing**: Image upload handling via Multer
- **Data Validation**: Title, description, goal amount, end date
- **Category Validation**: Against predefined categories
- **Database Creation**: Campaign record with creator reference

#### `getCampaigns(req, res)`
- **Public Access**: No authentication required
- **Filtering**: By category, status, search terms
- **Pagination**: Page and limit parameters
- **Sorting**: By creation date, popularity, amount raised
- **Population**: Creator information inclusion

#### `getCampaignById(req, res)`
- **Parameter Validation**: MongoDB ObjectId validation
- **Data Enrichment**: Creator details, donation statistics
- **View Tracking**: Increment view count
- **Related Data**: Recent donations, similar campaigns

#### `updateCampaign(req, res)`
- **Ownership Verification**: Creator or admin only
- **Field Validation**: Updateable fields only
- **File Handling**: New image processing
- **Status Management**: Campaign status updates
- **Activity Logging**: Update event recording

#### `deleteCampaign(req, res)`
- **Authorization**: Creator or admin permission
- **Soft Delete**: Mark as inactive rather than remove
- **Dependency Check**: Related donations handling
- **File Cleanup**: Remove associated uploaded files

#### `getUserCampaigns(req, res)`
- **Authentication**: User login verification
- **User Filter**: Creator-specific campaign list
- **Status Options**: Include all statuses for creator
- **Pagination**: Support for large campaign lists

**Business Logic**:
- **Goal Validation**: Positive amount requirements
- **Date Validation**: End date must be future
- **Status Workflow**: Active → Completed/Suspended
- **Progress Calculation**: Real-time completion percentage

---

### 📄 `donationController.js`
**Purpose**: Donation processing controller  
**Function**: Manages donation creation, tracking, and payment integration

**Key Methods**:

#### `createDonation(req, res)`
- **Campaign Validation**: Active campaign verification
- **Amount Validation**: Positive amount, currency support
- **Donor Processing**: Authenticated user or anonymous donor
- **Payment Simulation**: Payment gateway integration preparation
- **Database Transaction**: Atomic donation and campaign updates

#### `getDonationById(req, res)`
- **Access Control**: Donor, campaign owner, or admin only
- **Data Retrieval**: Complete donation details
- **Payment Status**: Current payment processing status
- **Privacy**: Sensitive payment data protection

#### `getUserDonations(req, res)`
- **Authentication**: User login verification
- **History Retrieval**: User's complete donation history
- **Pagination**: Support for extensive donation lists
- **Status Filtering**: Filter by payment status

#### `getCampaignDonations(req, res)`
- **Authorization**: Campaign owner or admin only
- **Campaign Filter**: Donations for specific campaign
- **Analytics**: Donation patterns and statistics
- **Donor Privacy**: Anonymous donation respect

#### `updateDonationStatus(req, res)`
- **Authorization**: Admin or payment gateway only
- **Status Validation**: Valid status transitions
- **Campaign Updates**: Adjust raised amounts accordingly
- **Notification Triggers**: Status change notifications

**Payment Integration**:
- **Gateway Ready**: Webhook endpoints prepared
- **Status Tracking**: Complete payment lifecycle
- **Refund Support**: Refund processing capability
- **Security**: Payment data encryption ready

**Anonymous Donations**:
- **Guest Support**: Non-registered donor handling
- **Email Validation**: Contact information validation
- **Privacy Options**: Anonymous flag support
- **Receipt Generation**: Email receipt capability

---

### 📄 `userController.js`
**Purpose**: User management and profile controller  
**Function**: User CRUD operations, profile management, and social features

**Key Methods**:

#### `getUsers(req, res)`
- **Admin Only**: Administrative user listing
- **Search**: Name and email search capability
- **Filtering**: Role, status, registration date filters
- **Pagination**: Large user base support
- **Export**: User data export capability

#### `getUserById(req, res)`
- **Public Profile**: Basic user information
- **Privacy**: Sensitive data exclusion
- **Activity Summary**: Public activity overview
- **Campaign List**: User's public campaigns

#### `getOwnProfile(req, res)`
- **Authentication**: User login verification
- **Complete Data**: Full profile information
- **Role-specific**: Company/NGO profile inclusion
- **Privacy Settings**: User privacy preferences

#### `updateOwnProfile(req, res)`
- **Field Validation**: Allowed field updates only
- **Image Upload**: Profile picture handling
- **Phone Validation**: International format support
- **Activity Logging**: Profile change tracking

#### `getDashboard(req, res)`
- **Role-based**: Different dashboards by user type
- **Analytics**: User-specific statistics
- **Recent Activity**: Latest user actions
- **Notifications**: Pending user notifications

#### `uploadProfileImage(req, res)`
- **File Validation**: Image type and size validation
- **Storage**: Organized file storage
- **Old File Cleanup**: Previous image removal
- **Response**: New image URL return

**Social Features**:
- **Favorites**: Campaign favoriting system
- **Following**: User following capability
- **Activity Feed**: Social activity stream
- **Privacy Controls**: User privacy settings

---

### 📄 `companyController.js`
**Purpose**: Company profile management controller  
**Function**: Company-specific operations and profile management

**Key Methods**:

#### `getCompanies(req, res)`
- **Public Listing**: All active companies
- **Search**: Company name and description search
- **Filtering**: By industry, size, location
- **Pagination**: Support for large company lists

#### `getCompanyById(req, res)`
- **Public Profile**: Company information display
- **Campaign List**: Company's active campaigns
- **Statistics**: Company donation and campaign metrics
- **Contact Info**: Business contact information

#### `getCompanyProfile(req, res)`
- **Authentication**: Company user verification
- **Complete Profile**: Full company information
- **Edit Permissions**: Owner access verification
- **Related Data**: Campaigns and donations

#### `updateCompanyProfile(req, res)`
- **Authorization**: Company owner only
- **Business Validation**: Company-specific field validation
- **Logo Upload**: Company logo handling
- **Verification**: Document upload for verification

#### `getCompanyDashboard(req, res)`
- **Company Analytics**: Campaign performance metrics
- **Donation Tracking**: Company donation history
- **Goal Progress**: Campaign goal achievements
- **Employee Engagement**: Internal company metrics

**Business Features**:
- **CSR Tracking**: Corporate social responsibility metrics
- **Employee Campaigns**: Internal fundraising campaigns
- **Matching Donations**: Company donation matching
- **Reporting**: Corporate giving reports

---

### 📄 `statsController.js`
**Purpose**: Statistics and analytics controller  
**Function**: Platform-wide statistics and reporting

**Key Methods**:

#### `getGlobalStats(req, res)`
- **Public Access**: General platform statistics
- **User Metrics**: Total users, growth rates
- **Campaign Metrics**: Success rates, categories
- **Donation Metrics**: Total amounts, averages
- **Performance**: Cached statistics for speed

#### `getDonationStats(req, res)`
- **Donation Analytics**: Detailed donation statistics
- **Time Series**: Historical donation patterns
- **Geographic**: Donation distribution by location
- **Payment Methods**: Usage statistics by method

#### `getCampaignStats(req, res)`
- **Campaign Analytics**: Success rates by category
- **Performance Metrics**: Average goal achievement
- **Creator Statistics**: Top performing creators
- **Category Trends**: Popular campaign categories

#### `getUserStats(req, res)`
- **User Analytics**: User engagement metrics
- **Registration Trends**: User growth patterns
- **Activity Levels**: User engagement statistics
- **Demographics**: User distribution by role

**Optimization Features**:
- **Caching**: Redis integration ready for statistics caching
- **Aggregation**: MongoDB aggregation pipelines
- **Real-time**: Live statistic updates
- **Historical**: Trend analysis capabilities

---

## Admin Controllers (`/controllers/admin/`)

### 📄 `dashboardController.js`
**Purpose**: Administrative dashboard controller  
**Function**: Admin-specific analytics and management interfaces

**Key Methods**:

#### `getAnalytics(req, res)`
- **Comprehensive Analytics**: Complete platform overview
- **User Management**: User statistics and trends
- **Financial Metrics**: Revenue and transaction analytics
- **Performance**: System performance metrics
- **Alerts**: System health and security alerts

#### `getUserAnalytics(req, res)`
- **User Deep Dive**: Detailed user behavior analysis
- **Segmentation**: User groups and cohorts
- **Activity Patterns**: User engagement analysis
- **Growth Metrics**: User acquisition and retention

#### `getCampaignAnalytics(req, res)`
- **Campaign Performance**: Success rate analysis
- **Category Analysis**: Performance by campaign type
- **Creator Insights**: Top performing campaign creators
- **Optimization**: Campaign improvement recommendations

**Administrative Features**:
- **User Management**: Bulk user operations
- **Content Moderation**: Campaign and comment moderation
- **Financial Controls**: Transaction monitoring and controls
- **System Health**: Performance and error monitoring

---

## NGO Controllers (`/controllers/ngo/`)

### 📄 `dashboardController.js`
**Purpose**: NGO-specific dashboard controller  
**Function**: Nonprofit organization management interface

**Key Methods**:

#### `getDashboard(req, res)`
- **NGO Analytics**: Fundraising performance metrics
- **Campaign Management**: NGO campaign overview
- **Donor Insights**: Donor behavior and demographics
- **Impact Metrics**: Social impact measurement

**NGO-Specific Features**:
- **Compliance Tracking**: Regulatory compliance monitoring
- **Grant Management**: Grant application and tracking
- **Volunteer Coordination**: Volunteer management features
- **Impact Reporting**: Social impact documentation

---

## Middleware Directory (`/middleware`)

### 📄 `auth.js`
**Purpose**: Authentication middleware for protected routes  
**Function**: JWT token verification and user context setting

**Key Functions**:

#### `verifyToken(req, res, next)`
- **Token Extraction**: Authorization header parsing
- **JWT Verification**: Token signature and expiration validation
- **User Lookup**: Database user verification
- **Context Setting**: User object attachment to request
- **Error Handling**: Invalid token response

#### `requireRole(roles)`
- **Role Authorization**: Specific role requirement enforcement
- **Multi-role Support**: Array of allowed roles
- **Admin Override**: Admin access to all resources
- **Error Responses**: Insufficient permission handling

**Security Features**:
- **Token Expiration**: Automatic token timeout
- **User Status**: Active account verification
- **Request Context**: Secure user context propagation
- **Audit Trail**: Authentication event logging

---

### 📄 `rateLimiter.js`
**Purpose**: API rate limiting middleware  
**Function**: Request rate limiting and abuse prevention

**Limiter Types**:

#### `generalLimiter`
- **Scope**: General API endpoints
- **Limit**: 1000 requests per 15 minutes
- **Purpose**: Basic API protection

#### `authLimiter`
- **Scope**: Authentication endpoints
- **Limit**: 5 requests per 15 minutes
- **Purpose**: Brute force attack prevention

#### `registrationLimiter`
- **Scope**: User registration
- **Limit**: 20 requests per hour
- **Purpose**: Spam registration prevention

#### `donationLimiter`
- **Scope**: Donation creation
- **Limit**: 5 requests per minute
- **Purpose**: Payment fraud prevention

**Features**:
- **IP-based Limiting**: Trust proxy configuration
- **Custom Messages**: Clear rate limit error messages
- **Headers**: Rate limit information in response headers
- **Logging**: Rate limit violation logging

---

### 📄 `validation.js`
**Purpose**: Input validation middleware using express-validator  
**Function**: Request data validation and sanitization

**Validation Sets**:

#### `validateRegistration`
- **Full Name**: 2-100 characters, letters and spaces only
- **Email**: Valid email format with normalization
- **Phone**: 10-15 digits with international support
- **Password**: Complex password requirements
- **Role**: Valid role from allowed list

#### `validateLogin`
- **Email**: Valid email format
- **Password**: Presence validation (no complexity check)

#### `validateCampaignCreation`
- **Title**: 10-200 characters
- **Description**: 50-5000 characters
- **Goal Amount**: Positive number validation
- **Category**: Predefined category list
- **End Date**: Future date validation

#### `validateDonationCreation`
- **Campaign ID**: Valid MongoDB ObjectId
- **Amount**: Positive number validation
- **Donor Info**: Email and name validation
- **Payment Method**: Valid payment method

**Features**:
- **Sanitization**: Input cleaning and normalization
- **Custom Validators**: Business logic validation
- **Error Aggregation**: Multiple error collection
- **Field-specific Errors**: Detailed error messages

---

### 📄 `errorHandler.js`
**Purpose**: Global error handling middleware  
**Function**: Centralized error processing and response formatting

**Error Types**:

#### `ValidationError`
- **Source**: Input validation failures
- **Response**: 400 with field-specific errors
- **Logging**: Validation error details

#### `AuthenticationError`
- **Source**: Token validation failures
- **Response**: 401 with authentication required
- **Logging**: Authentication attempt details

#### `AuthorizationError`
- **Source**: Insufficient permissions
- **Response**: 403 with permission denied
- **Logging**: Authorization failure details

#### `DatabaseError`
- **Source**: MongoDB operation failures
- **Response**: 500 with generic error message
- **Logging**: Complete error stack trace

**Features**:
- **Environment Awareness**: Different responses for development/production
- **Error Logging**: Comprehensive error logging
- **User Safety**: Sensitive information protection
- **Recovery**: Graceful error recovery where possible

---

### 📄 `uploadMiddleware.js`
**Purpose**: File upload middleware using Multer  
**Function**: File upload processing and validation

**Upload Configurations**:

#### `campaignUpload`
- **Destination**: `/uploads/campaign/`
- **File Types**: Images (JPG, PNG, GIF)
- **Size Limit**: 10MB per file
- **File Count**: Maximum 5 files

#### `profileUpload`
- **Destination**: `/uploads/profile/`
- **File Types**: Images only
- **Size Limit**: 5MB per file
- **File Count**: Single file

#### `companyUpload`
- **Destination**: `/uploads/company/`
- **File Types**: Images and documents
- **Size Limit**: 10MB per file
- **File Count**: Multiple files for verification

**Features**:
- **Filename Generation**: Timestamp-based unique names
- **File Type Validation**: MIME type checking
- **Size Validation**: File size limits
- **Error Handling**: Upload error management

---

### 📄 `activityLogger.js`
**Purpose**: User activity logging middleware  
**Function**: Automatic activity tracking for audit and analytics

**Logged Activities**:
- **Authentication**: Login, logout, registration
- **Profile Changes**: Updates, image uploads
- **Campaign Operations**: Creation, updates, deletion
- **Donations**: Creation, status changes
- **Administrative**: Admin actions and changes

**Data Captured**:
- **User Context**: User ID, role, email
- **Action Details**: Action type, description, target
- **Request Context**: IP address, user agent, timestamp
- **Metadata**: Additional action-specific information

**Features**:
- **Automatic Logging**: Transparent activity capture
- **Privacy Compliance**: Sensitive data exclusion
- **Performance**: Asynchronous logging to prevent delays
- **Retention**: Configurable data retention policies

---

### 📄 `security.js`
**Purpose**: Additional security middleware  
**Function**: Security headers and protection mechanisms

**Security Features**:
- **CORS Configuration**: Cross-origin request handling
- **Content Security Policy**: XSS protection
- **Helmet Integration**: Security header management
- **Request Sanitization**: Input cleaning
- **SQL Injection Prevention**: Parameter sanitization

---

## Routes Directory (`/routes`)

### 📄 `authRoutes.js`
**Purpose**: Authentication route definitions  
**Function**: Maps authentication endpoints to controller methods

**Route Definitions**:
```javascript
POST   /api/auth/register     -> authController.register
POST   /api/auth/login        -> authController.login
GET    /api/auth/profile      -> authController.getProfile      [Protected]
PATCH  /api/auth/profile      -> authController.updateProfile   [Protected]
PATCH  /api/auth/change-password -> authController.changePassword [Protected]
POST   /api/auth/logout       -> authController.logout          [Protected]
```

**Middleware Stack**:
- **Rate Limiting**: Registration and auth limiters
- **Validation**: Input validation middleware
- **Authentication**: JWT verification for protected routes

---

### 📄 `campaignRoutes.js`
**Purpose**: Campaign management route definitions  
**Function**: Campaign CRUD operation routing

**Route Definitions**:
```javascript
GET    /api/campaigns/           -> campaignController.getCampaigns
GET    /api/campaigns/:id        -> campaignController.getCampaignById
GET    /api/campaigns/:id/stats  -> campaignController.getCampaignStats
POST   /api/campaigns/           -> campaignController.createCampaign    [Protected]
PATCH  /api/campaigns/:id        -> campaignController.updateCampaign    [Protected]
DELETE /api/campaigns/:id        -> campaignController.deleteCampaign    [Protected]
GET    /api/campaigns/user/my-campaigns -> campaignController.getUserCampaigns [Protected]
```

**Middleware Features**:
- **File Uploads**: Multer middleware for campaign images
- **Validation**: Campaign data validation
- **Authorization**: Owner-only access for modifications

---

### 📄 `donationRoutes.js`
**Purpose**: Donation processing route definitions  
**Function**: Donation lifecycle management routing

**Route Definitions**:
```javascript
POST   /api/donations/                    -> donationController.createDonation
GET    /api/donations/:id                 -> donationController.getDonationById
GET    /api/donations/user/my-donations   -> donationController.getUserDonations    [Protected]
GET    /api/donations/campaign/:campaignId -> donationController.getCampaignDonations [Protected]
PATCH  /api/donations/:id/status          -> donationController.updateDonationStatus [Admin]
GET    /api/donations/stats/overview      -> donationController.getDonationStats    [Admin]
GET    /api/donations/admin/all           -> donationController.getAllDonations     [Admin]
```

**Access Control**:
- **Public**: Donation creation (supports anonymous)
- **User**: Personal donation history
- **Campaign Owner**: Campaign donation list
- **Admin**: All donations and status management

---

### 📄 `userRoutes.js`
**Purpose**: User management route definitions  
**Function**: User profile and social feature routing

**Route Definitions**:
```javascript
GET    /api/users/                -> userController.getUsers           [Admin]
GET    /api/users/profile/:id     -> userController.getUserById
GET    /api/users/profile/me      -> userController.getOwnProfile      [Protected]
PATCH  /api/users/profile/me      -> userController.updateOwnProfile   [Protected]
GET    /api/users/dashboard/analytics -> userController.getDashboard   [Protected]
POST   /api/users/profile/image   -> userController.uploadProfileImage [Protected]
GET    /api/users/favorites       -> userController.getFavorites       [Protected]
POST   /api/users/favorites/:campaignId -> userController.addFavorite  [Protected]
DELETE /api/users/favorites/:campaignId -> userController.removeFavorite [Protected]
```

**Social Features**:
- **Favorites**: Campaign favoriting system
- **Following**: User following capabilities
- **Activity**: User activity tracking
- **Dashboard**: Personalized user dashboard

---

### 📄 `companyRoutes.js`
**Purpose**: Company profile route definitions  
**Function**: Company-specific functionality routing

**Route Definitions**:
```javascript
GET    /api/companies/              -> companyController.getCompanies
GET    /api/companies/:id           -> companyController.getCompanyById
GET    /api/companies/profile/me    -> companyController.getCompanyProfile    [Protected]
PATCH  /api/companies/profile/me    -> companyController.updateCompanyProfile [Protected]
GET    /api/companies/dashboard/analytics -> companyController.getCompanyDashboard [Protected]
POST   /api/companies/profile/logo  -> companyController.uploadCompanyLogo    [Protected]
```

**Business Features**:
- **Corporate Profiles**: Complete company information
- **CSR Tracking**: Corporate social responsibility
- **Employee Engagement**: Internal campaign features
- **Reporting**: Corporate giving analytics

---

### 📄 `statsRoutes.js`
**Purpose**: Statistics and analytics route definitions  
**Function**: Platform analytics and reporting routing

**Route Definitions**:
```javascript
GET    /api/stats/global      -> statsController.getGlobalStats
GET    /api/stats/donations   -> statsController.getDonationStats
GET    /api/stats/campaigns   -> statsController.getCampaignStats
GET    /api/stats/users       -> statsController.getUserStats
```

**Analytics Features**:
- **Public Statistics**: General platform metrics
- **Performance Analytics**: Platform performance data
- **Trend Analysis**: Historical data analysis
- **Real-time Updates**: Live statistic updates

---

### 📄 `protectedRoutes.js`
**Purpose**: Protected utility route definitions  
**Function**: Authenticated user utility endpoints

**Route Definitions**:
```javascript
GET    /api/protected/activities     -> protectedController.getActivities
GET    /api/protected/health         -> protectedController.protectedHealth
GET    /api/protected/dashboard      -> protectedController.getDashboard
PATCH  /api/protected/preferences    -> protectedController.updatePreferences
GET    /api/protected/notifications  -> protectedController.getNotifications
PATCH  /api/protected/notifications/:id/read -> protectedController.markAsRead
```

**Protected Features**:
- **Activity History**: User action history
- **Preferences**: User preference management
- **Notifications**: User notification system
- **Dashboard**: Role-based dashboard routing

---

### 📄 `paymentRoutes.js`
**Purpose**: Payment processing route definitions  
**Function**: Payment gateway integration routing

**Route Definitions**:
```javascript
POST   /api/payments/initialize -> paymentController.initializePayment
POST   /api/payments/callback   -> paymentController.paymentCallback
GET    /api/payments/status/:orderId -> paymentController.getPaymentStatus
POST   /api/payments/verify     -> paymentController.verifyPayment      [Protected]
POST   /api/payments/refund     -> paymentController.processRefund      [Admin]
GET    /api/payments/methods    -> paymentController.getPaymentMethods
```

**Payment Features**:
- **Gateway Integration**: Ready for payment processor
- **Webhook Support**: Payment status callbacks
- **Refund Processing**: Administrative refund capabilities
- **Status Tracking**: Complete payment lifecycle

---

## Admin Routes (`/routes/admin/`)

### 📄 `index.js`
**Purpose**: Admin route aggregation  
**Function**: Combines all admin routes into single module

### 📄 `dashboard.js`
**Purpose**: Admin dashboard route definitions  
**Function**: Administrative interface routing

**Route Definitions**:
```javascript
GET    /api/admin/dashboard          -> adminController.getDashboard      [Admin]
GET    /api/admin/dashboard/analytics -> adminController.getAnalytics    [Admin]
GET    /api/admin/dashboard/users    -> adminController.getUserAnalytics [Admin]
GET    /api/admin/dashboard/campaigns -> adminController.getCampaignAnalytics [Admin]
PATCH  /api/admin/dashboard/users/:id/status -> adminController.updateUserStatus [Admin]
PATCH  /api/admin/dashboard/campaigns/:id/status -> adminController.updateCampaignStatus [Admin]
```

**Administrative Features**:
- **User Management**: Bulk user operations
- **Content Moderation**: Campaign and content management
- **Analytics**: Comprehensive platform analytics
- **System Controls**: Administrative system controls

---

## NGO Routes (`/routes/ngo/`)

### 📄 `dashboard.js`
**Purpose**: NGO dashboard route definitions  
**Function**: NGO-specific interface routing

**Route Definitions**:
```javascript
GET    /api/ngo/dashboard    -> ngoController.getDashboard    [NGO]
```

**NGO Features**:
- **Fundraising Analytics**: NGO performance metrics
- **Compliance Tracking**: Regulatory compliance
- **Impact Reporting**: Social impact measurement
- **Grant Management**: Grant tracking and reporting

---

## Utilities Directory (`/utils`)

### 📄 `logger.js`
**Purpose**: Application logging utility  
**Function**: Centralized logging system

**Logging Levels**:
- **ERROR**: Error conditions and exceptions
- **WARN**: Warning conditions
- **INFO**: General information
- **DEBUG**: Debug information (development only)

**Features**:
- **File Logging**: Logs written to `/logs` directory
- **Console Logging**: Development environment console output
- **Log Rotation**: Automatic log file rotation
- **Structured Logging**: JSON-formatted log entries

**Usage Examples**:
```javascript
logger.info('User registered successfully');
logger.error('Database connection failed:', error);
logger.warn('Rate limit exceeded for IP:', ip);
```

---

### 📄 `validators.js`
**Purpose**: Custom validation utility functions  
**Function**: Business logic validation helpers

**Validation Functions**:

#### `validateEmail(email)`
- **Purpose**: Email format validation
- **Implementation**: Regex pattern matching
- **Features**: RFC-compliant email validation

#### `validatePassword(password)`
- **Purpose**: Password strength validation
- **Requirements**: 8+ chars, uppercase, lowercase, number, special char
- **Security**: Prevents common weak passwords

#### `validatePhone(phone)`
- **Purpose**: Phone number format validation
- **Support**: International formats (7-15 digits)
- **Flexibility**: Various international number formats

#### `validateURL(url)`
- **Purpose**: URL format validation
- **Features**: HTTP/HTTPS protocol validation
- **Usage**: Website URL validation for companies/NGOs

**Custom Validators**:
- **MongoDB ObjectId**: Validates database ID format
- **Date Range**: Future date validation for campaigns
- **File Type**: File upload type validation
- **Currency**: Currency code validation

---

### 📄 `sanitizer.js`
**Purpose**: Input sanitization utility  
**Function**: XSS prevention and input cleaning

**Sanitization Functions**:

#### `sanitizeInput(input)`
- **Purpose**: General input sanitization
- **Features**: HTML tag removal, script injection prevention
- **Output**: Clean, safe text

#### `sanitizeEmail(email)`
- **Purpose**: Email address sanitization
- **Features**: Lowercase conversion, trim whitespace
- **Validation**: Format verification

#### `sanitizeHtml(html)`
- **Purpose**: HTML content sanitization
- **Features**: Allowed tag whitelisting
- **Security**: XSS attack prevention

**Security Features**:
- **XSS Prevention**: Script injection blocking
- **SQL Injection**: Parameter sanitization
- **Data Integrity**: Input normalization
- **Performance**: Efficient sanitization algorithms

---

### 📄 `hashPassword.js`
**Purpose**: Password hashing utility  
**Function**: Secure password handling

**Functions**:

#### `hashPassword(password)`
- **Implementation**: bcrypt with 12 salt rounds
- **Security**: Industry-standard password hashing
- **Performance**: Optimized for security vs speed

#### `comparePassword(password, hash)`
- **Purpose**: Password verification
- **Security**: Timing attack prevention
- **Accuracy**: Reliable password comparison

**Security Features**:
- **Salt Rounds**: 12 rounds for optimal security
- **Timing Safety**: Constant-time comparison
- **Future-proof**: Easily adjustable security parameters

---

### 📄 `decodeToken.js`
**Purpose**: JWT token utility functions  
**Function**: Token processing and validation

**Functions**:

#### `decodeToken(token)`
- **Purpose**: JWT token decoding
- **Security**: Signature verification
- **Output**: User payload information

#### `generateToken(payload)`
- **Purpose**: JWT token creation
- **Configuration**: Expiration and secret management
- **Features**: Role-based payload inclusion

**Token Features**:
- **Expiration**: Configurable token lifetime
- **Security**: Secret key management
- **Payload**: User context information
- **Stateless**: No server-side session storage

---

### 📄 `constants.js`
**Purpose**: Application constants utility  
**Function**: Centralized constant definitions

**Constant Categories**:

#### User and Role Constants
```javascript
USER_ROLES: ['user', 'company', 'ngo', 'admin']
DEFAULT_ROLE: 'user'
```

#### Campaign Constants
```javascript
CAMPAIGN_CATEGORIES: ['education', 'healthcare', 'environment', ...]
CAMPAIGN_STATUSES: ['active', 'inactive', 'completed', 'suspended']
```

#### Payment Constants
```javascript
PAYMENT_METHODS: ['credit_card', 'debit_card', 'upi', 'net_banking']
DONATION_STATUSES: ['pending', 'completed', 'failed', 'refunded']
```

#### File Upload Constants
```javascript
MAX_FILE_SIZE: 10 * 1024 * 1024  // 10MB
ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif']
```

**Benefits**:
- **Consistency**: Uniform constant usage
- **Maintainability**: Single source of truth
- **Type Safety**: Prevents magic number/string usage
- **Configuration**: Environment-specific constants

---

## Documentation Files

### 📄 `API_DOCUMENTATION.md`
**Purpose**: Complete API endpoint documentation  
**Content**: All 62 endpoints with examples, parameters, and responses

### 📄 `LOCAL_SETUP_GUIDE.md`
**Purpose**: Development environment setup instructions  
**Content**: Step-by-step setup process, troubleshooting, and testing

### 📄 `MODULE_IMPROVEMENT_SUGGESTIONS.md`
**Purpose**: Future enhancement recommendations  
**Content**: Planned features, optimizations, and architectural improvements

### 📄 `postman_collection.json`
**Purpose**: API testing collection for Postman  
**Content**: Complete endpoint collection with test data and authentication

---

## Upload Directory (`/uploads`)

**Purpose**: File storage for uploaded content  
**Structure**:
```
/uploads/
├── campaign/    # Campaign images and documents
├── profile/     # User profile pictures
├── company/     # Company logos and documents
├── ngo/         # NGO documentation and images
└── temp/        # Temporary upload storage
```

**File Management**:
- **Organization**: Type-based directory structure
- **Naming**: Timestamp-based unique filenames
- **Security**: File type validation and size limits
- **Cleanup**: Automated cleanup of unused files

---

## Integration and Data Flow

### Authentication Flow
1. **Registration**: `authRoutes.js` → `authController.js` → `User.js` model
2. **Login**: JWT generation and user verification
3. **Protected Access**: `auth.js` middleware → controller methods

### Campaign Lifecycle
1. **Creation**: `campaignRoutes.js` → `campaignController.js` → `Campaign.js` model
2. **File Upload**: `uploadMiddleware.js` → file storage
3. **Public Listing**: Database query → response formatting

### Donation Processing
1. **Creation**: `donationRoutes.js` → `donationController.js`
2. **Payment**: Integration with payment gateway (simulated)
3. **Campaign Update**: Atomic database updates

### Activity Tracking
1. **Action Capture**: `activityLogger.js` middleware
2. **Database Storage**: `Activity.js` model
3. **Analytics**: Aggregation for reporting

This comprehensive file structure documentation provides complete coverage of every component in the donation platform backend, explaining the purpose, functionality, and integration points of each file in the system.
