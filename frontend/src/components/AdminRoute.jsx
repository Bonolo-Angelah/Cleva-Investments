import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../utils/store';

const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" />;
  }

  return children;
};

export default AdminRoute;
