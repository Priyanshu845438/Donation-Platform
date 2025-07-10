module.exports = {
    // User roles
    USER_ROLES: {
        USER: 'user',
        COMPANY: 'company',
        NGO: 'ngo',
        ADMIN: 'admin'
    },

    // Campaign status
    CAMPAIGN_STATUS: {
        DRAFT: 'draft',
        ACTIVE: 'active',
        PAUSED: 'paused',
        COMPLETED: 'completed',
        CANCELLED: 'cancelled'
    },

    // Donation status
    DONATION_STATUS: {
        PENDING: 'pending',
        COMPLETED: 'completed',
        FAILED: 'failed',
        REFUNDED: 'refunded'
    },

    // Payment methods
    PAYMENT_METHODS: {
        CREDIT_CARD: 'credit_card',
        DEBIT_CARD: 'debit_card',
        NET_BANKING: 'net_banking',
        UPI: 'upi',
        WALLET: 'wallet'
    },

    // Upload configuration
    UPLOAD_CONFIG: {
        MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
        MAX_FILES: 10,
        ALLOWED_MIME_TYPES: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ]
    },

    // Activity types
    ACTIVITY_TYPES: {
        LOGIN: 'login',
        LOGOUT: 'logout',
        PROFILE_UPDATE: 'profile_update',
        CAMPAIGN_CREATE: 'campaign_create',
        CAMPAIGN_UPDATE: 'campaign_update',
        DONATION_MADE: 'donation_made',
        FILE_UPLOAD: 'file_upload'
    },

    // NGO types
    NGO_TYPES: {
        TRUST: 'trust',
        SOCIETY: 'society',
        FOUNDATION: 'foundation',
        SECTION_8: 'section_8',
        COOPERATIVE: 'cooperative'
    },

    // Company types
    COMPANY_TYPES: {
        PRIVATE: 'private',
        PUBLIC: 'public',
        PARTNERSHIP: 'partnership',
        LLP: 'llp',
        SOLE_PROPRIETORSHIP: 'sole_proprietorship'
    },

    // HTTP status codes
    HTTP_STATUS: {
        OK: 200,
        CREATED: 201,
        BAD_REQUEST: 400,
        UNAUTHORIZED: 401,
        FORBIDDEN: 403,
        NOT_FOUND: 404,
        CONFLICT: 409,
        INTERNAL_SERVER_ERROR: 500
    },

    // Pagination
    PAGINATION: {
        DEFAULT_PAGE: 1,
        DEFAULT_LIMIT: 10,
        MAX_LIMIT: 100
    },

    // Cache TTL (in seconds)
    CACHE_TTL: {
        SHORT: 300, // 5 minutes
        MEDIUM: 1800, // 30 minutes
        LONG: 3600 // 1 hour
    }
};
