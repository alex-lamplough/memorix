import { Link } from 'react-router-dom'

// Icons
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import StarIcon from '@mui/icons-material/Star'
import QuizIcon from '@mui/icons-material/Quiz'
import SettingsIcon from '@mui/icons-material/Settings'

function SidebarItem({ icon, label, active, to }) {
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
  return (
    <div className="w-64 border-r border-gray-800/30 p-4 h-full">
      <div className="flex items-center gap-2 px-4 py-3 mb-6">
        <Link to="/" className="text-2xl font-black tracking-widest text-[#00ff94]">M/</Link>
        <span className="text-white font-bold">Memorix</span>
      </div>
      
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
  )
}

export default Sidebar 