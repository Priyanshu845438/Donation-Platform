
# Database Engineer Summary - Donation Platform

## Database Technology Stack

### Primary Database
- **MongoDB** (v5.0+) - NoSQL document database
- **Mongoose** (v7+) - Object Document Mapper (ODM)
- **MongoDB Atlas** - Cloud database hosting (production)
- **Local MongoDB** - Development environment

### Design Philosophy
- **Document-oriented** approach for flexible schema design
- **Embedded documents** for related data
- **Reference relationships** for normalized data
- **Horizontal scalability** for future growth

## ER Diagram and Schema Design

### Core Entities Relationship

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    Users    │    │ Campaigns   │    │ Donations   │
│             │    │             │    │             │
│ _id (PK)    │◄──┤ createdBy   │◄──┤ campaignId  │
│ name        │    │ _id (PK)    │    │ _id (PK)    │
│ email       │    │ title       │    │ amount      │
│ role        │    │ goalAmount  │    │ donorId     │
│ password    │    │ raisedAmount│    │ paymentId   │
└─────────────┘    └─────────────┘    └─────────────┘
       │                   │
       │                   │
       ▼                   ▼
┌─────────────┐    ┌─────────────┐
│ Activities  │    │  Comments   │
│             │    │             │
│ _id (PK)    │    │ _id (PK)    │
│ userId      │    │ campaignId  │
│ action      │    │ userId      │
│ timestamp   │    │ content     │
└─────────────┘    └─────────────┘
```

## Collection Structures

### 1. Users Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: ['admin', 'company', 'ngo', 'donor']),
  isApproved: Boolean (default: false),
  isActive: Boolean (default: true),
  profile: {
    phone: String,
    address: String,
    profileImage: String,
    dateOfBirth: Date,
    gender: String
  },
  organizationDetails: {  // For companies and NGOs
    organizationName: String,
    registrationNumber: String,
    website: String,
    description: String,
    logo: String,
    documents: [String],
    verificationStatus: String
  },
  preferences: {
    notifications: Boolean,
    newsletter: Boolean,
    language: String,
    theme: String
  },
  lastLogin: Date,
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### 2. Campaigns Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String (required),
  shortDescription: String,
  goalAmount: Number (required),
  raisedAmount: Number (default: 0),
  category: String (required),
  subcategory: String,
  tags: [String],
  
  createdBy: ObjectId (ref: 'User'),
  beneficiaryInfo: {
    name: String,
    age: Number,
    location: String,
    story: String
  },
  
  media: {
    images: [String],
    videos: [String],
    documents: [String]
  },
  
  timeline: {
    startDate: Date,
    endDate: Date,
    milestones: [{
      title: String,
      description: String,
      targetDate: Date,
      completed: Boolean,
      completedDate: Date
    }]
  },
  
  location: {
    country: String,
    state: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  status: String (enum: ['draft', 'active', 'completed', 'paused', 'cancelled']),
  featured: Boolean (default: false),
  urgent: Boolean (default: false),
  
  donorCount: Number (default: 0),
  shareCount: Number (default: 0),
  viewCount: Number (default: 0),
  
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}
```

### 3. Donations Collection
```javascript
{
  _id: ObjectId,
  campaignId: ObjectId (ref: 'Campaign'),
  donorId: ObjectId (ref: 'User'),
  
  amount: Number (required),
  currency: String (default: 'INR'),
  
  paymentDetails: {
    paymentId: String,
    orderId: String,
    signature: String,
    method: String,
    gateway: String (default: 'razorpay')
  },
  
  donorInfo: {
    name: String,
    email: String,
    phone: String,
    isAnonymous: Boolean (default: false)
  },
  
  message: String,
  dedicatedTo: String,
  
  status: String (enum: ['pending', 'completed', 'failed', 'refunded']),
  receiptGenerated: Boolean (default: false),
  receiptUrl: String,
  
  fees: {
    platformFee: Number,
    gatewayFee: Number,
    totalFees: Number
  },
  
  metadata: {
    ipAddress: String,
    userAgent: String,
    referrer: String
  },
  
  createdAt: Date (default: Date.now),
  processedAt: Date
}
```

### 4. Activities Collection (Audit Trail)
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User'),
  action: String (required),
  entityType: String (enum: ['user', 'campaign', 'donation', 'system']),
  entityId: ObjectId,
  
  details: {
    description: String,
    oldValue: Mixed,
    newValue: Mixed,
    additionalInfo: Mixed
  },
  
  metadata: {
    ipAddress: String,
    userAgent: String,
    timestamp: Date (default: Date.now),
    sessionId: String
  }
}
```

## Indexing Strategy

### Primary Indexes
```javascript
// Users Collection
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ role: 1, isApproved: 1 })
db.users.createIndex({ "organizationDetails.registrationNumber": 1 })

// Campaigns Collection  
db.campaigns.createIndex({ createdBy: 1 })
db.campaigns.createIndex({ status: 1, featured: 1 })
db.campaigns.createIndex({ category: 1, status: 1 })
db.campaigns.createIndex({ goalAmount: 1, raisedAmount: 1 })
db.campaigns.createIndex({ "location.city": 1, "location.state": 1 })
db.campaigns.createIndex({ createdAt: -1 })

