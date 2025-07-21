
# System Architecture Documentation - Donation Platform

## System Overview

The Donation Platform is built using a modern three-tier architecture with clear separation of concerns, following MVC (Model-View-Controller) design patterns. The system facilitates secure donations, campaign management, and multi-role user interactions through a scalable web-based platform.

### Architecture Principles
- **Separation of Concerns**: Clear division between presentation, business logic, and data layers
- **Scalability**: Horizontal scaling capabilities through stateless design
- **Security**: Multi-layered security approach with authentication and authorization
- **Maintainability**: Modular design with reusable components and services

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
├─────────────────────────────────────────────────────────────────┤
│  React Frontend (TypeScript)                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   Admin     │ │   Company   │ │     NGO     │              │
│  │  Dashboard  │ │  Dashboard  │ │  Dashboard  │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │    Donor    │ │   Public    │ │   Common    │              │
│  │  Dashboard  │ │    Pages    │ │ Components  │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ HTTPS/REST API
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  Node.js + Express.js Backend                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │   Auth      │ │ Middleware  │ │   Routes    │              │
│  │  Service    │ │   Layer     │ │   Layer     │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │ Controllers │ │  Services   │ │ Validation  │              │
│  │    Layer    │ │   Layer     │ │   Layer     │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
                                │
                                │ Mongoose ODM
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB Database                                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │    Users    │ │  Campaigns  │ │  Donations  │              │
│  │ Collection  │ │ Collection  │ │ Collection  │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐              │
│  │ Activities  │ │   Notice    │ │  Settings   │              │
│  │ Collection  │ │ Collection  │ │ Collection  │              │
│  └─────────────┘ └─────────────┘ └─────────────┘              │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Frontend Architecture (React + TypeScript)

#### Component Hierarchy
```
App
├── Router
│   ├── Public Routes
│   │   ├── HomePage
│   │   ├── AboutPage
│   │   ├── CampaignsPage
│   │   ├── LoginPage
│   │   └── SignupPage
│   └── Protected Routes
│       ├── AdminLayout
│       │   ├── UserManagement
│       │   ├── CampaignManagement
│       │   ├── ReportsPage
│       │   └── SettingsPage
│       ├── CompanyLayout
│       │   ├── DashboardPage
│       │   ├── CampaignListPage
│       │   └── ProfilePage
│       ├── NgoLayout
│       │   ├── DashboardPage
│       │   ├── CampaignManagement
│       │   └── VolunteeringPage
│       └── DonorLayout
│           ├── DashboardPage
│           ├── DonationHistory
│           └── ProfilePage
```

#### State Management Architecture
```
React Context Providers
├── AuthContext
│   ├── User Authentication State
│   ├── Role-based Permissions
│   └── Token Management
├── ThemeContext
│   ├── Light/Dark Mode
│   └── Theme Persistence
└── ToastContext
    ├── Notification Management
    └── Alert System
```

### Backend Architecture (Node.js + Express.js)

#### MVC Pattern Implementation
```
Backend Structure
├── Controllers
│   ├── authController.js        # Authentication logic
│   ├── campaignController.js    # Campaign CRUD operations
│   ├── adminController.js       # Admin panel operations
│   ├── paymentController.js     # Payment processing
│   └── userController.js        # User management
├── Models
│   ├── User.js                  # User schema definition
│   ├── Campaign.js              # Campaign schema definition
│   ├── Donation.js              # Donation schema definition
│   └── Activity.js              # Activity logging schema
├── Routes
│   ├── authRoutes.js            # Authentication endpoints
│   ├── campaignRoutes.js        # Campaign endpoints
│   ├── adminRoutes.js           # Admin endpoints
│   └── paymentRoutes.js         # Payment endpoints
├── Middleware
│   ├── auth.js                  # JWT authentication
│   ├── validation.js            # Input validation
│   ├── errorHandler.js          # Error handling
│   └── upload.js                # File upload handling
└── Services
    ├── emailService.js          # Email notifications
    ├── paymentService.js        # Razorpay integration
    └── fileService.js           # File management
```

## Database Architecture

### MongoDB Schema Design

#### Entity Relationship Model
```
Users (1) ──────── (*) Campaigns
  │                      │
  │                      │
  │                      ▼
  │                 (*) Donations
  │                      │
  │                      │
  ▼                      ▼
(*) Activities      (*) Comments
```

#### Collection Schemas

**Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['admin', 'company', 'ngo', 'donor']),
  profile: {
    phone: String,
    address: String,
    profileImage: String
  },
  organizationDetails: {
    name: String,
    registrationNumber: String,
    documents: [String]
  },
  isApproved: Boolean,
  createdAt: Date
}
```

**Campaigns Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  goalAmount: Number,
  raisedAmount: Number,
  category: String,
  createdBy: ObjectId (ref: 'User'),
  images: [String],
  documents: [String],
  status: String (enum: ['active', 'completed', 'paused']),
  createdAt: Date
}
```

