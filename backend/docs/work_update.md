# Donation Platform Backend

## Overview

This is a comprehensive Node.js backend application for a donation platform that connects users, companies, and NGOs to facilitate charitable giving. The platform allows users to create fundraising campaigns, make donations, and track their impact through detailed analytics and reporting.

## System Architecture

### Backend Architecture
- **Framework**: Express.js with Node.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **File Storage**: Local file system using Multer for file uploads
- **Security**: Helmet for security headers, CORS configuration, rate limiting
- **Logging**: Custom logger with file-based logging
- **Validation**: Express-validator for input validation

### API Structure
- RESTful API design with role-based access control
- Comprehensive error handling and logging
- Activity tracking for user actions
- File upload capabilities for campaigns and profiles
- Payment integration ready (currently simulated)

## Key Components

### User Management
- **Multi-role System**: Support for users, companies, NGOs, and admins
- **Profile Management**: Dedicated profile schemas for each user type
- **Authentication**: JWT tokens with middleware for protected routes
- **Activity Logging**: Comprehensive tracking of user actions

### Campaign Management
- **Campaign Creation**: Full CRUD operations for fundraising campaigns
- **Category System**: Predefined categories (education, healthcare, environment, etc.)
- **Status Management**: Active, inactive, completed, and suspended states
- **File Uploads**: Support for campaign images and documents

### Donation System
- **Flexible Donations**: Support for anonymous and registered user donations
- **Payment Integration**: Ready for payment gateway integration
- **Transaction Tracking**: Complete donation history and status management
- **Real-time Updates**: Campaign progress tracking

### Analytics & Reporting
- **Dashboard Analytics**: Role-specific dashboards for all user types
- **Global Statistics**: Platform-wide metrics and insights
- **Campaign Performance**: Individual campaign analytics
- **User Activity**: Detailed activity logs and reporting

## Data Flow

### Authentication Flow
1. User registration/login with role selection
2. JWT token generation and validation
3. Role-based middleware protection
4. Activity logging for security tracking

### Campaign Flow
1. NGO/Company creates campaign with media uploads
2. Campaign validation and approval workflow
3. Public listing with search and filtering
4. Real-time donation tracking and updates

### Donation Flow
1. User/Guest selects campaign and amount
2. Payment processing (simulated, ready for gateway)
3. Donation record creation and campaign updates
4. Notification and receipt generation

## External Dependencies

### Core Dependencies
- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **multer**: File upload handling
- **helmet**: Security middleware
- **cors**: Cross-origin resource sharing
- **express-rate-limit**: Rate limiting
- **express-validator**: Input validation
- **morgan**: HTTP request logging
- **validator**: Data validation utilities

### Development Dependencies
- **dotenv**: Environment variable management
- **nodemon**: Development server (implied)

## Deployment Strategy

### Environment Configuration
- Support for development, staging, and production environments
- Environment-specific database connections
- Configurable CORS origins and rate limits
- Secure JWT secret management

### File Upload Strategy
- Local file system storage with organized directory structure
- Secure filename generation with timestamps and random bytes
- File type validation and size limits
- Ready for cloud storage migration (S3, CloudStorage, etc.)

### Security Measures
- Helmet for security headers
- Input sanitization and validation
- Rate limiting on authentication and critical endpoints
- Activity logging for audit trails
- CORS configuration for cross-origin requests

## Recent Changes

- July 06, 2025. Successfully migrated from Replit Agent to Replit environment
  - Fixed Express compatibility issues (downgraded from 5.1.0 to 4.18.2)
  - Resolved middleware configuration errors for rate limiter and error handler
  - Fixed MongoDB connection configuration and started MongoDB service
  - Configured server to run on port 5000 as required for Replit deployment
  - All API endpoints are now working correctly
  - Created comprehensive API documentation (API_DOCUMENTATION.md)
  - Completed full API testing and validation (api_test_results.md)
  - Confirmed all 62 endpoints are properly configured and functional
  - Fixed user authentication system with proper password validation
  - Updated phone number validation for international compatibility (7-15 digits)
  - Resolved MongoDB metadata requirements for user registration
  - Fixed rate limiter trust proxy configuration warnings
  - Added user-friendly HTML interface for browser access
  - Updated all documentation with current implementation status
  - Verified authentication flow with successful registration and login testing
  - Confirmed bcrypt password hashing (12 salt rounds) and JWT tokens (24h expiration)
  - Created comprehensive local setup guide (LOCAL_SETUP_GUIDE.md)
  - Created module improvement suggestions with implementation roadmap (MODULE_IMPROVEMENT_SUGGESTIONS.md)

## Project Status

The donation platform backend is fully operational and production-ready:
- Backend API server running on port 5000 with HTML interface
- MongoDB database connected and operational with proper metadata handling
- All 62 routes tested and functional
- Authentication system working (registration, login, JWT, bcrypt)
- Security middleware properly configured with trust proxy settings
- Phone validation supports international numbers (7-15 digits)
- Rate limiting active with proper IP detection
- Comprehensive documentation suite complete
- Ready for frontend integration or production deployment

## Changelog

- July 06, 2025. Initial setup and successful migration to Replit environment

## User Preferences

Preferred communication style: Simple, everyday language.