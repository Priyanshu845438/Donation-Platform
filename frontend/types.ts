
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
  status: 'active' | 'completed' | 'disabled';
  endDate: string;
  isActive: boolean;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  targetAmount?: number;
  ngoId?: { _id: string; fullName: string; };
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