# Donation Platform API Documentation

Welcome to the comprehensive documentation for the Donation Platform Backend API. This documentation provides detailed information about all available endpoints, authentication, and usage examples.

## 📚 Documentation Structure

### API Endpoints
- **[Authentication API](./api/auth-endpoints.md)** - User registration, login, profile management
- **[Public API](./api/public-endpoints.md)** - Public campaigns, statistics, search
- **[NGO API](./api/ngo-endpoints.md)** - NGO-specific campaign and profile management
- **[Company API](./api/company-endpoints.md)** - Company donation and browsing features
- **[Admin API](./api/admin-endpoints.md)** - Basic admin user management
- **[Admin Campaign Management](./api/admin-campaign-management.md)** - Comprehensive campaign management
- **[Complete Admin Reference](./api/admin-endpoints-complete.md)** - Full admin API reference

### Technical Documentation
- **[Tech Stack](./technical/tech-stack.md)** - Technologies and frameworks used
- **[Code Overview](./code-overview/complete-overview.md)** - Project structure and architecture

### Setup & Configuration
- **[Local Setup](./setup/local-setup.md)** - Development environment setup
- **[Routes Structure](./setup/routes-structure.md)** - API routing organization

### Testing
- **[Testing Guide](./testing/testing-guide.md)** - How to test the API
- **[Postman Collection](./testing/api-collection.json)** - Import for easy testing
- **[API Test Scripts](./testing/api-tests.js)** - Automated testing scripts

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn package manager

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Start the server: `npm run dev`

### Base URL
```
Development: http://0.0.0.0:5000
Production: https://your-domain.com
```

## 🔐 Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### User Roles
- **Admin** - Full platform management access
- **NGO** - Campaign creation and management
- **Company** - Donation and browsing capabilities

## 📋 API Features

### Core Functionality
- ✅ User registration and authentication
- ✅ Role-based access control (Admin, NGO, Company)
- ✅ Campaign creation and management
- ✅ Donation processing
- ✅ File upload handling
- ✅ Search and filtering
- ✅ Analytics and reporting

### Admin Features
- ✅ User management (create, approve, edit, delete)
- ✅ Campaign approval workflow
- ✅ Dashboard analytics
- ✅ Notice system
- ✅ Share link generation
- ✅ Settings management
- ✅ Activity logging

### NGO Features
- ✅ Campaign creation with media uploads
- ✅ Campaign management and updates
- ✅ Donation tracking
- ✅ Profile management

### Company Features
- ✅ Campaign browsing and filtering
- ✅ Donation processing
- ✅ Donation history
- ✅ Impact tracking

## 🧪 Testing

### Using Postman
1. Import the collection from `docs/testing/api-collection.json`
2. Set up environment variables:
   - `base_url`: `http://0.0.0.0:5000`
   - `auth_token`: (obtained after login)
3. Run the authentication endpoints first
4. Test other endpoints with the obtained token

### Using Test Scripts
```bash
node docs/testing/api-tests.js
```

## 📊 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { /* response data */ }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

## 🔧 Configuration

### Environment Variables
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/donation-platform
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=24h
EMAIL_ID=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### Database Setup
The application uses MongoDB with the following collections:
- Users
- NGO profiles
- Company profiles
- Campaigns
- Donations
- Activities
- Settings
- Notices

## 📈 Monitoring & Analytics

### Admin Dashboard Metrics
- Total users, NGOs, companies
- Campaign statistics
- Donation analytics
- User approval statistics
- Recent activities

### Activity Logging
All significant actions are logged including:
- User registrations
- Campaign creation/approval
- Donations
- Admin actions

## 🛡️ Security Features

- JWT-based authentication
- Role-based authorization
- Input validation and sanitization
- File upload security
- Rate limiting
- Activity monitoring
- Secure password hashing

## 🚀 Deployment

### Replit Deployment
1. Configure the run button with `npm run dev`
2. Set up environment variables in Secrets
3. Deploy using Replit's deployment features

### Production Considerations
- Use HTTPS in production
- Set up proper database backups
- Configure error monitoring
- Implement proper logging
- Set up CI/CD pipelines

## 🤝 Contributing

1. Follow the existing code structure
2. Add proper documentation for new endpoints
3. Include test cases
4. Update this documentation

## 📞 Support

For technical support or questions:
- Review the documentation thoroughly
- Check the testing guide for examples
- Use the Postman collection for testing

## 🆕 Recent Updates

### Admin Campaign Management
- Comprehensive campaign management API
- Share link generation and tracking
- Bulk operations support
- Enhanced analytics and reporting

### Enhanced Documentation
- Complete admin API reference
- Detailed endpoint documentation
- Testing examples and scripts
- Security best practices

---

**Last Updated:** January 2024  
**API Version:** 1.0.0  
**Documentation Version:** 2.0.0