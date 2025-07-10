/**
 * Application constants
 */

// HTTP Status Codes
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503,
    GATEWAY_TIMEOUT: 504
};

// User Roles
const USER_ROLES = {
    USER: 'user',
    COMPANY: 'company',
    NGO: 'ngo',
    ADMIN: 'admin'
};

// Campaign Categories
const CAMPAIGN_CATEGORIES = [
    'education',
    'healthcare',
    'environment',
    'poverty',
    'disaster-relief',
    'animal-welfare',
    'other'
];

// Campaign Status
const CAMPAIGN_STATUS = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    COMPLETED: 'completed',
    SUSPENDED: 'suspended',
    DRAFT: 'draft'
};

// Donation Status
const DONATION_STATUS = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
    CANCELLED: 'cancelled'
};

// Payment Methods
const PAYMENT_METHODS = {
    CREDIT_CARD: 'credit_card',
    DEBIT_CARD: 'debit_card',
    UPI: 'upi',
    NET_BANKING: 'net_banking',
    WALLET: 'wallet',
    BANK_TRANSFER: 'bank_transfer',
    CASH: 'cash'
};

// File Types
const ALLOWED_FILE_TYPES = {
    IMAGES: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    DOCUMENTS: ['.pdf', '.doc', '.docx'],
    ALL: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx']
};

// MIME Types
const ALLOWED_MIME_TYPES = {
    IMAGES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENTS: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    ALL: [
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp',
        'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
};

// File Size Limits (in bytes)
const FILE_SIZE_LIMITS = {
    IMAGE: 5 * 1024 * 1024, // 5MB
    DOCUMENT: 10 * 1024 * 1024, // 10MB
    DEFAULT: 5 * 1024 * 1024 // 5MB
};

// Activity Types
const ACTIVITY_TYPES = {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    REGISTER: 'REGISTER',
    UPDATE_PROFILE: 'UPDATE_PROFILE',
    CHANGE_PASSWORD: 'CHANGE_PASSWORD',
    CREATE_CAMPAIGN: 'CREATE_CAMPAIGN',
    UPDATE_CAMPAIGN: 'UPDATE_CAMPAIGN',
    DELETE_CAMPAIGN: 'DELETE_CAMPAIGN',
    DONATE: 'DONATE',
    FILE_UPLOAD: 'FILE_UPLOAD',
    VIEW_CAMPAIGN: 'VIEW_CAMPAIGN',
    VIEW_PROFILE: 'VIEW_PROFILE',
    ADMIN_LOGIN: 'ADMIN_LOGIN',
    ADMIN_UPDATE_USER: 'ADMIN_UPDATE_USER',
    ADMIN_UPDATE_CAMPAIGN: 'ADMIN_UPDATE_CAMPAIGN',
    ADMIN_DELETE_USER: 'ADMIN_DELETE_USER',
    ADMIN_DELETE_CAMPAIGN: 'ADMIN_DELETE_CAMPAIGN',
    OTHER: 'OTHER'
};

// Company Types
const COMPANY_TYPES = [
    'IT',
    'Manufacturing',
    'Healthcare',
    'Education',
    'Finance',
    'Retail',
    'Construction',
    'Agriculture',
    'Other'
];

// NGO Types
const NGO_TYPES = [
    'Trust',
    'Society',
    'Section 8 Company',
    'Partnership',
    'Other'
];

// Working Areas for NGOs
const NGO_WORKING_AREAS = [
    'Education',
    'Healthcare',
    'Environment',
    'Poverty Alleviation',
    'Women Empowerment',
    'Child Welfare',
    'Disaster Relief',
    'Animal Welfare',
    'Rural Development',
    'Other'
];

// Target Beneficiaries
const TARGET_BENEFICIARIES = [
    'Children',
    'Women',
    'Elderly',
    'Disabled',
    'Poor',
    'Students',
    'Farmers',
    'Workers',
    'All',
    'Other'
];

// Currencies
const CURRENCIES = {
    INR: 'INR',
    USD: 'USD',
    EUR: 'EUR',
    GBP: 'GBP'
};

// Languages
const LANGUAGES = [
    'english',
    'hindi',
    'tamil',
    'telugu',
    'bengali',
    'marathi',
    'gujarati',
    'kannada',
    'malayalam',
    'punjabi'
];

// Gender Options
const GENDER_OPTIONS = [
    'male',
    'female',
    'other',
    'prefer-not-to-say'
];

// Account Types
const ACCOUNT_TYPES = [
    'Savings',
    'Current',
    'Other'
];

// Notification Types
const NOTIFICATION_TYPES = {
    EMAIL: 'email',
    SMS: 'sms',
    PUSH: 'push',
    IN_APP: 'in_app'
};

// Stats Types
const STATS_TYPES = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    YEARLY: 'yearly'
};

// Pagination Defaults
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
};

// Rate Limiting
const RATE_LIMITS = {
    GENERAL: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 100
    },
    AUTH: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 5
    },
    UPLOAD: {
        WINDOW_MS: 15 * 60 * 1000, // 15 minutes
        MAX_REQUESTS: 10
    },
    DONATION: {
        WINDOW_MS: 60 * 1000, // 1 minute
        MAX_REQUESTS: 5
    }
};

// JWT Configuration
const JWT_CONFIG = {
    DEFAULT_EXPIRES_IN: '24h',
    REFRESH_THRESHOLD: 3600, // 1 hour in seconds
    ALGORITHM: 'HS256'
};

