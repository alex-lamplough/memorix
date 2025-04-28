import { useState } from 'react'
import { Link } from 'react-router-dom'

// Icons
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import StarIcon from '@mui/icons-material/Star'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import QuizIcon from '@mui/icons-material/Quiz'

// Components
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import FlashcardSet from '../components/FlashcardSet'

// This component was causing a conflict with the imported FlashcardSet
function FlashcardCard({ title, cards, lastStudied, progress }) {
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <button className="text-white/60 hover:text-white p-1">
          <MoreHorizIcon fontSize="small" />
        </button>
      </div>
      
      <div className="mb-4">
        <span className="text-white/70 text-sm">
          {cards} {cards === 1 ? 'card' : 'cards'}
        </span>
        <div className="mt-2 h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00ff94]" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="text-white/70 text-sm mb-5 flex items-center gap-1">
        <AccessTimeIcon fontSize="small" />
        <span>Last studied: {lastStudied}</span>
      </div>
      
      <div className="flex gap-2">
        <button className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex-1">
          Study
        </button>
        <button className="bg-[#18092a]/60 text-white px-4 py-2 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors">
          Edit
        </button>
      </div>
    </div>
  )
}

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

function RecentActivity() {
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Recent Activity</h3>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-4 border-b border-gray-800/30">
          <div className="p-2 bg-[#00ff94]/10 rounded-lg">
            <span className="text-[#00ff94] text-lg font-bold">+5</span>
          </div>
          <div>
            <h4 className="font-medium">Physics Fundamentals</h4>
            <p className="text-white/70 text-sm">Completed 5 cards • 2 hours ago</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 pb-4 border-b border-gray-800/30">
          <div className="p-2 bg-[#3ec1ff]/10 rounded-lg">
            <span className="text-[#3ec1ff] text-lg font-bold">+3</span>
          </div>
          <div>
            <h4 className="font-medium">Spanish Vocabulary</h4>
            <p className="text-white/70 text-sm">Added 3 new cards • 5 hours ago</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#a259ff]/10 rounded-lg">
            <span className="text-[#a259ff] text-lg font-bold">+8</span>
          </div>
          <div>
            <h4 className="font-medium">Web Development</h4>
            <p className="text-white/70 text-sm">Studied 8 cards • Yesterday</p>
          </div>
        </div>
      </div>
      
      <button className="text-[#00ff94] text-sm mt-4 hover:underline">
        View all activity
      </button>
    </div>
  )
}

function Dashboard() {
  const [flashcardSets] = useState([
    {
      id: 1,
      title: 'Physics Fundamentals',
      cards: 24,
      lastStudied: 'Today',
      progress: 75
    },
    {
      id: 2,
      title: 'Spanish Vocabulary',
      cards: 48,
      lastStudied: 'Yesterday',
      progress: 45
    },
    {
      id: 3,
      title: 'Web Development',
      cards: 32,
      lastStudied: '3 days ago',
      progress: 90
    },
    {
      id: 4,
      title: 'IELTS Preparation',
      cards: 56,
      lastStudied: '1 week ago',
      progress: 30
    }
  ]);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex">
      <Sidebar activePage="dashboard" />
      
      <div className="flex-1 flex flex-col">
        <DashboardHeader title="My Flashcards" actionButton="Create New" />
        
        <div className="flex-1 p-6">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {flashcardSets.map(set => (
                <FlashcardCard 
                  key={set.id}
                  title={set.title}
                  cards={set.cards}
                  lastStudied={set.lastStudied}
                  progress={set.progress}
                />
              ))}
            </div>
            
            <div className="mt-8">
              <RecentActivity />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 