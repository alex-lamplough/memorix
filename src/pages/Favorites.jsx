import { useState, useRef } from 'react'
import { useMediaQuery } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'
import { useAuth0 } from '@auth0/auth0-react'
import { useQueryClient } from '@tanstack/react-query'

// React Query hooks
import { useFavoriteFlashcardSets, QUERY_KEYS as FLASHCARD_QUERY_KEYS } from '../api/queries/flashcards'
import { useFavoriteQuizzes, useToggleFavorite as useToggleQuizFavorite, useDeleteQuiz, QUERY_KEYS as QUIZ_QUERY_KEYS } from '../api/queries/quizzes'
import { useToggleFavorite as useToggleFlashcardFavorite, useDeleteFlashcardSet } from '../api/queries/flashcards'

// Custom hooks
import useNavigationWithCancellation from '../hooks/useNavigationWithCancellation'

// Components
import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import FlashcardSet from '../components/FlashcardSet'
import ShareModal from '../components/ShareModal'

// Icons
import AppsIcon from '@mui/icons-material/Apps'
import FilterListIcon from '@mui/icons-material/FilterList'
import SortIcon from '@mui/icons-material/Sort'
import SegmentIcon from '@mui/icons-material/Segment'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import QuizIcon from '@mui/icons-material/Quiz'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ShareIcon from '@mui/icons-material/Share'
import DeleteIcon from '@mui/icons-material/Delete'
import AccessTimeIcon from '@mui/icons-material/AccessTime'

