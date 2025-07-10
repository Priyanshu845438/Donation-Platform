
import React, { createContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { apiFetch } from '../utils/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const initializeAuth = useCallback(() => {
        setIsLoading(true);
        try {
            const storedToken = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');
            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to initialize auth from storage", error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        initializeAuth();
    }, [initializeAuth]);

    const login = (newToken: string, newUser: User) => {
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        setToken(newToken);
        setUser(newUser);
    };

    const logout = async () => {
        try {
            await apiFetch('/auth/logout', { method: 'POST' });
        } catch (error) {
            console.error('Logout API call failed, proceeding with client-side logout.', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
        }
    };
    
    const updateUser = (updatedData: Partial<User>) => {
        if(user) {
            const newUser = { ...user, ...updatedData };
            setUser(newUser);
            localStorage.setItem('user', JSON.stringify(newUser));
        }
    };

    const authContextValue: AuthContextType = {
        isAuthenticated: !!token && !!user,
        user,
        token,
        login,
        logout,
        updateUser,
        isLoading
    };

    return (
        <AuthContext.Provider value={authContextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;