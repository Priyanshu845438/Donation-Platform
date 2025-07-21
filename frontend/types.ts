

export interface User {
  _id: string;
  id: string;
  username: string;
  name: string;
  fullName: string;
  email: string;
  password?: string;
  phoneNumber?: string;
  role: 'admin' | 'ngo' | 'company' | 'donor';
  status: 'active' | 'pending' | 'disabled';
  avatar: string;
  createdAt: string;
  isActive: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  profile?: {
    _id?: string;
    description?: string;
    address?: string;
    website?: string;
    documents?: string[];
    // NGO specific
    ngoName?: string;
    registrationNumber?: string;
    registeredYear?: string;
    numberOfEmployees?: number;
    ngoType?: string;
    panNumber?: string;
    tanNumber?: string;
    gstNumber?: string;
    is80GCertified?: boolean;
    is12ACertified?: boolean;
    authorizedPerson?: {
        name?: string;
        phone?: string;
        email?: string;
    };
    bankDetails?: {
        accountHolderName?: string;
        accountNumber?: string;
        ifscCode?: string;
        bankName?: string;
        branchName?: string;
    };
    // Company specific
    companyName?: string;
    companyEmail?: string;
    companyPhoneNumber?: string;
    companyAddress?: string;
    companyType?: string;
    ceoName?: string;
    ceoContactNumber?: string;
    ceoEmail?: string;
  };
}

export interface Campaign {
  _id: string;
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  organizer: string;
  organizerId: string;
  organizerLogo: string;
  description: string;
  fullDescription: string;
  goal: number;
  raised: number;
  category: string;
  location: string;
  verified: boolean;
  urgent: boolean;
  images: string[];
  documents?: string[];
  proofs?: string[];
  status: 'active' | 'completed' | 'disabled';
  endDate: string;
  isActive: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  targetAmount?: number;
  ngoId?: { _id: string; fullName: string; avatar?: string; };
  // Add all other fields from API
  campaignName?: string;
  goalAmount?: number;
  currentAmount?: number;
  beneficiaries?: string;
  importance?: string;
  explainStory?: string;
  contactNumber?: string;
  donationLink?: string;
  createdBy?: string | User;
}

export interface Notice {
  _id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  targetRole: 'all' | 'ngo' | 'company' | 'donor' | 'admin';
  targetUsers?: string[];
  isActive: boolean;
  sendEmail?: boolean;
  scheduledAt?: string;
  createdBy: {
    _id: string;
    fullName: string;
  };
  createdAt: string;
  readBy: string[];
}


export interface Testimonial {
  id: number;
  name: string;
  role: string;
  quote: string;
  avatar: string;
}

export interface TeamMember {
  id: number;
  name:string;
  role: string;
  imageUrl: string;
}

export interface PolicyDocument {
  id: string;
  title: string;
  url: string;
  description: string;
}

export interface PolicyContent {
  title: string;
  content: string;
}

export interface UserReportStats {
  totalUsers: number;
  roleDistribution: { [key: string]: number };
  statusDistribution: { [key: string]: number };
  approvalDistribution: { [key: string]: number };
  monthlyRegistrations: { [key: string]: number };
}

export interface CampaignReportSummary {
    totalCampaigns: number;
    activeCampaigns: number;
    approvedCampaigns: number;
    totalTargetAmount: number;
    totalRaisedAmount: number;
    categoryDistribution: { [key: string]: number };
}

export interface DonationReportSummary {
    totalDonations: number;
    totalAmount: number;
    averageAmount: number;
    uniqueDonors: number;
    uniqueCampaigns: number;
    paymentMethodDistribution: { [key: string]: number };
    statusDistribution: { [key:string]: number };
    monthlyTrends: { [key: string]: { count: number; amount: number } };
}

export interface FinancialReportSummary {
    summary: {
      totalAmount: number;
      totalDonations: number;
      averageAmount: number;
    };
    ngoWiseCollection: {
        _id: string;
        ngoName: string;
        totalAmount: number;
        totalDonations: number;
        campaignCount: number;
    }[];
    monthlyTrends: {
        _id: { year: number; month: number };
        totalAmount: number;
        totalDonations: number;
    }[];
    categoryWiseDistribution: {
        _id: string;
        totalAmount: number;
        totalDonations: number;
    }[];
    reportPeriod: {
        startDate: string;
        endDate: string;
    };
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  dueDate: string;
  dueTime: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  category: 'meeting' | 'review' | 'approval' | 'maintenance' | 'deadline' | 'other';
  reminderBefore?: number;
  isRecurring?: boolean;
  recurringType?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringEndDate?: string;
  notes?: string;
  createdBy: string;
  reminderSent?: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  isOverdue?: boolean;
}

export interface TaskStats {
    total: number;
    pending: number;
    'in-progress': number;
    completed: number;
    cancelled: number;
    overdue: number;
}

export interface Donation {
  _id: string;
  donorId: {
    _id: string;
    fullName: string;
  };
  campaignId: {
    _id: string;
    title: string;
  };
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  transactionId: string;
  donationDate: string;
  isAnonymous: boolean;
  paymentMethod?: string;
}

// Admin Dashboard Types
export interface UserKPIs {
  total: number;
  active: number;
  growth: number;
  pending: number;
  activePercentage: number;
}

export interface OrganizationKPIs {
  ngos: {
    total: number;
    active: number;
    growth: number;
  };
  companies: {
    total: number;
    active: number;
    growth: number;
  };
}

export interface CampaignKPIs {
  total: number;
  active: number;
  growth: number;
  pending: number;
  stats?: {
    totalTarget: number;
    totalRaised: number;
    completionRate: number;
  };
}

export interface DonationKPIs {
  totalAmount: number;
  totalDonations: number;
  averageAmount: number;
}

export interface KPIs {
  users: UserKPIs;
  organizations: OrganizationKPIs;
  campaigns: CampaignKPIs;
  donations: DonationKPIs;
}

export interface SecurityMetrics {
  status: string;
  failedLogins24h: number;
  suspiciousActivities: number;
  riskScore: number;
}

export interface QuickActionData {
  pendingApprovals: number;
  flaggedActivities: number;
  systemAlerts: number;
  maintenanceRequired: boolean;
}

export interface Activity {
  _id: string;
  action: string;
  user?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  details: string;
  timestamp: string;
}

export interface Recommendation {
  _id: string;
  type: string;
  title: string;
  description: string;
  actionLink: string;
}

export interface DashboardData {
  success: boolean;
  timestamp: string;
  timeRange: string;
  kpis: KPIs;
  security: SecurityMetrics;
  quickActions: QuickActionData;
  recentActivities: Activity[];
  recommendations: Recommendation[];
  // For charts - assuming this data structure might be added later
  analytics?: {
    userGrowth: { date: string, count: number }[];
    donationTrend: { date: string, amount: number }[];
  }
}

export interface SystemHealth {
  server: {
    platform: string;
    arch: string;
    nodeVersion: string;
    uptime: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    percentage: number;
  };
  cpu: {
    cores: number;
    loadAverage: number[];
    usage: {
      user: number;
      system: number;
    };
  };
  database: {
    status: string;
    responseTime: string;
  };
}

export interface SecurityDashboardData {
  metrics: {
    authentication: {
      failedLogins24h: number;
      successfulLogins24h: number;
      uniqueLoginIPs: number;
    };
    users: {
      activeUsers: number;
      suspendedUsers: number;
      pendingApprovals: number;
      adminUsers: number;
    };
    threats: {
      suspiciousActivities: number;
      blockedIPs: number;
      securityAlerts: number;
    };
  };
  recentEvents: any[];
  recommendations: any[];
}