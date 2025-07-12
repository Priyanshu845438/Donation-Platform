
# Authentication API Endpoints

Base URL: `/api/auth`

## Authentication Endpoints

### 1. Setup Admin
**POST** `/setup-admin`

Creates the default admin account. This should be called once during initial setup.

**Request Body:** None required

**Response (201):**
```json
{
  "message": "Default admin created successfully"
}
```

**Response (400):**
```json
{
  "message": "Admin already exists"
}
```

### 2. User Registration
**POST** `/register`

Register a new user (NGO, Company, or Donor).

**Request Body:**
```json
{
  "fullName": "string (required)",
  "email": "string (required, unique)",
  "password": "string (required, min 6 chars)",
  "phoneNumber": "string (required)",
  "role": "NGO|Company|Donor (required)"
}
```

**Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "string",
    "fullName": "string",
    "email": "string",
    "role": "string",
    "isActive": true,
    "approvalStatus": "Pending"
  }
}
```

**Response (400):**
```json
{
  "message": "User already exists with this email"
}
```

### 3. User Login
**POST** `/login`

Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "string (required)",
  "password": "string (required)",
  "role": "string (required)"
}
```

**Response (200):**
```json
{
  "message": "Login successful",
  "token": "jwt_token_string",
  "user": {
    "_id": "string",
    "fullName": "string",
    "email": "string",
    "role": "string",
    "isActive": true,
    "approvalStatus": "string"
  }
}
```

**Response (401):**
```json
{
  "message": "Invalid credentials"
}
```

**Response (404):**
```json
{
  "message": "No user found with this email and role combination"
}
```

### 4. Get Profile
**GET** `/profile`

Get current user's profile information with role-specific data.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Profile retrieved successfully",
  "entity": {
    // Profile data varies by role:
    // - Admin: Basic user info
    // - NGO: User info + NGO profile
    // - Company: User info + Company profile
    // - Donor: Basic user info
  }
}
```

**Response (401):**
```json
{
  "message": "Access denied. No token provided."
}
```

### 5. Update Profile
**PUT** `/profile`

Update user profile with role-specific data and optional file upload.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Form Data:**
```
// Common fields for all roles:
fullName: string (optional)
phoneNumber: string (optional)
profileImage: File (optional)

// NGO-specific fields:
ngoName: string
registrationNumber: string
description: string
website: string
// ... other NGO fields

// Company-specific fields:
companyName: string
registrationNumber: string
industry: string
website: string
// ... other company fields
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "entity": {
    // Updated profile data
  }
}
```

### 6. Logout
**POST** `/logout`

Logout user (primarily for client-side token invalidation).

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

### 7. Get User Activity
**GET** `/activity`

Get user's activity logs and recent actions.

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response (200):**
```json
{
  "message": "Activity retrieved successfully",
  "activities": [
    {
      "_id": "string",
      "userId": "string",
      "action": "string",
      "details": "string",
      "timestamp": "ISO date string",
      "ipAddress": "string"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50
  }
}
```

## Authentication Middleware

All protected routes use JWT token authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Token Information

- **Expiration**: 24 hours
- **Refresh**: Automatic refresh not implemented (user must login again)
- **Payload**: Contains user ID, role, and email

## Error Responses

All endpoints may return these error responses:

**400 Bad Request**
```json
{
  "message": "Validation error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Field-specific error message"
    }
  ]
}
```

**401 Unauthorized**
```json
{
  "message": "Access denied. No token provided."
}
```

**403 Forbidden**
```json
{
  "message": "Access denied. Insufficient permissions."
}
```

**409 Conflict**
```json
{
  "message": "User already exists with this email"
}
```

**500 Internal Server Error**
```json
{
  "message": "Internal server error",
  "error": "Error details (in development mode)"
}
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt
2. **JWT Tokens**: Secure token-based authentication
3. **Input Validation**: All inputs are validated and sanitized
4. **Rate Limiting**: (If implemented) Protects against brute force attacks
5. **CORS Protection**: Configured for secure cross-origin requests

## Usage Examples

### JavaScript/Fetch
```javascript
// Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    role: 'NGO'
  })
});

const data = await response.json();
const token = data.token;

// Use token for protected routes
const profileResponse = await fetch('/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

### cURL
```bash
# Login
curl -X POST http://0.0.0.0:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "role": "NGO"
  }'

# Get profile with token
curl -X GET http://0.0.0.0:5000/api/auth/profile \
  -H "Authorization: Bearer <your_token>"
```
