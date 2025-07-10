
import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const { isAuthenticated, user, isLoading } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
             <div className="flex justify-center items-center h-screen bg-background">
                <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-primary"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user && !allowedRoles.includes(user.role)) {
        // Redirect to their own dashboard if they try to access a wrong one
        return <Navigate to={`/dashboard/${user.role}`} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
