export const ADMIN_ENDPOINTS = {
  // Dashboard Analytics
  ANALYTICS: '/admin/dashboard/analytics',

  // User Management
  USERS: {
    LIST: '/users',
    CREATE: '/users',
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
    UPDATE_STATUS: (id: string) => `/users/${id}/status`,
    BULK_ACTION: '/users/bulk-action'
  },

  // Campaign Management
  CAMPAIGNS: {
    LIST: '/campaigns',
    CREATE: '/campaigns',
    UPDATE: (id: string) => `/campaigns/${id}`,
    DELETE: (id: string) => `/campaigns/${id}`,
    UPDATE_STATUS: (id: string) => `/campaigns/${id}/status`,
    BULK_ACTION: '/campaigns/bulk-action'
  },

  // Company Management
  COMPANIES: {
    LIST: '/companies',
    CREATE: '/companies',
    UPDATE: (id: string) => `/companies/${id}`,
    DELETE: (id: string) => `/companies/${id}`,
    UPDATE_STATUS: (id: string) => `/companies/${id}/status`,
    BULK_ACTION: '/companies/bulk-action'
  },

  // NGO Management
  NGOS: {
    LIST: '/ngo',
    CREATE: '/ngo',
    UPDATE: (id: string) => `/ngo/${id}`,
    DELETE: (id: string) => `/ngo/${id}`,
    UPDATE_STATUS: (id: string) => `/ngo/${id}/status`,
    BULK_ACTION: '/ngo/bulk-action'
  },

  // Donation Management
  DONATIONS: {
    LIST: '/donations/admin/all',
    STATS: '/donations/stats/overview',
    UPDATE_STATUS: (id: string) => `/donations/${id}/status`,
    EXPORT: '/donations/export'
  },

  // Reports
  REPORTS: {
    DONATIONS: '/donations',
    CAMPAIGNS: '/campaigns',
    USERS: '/admin/dashboard/users'
  }
};

// Helper function to build query parameters
export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  return searchParams.toString();
};