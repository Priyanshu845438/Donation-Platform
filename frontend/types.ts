
export enum UserRole {
    ADMIN = 'admin',
    NGO = 'ngo',
    COMPANY = 'company',
    USER = 'user',
}

export interface User {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
    phoneNumber?: string;
    status?: 'active' | 'inactive' | 'pending';
    profileImageUrl?: string;
}

export interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
    isLoading: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  goal: number;
  raised: number;
  category?: string;
  endDate?: string;
  ngo?: { name: string };
  status?: string;
  creator?: {
      id: string;
      name: string;
  }
}

export interface Donation {
    id: string;
    amount: number;
    date: string;
    campaign: {
        id: string;
        title: string;
    };
    status: 'Paid' | 'Failed' | 'Pending';
    donor?: {
        id: string;
        name: string;
    };
}

// For Admin Analytics
export interface AdminAnalytics {
    overview: {
        totalNGOs: number;
        totalCompanies: number;
        activeCampaigns: number;
        totalDonations: number;
        totalUsers: number;
    };
    monthlyDonations: { month: string; donations: number }[];
    recentDonations: Donation[];
    topDonors: any[];
    campaignStats: any;
}


// For NGO Profile
export interface NgoProfile {
    id: string;
    ngoName: string;
    address: {
        street: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    authorizedPerson: {
        name: string;
        phone: string;
        email: string;
        designation: string;
    };
    workingAreas: string[];
    targetBeneficiaries: string[];
    documents: {
        registrationCertificate?: string;
        panCard?: string;
        '80gCertificate'?: string;
    }
}

// For Company Profile
export interface CompanyProfile {
    id: string;
    companyName: string;
    companyAddress: string;
    ceoName: string;
    ceoContactNumber: string;
    companyType: string;
    numberOfEmployees: number;
    website: string;
    companyLogo?: string;
}