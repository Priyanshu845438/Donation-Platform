
# Technical Stack Documentation

## 🏗️ Architecture Overview

The Donation Platform Backend is built using a modern Node.js stack with a RESTful API architecture, designed for scalability, security, and maintainability.

## 🔧 Core Technologies

### Runtime & Framework
- **Node.js** (v18+): JavaScript runtime environment
- **Express.js** (v4.21+): Web application framework
  - Fast, unopinionated, minimalist web framework
  - Middleware-based architecture
  - Extensive ecosystem support

### Database & ODM
- **MongoDB** (v5.0+): NoSQL document database
  - Flexible schema design
  - Horizontal scaling capabilities
  - Rich query language
- **Mongoose** (v8.11+): MongoDB object modeling
  - Schema definition and validation
  - Middleware (pre/post hooks)
  - Query building and population

### Authentication & Security
- **JSON Web Tokens (JWT)**: Stateless authentication
  - Secure token-based authentication
  - Configurable expiration times
  - Role-based access control
- **bcryptjs**: Password hashing
  - Secure password storage
  - Salt-based hashing
  - Configurable rounds

### File Handling
- **Multer**: Multipart/form-data handling
  - File upload middleware
  - Memory and disk storage options
  - File filtering and validation

### Validation & Sanitization
- **Validator.js**: String validation and sanitization
  - Email validation
  - Phone number validation
  - Input sanitization
- **Custom Validators**: Business logic validation
  - Role validation
  - MongoDB ObjectId validation
  - Custom input sanitization

### Email Services
- **Nodemailer**: Email sending
  - SMTP support
  - HTML email templates
  - Attachment support

### Payment Integration
- **Razorpay SDK**: Payment processing
  - Secure payment gateway integration
  - Webhook handling
  - Transaction management
- **Cashfree SDK**: Alternative payment gateway
  - Multi-gateway support
  - Failover capabilities

### Development & Utilities
- **Nodemon**: Development server
  - Auto-restart on file changes
  - Environment-specific configurations
- **dotenv**: Environment configuration
  - Secure environment variable management
  - Environment-specific settings
- **CORS**: Cross-Origin Resource Sharing
  - Configurable origin policies
  - Security headers
- **UUID**: Unique identifier generation
  - Secure random UUIDs
  - Multiple UUID versions

## 📁 Project Architecture

### MVC Pattern Implementation

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│     Routes      │───▶│   Controllers   │───▶│     Models      │
│  (API Layer)    │    │ (Business Logic)│    │ (Data Layer)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Middleware    │    │   Utilities     │    │    Database     │
│ (Auth, Upload)  │    │ (Validators)    │    │   (MongoDB)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Directory Structure Philosophy

#### Role-Based Route Organization
```
routes/
├── auth/           # Authentication & user management
├── admin/          # Administrative operations
├── ngo/            # NGO-specific operations
├── company/        # Company-specific operations
└── public/         # Public access endpoints
```

#### Separation of Concerns
- **Routes**: API endpoint definitions and request handling
- **Controllers**: Business logic and request processing
- **Models**: Data schema and database operations
- **Middleware**: Cross-cutting concerns (auth, logging, validation)
- **Utils**: Shared utilities and helper functions

## 🔐 Security Implementation

### Authentication Flow
```
Client Request → JWT Verification → Role Authorization → Controller → Response
```

### Security Measures
1. **Password Security**
   - bcrypt hashing with salt rounds
   - Minimum password complexity requirements
   - Password change tracking

2. **JWT Security**
   - Short expiration times (24h default)
   - Secure secret key management
   - Token blacklisting capability

3. **Input Validation**
   - Request body sanitization
   - SQL injection prevention
   - XSS attack mitigation

4. **File Upload Security**
   - File type whitelisting
   - Size limitations
   - Path traversal prevention

### CORS Configuration
```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
```

## 📊 Database Design

### Schema Architecture

#### User Management
```
Users ──┬── NGO Profiles
        ├── Company Profiles
        └── Activity Logs
```

#### Campaign System
```
Campaigns ──┬── Donations
            ├── Comments
            └── Share Links
```

#### Administrative
```
Settings ──┬── Email Config
           ├── Payment Config
           └── General Config

Notices ────── User Notifications
```

### Data Relationships
- **One-to-One**: User → Profile (NGO/Company)
- **One-to-Many**: NGO → Campaigns, Campaign → Donations
- **Many-to-Many**: Users ↔ Activities (through logging)

### Indexing Strategy
```javascript
// Performance-critical indexes
User: { email: 1 }        // Unique login
Campaign: { status: 1, endDate: 1 }  // Active campaigns
Donation: { campaignId: 1, createdAt: -1 }  // Campaign donations
Activity: { userId: 1, createdAt: -1 }  // User activity
```

## 🔄 Middleware Stack

