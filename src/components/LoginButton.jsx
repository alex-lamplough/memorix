import React from 'react';
import { useAuth } from '../auth/useAuth';

/**
 * A button component that handles login/logout functionality
 */
const LoginButton = () => {
  const { isAuthenticated, user, login, logout, isLoading, error } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <button
        disabled
        className="bg-[#00ff94]/60 text-[#18092a] font-medium py-2 px-6 rounded-lg flex items-center gap-2"
      >
        <svg className="animate-spin h-4 w-4 text-[#18092a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </button>
    );
  }

  // Show error state if there's an error during authentication
  if (error) {
    return (
      <div className="text-red-500 text-sm flex items-center gap-2">
        <span>Auth Error</span>
        <button
          onClick={() => login()}
          className="bg-[#00ff94] text-[#18092a] font-medium py-1 px-3 rounded-lg hover:bg-[#00ff94]/90 transition-colors text-xs"
        >
          Retry
        </button>
      </div>
    );
  }

  return isAuthenticated ? (
    <div className="flex items-center gap-3">
      <div className="hidden md:flex items-center gap-2">
        <img 
          src={user?.picture} 
          alt={user?.name} 
          className="w-8 h-8 rounded-full border-2 border-[#00ff94]"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${user?.name}&background=00ff94&color=18092a`;
          }}
        />
        <span className="text-white font-medium">{user?.name}</span>
      </div>
      <button
        onClick={() => logout()}
        className="text-[#00ff94] border border-[#00ff94] py-2 px-4 rounded-lg hover:bg-[#00ff94]/10 transition-colors font-medium"
      >
        Log Out
      </button>
    </div>
  ) : (
    <button
      onClick={() => login()}
      className="bg-[#00ff94] text-[#18092a] font-medium py-2 px-6 rounded-lg hover:bg-[#00ff94]/90 transition-colors"
    >
      Log In
    </button>
  );
};

export default LoginButton; 