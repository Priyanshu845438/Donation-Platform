
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import type { User } from '../types.ts';
import * as api from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  logout: () => void;
  signup: (userData: any) => Promise<User | null>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => null,
  logout: () => {},
  signup: async () => null,
});

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Attempt to load user from localStorage on initial load
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem('authUser');
        const token = localStorage.getItem('authToken');
        if (storedUser && token) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Failed to parse auth user from localStorage", error);
        localStorage.removeItem('authUser');
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<User | null> => {
    const { user: backendUser, token } = await api.loginUser({ email, password });
    
    if (backendUser && token) {
      if(backendUser.approvalStatus !== 'approved'){
        throw new Error('Your account is pending approval or has been rejected.');
      }
      if(!backendUser.isActive){
        throw new Error('Your account is disabled. Please contact support.');
      }
      
      const frontendUser = api.transformBackendUser(backendUser);
      setUser(frontendUser);
      localStorage.setItem('authToken', token);
      localStorage.setItem('authUser', JSON.stringify(frontendUser));
      return frontendUser;
    }
    
    return null;
  };

  const logout = () => {
    api.logoutUser().catch(err => console.error("Logout failed on server:", err)); // Call API but don't block UI
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const signup = async (userData: any): Promise<User | null> => {
    const { user: newUser } = await api.signupUser(userData);
    if (newUser) {
      // Don't log in, just signal success.
      return api.transformBackendUser(newUser);
    }
    return null;
  };
  

  const value = {
    user,
    loading,
    login,
    logout,
    signup,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
