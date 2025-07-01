
export enum UserRole {
    ADMIN = 'Admin',
    NGO = 'NGO',
    COMPANY = 'Company',
    DONOR = 'Donor',
}

export interface User {
    id: string;
    fullName: string;
    email: string;
    role: UserRole;
}

export interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    token: string | null;
    login: (token: string, user: User) => void;
    logout: () => void;
    isLoading: boolean;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  goal: number;
  raised: number;
}
