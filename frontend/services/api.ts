
import type { User, Campaign } from '../types.ts';

const API_BASE = 'http://localhost:5000/api';

// Helper to get token from localStorage
const getToken = () => localStorage.getItem('authToken');

// Generic request helper
async function request(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const headers = new Headers(options.headers);

  if (!headers.has('Content-Type')) {
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
  const raised = backendCampaign.currentAmount || 0;

  let status: Campaign['status'] = 'disabled';
  if (backendCampaign.isActive) {
    if (raised >= goal && goal > 0) {
      status = 'completed';
    } else {
      status = 'active';
    }
  }

  return {
    ...backendCampaign,
    id: backendCampaign._id,
    _id: backendCampaign._id,
    title: backendCampaign.title,
    slug: (backendCampaign.title || '').toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, ''),
    organizer: organizer.fullName,
    organizerId: organizer._id,
    organizerLogo: organizer.avatar || `https://picsum.photos/seed/${organizer.fullName}/100`,
    description: (backendCampaign.description || '').substring(0, 100) + '...',
    fullDescription: backendCampaign.fullDescription || backendCampaign.description || backendCampaign.explainStory || 'Full description not provided.',
    goal,
    raised,
    category: backendCampaign.category || 'Health',
    location: backendCampaign.location || 'India',
    verified: organizer.approvalStatus === 'approved' && organizer.isActive,
    urgent: backendCampaign.isUrgent || false,
    images: backendCampaign.images?.length > 0 ? backendCampaign.images : [`https://picsum.photos/seed/${backendCampaign.title || 'default'}/800/600`],
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
    avatar: backendUser.profileImage || `https://picsum.photos/seed/${name}/100`,
    createdAt: backendUser.createdAt,
    isActive: backendUser.isActive,
    approvalStatus: backendUser.approvalStatus,
    profile: {
      _id: profileData._id,
      description: backendUser.description || profileData.description,
      address: backendUser.address || profileData.address || profileData.companyAddress,
      website: backendUser.website || profileData.website,
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

// User Profile Endpoints
export const userAPI = {
  getProfile: () => 
    request('/user/profile'),

  updateProfile: (userData: any) => 
    request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    }),

  uploadAvatar: (formData: FormData) => 
    request('/user/avatar', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set multipart headers
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
    const data = await request('/campaigns/public');
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
    request('/donations', {
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

  deleteUser: (userId: string) => 
    request(`/admin/users/${userId}/complete`, {
      method: 'DELETE',
    }),
    
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


  // Dashboard & Reports
  getDashboardStats: async () => {
    try {
      const response = await request('/admin/dashboard/stats');
      const data = response.data || response;
      const overview = data.overview || {};

      return {
        totalUsers: overview.totalUsers || 0,
        totalCampaigns: overview.totalCampaigns || 0,
        totalDonations: overview.totalRaised || 0,
        pendingApprovals: (overview.pendingUsers || 0) + (overview.pendingCampaigns || 0),
        userDistribution: { 
          donor: (overview.totalUsers || 0) - (overview.totalNgos || 0) - (overview.totalCompanies || 0), 
          ngo: overview.totalNgos || 0, 
          company: overview.totalCompanies || 0 
        },
        campaignStatus: { 
          active: overview.activeCampaigns || 0, 
          completed: overview.completedCampaigns || 0,
          disabled: (overview.totalCampaigns || 0) - (overview.activeCampaigns || 0) - (overview.completedCampaigns || 0)
        },
        recentUsers: data.recentUsers || [],
        systemHealth: data.systemHealth || {}
      };
    } catch (error) {
      console.error("Dashboard API failed:", error);
      return {
        totalUsers: 0,
        totalCampaigns: 0,
        totalDonations: 0,
        pendingApprovals: 0,
        userDistribution: { donor: 0, ngo: 0, company: 0 },
        campaignStatus: { active: 0, completed: 0, disabled: 0 },
        recentUsers: [],
        systemHealth: {}
      };
    }
  },

  getReports: (reportType: string, params?: any) => 
    request(`/admin/reports/${reportType}`, {
      method: 'POST',
      body: JSON.stringify(params || {}),
    }),
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
export const getAdminDashboardStats = adminAPI.getDashboardStats;
export const updateUserProfile = adminAPI.updateUserProfile;
export const deleteUser = adminAPI.deleteUser;
export const getShareablePageDesign = adminAPI.getShareablePageDesign;
export const updateShareablePageDesign = adminAPI.updateShareablePageDesign;