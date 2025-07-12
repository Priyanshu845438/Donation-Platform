
# Local Development Setup Guide

## 📋 Prerequisites

Before setting up the project locally, ensure you have the following installed:

### Required Software
- **Node.js** (v18.0 or higher)
- **npm** (v8.0 or higher) 
- **MongoDB** (v5.0 or higher)
- **Git**

### Optional Tools
- **MongoDB Compass** (GUI for MongoDB)
- **Postman** (API testing)
- **VS Code** (Recommended editor)

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd donation-platform-backend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/donation-platform

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h

# Email Configuration
EMAIL_ID=your-email@example.com
EMAIL_PASSWORD=your-app-password
SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret

# Cashfree Configuration
CASHFREE_APP_ID=your-cashfree-app-id
CASHFREE_SECRET_KEY=your-cashfree-secret-key
CASHFREE_BASE_URL=https://sandbox.cashfree.com

# File Upload Configuration
MAX_FILE_SIZE=10MB
UPLOAD_PATH=./uploads

# Security
BCRYPT_ROUNDS=10
CORS_ORIGIN=http://localhost:3000

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### 4. Database Setup

#### Option A: Local MongoDB
1. Install MongoDB locally
2. Start MongoDB service:
```bash
# Windows
net start MongoDB

# macOS
brew services start mongodb/brew/mongodb-community

# Linux
sudo systemctl start mongod
```

#### Option B: MongoDB Atlas (Cloud)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a cluster
3. Get connection string
4. Update `MONGODB_URI` in `.env`

### 5. Initialize Database
```bash
# Create initial admin user and default settings
npm run seed
```

### 6. Start Development Server
```bash
# Start with auto-reload
npm run dev

# Or start normally
npm start
```

The server will start on `http://localhost:5000`

## 📁 Project Structure

```
donation-platform-backend/
├── config/
│   ├── database.js          # Database connection
│   ├── corsConfig.js        # CORS configuration
│   └── multerConfig.js      # File upload config
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── adminController.js   # Admin operations
│   ├── ngoController.js     # NGO operations
│   ├── companyController.js # Company operations
│   └── publicController.js  # Public endpoints
├── middleware/
│   ├── auth.js             # Authentication middleware
│   ├── uploadMiddleware.js # File upload handling
│   └── activityLogger.js   # Activity logging
├── models/
│   ├── User.js             # User schema
│   ├── NGO.js              # NGO profile schema
│   ├── Company.js          # Company profile schema
│   ├── Campaign.js         # Campaign schema
│   ├── Donation.js         # Donation schema
│   ├── Activity.js         # Activity log schema
│   ├── Notice.js           # Notice schema
│   ├── Settings.js         # Settings schema
│   └── ShareLink.js        # Share link schema
├── routes/
│   ├── auth/
│   │   └── index.js        # Auth routes
│   ├── admin/
│   │   └── index.js        # Admin routes
│   ├── ngo/
│   │   └── index.js        # NGO routes
│   ├── company/
│   │   └── index.js        # Company routes
│   └── public/
│       └── index.js        # Public routes
├── utils/
│   ├── errorHandler.js     # Error handling
│   └── validators.js       # Input validation
├── uploads/                # File storage directory
├── docs/                   # Documentation
├── .env                    # Environment variables
├── index.js                # Main server file
└── package.json            # Dependencies
```

## 🔧 Configuration Details

### Database Schema Initialization
The application will automatically create the required collections on first run. No manual schema setup required.

### File Upload Configuration
- **Profile Images**: `uploads/Profile/`
- **Campaign Images**: `uploads/campaign/image/`
- **Campaign Documents**: `uploads/campaign/proof/`
- **Company Logos**: `uploads/company/`

### Default Admin Account
After running `npm run seed`, default admin account:
- **Email**: admin@example.com
- **Password**: admin123
- **Role**: Admin

⚠️ **Important**: Change the default admin password after first login!

## 🧪 Testing Setup

### API Testing with Postman
1. Import the provided Postman collection: `docs/testing/api-collection.json`
2. Set up environment variables in Postman:
   - `base_url`: http://localhost:5000
   - `auth_token`: (will be set automatically after login)

### Running Tests
```bash
# Run all tests
npm test

# Run specific test suite
npm run test:auth
npm run test:campaigns
npm run test:admin
```

## 🔍 Debugging

### Enable Debug Logging
Add to `.env`:
```env
DEBUG=true
LOG_LEVEL=debug
```

### MongoDB Debugging
```env
MONGOOSE_DEBUG=true
```

### Common Issues & Solutions

#### 1. MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Ensure MongoDB is running locally or check Atlas connection string.

#### 2. Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution**: 
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>

# Or use different port
PORT=5001 npm run dev
```

#### 3. File Upload Issues
```
Error: ENOENT: no such file or directory, open 'uploads/...'
```
**Solution**: Ensure upload directories exist:
```bash
mkdir -p uploads/Profile uploads/campaign/image uploads/campaign/proof uploads/company
```

#### 4. JWT Secret Missing
```
Error: secretOrPrivateKey has a value which is not a string
```
**Solution**: Add `JWT_SECRET` to `.env` file.

## 📊 Development Tools

### Recommended VS Code Extensions
- **REST Client**: Test APIs directly in VS Code
- **MongoDB for VS Code**: Database management
- **ES7+ React/Redux/React-Native snippets**: Code snippets
- **Prettier**: Code formatting
- **ESLint**: Code linting

### Useful npm Scripts
```bash
# Development with auto-reload
npm run dev

# Production build
npm run build

# Lint code
npm run lint

# Format code
npm run format

# Generate documentation
npm run docs

# Database operations
npm run db:seed     # Seed initial data
npm run db:reset    # Reset database
npm run db:backup   # Backup database
```

## 🔐 Security Configuration

### Environment Variables Security
- Never commit `.env` file to version control
- Use different secrets for different environments
- Rotate JWT secrets regularly

### File Upload Security
- Whitelist allowed file types
- Scan uploaded files for malware
- Limit file sizes
- Store files outside web root

### Database Security
- Use MongoDB authentication
- Enable database encryption
- Regular security updates
- Monitor database access

## 🚀 Deployment Preparation

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
Create `.env.production`:
```env
NODE_ENV=production
MONGODB_URI=your-production-database-url
JWT_SECRET=super-strong-production-secret
# ... other production configs
```

### Health Check Endpoint
The application includes a health check endpoint:
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "uptime": 3600,
  "environment": "development"
}
```

## 📞 Support

### Getting Help
- Check the [FAQ](../FAQ.md)
- Review [API Documentation](../api/)
- Check [GitHub Issues](https://github.com/your-repo/issues)
- Contact: support@yourplatform.com

### Contributing
1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

### Code Style
- Use ESLint configuration
- Follow naming conventions
- Add JSDoc comments
- Write meaningful commit messages
