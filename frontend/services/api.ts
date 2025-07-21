



import type { User, Campaign, Notice, Task, Donation, DashboardData, SystemHealth, SecurityDashboardData } from './types.ts';

const API_BASE = 'http://localhost:5000/api';
export const API_SERVER_URL = 'http://localhost:5000';
export const DEFAULT_IMAGE_URL = `${API_SERVER_URL}/uploads/default-image.jpeg`;


// Helper to get token from localStorage
const getToken = () => localStorage.getItem('authToken');

// Generic request helper
async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(url, { ...options, headers });

  const responseData = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(responseData.message || `HTTP error! status: ${response.status}`);
  }

  return responseData;
}

const makeAbsoluteUrl = (path?: string | null): string => {
    if (!path || path.trim() === '') {
        return DEFAULT_IMAGE_URL;
    }
    // If it's a data URL or already absolute, return as is.
    if (path.startsWith('http') || path.startsWith('data:')) {
        return path;
    }
    const cleanedPath = path.startsWith('/') ? path : `/${path}`;
    return `${API_SERVER_URL}${cleanedPath}`;
};


// Data Transformation Layer
export const transformBackendCampaign = (backendCampaign: any): Campaign => {
  const organizer = backendCampaign.ngoId || { 
    fullName: 'Unknown', 
    avatar: '', 
    _id: '', 
    approvalStatus: 'pending', 
    isActive: false 
  };
  const goal = backendCampaign.targetAmount || backendCampaign.goalAmount || 0;
  const raised = backendCampaign.currentAmount || backendCampaign.raisedAmount || 0;

  let status: Campaign['status'] = 'disabled';
  if (backendCampaign.isActive) {
    if (raised >= goal && goal > 0) {
      status = 'completed';
    } else {
      status = 'active';
    }
  }

  const organizerName = typeof backendCampaign.organizer === 'string' 
      ? backendCampaign.organizer 
      : (organizer.ngoName || organizer.fullName || 'Unknown');

  const rawImages = backendCampaign.images || [];

  return {
    ...backendCampaign,
    id: backendCampaign._id,
    _id: backendCampaign._id,
    title: backendCampaign.title,
    slug: (backendCampaign.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
    thumbnail: makeAbsoluteUrl(rawImages.length > 0 ? rawImages[0] : null),
    organizer: organizerName,
    organizerId: organizer._id,
    organizerLogo: makeAbsoluteUrl(organizer.avatar),
    description: (backendCampaign.description || '').substring(0, 100) + '...',
    fullDescription: backendCampaign.fullDescription || backendCampaign.description || backendCampaign.explainStory || 'Full description not provided.',
    goal,
    raised,
    category: backendCampaign.category || 'Health',
    location: backendCampaign.location || 'India',
    verified: organizer.approvalStatus === 'approved' && organizer.isActive,
    urgent: backendCampaign.isUrgent || false,
    images: rawImages.map(makeAbsoluteUrl),
    documents: (backendCampaign.documents || []).map(makeAbsoluteUrl),
    proofs: (backendCampaign.proofs || backendCampaign.proofDocs || []).map(makeAbsoluteUrl),
    status,
    endDate: backendCampaign.endDate,
    isActive: backendCampaign.isActive,
    approvalStatus: backendCampaign.approvalStatus || 'pending',
  };
};

export const transformBackendUser = (backendUser: any): User => {
  let status: 'active' | 'pending' | 'disabled';
  const isApproved = backendUser.approvalStatus === 'approved';

  if (isApproved && backendUser.isActive) {
      status = 'active';
  } else if (!isApproved && backendUser.approvalStatus === 'pending') {
      status = 'pending';
  } else {
      status = 'disabled';
  }

  const name = backendUser.fullName || backendUser.name;
  const profileData = backendUser.profile || {};

  return {
    id: backendUser._id,
    _id: backendUser._id,
    username: (name || '').toLowerCase().replace(/\s+/g, '_'),
    name: name,
    fullName: name,
    email: backendUser.email,
    phoneNumber: backendUser.phoneNumber,
    role: backendUser.role,
    status: status,
    avatar: makeAbsoluteUrl(backendUser.profileImage),
    createdAt: backendUser.createdAt,
    isActive: backendUser.isActive,
    approvalStatus: backendUser.approvalStatus,
    profile: {
      _id: profileData._id,
      description: backendUser.description || profileData.description,
      address: backendUser.address || profileData.address || profileData.companyAddress,
      website: backendUser.website || profileData.website,
      documents: (profileData.documents || []).map(makeAbsoluteUrl),
      ...profileData
    }
  };
};

// === API ENDPOINTS ===

// Authentication Endpoints
export const authAPI = {
  login: (credentials: { email: string, password: string }) => 
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  signup: (userData: any) => 
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  logout: () => 
    request('/auth/logout', {
      method: 'POST',
    }),

  refreshToken: () => 
    request('/auth/refresh', {
      method: 'POST',
    }),

  verifyEmail: (token: string) => 
    request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  forgotPassword: (email: string) => 
    request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }),

  resetPassword: (token: string, password: string) => 
    request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    }),
};

