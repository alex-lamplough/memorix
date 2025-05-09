import { useState, useEffect, useRef, useMemo } from 'react'
import logger from '../utils/logger';
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
import ShareIcon from '@mui/icons-material/Share'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import StarBorderIcon from '@mui/icons-material/StarBorder'

// Components
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import Todo from '../components/Todo'
import FlashcardCreationModal from '../components/FlashcardCreationModal'
import ShareModal from '../components/ShareModal'
import ActivityModal from '../components/ActivityModal'
import Layout from '../components/Layout'
import FlashcardSetCard from '../components/FlashcardSetCard'

// Services & Queries
import { handleRequestError } from '../api/utils'
import { useFlashcardSets, useDeleteFlashcardSet, useToggleFavorite } from '../api/queries/flashcards'
import { useQuizzes, useDeleteQuiz } from '../api/queries/quizzes'
import { useGeneratedActivities, useActivities } from '../api/queries/activities'

// Custom hooks
import useNavigationWithCancellation from '../hooks/useNavigationWithCancellation'

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

function RecentActivity({ flashcardSets, quizSets }) {
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [useGeneratedOnly, setUseGeneratedOnly] = useState(false);
  
  // First try API endpoint if available
  const { 
    data: apiActivities,
    isLoading: isLoadingApi,
    isError: isApiError
  } = useActivities({ 
    limit: 5 // Only get 5 most recent activities
  }, {
    // Only use if we haven't already determined the endpoint doesn't exist
    enabled: !useGeneratedOnly,
    // Don't show error toasts for missing endpoints
    onError: (error) => {
      if (error.response?.status === 404) {
        setUseGeneratedOnly(true);
      }
    }
  });
  
  // Use React Query hook to generate activities as fallback
  const { 
    data: generatedActivities,
    isLoading: isLoadingGenerated
  } = useGeneratedActivities(flashcardSets, quizSets, { 
    limit: 5 // Only get 5 most recent activities
  });
  
  // Determine which activities to use and loading state
  const recentActivities = (!useGeneratedOnly && apiActivities && apiActivities.length > 0) 
    ? apiActivities 
    : generatedActivities || [];
  
  const isLoading = (!useGeneratedOnly && isLoadingApi) || 
    (useGeneratedOnly && isLoadingGenerated);
  
  // Format relative time
  const formatTimeAgo = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffTime / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
  
  // Get activity details based on type
  const getActivityDetails = (activity) => {
    switch (activity.actionType) {
      case 'study':
        return {
          icon: <AccessTimeIcon fontSize="small" className="text-[#00ff94]" />,
          color: 'text-[#00ff94]',
          bgColor: 'bg-[#00ff94]/10',
          count: activity.cardsStudied ? `+${activity.cardsStudied}` : '',
          label: activity.cardsStudied 
            ? `Studied ${activity.cardsStudied} cards • ${formatTimeAgo(activity.timestamp)}`
            : `Studied cards • ${formatTimeAgo(activity.timestamp)}`
        };
      case 'create':
        return {
          icon: <AddCircleOutlineIcon fontSize="small" className="text-[#a259ff]" />,
          color: 'text-[#a259ff]',
          bgColor: 'bg-[#a259ff]/10',
          count: activity.cardsCount ? `+${activity.cardsCount}` : 'New',
          label: `Created new ${activity.itemType} • ${formatTimeAgo(activity.timestamp)}`
        };
      case 'complete':
        return {
          icon: <CheckCircleOutlineIcon fontSize="small" className="text-[#3ec1ff]" />,
          color: 'text-[#3ec1ff]',
          bgColor: 'bg-[#3ec1ff]/10',
          count: activity.score ? `${activity.score}%` : '✓',
          label: `Completed ${activity.itemType} • ${formatTimeAgo(activity.timestamp)}`
        };
      default:
        return {
          icon: <CollectionsBookmarkIcon fontSize="small" className="text-[#00ff94]" />,
          color: 'text-[#00ff94]',
          bgColor: 'bg-[#00ff94]/10',
          count: '',
          label: `Activity • ${formatTimeAgo(activity.timestamp)}`
        };
    }
  };
  
  const openActivityModal = () => {
    setIsActivityModalOpen(true);
  };
  
  return (
    <div className="bg-[#18092a]/60 rounded-xl shadow-lg p-6 border border-gray-800/30">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">Recent Activity</h2>
        <button 
          onClick={openActivityModal}
          className="text-white/70 hover:text-white text-sm"
        >
          View All
        </button>
      </div>
      
      {isLoading ? (
        <div className="py-10 flex justify-center">
          <div className="w-8 h-8 border-2 border-[#00ff94]/10 border-t-[#00ff94] rounded-full animate-spin"></div>
        </div>
      ) : recentActivities && recentActivities.length > 0 ? (
        <div className="space-y-4">
          {recentActivities.map(activity => {
            const { icon, color, bgColor, count, label } = getActivityDetails(activity);
            return (
              <div key={activity.id} className="flex items-center gap-3">
                <div className={`${bgColor} rounded-lg p-2`}>
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold truncate">{activity.title}</h3>
                  <p className="text-white/70 text-sm">{label}</p>
                </div>
                {count && (
                  <div className={`${color} text-sm font-medium`}>
                    {count}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-8 text-center">
          <p className="text-white/70">No recent activity</p>
        </div>
      )}
      
      {/* Activity modal */}
      <ActivityModal 
        open={isActivityModalOpen} 
        onClose={() => setIsActivityModalOpen(false)} 
      />
    </div>
  );
}

function Dashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [transformedFlashcardSets, setTransformedFlashcardSets] = useState([]);
  const [activityModalOpen, setActivityModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const isMobile = useMediaQuery('(max-width:768px)');
  const navigate = useNavigationWithCancellation();
  
  // Use React Query to fetch flashcards
  const { 
    data: flashcardSets = [], 
    isLoading: isFlashcardsLoading,
    error: flashcardsError,
    refetch: flashcardRefetch
  } = useFlashcardSets();
  
  // Use React Query to fetch quizzes
  const {
    data: quizSets = [],
    isLoading: isQuizzesLoading,
    error: quizzesError
  } = useQuizzes();
  
  // Use the delete mutations
  const { mutate: deleteFlashcardSet } = useDeleteFlashcardSet();
  const { mutate: toggleFavorite } = useToggleFavorite();
  
  // Format the last studied date in a user-friendly way
  const formatLastStudied = (dateString) => {
    if (!dateString) return 'Never';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return 'Never';
      }
      
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        // Check if it's today
        const hours = date.getHours();
        const minutes = date.getMinutes();
        return `Today at ${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
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
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Never';
    }
  };
  
  // Transform flashcard data for display when flashcardSets changes
  // Using useMemo to prevent unnecessary recalculations
  useMemo(() => {
    if (!flashcardSets || !flashcardSets.length) return;
    
    // Debug the original data structure
    console.log('Original flashcard sets from API:', JSON.stringify(flashcardSets, null, 2));
    
    const transformedSets = flashcardSets.map(set => {
      // Debug study stats data for each set
      console.log(`Processing set for dashboard: ${set.title}`, { 
        studyStats: set.studyStats,
        lastStudied: set.lastStudied,
        progress: set.progress,
        correctPercentage: set.correctPercentage,
        cardCount: set.cardCount,
        studySessions: set.studySessions,
        isFavorite: set.isFavorite
      });
      
      return {
        id: set._id,
        title: set.title,
        cards: set.cardCount || 0,
        lastStudied: formatLastStudied(set.lastStudied || set.studyStats?.lastStudied),
        progress: set.progress || 0,
        correctPercentage: set.correctPercentage || 
                        (set.studyStats?.masteryLevel ? Math.round(set.studyStats.masteryLevel) : 0),
        totalStudied: set.studySessions || set.studyStats?.totalStudySessions || 0,
        isFavorite: set.isFavorite || false
      };
    });
    
    setTransformedFlashcardSets(transformedSets);
  }, [flashcardSets]);
  
  const handleCreateButtonClick = () => {
    setIsCreateModalOpen(true);
  };
  
  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false);
  };
  
  const handleDeleteFlashcard = (id) => {
    deleteFlashcardSet(id);
  };
  
  const handleToggleFavorite = (id, isFavorite) => {
    toggleFavorite({ id, isFavorite });
  };
  
  // Get only the first 6 flashcards to display on dashboard
  const limitedFlashcardSets = transformedFlashcardSets.slice(0, 6);
  const hasMoreFlashcards = transformedFlashcardSets.length > 6;
  
  // Combine errors from both data sources
  const combinedError = flashcardsError || quizzesError;
  const isLoading = isFlashcardsLoading || isQuizzesLoading;
  
  return (
    <Layout 
      title="Dashboard" 
      activePage="dashboard" 
      actionButton="Create" 
      onActionButtonClick={handleCreateButtonClick}
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#00ff94]"></div>
        </div>
      ) : combinedError ? (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <p className="text-white">{combinedError.message || 'Failed to load your data. Please try again later.'}</p>
          <button 
            className="mt-4 bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      ) : transformedFlashcardSets.length === 0 ? (
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
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Recent Flashcard Sets</h2>
            {hasMoreFlashcards && (
              <Link 
                to="/flashcards"
                className="text-[#00ff94] text-sm hover:underline flex items-center"
              >
                View all flashcards
              </Link>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {limitedFlashcardSets.map(set => {
              // Debug what's being passed to FlashcardSetCard
              console.log(`Rendering FlashcardSetCard for ${set.title}:`, {
                id: set.id,
                title: set.title,
                cards: set.cards,
                lastStudied: set.lastStudied,
                progress: set.progress,
                correctPercentage: set.correctPercentage,
                totalStudied: set.totalStudied,
                isFavorite: set.isFavorite
              });
              
              return (
                <FlashcardSetCard 
                  key={set.id}
                  id={set.id}
                  title={set.title}
                  cards={set.cards}
                  lastStudied={set.lastStudied}
                  progress={set.progress}
                  onDelete={handleDeleteFlashcard}
                  correctPercentage={set.correctPercentage}
                  totalStudied={set.totalStudied}
                  isFavorite={set.isFavorite}
                  onToggleFavorite={handleToggleFavorite}
                />
              );
            })}
          </div>
          
          {/* Recent Activity */}
          <div className="mt-12">
            <RecentActivity 
              flashcardSets={flashcardSets} 
              quizSets={quizSets}
            />
          </div>
          
          {/* Todo List */}
          <div className="mt-12">
            <Todo />
          </div>
        </>
      )}
      
      {/* Flashcard Creation Modal */}
      <FlashcardCreationModal 
        open={isCreateModalOpen} 
        onClose={handleCloseCreateModal} 
      />
    </Layout>
  );
}

export default Dashboard; 