// Password Configuration
const PASSWORD_CONFIG = {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    SALT_ROUNDS: 12,
    RESET_TOKEN_EXPIRY: 3600000 // 1 hour in milliseconds
};

// Validation Patterns
const VALIDATION_PATTERNS = {
    EMAIL: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    PHONE_IN: /^[6-9]\d{9}$/, // Indian mobile number
    OBJECT_ID: /^[0-9a-fA-F]{24}$/,
    URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
    ALPHA: /^[a-zA-Z]+$/,
    NUMERIC: /^[0-9]+$/
};

// Error Messages
const ERROR_MESSAGES = {
    // Authentication
    INVALID_CREDENTIALS: 'Invalid email or password',
    ACCESS_DENIED: 'Access denied. Authentication required.',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions to perform this action',
    TOKEN_EXPIRED: 'Authentication token has expired',
    INVALID_TOKEN: 'Invalid authentication token',
    ACCOUNT_LOCKED: 'Account is temporarily locked due to multiple failed login attempts',
    ACCOUNT_INACTIVE: 'Account is deactivated. Please contact support.',
    
    // Validation
    REQUIRED_FIELD: 'This field is required',
    INVALID_EMAIL: 'Please provide a valid email address',
    INVALID_PHONE: 'Please provide a valid phone number',
    WEAK_PASSWORD: 'Password does not meet security requirements',
    INVALID_URL: 'Please provide a valid URL',
    INVALID_DATE: 'Please provide a valid date',
    INVALID_NUMBER: 'Please provide a valid number',
    
    // File Upload
    FILE_TOO_LARGE: 'File size exceeds the maximum allowed limit',
    INVALID_FILE_TYPE: 'File type is not supported',
    NO_FILE_UPLOADED: 'No file was uploaded',
    UPLOAD_FAILED: 'File upload failed. Please try again.',
    
    // Database
    DUPLICATE_ENTRY: 'A record with this information already exists',
    RECORD_NOT_FOUND: 'The requested record was not found',
    DATABASE_ERROR: 'A database error occurred. Please try again.',
    
    // Rate Limiting
    TOO_MANY_REQUESTS: 'Too many requests. Please try again later.',
    
    // General
    INTERNAL_SERVER_ERROR: 'An internal server error occurred',
    INVALID_REQUEST: 'Invalid request format',
    SERVICE_UNAVAILABLE: 'Service is temporarily unavailable'
};

// Success Messages
const SUCCESS_MESSAGES = {
    // Authentication
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    REGISTRATION_SUCCESS: 'Registration completed successfully',
    PASSWORD_CHANGED: 'Password changed successfully',
    
    // Profile
    PROFILE_UPDATED: 'Profile updated successfully',
    
    // Campaign
    CAMPAIGN_CREATED: 'Campaign created successfully',
    CAMPAIGN_UPDATED: 'Campaign updated successfully',
    CAMPAIGN_DELETED: 'Campaign deleted successfully',
    
    // Donation
    DONATION_SUCCESS: 'Donation completed successfully',
    
    // File Upload
    FILE_UPLOADED: 'File uploaded successfully',
    
    // General
    OPERATION_SUCCESS: 'Operation completed successfully'
};

// Email Templates
const EMAIL_TEMPLATES = {
    WELCOME: 'welcome',
    PASSWORD_RESET: 'password_reset',
    DONATION_RECEIPT: 'donation_receipt',
    CAMPAIGN_CREATED: 'campaign_created',
    CAMPAIGN_MILESTONE: 'campaign_milestone'
};

// Default Values
const DEFAULTS = {
    PROFILE_IMAGE: '/assets/default-avatar.png',
    COMPANY_LOGO: '/assets/default-company-logo.png',
    NGO_LOGO: '/assets/default-ngo-logo.png',
    CAMPAIGN_IMAGE: '/assets/default-campaign-image.png',
    COUNTRY: 'India',
    CURRENCY: 'INR',
    LANGUAGE: 'english',
    TIMEZONE: 'Asia/Kolkata'
};

// API Endpoints
const API_ENDPOINTS = {
    BASE: '/api',
    AUTH: '/api/auth',
    USERS: '/api/users',
    CAMPAIGNS: '/api/campaigns',
    DONATIONS: '/api/donations',
    COMPANIES: '/api/companies',
    NGOS: '/api/ngos',
    STATS: '/api/stats',
    ADMIN: '/api/admin',
    PAYMENTS: '/api/payments'
};

module.exports = {
    HTTP_STATUS,
    USER_ROLES,
    CAMPAIGN_CATEGORIES,
    CAMPAIGN_STATUS,
    DONATION_STATUS,
    PAYMENT_METHODS,
    ALLOWED_FILE_TYPES,
    ALLOWED_MIME_TYPES,
    FILE_SIZE_LIMITS,
    ACTIVITY_TYPES,
    COMPANY_TYPES,
    NGO_TYPES,
    NGO_WORKING_AREAS,
    TARGET_BENEFICIARIES,
    CURRENCIES,
    LANGUAGES,
    GENDER_OPTIONS,
    ACCOUNT_TYPES,
    NOTIFICATION_TYPES,
    STATS_TYPES,
    PAGINATION,
    RATE_LIMITS,
    JWT_CONFIG,
    PASSWORD_CONFIG,
    VALIDATION_PATTERNS,
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    EMAIL_TEMPLATES,
    DEFAULTS,
    API_ENDPOINTS
};