// Payment Gateway API
export const paymentAPI = {
  createOrder: (donationData: any) => 
    request('/payment/create-order', {
      method: 'POST',
      body: JSON.stringify(donationData),
    }),
  verifyPayment: (paymentVerificationData: any) =>
    request('/payment/verify', {
      method: 'POST',
      body: JSON.stringify(paymentVerificationData)
    }),
};

// Public API (assumed endpoint)
export const publicAPI = {
  getSettings: () => request('/settings/public'),
};

// User Profile Endpoints
export const userAPI = {
  getProfile: async () => {
    const response = await request('/user/profile');
    return transformBackendUser(response.user || response);
  },

  updateProfile: (profileData: any) => 
    request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  uploadAvatar: (formData: FormData) => 
    request('/user/avatar', {
      method: 'POST',
      body: formData,
    }),

  changePassword: (currentPassword: string, newPassword: string) => 
    request('/user/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  deleteAccount: () => 
    request('/user/account', {
      method: 'DELETE',
    }),
};

// Campaign Endpoints
export const campaignAPI = {
  // Public campaigns
  getPublic: async (): Promise<Campaign[]> => {
    const data = await request('/public/campaigns');
    const campaigns = data.campaigns || (Array.isArray(data) ? data : []);
    return campaigns.map(transformBackendCampaign);
  },

  getById: async (campaignId: string): Promise<Campaign | null> => {
    try {
      const data = await request(`/campaigns/${campaignId}`);
      return transformBackendCampaign(data);
    } catch (error) {
      return null;
    }
  },

  getBySlug: async (slug: string): Promise<Campaign | null> => {
    try {
      const data = await request(`/campaigns/slug/${slug}`);
      return transformBackendCampaign(data);
    } catch (error) {
      return null;
    }
  },

  // User campaigns
  getUserCampaigns: async (): Promise<Campaign[]> => {
    const data = await request('/campaigns/my-campaigns');
    const campaigns = data.campaigns || (Array.isArray(data) ? data : []);
    return campaigns.map(transformBackendCampaign);
  },

  create: (campaignData: any) => 
    request('/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    }),

  update: (campaignId: string, campaignData: any) => 
    request(`/campaigns/${campaignId}`, {
      method: 'PUT',
      body: JSON.stringify(campaignData),
    }),

  delete: (campaignId: string) => 
    request(`/campaigns/${campaignId}`, {
      method: 'DELETE',
    }),

  uploadImages: (campaignId: string, formData: FormData) => 
    request(`/campaigns/${campaignId}/images`, {
      method: 'POST',
      body: formData,
      headers: {},
    }),
};

// Donation Endpoints
export const donationAPI = {
  create: (donationData: any) => 
    request('/donations/new', {
      method: 'POST',
      body: JSON.stringify(donationData),
    }),

  getUserDonations: () => 
    request('/donations/my-donations'),

  getCampaignDonations: (campaignId: string) => 
    request(`/donations/campaign/${campaignId}`),

  processPayment: (paymentData: any) => 
    request('/donations/process-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    }),
};

// Organization Endpoints
export const organizationAPI = {
  getPublic: async () => {
    const [ngoData, companyData] = await Promise.allSettled([
      request('/organizations/ngos/public'),
      request('/organizations/companies/public')
    ]);

    const ngos = ngoData.status === 'fulfilled' ? 
      (ngoData.value.ngos || ngoData.value || []) : [];
    const companies = companyData.status === 'fulfilled' ? 
      (companyData.value.companies || companyData.value || []) : [];

    return {
      ngos: ngos.map(transformBackendUser),
      companies: companies.map(transformBackendUser)
    };
  },
  
  getCompanies: async (): Promise<User[]> => {
     const data = await request('/organizations/companies/public');
     const companies = data.companies || (Array.isArray(data) ? data : []);
     return companies.map(transformBackendUser);
  },

  getNgos: async (): Promise<User[]> => {
     const data = await request('/organizations/ngos/public');
     const ngos = data.ngos || (Array.isArray(data) ? data : []);
     return ngos.map(transformBackendUser);
  },

  getByUsername: async (username: string) => {
    const { ngos, companies } = await organizationAPI.getPublic();
    const allOrgs = [...ngos, ...companies];

    const user = allOrgs.find(u => u.username === username);
    if (!user) {
      throw new Error('Organization profile not found.');
    }

    let campaigns: Campaign[] = [];
    if (user.role === 'ngo') {
      const publicCampaigns = await campaignAPI.getPublic();
      campaigns = publicCampaigns.filter(c => c.organizerId === user._id);
    }

    return { user, campaigns };
  },
};

// User Task Management API
export const taskAPI = {
  getTasks: (filters: { page?: number; limit?: number; status?: string; priority?: string; category?: string; search?: string; startDate?: string; endDate?: string }) => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
            queryParams.append(key, value.toString());
        }
    });
    return request(`/user/tasks?${queryParams.toString()}`);
  },

  createTask: (taskData: Partial<Task>) => request('/user/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  }),

  getTaskById: (id: string) => request(`/user/tasks/${id}`),

  updateTask: (id: string, taskData: Partial<Task>) => request(`/user/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData)
  }),

  deleteTask: (id: string) => request(`/user/tasks/${id}`, {
    method: 'DELETE'
  }),

  markTaskComplete: (id: string) => request(`/user/tasks/${id}/complete`, {
    method: 'PATCH'
  }),

  getCalendarView: (params: { year: number; month: number }) => request(`/user/tasks/calendar/view?year=${params.year}&month=${params.month}`),

  getTodaysTasks: () => request('/user/tasks/today/list'),

  getUpcomingTasks: () => request('/user/tasks/upcoming/list')
};

// NGO Endpoints
export const ngoAPI = {
    getDashboard: () => request('/ngo/dashboard'),
    getReports: (filters: any) => request('/ngo/reports', {
        method: 'POST',
        body: JSON.stringify(filters)
    }),
};

// Company Endpoints
export const companyAPI = {
    getDashboard: () => request('/company/dashboard'),
    getDonationHistory: (filters: any) => request('/company/donations', {
        method: 'POST',
        body: JSON.stringify(filters)
    }),
};

// Donor Endpoints
export const donorAPI = {
    getDashboard: () => request('/donor/dashboard'),
    getDonationHistory: (filters: any) => request('/donor/donations', {
        method: 'POST',
        body: JSON.stringify(filters)
    }),
};

// Admin Endpoints
export const adminAPI = {
  // Users Management
  getUsers: async (filters?: { page?: number; limit?: number; role?: string; approvalStatus?: string; search?: string }): Promise<{ users: User[]; pagination?: any }> => {
    const queryParams = new URLSearchParams();
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.role && filters.role !== 'all') queryParams.append('role', filters.role);
    if (filters?.approvalStatus && filters.approvalStatus !== 'all') queryParams.append('approvalStatus', filters.approvalStatus);
    if (filters?.search) queryParams.append('search', filters.search);

    const queryString = queryParams.toString();
    const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';

    const response = await request(endpoint);
    const data = response.data || response;
    const users = data.users || (Array.isArray(data) ? data : []);

    return {
      users: users.map(transformBackendUser),
      pagination: data.pagination
    };
  },

  getAllUsers: async (): Promise<User[]> => {
    try {
      const { users } = await adminAPI.getUsers({ limit: 1000 });
      return users;
    } catch (error) {
      console.error("Failed to fetch all users:", error);
      return [];
    }
  },

  getUserById: async (userId: string): Promise<{ user: User, stats: any, activities: any[], campaigns: Campaign[] } | null> => {
    try {
        const response = await request(`/admin/users/${userId}`);
        const userProfile = response?.userProfile;

        if (!userProfile?.user?._id) {
            console.error("User profile structure not found in response for ID:", userId, response);
            return null;
        }

        const combinedUserData = {
            ...userProfile.user,
            profile: userProfile.profile,
        };

        return {
            user: transformBackendUser(combinedUserData),
            stats: userProfile.stats || {},
            activities: (userProfile.activities || []).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
            campaigns: (userProfile.campaigns || []).map(transformBackendCampaign)
        };

    } catch (error) {
        console.error(`Error fetching user by ID ${userId}:`, error);
        return null;
    }
  },

  createUser: (userData: any) => 
    request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  updateUser: (userId: string, userData: any) => 
    request(`/admin/users/${userId}/details`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  updateUserProfile: (userId: string, profileData: any) =>
    request(`/admin/users/${userId}/profile`, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  approveUser: (userId: string, status: 'approved' | 'rejected') => 
    request(`/admin/users/${userId}/approval`, {
      method: 'PUT',
      body: JSON.stringify({ approvalStatus: status }),
    }),

  toggleUserStatus: (user: User) => {
    return request(`/admin/users/${user._id}/details`, {
      method: 'PUT',
      body: JSON.stringify({ isActive: !user.isActive }),
    });
  },

  deleteUser: (userId: string) => request(`/admin/users/${userId}/complete`, {
      method: 'DELETE',
  }),

  // Profile image uploads
  uploadUserProfileImage: (userId: string, imageFile: File) => {
      const formData = new FormData();
      formData.append('profileImage', imageFile);
      return request(`/admin/users/${userId}/profile-image`, {
          method: 'PUT',
          body: formData,
      });
  },

  uploadAdminProfileImage: (imageFile: File) => {
      const formData = new FormData();
      formData.append('profileImage', imageFile);
      return request('/admin/profile-image', {
          method: 'PUT',
          body: formData,
      });
  },

  uploadCompanyDocuments: async (userId: string, documentFiles: File[]) => {
    const formData = new FormData();
    documentFiles.forEach(file => formData.append('documents', file));
    // NOTE: This is an assumed endpoint.
    return request(`/admin/users/${userId}/documents`, {
        method: 'POST',
        body: formData,
    });
  },

  // Settings Management
  getSettings: () => request('/admin/settings'),

  generateNgoShareLink: (profileId: string) => 
    request(`/admin/ngos/${profileId}/share`, { method: 'POST' }),

  generateCompanyShareLink: (profileId: string) => 
    request(`/admin/companies/${profileId}/share`, { method: 'POST' }),

  getShareablePageDesign: async (shareId: string) => {
    const response = await request(`/admin/share/${shareId}/customize`);
    return response.customDesign || {};
  },

  updateShareablePageDesign: (shareId: string, design: { html: string; css: string; additionalData?: any }) =>
    request(`/admin/share/${shareId}/customize`, {
      method: 'PUT',
      body: JSON.stringify({ customDesign: design }),
    }),

  getNgos: async (): Promise<User[]> => {
    const { users } = await adminAPI.getUsers({ role: 'ngo', approvalStatus: 'approved', limit: 1000 });
    return users;
  },

  // Campaigns Management
  getCampaigns: async (filters: { page?: number; limit?: number; status?: string; approvalStatus?: string; search?: string }): Promise<{ campaigns: Campaign[]; pagination?: any }> => {
    const queryParams = new URLSearchParams();
    if (filters.page) queryParams.append('page', filters.page.toString());
    if (filters.limit) queryParams.append('limit', filters.limit.toString());
    if (filters.status && filters.status !== 'all') queryParams.append('status', filters.status);
    if (filters.approvalStatus && filters.approvalStatus !== 'all') queryParams.append('approvalStatus', filters.approvalStatus);
    if (filters.search) queryParams.append('search', filters.search);

    const queryString = queryParams.toString();
    const endpoint = `/admin/campaigns?${queryString}`;

    const response = await request(endpoint);
    const campaigns = response.data?.campaigns || response.campaigns || (Array.isArray(response) ? response : []);

    return {
      campaigns: campaigns.map(transformBackendCampaign),
      pagination: response.data?.pagination || response.pagination
    };
  },

  getCampaignById: async (campaignId: string): Promise<Campaign | null> => {
    const data = await request(`/admin/campaigns/${campaignId}`);
    return data ? transformBackendCampaign(data.campaign || data) : null;
  },

  createCampaign: (campaignData: any) =>
    request('/admin/campaigns', {
      method: 'POST',
      body: JSON.stringify(campaignData),
    }),

  updateCampaign: (campaignId: string, campaignData: any) =>
    request(`/admin/campaigns/${campaignId}`, {
      method: 'PUT',
      body: JSON.stringify(campaignData),
    }),

  updateCampaignStatus: (campaignId: string, isActive: boolean) =>
    request(`/admin/campaigns/${campaignId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ isActive }),
    }),

  deleteCampaign: (campaignId: string) => 
    request(`/admin/campaigns/${campaignId}`, {
      method: 'DELETE',
    }),

  approveCampaign: (campaignId: string, status: 'approved' | 'rejected') => 
    adminAPI.updateCampaign(campaignId, { approvalStatus: status }),

  generateCampaignShareLink: (campaignId: string) => 
    request(`/admin/campaigns/${campaignId}/share`, { method: 'POST' }),

  deleteCampaignFile: (campaignId: string, filePath: string) => {
    // The filePath from frontend will be a full URL, e.g., http://localhost:5000/uploads/....
    // Backend likely needs the relative path.
    const relativePath = new URL(filePath).pathname;
    return request(`/admin/campaigns/${campaignId}/file`, {
        method: 'DELETE',
        body: JSON.stringify({ filePath: relativePath })
    });
  },

  // Campaign file uploads
  uploadCampaignImages: async (campaignId: string, imageFiles: File[]) => {
      const formData = new FormData();
      imageFiles.forEach(file => formData.append('image', file));
      return request(`/admin/campaigns/${campaignId}/images`, {
          method: 'POST',
          body: formData,
      });
  },

  uploadCampaignDocuments: async (campaignId: string, documentFiles: File[]) => {
      const formData = new FormData();
      documentFiles.forEach(file => formData.append('documents', file));
      return request(`/admin/campaigns/${campaignId}/documents`, {
          method: 'POST',
          body: formData,
      });
  },

  uploadCampaignProofs: async (campaignId: string, proofFiles: File[]) => {
      const formData = new FormData();
      proofFiles.forEach(file => formData.append('proof', file));
      return request(`/admin/campaigns/${campaignId}/proof`, {
          method: 'POST',
          body: formData,
      });
  },


  // Notice Management
  noticeAPI: {
    getNotices: (filters: { page?: number; limit?: number; type?: string; priority?: string; search?: string; status?: string, targetRole?: string }) => {
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                queryParams.append(key, value.toString());
            }
        });
        const queryString = queryParams.toString();
        return request(`/admin/notices?${queryString}`);
    },
    createNotice: (data: Partial<Notice>) => request('/admin/notices', {
        method: 'POST',
        body: JSON.stringify(data),
    }),
    getNoticeById: (id: string): Promise<Notice> => request(`/admin/notices/${id}`),
    updateNotice: (id: string, data: Partial<Notice>) => request(`/admin/notices/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteNotice: (id: string) => request(`/admin/notices/${id}`, {
        method: 'DELETE',
    }),
  },

  // Donation Management
  donations: {
    getDonations: (filters: { page?: number; limit?: number; status?: string; search?: string }) => {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
          if (value && value !== 'all') {
              queryParams.append(key, value.toString());
          }
      });
      return request(`/admin/donations?${queryParams.toString()}`);
    },
    updateDonation: (id: string, data: Partial<Donation>) => request(`/admin/donations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    }),
    deleteDonation: (id: string) => request(`/admin/donations/${id}`, {
        method: 'DELETE',
    }),
  },

  // Settings Management
  settingsAPI: {
    getSettings: () => request('/admin/settings'),
    updateAppearanceSettings: (settings: any) => request('/admin/settings/appearance', {
      method: 'PUT',
      body: JSON.stringify(settings)
    }),
    updateRateLimiter: (data: any) => request('/admin/settings', { 
      method: 'PUT', 
      body: JSON.stringify({ category: 'rate_limiting', settings: data }) 
    }),
    updateBranding: (data: any) => request('/admin/settings', { 
      method: 'PUT', 
      body: JSON.stringify({ category: 'branding', settings: data }) 
    }),
    uploadLogo: (formData: FormData) => request('/admin/branding/logo', { method: 'PUT', body: formData }),
    uploadFavicon: (formData: FormData) => request('/admin/branding/favicon', { method: 'PUT', body: formData }),
    updateEnvironment: (data: any) => request('/admin/settings', { 
      method: 'PUT', 
      body: JSON.stringify({ category: 'environment', settings: data }) 
    }),
    changeUserPassword: (userId: string, data: any) => request(`/admin/users/${userId}/password`, { method: 'PUT', body: JSON.stringify(data) }),
    resetSettings: (data: any) => request('/admin/settings/reset', { method: 'POST', body: JSON.stringify(data) })
  },


  // Dashboard & Reports
  dashboard: {
    getOverview: (timeRange: string = '30d'): Promise<DashboardData> => 
      request(`/admin/dashboard?timeRange=${timeRange}`),
    
    getSystemHealth: (): Promise<{success: boolean, data: SystemHealth}> => 
      request('/admin/dashboard/system-health'),
      
    getSecurity: (): Promise<{success: boolean, data: SecurityDashboardData}> =>
      request('/admin/dashboard/security'),
  },

  reportsAPI: {
    getUsersReport: async (filters: any) => {
        const queryParams = new URLSearchParams(filters);
        return request(`/admin/reports/users?${queryParams.toString()}`);
    },
    getCampaignsReport: async (filters: any) => {
        const queryParams = new URLSearchParams(filters);
        return request(`/admin/reports/campaigns?${queryParams.toString()}`);
    },
    getDonationsReport: async (filters: any) => {
        const queryParams = new URLSearchParams(filters);
        return request(`/admin/reports/donations?${queryParams.toString()}`);
    },
    getFinancialReport: async (filters: any) => {
        const queryParams = new URLSearchParams(filters);
        return request(`/admin/reports/financial?${queryParams.toString()}`);
    },
    exportReport: async (reportType: string, filters: any, format: 'pdf' | 'excel') => {
        const queryParams = new URLSearchParams({ ...filters, export: format });
        const url = `${API_BASE}/admin/reports/${reportType}?${queryParams.toString()}`;
        const token = getToken();

        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `Failed to export report.`);
        }

        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `${reportType}-report-${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(downloadUrl);
    },
  },
};

// --- Public APIs ---
export const getSharedProfile = async (shareId: string): Promise<{ user: User, campaigns: Campaign[], customization?: { html: string; css: string } } | null> => {
    try {
        const response = await request(`/public/share/profile/${shareId}`);
        const data = response.data || response;

        // Based on logs, the main user object is nested inside profile.userId
        const userDetails = data.profile?.userId;

        if (!data || !data.profile || !userDetails?._id) {
            console.error("Shared profile data structure not found in response for share ID:", shareId, response);
            return null;
        }

        // Combine the user details from `profile.userId` and the profile shell from `profile`
        // so that transformBackendUser can process it correctly.
        const combinedUserData = {
            ...userDetails, // has _id, fullName, email
            role: data.type, // role is at the top level of the data object
            profile: data.profile, // contains all NGO/Company specific fields
        };

        return {
            user: transformBackendUser(combinedUserData),
            campaigns: (data.campaigns || []).map(transformBackendCampaign),
            customization: data.customDesign
        };
    } catch (error) {
        console.error(`Error fetching shared profile with ID ${shareId}:`, error);
        return null;
    }
};

export const getSharedCampaign = async (shareId: string): Promise<{ campaign: Campaign } | null> => {
    try {
        const response = await request(`/public/share/campaign/${shareId}`);
        const data = response.data || response;

        if (!data || !data.campaign || !data.campaign._id) {
            console.error("Shared campaign data structure not found in response for share ID:", shareId, response);
            return null;
        }

        return {
            campaign: transformBackendCampaign(data.campaign),
        };
    } catch (error) {
        console.error(`Error fetching shared campaign with ID ${shareId}:`, error);
        return null;
    }
};

// Backwards compatibility - Legacy function exports
export const loginUser = authAPI.login;
export const signupUser = authAPI.signup;
export const logoutUser = authAPI.logout;
export const getProfileByUsername = organizationAPI.getByUsername;
export const getCampaignById = campaignAPI.getById;
export const getPublicCampaigns = campaignAPI.getPublic;
export const getAdminUsers = adminAPI.getAllUsers;
export const getAdminUserById = adminAPI.getUserById;
export const approveUser = (userId: string) => adminAPI.approveUser(userId, 'approved');
export const rejectUser = (userId: string) => adminAPI.approveUser(userId, 'rejected');
export const toggleUserStatus = adminAPI.toggleUserStatus;
export const createAdminUser = adminAPI.createUser;
export const updateUser = adminAPI.updateUser;
export const getAdminCampaigns = async () => (await adminAPI.getCampaigns({limit: 1000})).campaigns;
export const toggleCampaignStatus = (campaign: Campaign) => adminAPI.updateCampaignStatus(campaign._id, !campaign.isActive);
export const updateUserProfile = adminAPI.updateUserProfile;
export const deleteUser = adminAPI.deleteUser;
export const getShareablePageDesign = adminAPI.getShareablePageDesign;
export const updateShareablePageDesign = adminAPI.updateShareablePageDesign;

export type { User, Campaign, Notice, Task, Donation, DashboardData, SystemHealth, SecurityDashboardData };