// FlashcardCard component - Updated to use React Query
function FlashcardCard({ title, cards, lastStudied, progress, id, onDelete, isFavorite = false, onToggleFavorite }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [favorite, setFavorite] = useState(isFavorite);
  const navigate = useNavigationWithCancellation();
  
  // Use React Query mutation for toggling favorite
  const toggleFavoriteMutation = useToggleFlashcardFavorite();
  
  // Use React Query mutation for deletion
  const deleteFlashcardMutation = useDeleteFlashcardSet();
  
  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    try {
      const newFavoriteStatus = !favorite;
      setFavorite(newFavoriteStatus);
      
      // Use mutation to update favorite status
      toggleFavoriteMutation.mutate(
        { id, isFavorite: newFavoriteStatus },
        {
          onSuccess: () => {
            // If there's a parent callback, invoke it
            if (onToggleFavorite) {
              onToggleFavorite(id, newFavoriteStatus);
            }
          },
          onError: () => {
            // Revert the UI state on error
            setFavorite(favorite);
          }
        }
      );
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Revert the UI state on error
      setFavorite(favorite);
    }
  };
  
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
    // Use mutation for delete
    deleteFlashcardMutation.mutate(id, {
      onSuccess: () => {
        // Call the parent component's onDelete function to update the UI
        if (onDelete) {
          onDelete(id);
        }
        setShowDeleteConfirm(false);
      },
      onError: (error) => {
        console.error('Error deleting flashcard set:', error);
        setShowDeleteConfirm(false);
      }
    });
  }
  
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold truncate pr-2">{title}</h3>
        <div className="flex space-x-1">
          <button 
            onClick={handleToggleFavorite}
            className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10"
            title={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            {favorite ? 
              <StarIcon className="text-[#FFD700]" fontSize="small" /> : 
              <StarBorderIcon className="text-white/60 hover:text-white" fontSize="small" />
            }
          </button>
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
                onClick={() => setShowDeleteConfirm(false)} 
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg"
                disabled={deleteFlashcardMutation.isPending}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg"
                disabled={deleteFlashcardMutation.isPending}
              >
                {deleteFlashcardMutation.isPending ? 'Deleting...' : 'Delete'}
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
        <span>Last studied: {lastStudied || 'Never'}</span>
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

// QuizCard component - Updated to use React Query
function QuizCard({ title, description, questionCount, difficulty, time, tags, id = 1, onDelete, isFavorite = false, onToggleFavorite }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [favorite, setFavorite] = useState(isFavorite)
  const navigate = useNavigationWithCancellation()
  
  // Use React Query mutations
  const toggleFavoriteMutation = useToggleQuizFavorite();
  const deleteQuizMutation = useDeleteQuiz();
  
  const handleEditClick = () => {
    navigate(`/edit-quiz/${id}`)
  }
  
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }
  
  const handleToggleFavorite = async () => {
    try {
      const newFavoriteStatus = !favorite
      setFavorite(newFavoriteStatus)
      
      // Use mutation to update favorite status
      toggleFavoriteMutation.mutate(
        { id, isFavorite: newFavoriteStatus },
        {
          onSuccess: () => {
            // If there's a parent callback, invoke it
            if (onToggleFavorite) {
              onToggleFavorite(id, newFavoriteStatus)
            }
          },
          onError: () => {
            // Revert the UI state on error
            setFavorite(favorite)
          }
        }
      );
    } catch (error) {
      console.error('Error toggling favorite:', error)
      // Revert the UI state on error
      setFavorite(favorite)
    }
  }
  
  const confirmDelete = async () => {
    // Use mutation for delete
    deleteQuizMutation.mutate(id, {
      onSuccess: () => {
        if (onDelete) {
          onDelete(id);
        }
        setShowDeleteConfirm(false);
      },
      onError: (error) => {
        console.error('Error deleting quiz:', error);
        
        // If 403, user is not authorized (owner ID mismatch)
        if (error.response && error.response.status === 403) {
          // Handle by removing from UI anyway for better UX
          if (onDelete) {
            onDelete(id);
          }
        }
        setShowDeleteConfirm(false);
      }
    });
  }
  
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold truncate pr-2">{title}</h3>
        <div className="flex space-x-1">
          <button 
            onClick={handleToggleFavorite}
            className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10"
            title={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            {favorite ? 
              <StarIcon className="text-[#FFD700]" fontSize="small" /> : 
              <StarBorderIcon className="text-white/60" fontSize="small" />
            }
          </button>
          <button 
            className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10"
            onClick={() => setIsShareModalOpen(true)}
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
      
      <p className="text-white/70 text-sm mb-4 line-clamp-2">{description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="bg-white/10 px-3 py-1 rounded-full text-xs text-white/80 flex items-center gap-1">
          <span>{questionCount} Questions</span>
        </div>
        <div className="bg-white/10 px-3 py-1 rounded-full text-xs text-white/80 flex items-center gap-1">
          <span>{time}</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${
          difficulty === 'Easy' 
            ? 'bg-green-500/10 text-green-400' 
            : difficulty === 'Medium'
              ? 'bg-yellow-500/10 text-yellow-400'
              : 'bg-red-500/10 text-red-400'
        }`}>
          <span>{difficulty}</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-5">
        {tags && tags.map((tag, index) => (
          <span key={index} className="bg-[#00ff94]/10 px-2 py-0.5 rounded-full text-xs text-[#00ff94]">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={() => navigate(`/take-quiz/${id}`)}
          className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex-1"
        >
          Start Quiz
        </button>
        <button 
          onClick={handleEditClick}
          className="bg-[#18092a]/60 text-white px-4 py-2 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors"
        >
          Edit
        </button>
      </div>
      
      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#18092a] rounded-xl p-6 border border-gray-800/30 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-2">Delete Quiz</h3>
            <p className="text-white/70 mb-4">
              Are you sure you want to delete "{title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-lg border border-gray-700 text-white/80 hover:bg-white/5"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteQuizMutation.isPending}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                onClick={confirmDelete}
                disabled={deleteQuizMutation.isPending}
              >
                {deleteQuizMutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ShareModal 
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        itemToShare={{
          id,
          type: "quiz",
          title
        }}
      />
    </div>
  )
}

function Favorites() {
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'flashcards', 'quizzes'
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  const navigate = useNavigationWithCancellation();
  const queryClient = useQueryClient();
  
  // Use React Query hooks for fetching favorites
  const { 
    data: favoriteFlashcards = [], 
    isLoading: isLoadingFlashcards,
    error: flashcardsError,
  } = useFavoriteFlashcardSets();
  
  const { 
    data: favoriteQuizzes = [], 
    isLoading: isLoadingQuizzes,
    error: quizzesError,
  } = useFavoriteQuizzes();
  
  // Determine overall loading and error states
  const isLoading = isLoadingFlashcards || isLoadingQuizzes;
  const error = flashcardsError || quizzesError;
  
  // Transform flashcards data if needed
  const transformedFlashcards = favoriteFlashcards.map(set => ({
    id: set._id || set.id,
    title: set.title,
    description: set.description || '',
    category: set.category || '',
    tags: set.tags || [],
    cardCount: set.cardCount || (set.cards ? set.cards.length : 0),
    createdAt: set.createdAt,
    type: 'flashcard',
    isFavorite: true
  }));
  
  // Transform quizzes data if needed
  const transformedQuizzes = favoriteQuizzes.map(quiz => ({
    id: quiz._id || quiz.id,
    title: quiz.title,
    description: quiz.description || '',
    category: quiz.category || '',
    tags: quiz.tags || [],
    questionCount: quiz.questionCount || 0,
    difficulty: quiz.difficulty || 'Medium',
    time: quiz.time || '5 min',
    createdAt: quiz.createdAt,
    type: 'quiz',
    isFavorite: true
  }));

  // Filter favorites based on search query and active tab
  const filteredFavorites = {
    flashcards: transformedFlashcards.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    quizzes: transformedQuizzes.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle favorite toggle for flashcard sets
  const handleFlashcardFavoriteToggle = (id, newStatus) => {
    if (!newStatus) {
      // This is handled automatically by React Query invalidation
    }
  };

  // Handle favorite toggle for quizzes
  const handleQuizFavoriteToggle = (id, newStatus) => {
    if (!newStatus) {
      // This is handled automatically by React Query invalidation
    }
  };

  return (
    <Layout
      title="Favorites"
      activePage="favorites"
      searchEnabled={true}
      filterEnabled={false}
    >
      {/* Filter tabs */}
      <div className="flex mb-6 bg-[#18092a]/40 p-1 rounded-lg">
        <button
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-[#18092a] text-white' : 'text-white/70 hover:bg-white/5'}`}
          onClick={() => handleTabChange('all')}
        >
          <div className="flex items-center justify-center gap-2">
            <AppsIcon fontSize="small" />
            <span>All</span>
          </div>
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'flashcards' ? 'bg-[#18092a] text-white' : 'text-white/70 hover:bg-white/5'}`}
          onClick={() => handleTabChange('flashcards')}
        >
          <div className="flex items-center justify-center gap-2">
            <MenuBookIcon fontSize="small" />
            <span>Flashcards</span>
          </div>
        </button>
        <button
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'quizzes' ? 'bg-[#18092a] text-white' : 'text-white/70 hover:bg-white/5'}`}
          onClick={() => handleTabChange('quizzes')}
        >
          <div className="flex items-center justify-center gap-2">
            <QuizIcon fontSize="small" />
            <span>Quizzes</span>
          </div>
        </button>
      </div>
      
      {isLoading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="w-12 h-12 rounded-full border-4 border-[#00ff94]/20 border-t-[#00ff94] animate-spin"></div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-white/70 mb-4">{error}</p>
          <button 
            onClick={() => {
              // Refresh both queries
              queryClient.invalidateQueries({ queryKey: [FLASHCARD_QUERY_KEYS.FAVORITES] });
              queryClient.invalidateQueries({ queryKey: [QUIZ_QUERY_KEYS.FAVORITES] });
            }}
            className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Flashcards Section */}
          {(activeTab === 'all' || activeTab === 'flashcards') && filteredFavorites.flashcards.length > 0 && (
            <div className="mb-8">
              {activeTab === 'all' && (
                <h2 className="text-xl font-bold mb-4 px-2">Flashcard Sets</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredFavorites.flashcards.map(set => (
                  <FlashcardCard 
                    key={set.id}
                    id={set.id}
                    title={set.title}
                    cards={set.cardCount}
                    lastStudied={set.lastStudied || 'Never'}
                    progress={set.progress || 0}
                    isFavorite={true}
                    onToggleFavorite={handleFlashcardFavoriteToggle}
                    onDelete={(id) => {
                      // Remove deleted flashcard from favorites
                      // This is handled automatically by React Query invalidation
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Quizzes Section */}
          {(activeTab === 'all' || activeTab === 'quizzes') && filteredFavorites.quizzes.length > 0 && (
            <div>
              {activeTab === 'all' && (
                <h2 className="text-xl font-bold mb-4 px-2">Quizzes</h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredFavorites.quizzes.map(quiz => (
                  <QuizCard 
                    key={quiz.id}
                    id={quiz.id}
                    title={quiz.title}
                    description={quiz.description}
                    questionCount={quiz.questionCount}
                    difficulty={quiz.difficulty}
                    time={quiz.time}
                    tags={quiz.tags}
                    isFavorite={true}
                    onToggleFavorite={handleQuizFavoriteToggle}
                    onDelete={(id) => {
                      // Remove deleted quiz from favorites
                      // This is handled automatically by React Query invalidation
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* No favorites message */}
          {filteredFavorites.flashcards.length === 0 && filteredFavorites.quizzes.length === 0 && (
            <div className="text-center py-16">
              <div className="bg-[#18092a]/60 rounded-xl p-8 border border-gray-800/30 shadow-lg inline-block max-w-md">
                <div className="text-[#00ff94] mb-4">
                  <StarIcon style={{ fontSize: 48 }} />
                </div>
                <h3 className="text-xl font-bold mb-2">No favorites yet</h3>
                <p className="text-white/70 mb-6">
                  Add flashcard sets and quizzes to your favorites by clicking the star icon.
                </p>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={() => navigate('/flashcards')}
                    className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
                  >
                    Browse Flashcards
                  </button>
                  <button 
                    onClick={() => navigate('/quizzes')}
                    className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
                  >
                    Browse Quizzes
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </Layout>
  );
}

export default Favorites 