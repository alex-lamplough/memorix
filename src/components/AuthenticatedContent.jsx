import React from 'react';
import { useAuthContext } from '../auth/AuthContext';

/**
 * Component that renders different content based on authentication state
 * 
 * @param {Object} props
 * @param {ReactNode} props.children - Content to show when authenticated
 * @param {ReactNode} props.fallback - Content to show when not authenticated
 * @param {ReactNode} props.loading - Content to show during loading
 * @param {boolean} props.skipLoading - Whether to skip showing loading state
 * @returns {ReactNode} The appropriate content based on auth state
 */
const AuthenticatedContent = ({ 
  children, 
  fallback, 
  loading,
  skipLoading = false
}) => {
  const { isAuthenticated, isLoading } = useAuthContext();

  // Show loading state
  if (isLoading && !skipLoading) {
    return loading || (
      <div className="flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-[#00ff94]/20 border-t-[#00ff94] rounded-full animate-spin"></div>
      </div>
    );
  }

  // If authenticated, show the actual content
  if (isAuthenticated) {
    return children;
  }

  // If not authenticated, show fallback content
  return fallback || (
    <div className="p-4 text-center">
      <p className="text-white/70">Please log in to view this content</p>
    </div>
  );
};

export default AuthenticatedContent; 