
# 🚀 Local Development Setup Guide

This guide will help you set up the Donation Platform project locally on your machine.

## 📋 Prerequisites

Before starting, ensure you have the following installed:

1. **Node.js** (v18.0.0 or higher)
   - Download from: https://nodejs.org/
   - Verify: `node --version`

2. **MongoDB** (v5.0 or higher)
   - Download from: https://www.mongodb.com/try/download/community
   - Verify: `mongod --version`

3. **Git** (for version control)
   - Download from: https://git-scm.com/

## 📁 Project Structure Overview

```
donation-platform/
├── backend/           # Node.js/Express API server
├── frontend/          # React frontend application
├── start.js          # Full-stack startup script
└── package.json      # Root package configuration
```

## 🔧 Setup Instructions

### Step 1: Clone and Navigate to Project

```bash
# If cloning from repository
git clone <your-repository-url>
cd donation-platform

# Or if you have the project locally
cd path/to/donation-platform
```

### Step 2: Backend Setup

#### 2.1 Navigate to Backend Directory
```bash
cd backend
```

#### 2.2 Install Backend Dependencies
```bash
npm install
```

#### 2.3 Environment Configuration
Create a `.env` file in the `backend/` directory:

```bash
# Path: backend/.env
touch .env
```

Add the following configuration to `backend/.env`:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/donation_platform

# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-change-this-in-production
JWT_EXPIRES_IN=24h

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=./uploads

# Email Configuration (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Payment Gateway (Optional)
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
```

#### 2.4 Create Upload Directories
```bash
# Path: backend/
mkdir -p uploads/{campaign,company,profile,ngo}
```

### Step 3: Frontend Setup

#### 3.1 Navigate to Frontend Directory
```bash
# From project root
cd frontend
```

#### 3.2 Install Frontend Dependencies
```bash
npm install
```

#### 3.3 Frontend Configuration
The frontend is already configured to connect to `http://localhost:5000/api` for the backend API.

### Step 4: Database Setup

#### 4.1 Start MongoDB Service

**On Windows:**
```bash
# Start MongoDB service
net start MongoDB

# Or if installed manually
mongod --dbpath "C:\data\db"
```

**On macOS (with Homebrew):**
```bash
brew services start mongodb-community
```

**On Linux:**
```bash
sudo systemctl start mongod
```

#### 4.2 Verify MongoDB Connection
```bash
# Connect to MongoDB shell
mongosh

# Check if connected (you should see MongoDB prompt)
# Type 'exit' to close
```

## 🚀 Running the Application

### Option 1: Run Full Stack (Recommended)

From the project root directory:

```bash
# This will start both backend and frontend
node start.js
```

### Option 2: Run Services Separately

#### Start Backend Server
```bash
# Path: backend/
cd backend
npm start
# Backend will run on http://localhost:5000
```

#### Start Frontend Development Server
```bash
# Path: frontend/ (in a new terminal)
cd frontend
npm run dev
# Frontend will run on http://localhost:5173
```

### Option 3: Using Development Mode

#### Backend with Auto-reload
```bash
# Path: backend/
cd backend
npm run dev
```

#### Frontend Development Mode
```bash
# Path: frontend/
cd frontend
npm run dev
```

## 🔍 Verification Steps

### 1. Check Backend Health
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "status": "OK",
  "timestamp": "...",
  "uptime": "...",
  "version": "1.0.0"
}
```

### 2. Access Frontend
Open your browser and navigate to:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

### 3. Test API Endpoints
```bash
# Test registration endpoint
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "email": "test@example.com",
    "phoneNumber": "1234567890",
    "password": "Password123!",
    "role": "user"
  }'
```

## 📂 Important File Locations

### Backend Configuration Files:
- **Environment Variables**: `backend/.env`
- **Database Config**: `backend/config/database.js`
- **Main Server File**: `backend/index.js`
- **Package Config**: `backend/package.json`

### Frontend Configuration Files:
- **Main App File**: `frontend/App.tsx`
- **API Configuration**: `frontend/utils/api.ts`
- **Constants**: `frontend/utils/constants.tsx`
- **Package Config**: `frontend/package.json`

### Root Configuration Files:
- **Startup Script**: `start.js`
- **Main Package**: `package.json`

## 🛠 Development Workflow

### Daily Development Routine:

1. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running
   mongod  # or your system-specific command
   ```

2. **Start Development Servers**
   ```bash
   # From project root
   node start.js
   ```

3. **Open Development Tools**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:5000`
   - MongoDB Compass: Connect to `mongodb://localhost:27017`

### Making Changes:

- **Backend Changes**: Edit files in `backend/` directory
- **Frontend Changes**: Edit files in `frontend/` directory
- **Both servers will auto-reload on file changes**

## 🔧 Troubleshooting

### Common Issues:

#### 1. MongoDB Connection Error
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB if not running
mongod
```

#### 2. Port Already in Use
```bash
# Find process using port
lsof -i :5000
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

#### 3. Module Not Found
```bash
# Reinstall dependencies
cd backend && npm install
cd ../frontend && npm install
```

#### 4. Permission Issues
```bash
# Fix upload directory permissions
chmod 755 backend/uploads -R
```

## 📦 Package Management

### Adding New Packages:

**Backend Dependencies:**
```bash
cd backend
npm install <package-name>
```

**Frontend Dependencies:**
```bash
cd frontend
npm install <package-name>
```

## 🔐 Security Notes

- Never commit `.env` files to version control
- Change JWT_SECRET in production
- Use strong passwords for database users
- Keep dependencies updated

## 📝 Next Steps

After successful setup:

1. **Test all API endpoints** using Postman or curl
2. **Create sample data** through the frontend
3. **Explore the admin dashboard** features
4. **Set up payment gateway** integration
5. **Configure email services** for notifications

For production deployment, refer to deployment documentation and ensure all security measures are configured properly.

---

## 📞 Need Help?

- Check the `backend/docs/` directory for detailed API documentation
- Review `backend/docs/local_setup_docs.md` for additional backend setup details
- Ensure all prerequisites are properly installed
- Verify MongoDB is running and accessible

Happy coding! 🚀
