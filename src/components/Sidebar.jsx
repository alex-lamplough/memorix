import { Link } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useMediaQuery } from '@mui/material'

// Icons
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import StarIcon from '@mui/icons-material/Star'
import QuizIcon from '@mui/icons-material/Quiz'
import SettingsIcon from '@mui/icons-material/Settings'
import LogoutIcon from '@mui/icons-material/Logout'

function SidebarItem({ icon, label, active, to, onClick }) {
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

function Sidebar({ activePage = 'dashboard' }) {
  const { user, logout } = useAuth();
  const isMobile = useMediaQuery('(max-width:768px)');
  
  return (
    <div className={`w-64 bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] border-r border-gray-800/30 flex flex-col
      ${isMobile ? 'h-screen overflow-y-auto' : 'h-full'}`}>
      <div className="sticky top-0 z-10 bg-[#2E0033] p-4 pb-2">
        <div className="flex items-center gap-2 px-4 py-3 mb-6">
          <Link to="/" className="text-2xl font-black tracking-widest text-[#00ff94]">M/</Link>
          <span className="text-white font-bold">Memorix</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 pt-0">
        {/* User Profile Section */}
        {user && (
          <div className="mb-6 px-4 py-3 bg-[#18092a]/60 rounded-xl border border-gray-800/30">
            <div className="flex items-center gap-3 mb-2">
              <img 
                src={user.picture} 
                alt={user.name} 
                className="w-10 h-10 min-w-[2.5rem] rounded-full border-2 border-[#00ff94]"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=00ff94&color=18092a`;
                }}
              />
              <div className="overflow-hidden">
                <div className="text-white font-medium truncate">{user.name}</div>
                <div className="text-white/50 text-xs truncate" title={user.email}>{user.email}</div>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-6">
          <div className="px-4 text-xs text-white/50 uppercase tracking-wider mb-2">
            Main
          </div>
          <SidebarItem 
            icon={<CollectionsBookmarkIcon fontSize="small" />} 
            label="My Flashcards" 
            active={activePage === 'dashboard'}
            to="/dashboard"
          />
          <SidebarItem 
            icon={<AnalyticsIcon fontSize="small" />} 
            label="Progress" 
            active={activePage === 'progress'}
            to="/progress"
          />
          <SidebarItem 
            icon={<StarIcon fontSize="small" />} 
            label="Favorites" 
            active={activePage === 'favorites'}
            to="/favorites"
          />
          <SidebarItem 
            icon={<QuizIcon fontSize="small" />} 
            label="Quizzes" 
            active={activePage === 'quizzes'}
            to="/quizzes"
          />
          <SidebarItem 
            icon={<SettingsIcon fontSize="small" />} 
            label="Settings" 
            active={activePage === 'settings'}
            to="/settings"
          />
        </div>
        
        <div>
          <div className="px-4 text-xs text-white/50 uppercase tracking-wider mb-2">
            Recent Sets
          </div>
          <Link to="#" className="block px-4 py-2.5 text-white/70 hover:text-white text-sm">
            Physics Fundamentals
          </Link>
          <Link to="#" className="block px-4 py-2.5 text-white/70 hover:text-white text-sm">
            Spanish Vocabulary
          </Link>
          <Link to="#" className="block px-4 py-2.5 text-white/70 hover:text-white text-sm">
            Web Development
          </Link>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-800/30 bg-[#1b1b2f]">
        <SidebarItem 
          icon={<LogoutIcon fontSize="small" />} 
          label="Log Out" 
          onClick={logout}
        />
      </div>
    </div>
  )
}

export default Sidebar 