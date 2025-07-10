
# Detailed Workflow Documentation

## Overview

This document provides an in-depth explanation of all workflows in the Donation Platform backend system, covering authentication flows, campaign management, donation processing, user interactions, and administrative operations.

**Last Updated**: January 6, 2025  
**System Status**: All workflows tested and operational

---

## 1. Authentication Workflows

### 1.1 User Registration Workflow

**Entry Point**: `POST /api/auth/register`  
**Controller**: `authController.js -> register()`  
**Middleware Chain**: Rate Limiter → Validation → Sanitization

#### Step-by-Step Process:

1. **Rate Limiting Check**
   - `rateLimiter.js` checks IP-based registration attempts (max 20/hour)
   - Logs attempt and blocks if limit exceeded

2. **Input Validation & Sanitization**
   - `validation.js` validates all input fields using express-validator
   - `sanitizer.js` cleans inputs to prevent XSS attacks
   - Password strength validation (8+ chars, uppercase, lowercase, number, special char)
   - Phone number validation (7-15 digits, international support)
   - Email format validation and normalization

3. **Role-Based Validation**
   - Checks role against allowed values: `['user', 'company', 'ngo', 'admin']`
   - Admin role only allowed in development environment

4. **Duplicate User Check**
   - Queries MongoDB for existing user with same email
   - Returns 409 conflict if user already exists

5. **User Creation Process**
   - Creates base user record in `User` collection
   - Password automatically hashed by pre-save middleware (bcrypt, 12 salt rounds)
   - Captures registration metadata (IP, user agent, timestamp)

6. **Role-Specific Profile Creation**
   - **Company Role**: Creates `Company` profile with default values
   - **NGO Role**: Creates `NGO` profile with validation-compliant defaults
   - **User Role**: No additional profile created

7. **Response Generation**
   - Returns sanitized user data (password excluded)
   - Includes profile data if applicable
   - Logs successful registration

#### Error Handling:
- Validation errors return 400 with detailed field-specific messages
- Duplicate email returns 409 with clear message
- Database errors return 500 with development-specific error details

---

### 1.2 User Login Workflow

**Entry Point**: `POST /api/auth/login`  
**Controller**: `authController.js -> login()`  
**Middleware Chain**: Rate Limiter → Validation

#### Step-by-Step Process:

1. **Rate Limiting**
   - `authLimiter` allows max 5 auth attempts per 15 minutes per IP
   - Prevents brute force attacks

2. **Input Validation**
   - Email format validation and normalization
   - Password presence check (no strength validation on login)

3. **User Lookup**
   - Searches database for user by email
   - Explicitly selects password field (normally excluded)
   - Returns generic "Invalid credentials" if user not found

4. **Account Status Check**
   - Verifies user account is active (`isActive: true`)
   - Returns 403 if account is deactivated

5. **Password Verification**
   - Uses `bcrypt.compare()` to verify password against hashed version
   - Returns generic "Invalid credentials" if password doesn't match

6. **JWT Token Generation**
   - Creates JWT with payload: `{userId, email, role}`
   - Uses `JWT_SECRET` from environment
   - Sets expiration to 24 hours (configurable via `JWT_EXPIRES_IN`)

7. **Login Tracking**
   - Updates user's `lastLogin` timestamp
   - Logs successful login event

#### Security Features:
- Generic error messages prevent email enumeration
- Rate limiting prevents brute force attacks
- JWT tokens are stateless and include role information

---

### 1.3 Protected Route Access Workflow

**Middleware**: `auth.js -> verifyToken()`  
**Applied To**: All protected endpoints

#### Step-by-Step Process:

1. **Token Extraction**
   - Checks `Authorization` header for `Bearer <token>` format
   - Returns 401 if no token provided

2. **Token Verification**
   - Uses `jwt.verify()` with `JWT_SECRET`
   - Handles expired tokens and invalid signatures
   - Returns 401 for any token validation failure

3. **User Lookup**
   - Extracts userId from token payload
   - Queries database to verify user still exists
   - Checks if user account is still active

4. **Request Context Setting**
   - Attaches user object to `req.user`
   - Includes user ID, email, and role for downstream use

5. **Role-Based Authorization** (when applicable)
   - Some endpoints check `req.user.role` for specific permissions
   - Admin-only endpoints verify role is 'admin'

---

## 2. Campaign Management Workflows

### 2.1 Campaign Creation Workflow

**Entry Point**: `POST /api/campaigns/`  
**Controller**: `campaignController.js -> createCampaign()`  
**Middleware Chain**: Auth → File Upload → Validation

#### Step-by-Step Process:

1. **Authentication Check**
   - Verifies user is logged in via JWT token
   - Only authenticated users can create campaigns