## Data Flow Architecture

### Authentication Flow
```
1. User Login Request
   │
   ▼
2. Validate Credentials
   │
   ▼
3. Generate JWT Token
   │
   ▼
4. Return Token + User Info
   │
   ▼
5. Store Token (Frontend)
   │
   ▼
6. Include Token in API Requests
   │
   ▼
7. Verify Token (Middleware)
   │
   ▼
8. Grant/Deny Access
```

### Donation Processing Flow
```
1. User Selects Campaign
   │
   ▼
2. Enter Donation Amount
   │
   ▼
3. Create Razorpay Order
   │
   ▼
4. Payment Gateway Redirect
   │
   ▼
5. Payment Processing
   │
   ▼
6. Payment Verification
   │
   ▼
7. Update Campaign Amount
   │
   ▼
8. Create Donation Record
   │
   ▼
9. Send Confirmation Email
   │
   ▼
10. Display Success Page
```

### Campaign Management Flow
```
1. NGO Creates Campaign
   │
   ▼
2. Upload Images/Documents
   │
   ▼
3. Submit for Review
   │
   ▼
4. Admin Approval Process
   │
   ▼
5. Campaign Goes Live
   │
   ▼
6. Donors Can Contribute
   │
   ▼
7. Real-time Progress Updates
   │
   ▼
8. Campaign Completion
```

## Security Architecture

### Multi-Layer Security Implementation

#### 1. Authentication Layer
```
JWT Token-based Authentication
├── Token Generation (24-hour expiry)
├── Token Verification Middleware
├── Role-based Access Control
└── Secure Token Storage
```

#### 2. Authorization Layer
```
Role-based Permissions
├── Admin: Full system access
├── Company: CSR management access
├── NGO: Campaign creation access
└── Donor: Donation and profile access
```

#### 3. Data Security Layer
```
Data Protection Measures
├── Password Hashing (bcrypt)
├── Input Validation & Sanitization
├── SQL Injection Prevention
├── XSS Protection
└── CORS Configuration
```

#### 4. Transport Security Layer
```
Network Security
├── HTTPS Encryption
├── Secure Headers (Helmet.js)
├── Rate Limiting
└── CSRF Protection
```

## API Architecture

### RESTful API Design

#### Endpoint Structure
```
/api/auth/*              # Authentication endpoints
/api/users/*             # User management
/api/campaigns/*         # Campaign operations
/api/donations/*         # Donation processing
/api/admin/*             # Admin panel operations
/api/payment/*           # Payment gateway integration
/api/public/*            # Public information endpoints
```

#### Standard Response Format
```javascript
{
  success: boolean,
  message: string,
  data: object | array,
  pagination: {
    page: number,
    limit: number,
    total: number,
    pages: number
  },
  timestamp: string
}
```

## Deployment Architecture

### Development Environment
```
Local Development
├── Frontend: React Dev Server (Port 3000)
├── Backend: Node.js Express Server (Port 5000)
├── Database: Local MongoDB Instance (Port 27017)
└── File Storage: Local File System
```

### Production Environment (Replit)
```
Replit Production
├── Frontend: Vite Build (Static Files)
├── Backend: PM2 Process Manager
├── Database: MongoDB Atlas
├── File Storage: Replit File System
├── Domain: Custom Replit Domain
└── SSL: Automatic HTTPS
```

## Performance Considerations

### Database Optimization
- **Indexing Strategy**: Compound indexes on frequently queried fields
- **Query Optimization**: Aggregation pipelines for complex queries
- **Connection Pooling**: Optimized MongoDB connection management

### Application Performance
- **Code Splitting**: Lazy loading for route components
- **Caching**: In-memory caching for frequently accessed data
- **File Optimization**: Compressed image uploads and optimized file storage

### Frontend Performance
- **Bundle Optimization**: Tree shaking and code minification
- **Image Optimization**: Responsive images with lazy loading
- **State Management**: Efficient React context usage

## Scalability Design

### Horizontal Scaling Capabilities
- **Stateless Architecture**: JWT-based authentication for multiple server instances
- **Database Scaling**: MongoDB replica sets and sharding support
- **Load Balancing**: Ready for load balancer implementation

### Future Enhancement Points
- **Microservices Migration**: Modular design supports service extraction
- **API Gateway**: Ready for API gateway implementation
- **Caching Layer**: Redis integration points identified
- **CDN Integration**: Static asset delivery optimization

This architecture provides a solid foundation for the donation platform with clear scalability paths and robust security measures while maintaining development efficiency and code maintainability.