// Donations Collection
db.donations.createIndex({ campaignId: 1, status: 1 })
db.donations.createIndex({ donorId: 1, createdAt: -1 })
db.donations.createIndex({ "paymentDetails.paymentId": 1 })
db.donations.createIndex({ status: 1, createdAt: -1 })

// Activities Collection
db.activities.createIndex({ userId: 1, "metadata.timestamp": -1 })
db.activities.createIndex({ entityType: 1, entityId: 1 })
db.activities.createIndex({ "metadata.timestamp": -1 })
```

### Compound Indexes for Complex Queries
```javascript
// Campaign search and filtering
db.campaigns.createIndex({ 
  status: 1, 
  category: 1, 
  featured: 1, 
  createdAt: -1 
})

// Donation analytics
db.donations.createIndex({ 
  campaignId: 1, 
  status: 1, 
  createdAt: -1 
})

// User activity tracking
db.activities.createIndex({ 
  userId: 1, 
  action: 1, 
  "metadata.timestamp": -1 
})
```

## Query Optimization Techniques

### 1. Aggregation Pipeline for Analytics
```javascript
// Campaign performance analytics
const campaignAnalytics = [
  {
    $match: { 
      status: 'active', 
      createdAt: { $gte: new Date('2024-01-01') } 
    }
  },
  {
    $lookup: {
      from: 'donations',
      localField: '_id',
      foreignField: 'campaignId',
      as: 'donations'
    }
  },
  {
    $addFields: {
      donationCount: { $size: '$donations' },
      totalRaised: { $sum: '$donations.amount' },
      averageDonation: { $avg: '$donations.amount' },
      completionPercentage: {
        $multiply: [
          { $divide: ['$raisedAmount', '$goalAmount'] },
          100
        ]
      }
    }
  },
  {
    $sort: { totalRaised: -1 }
  }
];
```

### 2. Efficient Pagination
```javascript
// Cursor-based pagination for large datasets
const paginateCampaigns = async (lastId, limit = 20) => {
  const query = lastId ? { _id: { $gt: lastId } } : {};
  
  return await Campaign.find(query)
    .sort({ _id: 1 })
    .limit(limit)
    .populate('createdBy', 'name organizationDetails.organizationName')
    .lean();
};
```

### 3. Text Search Implementation
```javascript
// Text search index
db.campaigns.createIndex({
  title: 'text',
  description: 'text',
  'beneficiaryInfo.story': 'text',
  tags: 'text'
})

// Search query
const searchCampaigns = async (searchTerm) => {
  return await Campaign.find(
    { $text: { $search: searchTerm } },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};
```

## Data Integrity Strategies

### 1. Schema Validation
```javascript
// Mongoose schema with validation
const campaignSchema = new mongoose.Schema({
  goalAmount: {
    type: Number,
    required: true,
    min: [100, 'Goal amount must be at least ₹100'],
    max: [10000000, 'Goal amount cannot exceed ₹1 crore']
  },
  email: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(v);
      },
      message: 'Please enter a valid email address'
    }
  }
});
```

### 2. Transaction Management
```javascript
// Multi-document transactions for donations
const processDonation = async (donationData) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    
    // Create donation record
    const donation = new Donation(donationData);
    await donation.save({ session });
    
    // Update campaign raised amount
    await Campaign.findByIdAndUpdate(
      donationData.campaignId,
      { 
        $inc: { 
          raisedAmount: donationData.amount,
          donorCount: 1
        }
      },
      { session }
    );
    
    // Log activity
    const activity = new Activity({
      userId: donationData.donorId,
      action: 'donation_made',
      entityType: 'donation',
      entityId: donation._id
    });
    await activity.save({ session });
    
    await session.commitTransaction();
    return donation;
    
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};
```

## Backup and Recovery Strategies

### 1. Automated Backup System
```javascript
// Daily backup script
const createBackup = async () => {
  const timestamp = new Date().toISOString().split('T')[0];
  const backupPath = `./backups/donation_platform_${timestamp}`;
  
  // MongoDB dump command
  const command = `mongodump --uri="${process.env.MONGO_URI}" --out=${backupPath}`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error('Backup failed:', error);
      return;
    }
    console.log('Backup completed successfully');
  });
};
```

### 2. Data Retention Policy
- **User Data**: Retained for 7 years after account deletion
- **Transaction Data**: Permanent retention for legal compliance
- **Activity Logs**: 2 years retention with monthly archival
- **File Uploads**: 5 years retention with cloud backup

## Performance Monitoring

### 1. Query Performance Metrics
```javascript
// Enable MongoDB profiler
db.setProfilingLevel(2, { slowms: 100 });

// Analyze slow queries
db.system.profile.find().sort({ ts: -1 }).limit(5);
```

### 2. Connection Pool Optimization
```javascript
// Mongoose connection options
const mongooseOptions = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  bufferMaxEntries: 0,
  useNewUrlParser: true,
  useUnifiedTopology: true
};
```

This database design ensures scalability, performance, and data integrity for the donation platform while maintaining flexibility for future enhancements.