2. **File Upload Processing**
   - `multer` middleware handles file uploads
   - Supports multiple images for campaign gallery
   - Files stored in `/uploads/campaign/` directory
   - Validates file types and sizes

3. **Input Validation**
   - Title: 10-200 characters
   - Description: 50-5000 characters
   - Goal amount: Positive number
   - Category: Predefined list (education, healthcare, etc.)
   - End date: Must be in future

4. **Campaign Data Preparation**
   - Associates campaign with authenticated user
   - Sets initial status to 'active'
   - Calculates initial raised amount (0)
   - Processes uploaded file paths

5. **Database Storage**
   - Creates campaign record in MongoDB
   - Auto-generates unique campaign ID
   - Sets creation timestamp

6. **Activity Logging**
   - Records campaign creation in activity log
   - Links to user and campaign for audit trail

#### File Upload Details:
- Accepts: JPG, PNG, GIF formats
- Max file size: 10MB per file
- Max files: 5 images per campaign
- Files renamed with timestamp prefix

---

### 2.2 Campaign Update Workflow

**Entry Point**: `PATCH /api/campaigns/:id`  
**Controller**: `campaignController.js -> updateCampaign()`  
**Authorization**: Campaign owner only

#### Step-by-Step Process:

1. **Campaign Ownership Verification**
   - Fetches campaign by ID
   - Compares campaign creator with authenticated user
   - Returns 403 if user doesn't own campaign

2. **Update Validation**
   - Only allows specific fields to be updated
   - Prevents modification of sensitive fields (raised amount, creator)
   - Validates new values if provided

3. **File Handling** (if new files uploaded)
   - Processes new image uploads
   - Optionally removes old images
   - Updates image array in campaign document

4. **Database Update**
   - Uses `findByIdAndUpdate` with validation
   - Returns updated campaign data
   - Logs update activity

---

### 2.3 Campaign Listing Workflow

**Entry Point**: `GET /api/campaigns/`  
**Controller**: `campaignController.js -> getCampaigns()`  
**Access**: Public (no authentication required)

#### Step-by-Step Process:

1. **Query Parameter Processing**
   - Page and limit for pagination (default: page 1, limit 10)
   - Search term for text-based filtering
   - Category filter for specific campaign types
   - Status filter (active, completed, suspended)

2. **Database Query Construction**
   - Builds MongoDB aggregation pipeline
   - Includes text search if search term provided
   - Filters by category and status if specified
   - Sorts by creation date (newest first)

3. **Population and Enrichment**
   - Populates creator information (name, role)
   - Calculates campaign progress percentage
   - Formats monetary amounts

4. **Pagination Implementation**
   - Applies skip and limit for pagination
   - Calculates total pages and current page info
   - Returns metadata for frontend pagination

5. **Response Formatting**
   - Returns campaigns array with metadata
   - Includes pagination information
   - Excludes sensitive creator information

---

## 3. Donation Processing Workflows

### 3.1 Donation Creation Workflow

**Entry Point**: `POST /api/donations/`  
**Controller**: `donationController.js -> createDonation()`  
**Access**: Public (supports both authenticated and anonymous donations)

#### Step-by-Step Process:

1. **Campaign Validation**
   - Verifies campaign exists and is active
   - Checks if campaign end date hasn't passed
   - Ensures campaign goal hasn't been exceeded

2. **Donor Information Processing**
   - **Authenticated Users**: Uses user data from JWT token
   - **Anonymous Donations**: Requires donor name and email in request
   - Validates email format for anonymous donations

3. **Amount Validation**
   - Ensures donation amount is positive
   - Validates currency (defaults to USD)
   - Checks for minimum donation amount (if configured)

4. **Payment Processing Simulation**
   - Generates unique payment ID
   - Sets initial status to 'pending'
   - Records payment method
   - Simulates payment gateway interaction

5. **Database Transaction**
   - Creates donation record
   - Updates campaign's raised amount
   - Updates campaign's donation count
   - Ensures data consistency

6. **Activity and Notification**
   - Logs donation activity
   - Prepares notification for campaign owner
   - Records transaction for audit trail

#### Payment Integration Points:
- Ready for real payment gateway integration
- Webhook endpoint prepared for payment confirmations
- Status update mechanisms in place

---

### 3.2 Donation Status Update Workflow

**Entry Point**: Payment gateway webhooks or admin actions  
**Controller**: `donationController.js -> updateDonationStatus()`  
**Access**: Payment gateway or admin only

#### Step-by-Step Process:

1. **Status Validation**
   - Verifies new status is valid (pending, completed, failed, refunded)
   - Checks current status allows the transition

2. **Campaign Amount Adjustment**
   - **Completed**: Confirms amount is added to campaign total
   - **Failed/Refunded**: Subtracts amount from campaign total
   - **Pending**: No amount changes

