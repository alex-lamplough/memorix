import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMediaQuery } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'

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
import Todo from '../components/Todo'
import FlashcardCreationModal from '../components/FlashcardCreationModal'

// Services
import { flashcardService } from '../services/api'

// This component was causing a conflict with the imported FlashcardSet
function FlashcardCard({ title, cards, lastStudied, progress, id }) {
  const navigate = useNavigate();
  
  const handleStudyClick = () => {
    navigate(`/study/${id}`);
  }
  
  const handleEditClick = () => {
    navigate(`/edit/${id}`);
  }
  
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold truncate pr-2">{title}</h3>
        <button className="text-white/60 hover:text-white p-1 ml-2">
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
        <button 
          className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex-1"
          onClick={handleStudyClick}
        >
          Study
        </button>
        <button 
          className="bg-[#18092a]/60 text-white px-4 py-2 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors"
          onClick={handleEditClick}
        >
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
  const [flashcardSets, setFlashcardSets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  const navigate = useNavigate();
  
  // Fetch user's flashcard sets
  useEffect(() => {
    const fetchFlashcardSets = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await flashcardService.getAllFlashcardSets();
        console.log('Fetched flashcard sets:', response);
        
        // Transform data to match our component requirements
        const transformedSets = response.map(set => ({
          id: set._id,
          title: set.title,
          cards: set.cardCount || 0,
          lastStudied: formatLastStudied(set.lastStudied),
          progress: set.progress || 0
        }));
        
        setFlashcardSets(transformedSets);
      } catch (err) {
        console.error('Error fetching flashcard sets:', err);
        setError('Failed to load your flashcard sets. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFlashcardSets();
  }, []);
  
  // Format the last studied date in a user-friendly way
  const formatLastStudied = (dateString) => {
    if (!dateString) return 'Never';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      // Check if it's today
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Lock body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobile, sidebarOpen]);
  
  const handleCreateButtonClick = () => {
    setIsCreateModalOpen(true);
  };
  
  // Reload flashcard sets after creating a new set
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
    // Refresh flashcard sets after creating a new one
    flashcardService.getAllFlashcardSets()
      .then(response => {
        const transformedSets = response.map(set => ({
          id: set._id,
          title: set.title,
          cards: set.cardCount || 0,
          lastStudied: formatLastStudied(set.lastStudied),
          progress: set.progress || 0
        }));
        
        setFlashcardSets(transformedSets);
      })
      .catch(err => {
        console.error('Error refreshing flashcard sets:', err);
      });
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex flex-col md:flex-row">
      {/* Mobile menu button */}
      {isMobile && (
        <div className="bg-[#18092a]/80 p-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-widest text-[#00ff94]">M/</span>
            <span className="text-white font-bold">Memorix</span>
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-white rounded-lg bg-[#18092a] hover:bg-[#18092a]/80"
          >
            <MenuIcon />
          </button>
        </div>
      )}
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar - hidden on mobile by default */}
      <div className={`z-40 ${isMobile ? 'fixed inset-0 transform transition-transform duration-300 ease-in-out' : ''} ${isMobile && !sidebarOpen ? '-translate-x-full' : ''} ${isMobile && sidebarOpen ? 'translate-x-0' : ''}`}>
        <Sidebar activePage="dashboard" />
      </div>
      
      <div className={`flex-1 flex flex-col ${isMobile && sidebarOpen ? 'blur-sm' : ''}`}>
        {!isMobile && (
          <DashboardHeader 
            title="My Flashcards" 
            actionButton="Create New"
            onActionButtonClick={handleCreateButtonClick}
          />
        )}
        
        <div className="flex-1 p-4 md:p-6">
          <div className="container mx-auto max-w-6xl">
            {isMobile && (
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white">My Flashcards</h1>
                <button 
                  className="bg-[#00ff94]/10 text-[#00ff94] px-3 py-1.5 text-sm rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex items-center gap-1"
                  onClick={handleCreateButtonClick}
                >
                  <AddCircleOutlineIcon fontSize="small" />
                  <span>Create</span>
                </button>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ff94]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                <p className="text-white">{error}</p>
                <button 
                  className="mt-4 bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            ) : flashcardSets.length === 0 ? (
              <div className="bg-[#18092a]/60 rounded-xl p-8 border border-gray-800/30 shadow-lg text-center">
                <h3 className="text-xl font-bold mb-4">No Flashcard Sets Yet</h3>
                <p className="text-white/70 mb-6">Create your first flashcard set to start learning!</p>
                <button 
                  className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 inline-flex items-center gap-1"
                  onClick={handleCreateButtonClick}
                >
                  <AddCircleOutlineIcon fontSize="small" />
                  <span>Create Your First Set</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {flashcardSets.map(set => (
                  <FlashcardCard 
                    key={set.id}
                    id={set.id}
                    title={set.title}
                    cards={set.cards}
                    lastStudied={set.lastStudied}
                    progress={set.progress}
                  />
                ))}
              </div>
            )}
            
            <div className="mt-6 md:mt-8">
              <RecentActivity />
            </div>
            
            <div className="mt-6 md:mt-8">
              <h2 className="text-xl font-bold mb-4">Study Tasks</h2>
              <Todo />
            </div>
          </div>
        </div>
      </div>
      
      {/* Flashcard Creation Modal */}
      <FlashcardCreationModal 
        open={isCreateModalOpen}
        onClose={handleCloseCreateModal}
      />
    </div>
  )
}

export default Dashboard 