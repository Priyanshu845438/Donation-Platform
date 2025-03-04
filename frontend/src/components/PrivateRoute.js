import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import jwt from 'jsonwebtoken';

const PrivateRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('token');
  let userRole = null;

  // Check if token exists and decode the role
  if (token) {
    try {
      const decodedToken = jwt.decode(token);
      userRole = decodedToken.role;
    } catch (err) {
      // If token is invalid or expired, clear the token
      localStorage.removeItem('token');
    }
  }

  // If there is no token or the role is not in allowedRoles, redirect to login
  if (!token || !allowedRoles.includes(userRole)) {
    return <Navigate to="/login" />;
  }

  // If the user is authenticated and has the correct role, render the component
  return <Outlet />;
};

export default PrivateRoute;
