import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './useAuth';

/**
 * A wrapper component that protects routes requiring authentication
 * Redirects to login page if user is not authenticated
 */
const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, isLoading, getToken } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);
  
  useEffect(() => {
    // When authentication state changes, verify the token is valid
    const verifyToken = async () => {
      if (isAuthenticated && !isLoading) {
        try {
          setIsVerifying(true);
          const token = await getToken();
          setIsTokenValid(!!token);
        } catch (error) {
          console.error('Token verification error:', error);
          setIsTokenValid(false);
        } finally {
          setIsVerifying(false);
        }
      } else if (!isLoading) {
        // If not authenticated and not loading, no need to verify
        setIsVerifying(false);
        setIsTokenValid(false);
      }
    };
    
    verifyToken();
  }, [isAuthenticated, isLoading, getToken]);

  // Show loading state while checking authentication or verifying token
  if (isLoading || isVerifying) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-[#00ff94] rounded-full animate-spin"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated or token is invalid
  if (!isAuthenticated || !isTokenValid) {
    console.log('Protected route access denied - redirecting to login');
    return <Navigate to="/" replace />;
  }

  // Render the protected component if authenticated with valid token
  return element;
};

export default ProtectedRoute; 