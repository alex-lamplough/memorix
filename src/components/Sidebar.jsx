import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useMediaQuery } from '@mui/material'
import { useUserProfile } from '../api/queries/users'

// Icons
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import StarIcon from '@mui/icons-material/Star'
import QuizIcon from '@mui/icons-material/Quiz'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuBookIcon from '@mui/icons-material/MenuBook'

// Assets
import logoWhite from '../assets/MemorixLogoImage.png'

function SidebarItem({ icon, label, active, to, onClick, disabled, comingSoon }) {
  if (disabled) {
    return (
      <div className="relative">
        <div className={`flex items-center gap-3 px-4 py-3 rounded-lg text-white/40 cursor-not-allowed`}>
          {icon}
          <span className="font-medium">{label}</span>
          {comingSoon && (
            <span className="ml-auto text-xs px-1.5 py-0.5 bg-[#00ff94]/10 text-[#00ff94] rounded-full border border-[#00ff94]/30">
              Soon
            </span>
          )}
        </div>
        {comingSoon && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <div className="px-2 py-1 bg-[#18092a] text-[#00ff94] text-xs rounded-md border border-[#00ff94]/30">
              Coming Soon
            </div>
          </div>
        )}
      </div>
    );
  }
  
  if (onClick) {
    return (
      <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 cursor-pointer transition-colors text-left`}
      >
        {icon}
        <span className="font-medium">{label}</span>
      </button>
    );
  }
  
  return (
    <Link 
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg ${active ? 'bg-[#00ff94]/10 text-[#00ff94]' : 'text-white/70 hover:bg-white/5'} cursor-pointer transition-colors`}
    >
      {icon}
      <span className="font-medium">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00ff94]"></div>}
    </Link>
  )
}

function Sidebar({ activePage = 'dashboard', transparentBg = false }) {
  const { user, logout } = useAuth();
  const { data: userProfile } = useUserProfile();
  const isMobile = useMediaQuery('(max-width:768px)');
  
  // Get the display name from user profile data, with fallbacks
  const displayName = userProfile?.profile?.displayName || userProfile?.name || user?.name || '';
  
  // Get the email from user profile data with fallback to Auth0 user email
  const email = userProfile?.email || user?.email || '';
  
  return (
    <div className={`fixed top-0 left-0 bottom-0 w-64 flex flex-col h-screen ${!transparentBg ? 'bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f]' : 'bg-transparent'} border-r border-gray-800/30 z-40`}>
      {/* Fixed header */}
      <div className={`flex-shrink-0 ${!transparentBg ? 'bg-[#2E0033]' : 'bg-transparent'} p-4 pb-6 border-b border-gray-800/20`}>
        <div className="flex justify-center items-center py-4">
          <Link to="/">
            <img src={logoWhite} alt="Memorix" className="w-24 h-auto" />
          </Link>
        </div>
      </div>
      
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pt-3">
        {/* User Profile Section */}
        {user && (
          <div className="mb-6 px-4 py-3 bg-[#18092a]/60 rounded-xl border border-gray-800/30">
            <div className="flex items-center gap-3 mb-2">
              <img 
                src={user.picture} 
                alt={displayName || user.name} 
                className="w-10 h-10 min-w-[2.5rem] rounded-full border-2 border-[#00ff94]"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${displayName || user.name}&background=00ff94&color=18092a`;
                }}
              />
              <div className="overflow-hidden">
                <div className="text-white font-medium truncate">{displayName || user.name}</div>
                <div className="text-white/50 text-xs truncate" title={email}>{email}</div>
              </div>
            </div>
            
            {/* Show logout button in profile section on mobile */}
            {isMobile && (
              <button 
                onClick={logout}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#00ff94]/10 text-[#00ff94] hover:bg-[#00ff94]/20 cursor-pointer transition-colors text-sm border border-[#00ff94]/30"
              >
                <LogoutIcon fontSize="small" />
                <span className="font-medium">Log Out</span>
              </button>
            )}
          </div>
        )}
        
        <div className="mb-6">
          <div className="px-4 text-xs text-white/50 uppercase tracking-wider mb-2">
            Main
          </div>
          <SidebarItem 
            icon={<CollectionsBookmarkIcon fontSize="small" />} 
            label="Dashboard" 
            active={activePage === 'dashboard'}
            to="/dashboard"
          />
          <SidebarItem 
            icon={<MenuBookIcon fontSize="small" />} 
            label="Flashcards" 
            active={activePage === 'flashcards'}
            to="/flashcards"
          />
          <SidebarItem 
            icon={<QuizIcon fontSize="small" />} 
            label="Quizzes" 
            active={activePage === 'quizzes'}
            to="/quizzes"
          />
          <SidebarItem 
            icon={<AnalyticsIcon fontSize="small" />} 
            label="Progress" 
            active={activePage === 'progress'}
            disabled={true}
            comingSoon={true}
          />
          <SidebarItem 
            icon={<StarIcon fontSize="small" />} 
            label="Favorites" 
            active={activePage === 'favorites'}
            to="/favorites"
          />
          <SidebarItem 
            icon={<SettingsIcon fontSize="small" />} 
            label="Settings" 
            active={activePage === 'settings'}
            to="/settings"
          />
        </div>
      </div>
      
      {/* Fixed footer with logout button - show only on desktop */}
      {!isMobile && (
        <div className={`flex-shrink-0 p-4 border-t border-gray-800/30 ${!transparentBg ? 'bg-[#1b1b2f]' : 'bg-transparent'} mt-auto`}>
          <SidebarItem 
            icon={<LogoutIcon fontSize="small" />} 
            label="Log Out" 
            onClick={logout}
          />
        </div>
      )}
    </div>
  )
}

export default Sidebar 