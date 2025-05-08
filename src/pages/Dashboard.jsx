import { useState, useEffect, useRef, useMemo } from 'react'
import logger from '../../utils/logger';
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

// Components
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import FlashcardSet from '../components/FlashcardSet'
import Todo from '../components/Todo'
import FlashcardCreationModal from '../components/FlashcardCreationModal'
import ShareModal from '../components/ShareModal'
import ActivityModal from '../components/ActivityModal'
import Layout from '../components/Layout'

// Services & Queries
import { handleRequestError } from '../services/utils'
import { useFlashcardSets, useDeleteFlashcardSet } from '../api/queries/flashcards'
import { useQuizzes, useDeleteQuiz } from '../api/queries/quizzes'

// Custom hooks
import useNavigationWithCancellation from '../hooks/useNavigationWithCancellation'

// This component was causing a conflict with the imported FlashcardSet
function FlashcardCard({ title, cards, lastStudied, progress, id, onDelete }) {
  const navigate = useNavigationWithCancellation();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  
  const handleStudyClick = () => {
    navigate(`/study/${id}`);
  }
  
  const handleEditClick = () => {
    navigate(`/edit/${id}`);
  }
  
  const handleShareClick = () => {
    setIsShareModalOpen(true);
  }
  
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  }
  
  const confirmDelete = async () => {
    try {
      await onDelete(id);
    } catch (error) {
      logger.error('Error deleting flashcard set:', error);
      alert('Failed to delete flashcard set. Please try again.');
    } finally {
      setShowDeleteConfirm(false);
    }
  }
  
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  }
  
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold truncate pr-2">{title}</h3>
        <div className="flex space-x-1">
          <button 
            className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10"
            onClick={handleShareClick}
            title="Share"
          >
            <ShareIcon fontSize="small" />
          </button>
          <button 
            className="text-white/60 hover:text-red-400 p-1 rounded-full hover:bg-white/10"
            onClick={handleDeleteClick}
            title="Delete"
          >
            <DeleteIcon fontSize="small" />
          </button>
        </div>
      </div>
      
      {/* Delete confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#18092a] p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-3">Delete Flashcard Set</h3>
            <p className="text-white/70 mb-6">Are you sure you want to delete "{title}"? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={cancelDelete} 
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Share modal */}
      <ShareModal
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        itemToShare={{
          id,
          type: "flashcards",
          title
        }}
      />
      
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

function RecentActivity({ flashcardSets, quizSets }) {
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const isMountedRef = useRef(true);
  
  useEffect(() => {
    isMountedRef.current = true;
    
    // Process data whenever props change
    if (flashcardSets && quizSets) {
      processActivityData(flashcardSets, quizSets);
    } else {
      // If we don't have data yet, keep showing loading
      setIsLoading(true);
    }
    
    return () => {
      isMountedRef.current = false;
    };
  }, [flashcardSets, quizSets]);
  
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
  
  // Process activity data
  const processActivityData = (flashcardSets, quizzes) => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    try {
      // Transform flashcard sets into activity items
      const flashcardActivities = flashcardSets.flatMap(set => {
        const activities = [];
        
        // Create activity
        activities.push({
          id: `create-${set._id}`,
          title: set.title,
          itemType: 'flashcard',
          actionType: 'create',
          timestamp: set.createdAt,
          cardsCount: set.cardCount || 0
        });
        
        // Study activity (if studied)
        if (set.lastStudied) {
          activities.push({
            id: `study-${set._id}-${new Date(set.lastStudied).getTime()}`,
            title: set.title,
            itemType: 'flashcard',
            actionType: 'study',
            timestamp: set.lastStudied,
            cardsStudied: Math.round(set.cardCount * (set.progress || 0) / 100)
          });
        }
        
        return activities;
      });
      
      // Transform quizzes into activity items
      const quizActivities = quizzes?.flatMap(quiz => {
        const activities = [];
        
        // Create activity
        activities.push({
          id: `create-${quiz._id}`,
          title: quiz.title,
          itemType: 'quiz',
          actionType: 'create',
          timestamp: quiz.createdAt
        });
        
        // Complete activity (if completed)
        if (quiz.lastCompleted) {
          activities.push({
            id: `complete-${quiz._id}-${new Date(quiz.lastCompleted).getTime()}`,
            title: quiz.title,
            itemType: 'quiz',
            actionType: 'complete',
            timestamp: quiz.lastCompleted
          });
        }
        
        return activities;
      }) || [];
      
      // Combine all activities
      const allActivities = [...flashcardActivities, ...quizActivities];
      
      // Sort by timestamp (newest first)
      allActivities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      
      // Take only the 5 most recent
      if (isMountedRef.current) {
        setRecentActivities(allActivities.slice(0, 5));
        setIsLoading(false);
      }
    } catch (error) {
      logger.error('Error processing activity data:', error);
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };
  
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
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Recent Activity</h3>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="w-8 h-8 border-2 border-[#00ff94]/20 border-t-[#00ff94] rounded-full animate-spin"></div>
        </div>
      ) : recentActivities.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-white/70">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recentActivities.map(activity => {
            const { icon, color, bgColor, count, label } = getActivityDetails(activity);
            
            return (
              <div key={activity.id} className="flex items-center gap-3 pb-4 border-b border-gray-800/30">
                <div className={`p-2 ${bgColor} rounded-lg`}>
                  <span className={`${color} text-lg font-bold`}>{count}</span>
                </div>
                <div>
                  <h4 className="font-medium">{activity.title}</h4>
                  <p className="text-white/70 text-sm flex items-center gap-1">
                    {icon} {label}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      <button 
        className="text-[#00ff94] text-sm mt-4 hover:underline flex items-center"
        onClick={openActivityModal}
      >
        View all activity
      </button>
      
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
    error: flashcardsError
  } = useFlashcardSets();
  
  // Use React Query to fetch quizzes
  const {
    data: quizSets = [],
    isLoading: isQuizzesLoading,
    error: quizzesError
  } = useQuizzes();
  
  // Use the delete mutations
  const { mutate: deleteFlashcardSet } = useDeleteFlashcardSet();
  const { mutate: deleteQuiz } = useDeleteQuiz();
  
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
  
  // Transform flashcard data for display when flashcardSets changes
  // Using useMemo to prevent unnecessary recalculations
  useMemo(() => {
    if (!flashcardSets || !flashcardSets.length) return;
    
    const transformedSets = flashcardSets.map(set => ({
      id: set._id,
      title: set.title,
      cards: set.cardCount || 0,
      lastStudied: formatLastStudied(set.lastStudied),
      progress: set.progress || 0
    }));
    
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
            {limitedFlashcardSets.map(set => (
              <FlashcardCard 
                key={set.id}
                id={set.id}
                title={set.title}
                cards={set.cards}
                lastStudied={set.lastStudied}
                progress={set.progress}
                onDelete={handleDeleteFlashcard}
              />
            ))}
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