import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * A wrapper component that protects routes requiring authentication
 * Redirects to login page if user is not authenticated
 */
const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-[#00ff94] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // Render the protected component if authenticated
  return element;
};

export default ProtectedRoute; 