### Request Processing Pipeline
```
1. CORS Headers
2. Body Parsing (JSON/URL-encoded)
3. Static File Serving
4. Route Matching
5. Authentication (if required)
6. Authorization (role-based)
7. Validation
8. Controller Logic
9. Response Formatting
10. Error Handling
```

### Custom Middleware

#### Authentication Middleware
```javascript
const authMiddleware = (requiredRoles = []) => {
  return async (req, res, next) => {
    // JWT verification
    // Role authorization
    // User attachment to request
  };
};
```

#### Upload Middleware
```javascript
const upload = multer({
  storage: diskStorage({
    destination: (req, file, cb) => {
      // Dynamic path based on file type
    },
    filename: (req, file, cb) => {
      // Unique filename generation
    }
  }),
  fileFilter: (req, file, cb) => {
    // File type validation
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});
```

## 🚀 Performance Optimizations

### Database Optimizations
1. **Mongoose Connection Pooling**
   ```javascript
   mongoose.connect(uri, {
     maxPoolSize: 10,
     serverSelectionTimeoutMS: 5000,
     socketTimeoutMS: 45000,
   });
   ```

2. **Query Optimization**
   - Selective field projection
   - Pagination implementation
   - Index utilization

3. **Connection Management**
   - Graceful shutdown handling
   - Connection retry logic
   - Health check monitoring

### API Performance
1. **Response Compression**
   - JSON response optimization
   - Static asset compression

2. **Caching Strategy**
   - Frequently accessed data caching
   - ETags for conditional requests

3. **Request Limiting**
   - Rate limiting implementation
   - DDoS protection

## 🔧 Configuration Management

### Environment-Based Configuration
```javascript
const config = {
  development: {
    database: 'mongodb://localhost:27017/donation-dev',
    jwtSecret: 'dev-secret',
    logLevel: 'debug'
  },
  production: {
    database: process.env.MONGODB_URI,
    jwtSecret: process.env.JWT_SECRET,
    logLevel: 'error'
  }
};
```

### Feature Flags
```javascript
const features = {
  email_notifications: process.env.ENABLE_EMAIL === 'true',
  payment_gateway: process.env.PAYMENT_PROVIDER || 'razorpay',
  file_uploads: process.env.ENABLE_UPLOADS !== 'false'
};
```

## 📈 Monitoring & Logging

### Error Handling Strategy
```javascript
// Global error handler
app.use((error, req, res, next) => {
  logger.error(error.stack);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Validation failed',
      errors: error.errors
    });
  }
  
  // Generic error response
  res.status(500).json({
    message: 'Internal server error'
  });
});
```

### Activity Logging
```javascript
const Activity = {
  log: async (userId, action, details) => {
    await Activity.create({
      userId,
      action,
      details,
      timestamp: new Date(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
  }
};
```

## 🔄 API Design Principles

### RESTful Conventions
- **GET**: Retrieve resources
- **POST**: Create new resources
- **PUT**: Update existing resources
- **DELETE**: Remove resources

### Response Format Standardization
```javascript
// Success Response
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully"
}

// Error Response
{
  "success": false,
  "message": "Error description",
  "errors": [ ... ]
}
```

### API Versioning Strategy
- URL-based versioning: `/api/v1/...`
- Header-based versioning support
- Backward compatibility maintenance

## 🛠️ Development Tools Integration

### Code Quality
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting consistency
- **Husky**: Git hooks for pre-commit checks

### Testing Framework
- **Jest**: Unit and integration testing
- **Supertest**: HTTP assertion testing
- **MongoDB Memory Server**: In-memory testing database

### Documentation
- **JSDoc**: Code documentation
- **Swagger/OpenAPI**: API documentation
- **Markdown**: Project documentation

## 🔮 Scalability Considerations

### Horizontal Scaling
- Stateless application design
- Database connection pooling
- Load balancer compatibility

### Microservices Readiness
- Modular architecture
- Service isolation capabilities
- API gateway integration support

### Cloud Deployment
- Container-ready configuration
- Environment variable management
- Health check endpoints
- Graceful shutdown handling

## 📋 Technology Versions

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime environment |
| Express.js | 4.21+ | Web framework |
| MongoDB | 5.0+ | Database |
| Mongoose | 8.11+ | ODM |
| JWT | 9.0+ | Authentication |
| Multer | 1.4+ | File uploads |
| bcryptjs | 3.0+ | Password hashing |
| Validator | 13.15+ | Input validation |
| Nodemailer | 6.10+ | Email service |

## 🔄 Future Enhancements

### Planned Integrations
- Redis for caching and session management
- Message queues for background processing
- Elasticsearch for advanced search capabilities
- GraphQL API endpoints
- WebSocket support for real-time features

### Performance Improvements
- Database query optimization
- CDN integration for file serving
- API response caching
- Connection pooling optimization
