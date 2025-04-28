import React from 'react';
import { useAuth } from '../auth/useAuth';

/**
 * A button component that handles login/logout functionality
 */
const LoginButton = () => {
  const { isAuthenticated, user, login, logout } = useAuth();

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