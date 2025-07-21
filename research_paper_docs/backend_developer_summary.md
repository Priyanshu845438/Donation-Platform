
# Backend Developer Summary - Donation Platform

## Technology Stack & Architecture

### Core Technologies
- **Node.js** (v18+) - Runtime environment
- **Express.js** (v4.18+) - Web framework
- **MongoDB** with **Mongoose** (v7+) - Database and ODM
- **JWT** - Authentication and authorization
- **bcryptjs** - Password hashing and security

### Architecture Pattern
- **MVC (Model-View-Controller)** pattern
- **RESTful API** design principles
- **Middleware-based** request processing
- **Modular routing** structure

## REST API Documentation

### Authentication Endpoints
```
POST /api/auth/register     # User registration
POST /api/auth/login        # User login  
POST /api/auth/logout       # User logout
GET  /api/auth/verify       # Token verification
POST /api/auth/refresh      # Token refresh
```

### User Management (Admin)
```
GET    /api/admin/users           # Get all users
POST   /api/admin/users           # Create new user
GET    /api/admin/users/:id       # Get user by ID
PUT    /api/admin/users/:id       # Update user
DELETE /api/admin/users/:id       # Delete user
PATCH  /api/admin/users/:id/approve # Approve user
```

### Campaign Management
```
GET    /api/campaigns             # Get all campaigns
POST   /api/campaigns             # Create campaign
GET    /api/campaigns/:id         # Get campaign by ID
PUT    /api/campaigns/:id         # Update campaign
DELETE /api/campaigns/:id         # Delete campaign
POST   /api/campaigns/:id/donate  # Make donation
```

### Organization Management
```
GET    /api/admin/ngos            # Manage NGOs
GET    /api/admin/companies       # Manage companies
POST   /api/admin/organizations   # Create organization
PUT    /api/admin/organizations/:id # Update organization
```

### Payment Processing
```
POST   /api/payment/create-order  # Create Razorpay order
POST   /api/payment/verify        # Verify payment
GET    /api/payment/history/:userId # Payment history
```

## Authentication & Authorization Flow

### JWT Token Strategy
```javascript
// Token generation
const token = jwt.sign(
  { userId: user._id, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

// Token verification middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ message: 'Access denied' });
  
  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
};
```

### Role-Based Access Control
- **Admin**: Full system access and user management
- **Company**: Campaign participation and CSR management
- **NGO**: Campaign creation and volunteer management
- **Donor**: Donation tracking and profile management

## Middleware Architecture

### Security Middleware
```javascript
// Helmet for security headers
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Rate limiting
app.use('/api/auth', rateLimiter);
```

### File Upload Middleware
```javascript
// Multer configuration for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: './uploads/',
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    }
  }),
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    cb(null, allowedTypes.test(file.mimetype));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
```

### Activity Logging Middleware
```javascript
const activityLogger = (req, res, next) => {
  const activity = new Activity({
    userId: req.user?.userId,
    action: `${req.method} ${req.originalUrl}`,
    timestamp: new Date(),
    ipAddress: req.ip
  });
  activity.save();
  next();
};
```

## Controller Descriptions

### Auth Controller
- **register()**: User registration with validation and password hashing
- **login()**: Authentication with JWT token generation
- **verify()**: Token validation and user verification

### Campaign Controller
- **createCampaign()**: Campaign creation with file upload
- **getCampaigns()**: Paginated campaign listing with filters
- **updateCampaign()**: Campaign modification with authorization
- **deleteCampaign()**: Soft delete with permission checks

### Admin Controller
- **getDashboard()**: System statistics and analytics
- **manageUsers()**: Complete user CRUD operations
- **systemSettings()**: Platform configuration management

### Payment Controller
- **createOrder()**: Razorpay order creation
- **verifyPayment()**: Payment signature verification
- **webhookHandler()**: Payment status updates

## Database Schema Design

### User Model
```javascript
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'company', 'ngo', 'donor'], default: 'donor' },
  isApproved: { type: Boolean, default: false },
  profile: {
    phone: String,
    address: String,
    profileImage: String
  },
  createdAt: { type: Date, default: Date.now }
});
```

### Campaign Model
```javascript
const campaignSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  goalAmount: { type: Number, required: true },
  raisedAmount: { type: Number, default: 0 },
  category: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  images: [String],
  documents: [String],
  createdAt: { type: Date, default: Date.now }
});
```

## Code Samples of Core Functionalities

### Campaign Creation
```javascript
const createCampaign = async (req, res) => {
  try {
    const { title, description, goalAmount, category } = req.body;
    
    const campaign = new Campaign({
      title,
      description,
      goalAmount,
      category,
      createdBy: req.user.userId,
      images: req.files?.images?.map(file => file.path) || [],
      documents: req.files?.documents?.map(file => file.path) || []
    });
    
    await campaign.save();
    res.status(201).json({ success: true, campaign });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

### Payment Processing
```javascript
const createOrder = async (req, res) => {
  try {
    const { amount, campaignId } = req.body;
    
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    });
    
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
```

## Security Implementation

### Password Security
- bcrypt hashing with salt rounds
- Password strength validation
- Secure password reset flow

### Data Validation
- Express-validator for input sanitization
- MongoDB injection prevention
- XSS protection with helmet

### Rate Limiting
- Authentication endpoint protection
- API abuse prevention
- IP-based rate limiting

## Performance Optimizations

### Database Optimization
- MongoDB indexing for frequently queried fields
- Aggregation pipelines for complex queries
- Connection pooling for efficiency

### Caching Strategy
- Memory caching for frequently accessed data
- Session management optimization
- Query result caching

## Error Handling

### Centralized Error Handler
```javascript
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.log(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};
```

This backend implementation provides a robust, scalable, and secure foundation for the donation platform with comprehensive API coverage and proper security measures.
