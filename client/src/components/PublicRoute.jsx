import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from './Spinner';

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="page-center-container">
        <Spinner size="lg" label="Checking session..." />
      </div>
    );
  }

  if (user) {
    const destination = user.targetRole ? '/dashboard' : '/roles';
    return <Navigate to={destination} replace />;
  }

  return children ? children : <Outlet />;
};

export default PublicRoute;
