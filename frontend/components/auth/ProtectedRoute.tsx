
import React, { useContext } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.tsx';
import type { User } from '../../types.ts';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: User['role'][];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    // You can add a loading spinner here
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they
    // login, which is a nicer user experience.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  if (!allowedRoles.includes(user.role)) {
      // If user is logged in but their role is not permitted, redirect to home page.
      return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;