3. **Notification Triggers**
   - Sends confirmation email for completed donations
   - Notifies donor of failed payments
   - Updates campaign owner of new donations

4. **Audit Trail**
   - Records status change with timestamp
   - Logs user/system that made the change
   - Maintains complete transaction history

---

## 4. User Management Workflows

### 4.1 Profile Management Workflow

**Entry Point**: Various profile endpoints  
**Controllers**: Multiple across `userController.js`, `companyController.js`

#### User Profile Update Process:

1. **Authentication Verification**
   - Confirms user is updating their own profile
   - Admin users can update any profile

2. **Field Validation**
   - Sanitizes all input fields
   - Validates email format if being changed
   - Checks phone number format
   - Prevents update of sensitive fields (role, email)

3. **Role-Specific Validation**
   - **Company**: Business-specific fields (registration number, employees)
   - **NGO**: Nonprofit-specific fields (80G certification, FCRA status)
   - **User**: Basic profile fields only

4. **File Upload Handling**
   - Profile images uploaded to `/uploads/profile/`
   - Company logos to `/uploads/company/`
   - Old files optionally removed

5. **Database Update**
   - Updates appropriate collection (User, Company, NGO)
   - Maintains update timestamp
   - Returns sanitized updated data

---

### 4.2 User Activity Tracking Workflow

**Middleware**: `activityLogger.js`  
**Applied To**: Key user actions

#### Activity Logging Process:

1. **Action Detection**
   - Middleware captures significant user actions
   - Includes: login, profile updates, campaign creation, donations

2. **Context Capture**
   - Records user ID and role
   - Captures IP address and user agent
   - Timestamps the action
   - Records specific action type and details

3. **Database Storage**
   - Stores in `Activity` collection
   - Indexes by user, timestamp, and action type
   - Enables querying user activity history

4. **Privacy Compliance**
   - Excludes sensitive information
   - Anonymizes certain data points
   - Supports data retention policies

---

## 5. Administrative Workflows

### 5.1 Admin Dashboard Analytics Workflow

**Entry Point**: `GET /api/admin/dashboard/analytics`  
**Controller**: `admin/dashboardController.js -> getAnalytics()`  
**Access**: Admin only

#### Data Aggregation Process:

1. **User Statistics**
   - Total users by role
   - New registrations in time periods
   - Active vs inactive user counts
   - User growth metrics

2. **Campaign Statistics**
   - Total campaigns by status
   - Most successful campaigns
   - Campaign completion rates
   - Category distribution

3. **Donation Statistics**
   - Total donation amount
   - Average donation size
   - Donation frequency patterns
   - Top donors and campaigns

4. **Financial Metrics**
   - Total platform transaction volume
   - Revenue trends over time
   - Payment method distribution
   - Refund and failure rates

5. **Response Compilation**
   - Aggregates all statistics
   - Formats monetary values
   - Calculates percentages and ratios
   - Returns comprehensive dashboard data

---

### 5.2 User Management Workflow (Admin)

**Entry Points**: Various admin user management endpoints  
**Access**: Admin only

#### User Administration Process:

1. **User Listing**
   - Supports pagination and search
   - Filters by role, status, registration date
   - Returns user profiles with activity summaries

2. **Status Management**
   - Activate/deactivate user accounts
   - Temporary suspension capabilities
   - Role modification (with restrictions)

3. **Profile Review**
   - View complete user profiles
   - Access activity history
   - Review campaign and donation history

4. **Bulk Operations**
   - Export user data for reporting
   - Batch status updates
   - Communication tools for user outreach

---

## 6. Security and Rate Limiting Workflows

### 6.1 Rate Limiting Workflow

**Middleware**: `rateLimiter.js`  
**Applied To**: All API endpoints

#### Rate Limiting Process:

1. **IP Detection**
   - Uses trust proxy settings for accurate IP
   - Handles proxy headers correctly
   - Accounts for load balancer forwarding

2. **Limit Checking**
   - Different limits for different endpoint types:
     - General API: 1000 requests/15 minutes
     - Authentication: 5 attempts/15 minutes
     - Registration: 20 attempts/hour
     - File uploads: 10 attempts/15 minutes

3. **Violation Handling**
   - Returns 429 status with retry information
   - Logs rate limit violations
   - Provides clear error messages

4. **Reset Mechanism**
   - Sliding window implementation
   - Automatic reset after time period
   - Grace period for legitimate users

---

### 6.2 Input Validation and Sanitization Workflow

**Middleware**: `validation.js` and `sanitizer.js`  
**Applied To**: All input-accepting endpoints

#### Validation Process:

1. **Input Sanitization**
   - Removes potentially dangerous characters
   - Trims whitespace
   - Converts to appropriate data types

2. **Format Validation**
   - Email format checking
   - Phone number pattern matching
   - URL validation for websites
   - File type validation for uploads

3. **Business Rule Validation**
   - Minimum/maximum lengths
   - Required field checking
   - Cross-field validation
   - Date range validation

4. **Error Response**
   - Detailed field-specific error messages
   - Clear indication of validation failures
   - Consistent error format across endpoints

---

## 7. File Upload and Management Workflows

### 7.1 File Upload Workflow

**Middleware**: `uploadMiddleware.js` using Multer  
**Storage**: Local filesystem

#### Upload Process:

1. **Pre-upload Validation**
   - File type checking (MIME type validation)
   - File size limits (10MB default)
   - Number of files restrictions

2. **Storage Processing**
   - Generates unique filenames with timestamps
   - Organizes files by type (profile, campaign, company)
   - Creates directory structure if needed

3. **Post-upload Processing**
   - Records file metadata in database
   - Associates files with user/campaign records
   - Generates public URLs for file access

4. **Error Handling**
   - Invalid file type rejection
   - Storage space checking
   - Corruption detection

---

## 8. Database Connection and Management Workflows

### 8.1 Database Connection Workflow

**File**: `config/database.js`  
**Process**: Application startup

#### Connection Process:

1. **Environment Configuration**
   - Reads MongoDB URI from environment variables
   - Sets connection options for production vs development
   - Configures connection pooling

2. **Connection Establishment**
   - Attempts connection with retry logic
   - Handles authentication if required
   - Validates database accessibility

3. **Error Handling**
   - Connection timeout handling
   - Network error recovery
   - Graceful degradation strategies

4. **Connection Monitoring**
   - Health check capabilities
   - Connection status logging
   - Automatic reconnection on failures

---

## 9. Error Handling and Logging Workflows

### 9.1 Global Error Handling Workflow

**Middleware**: `errorHandler.js`  
**Scope**: Application-wide error handling

#### Error Processing:

1. **Error Classification**
   - Validation errors (400)
   - Authentication errors (401)
   - Authorization errors (403)
   - Not found errors (404)
   - Server errors (500)

2. **Error Formatting**
   - Consistent error response structure
   - Development vs production error details
   - User-friendly error messages

3. **Logging and Monitoring**
   - Error details logged to files
   - Critical errors flagged for immediate attention
   - Error patterns tracked for system improvement

4. **Recovery Mechanisms**
   - Graceful degradation where possible
   - Fallback responses for non-critical failures
   - User guidance for recoverable errors

---

## 10. Statistics and Analytics Workflows

### 10.1 Global Statistics Workflow

**Entry Point**: `GET /api/stats/global`  
**Controller**: `statsController.js`  
**Access**: Public

#### Statistics Generation:

1. **Data Collection**
   - Queries multiple collections (users, campaigns, donations)
   - Aggregates real-time data
   - Calculates derived metrics

2. **Performance Optimization**
   - Uses MongoDB aggregation pipelines
   - Implements caching for frequently requested data
   - Minimizes database queries

3. **Data Formatting**
   - Formats currency amounts
   - Calculates percentages and ratios
   - Provides human-readable summaries

4. **Response Delivery**
   - Returns comprehensive statistics object
   - Includes metadata about data freshness
   - Provides breakdowns by category/time period

---

## Workflow Integration Points

### Inter-Workflow Communication

1. **Event-Driven Updates**
   - Campaign updates trigger statistic recalculation
   - Donations update multiple related entities
   - User actions generate activity logs

2. **Data Consistency**
   - Transaction-like operations where needed
   - Rollback mechanisms for failed operations
   - Eventual consistency for analytics data

3. **Notification Triggers**
   - Workflow completion triggers notifications
   - Error conditions generate admin alerts
   - User actions trigger email workflows

### Performance Considerations

1. **Caching Strategies**
   - Frequently accessed data cached in memory
   - Database query result caching
   - File metadata caching

2. **Async Processing**
   - Non-critical operations run asynchronously
   - Email sending and file processing queued
   - Background statistic calculation

3. **Database Optimization**
   - Proper indexing on frequently queried fields
   - Aggregation pipeline optimization
   - Connection pooling and query optimization

---

## Monitoring and Health Checks

### System Health Monitoring

1. **Application Health**
   - `/health` endpoint provides system status
   - Database connectivity checking
   - Memory and CPU usage monitoring

2. **Performance Metrics**
   - Request response time tracking
   - Error rate monitoring
   - Throughput measurement

3. **Business Metrics**
   - User engagement tracking
   - Transaction success rates
   - Feature usage analytics

This comprehensive workflow documentation covers all major processes in the donation platform. Each workflow is designed to be secure, scalable, and maintainable, with proper error handling and logging throughout.
