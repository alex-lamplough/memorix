import { useState, useEffect, useRef } from 'react'
import logger from '../utils/logger';
import { useMediaQuery } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'

// Custom hooks
import useNavigationWithCancellation from '../hooks/useNavigationWithCancellation'

// Components
import Layout from '../components/Layout'
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import ShareModal from '../components/ShareModal'
import QuizCreationModal from '../components/Quizzes/QuizCreationModal'

// Icons
import ShareIcon from '@mui/icons-material/Share'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import DeleteIcon from '@mui/icons-material/Delete'

// Services
import { quizService } from '../services/quiz-service'
import { handleRequestError } from '../services/utils'

// Queries
import { useQuizzes, useDeleteQuiz, useToggleFavorite } from '../api/queries/quizzes'

function QuizCard({ title, description, questionCount, difficulty, time, tags, id = 1, onDelete, isFavorite = false, onToggleFavorite }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [favorite, setFavorite] = useState(isFavorite)
  const navigate = useNavigationWithCancellation()
  
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
      
      // Use the parent callback that uses React Query
      if (onToggleFavorite) {
        onToggleFavorite(id, newFavoriteStatus)
      }
    } catch (error) {
      logger.error('Error toggling favorite:', error)
      // Revert the UI state on error
      setFavorite(favorite)
    }
  }
  
  const confirmDelete = async () => {
    try {
      setIsDeleting(true)
      
      // Use the parent callback that uses React Query
      if (onDelete) {
        await onDelete(id)
      }
      
      setIsDeleting(false)
    } catch (error) {
      logger.error('Error deleting quiz:', error)
      setIsDeleting(false)
    }
    setShowDeleteConfirm(false)
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
        <button className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex-1">
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
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
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

function Quizzes() {
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  
  // Use React Query to fetch quizzes
  const { 
    data: quizzesData = [], 
    isLoading, 
    error,
    refetch: refetchQuizzes
  } = useQuizzes();
  
  // Use mutations
  const { mutate: deleteQuiz } = useDeleteQuiz();
  const { mutate: toggleFavorite } = useToggleFavorite();
  
  // Transform data to match our component requirements
  const quizzes = quizzesData.map(quiz => ({
    id: quiz._id,
    title: quiz.title,
    description: quiz.description,
    questionCount: quiz.questionCount || quiz.totalQuestions || 0,
    difficulty: quiz.difficulty || 'Medium',
    time: quiz.estimatedTime || '15 min',
    tags: quiz.tags || [],
    isFavorite: quiz.isFavorite || false
  }));
  
  const handleOpenQuizModal = () => {
    setIsQuizModalOpen(true);
  }
  
  const handleCloseQuizModal = () => {
    setIsQuizModalOpen(false);
  }

  // Refresh quizzes after creating a new one
  const handleQuizCreated = () => {
    refetchQuizzes();
  }
  
  // Handle quiz deletion
  const handleQuizDeleted = (quizId) => {
    deleteQuiz(quizId);
  }
  
  // Handle toggling favorite status
  const handleToggleFavorite = (id, newStatus) => {
    toggleFavorite({ id, isFavorite: newStatus });
  };
  
  return (
    <Layout
      title="Quizzes"
      activePage="quizzes"
      actionButton="Create Quiz"
      onActionButtonClick={handleOpenQuizModal}
    >
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00ff94]"></div>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 text-red-400 p-4 rounded-lg text-center">
          {error.message || 'Failed to load your quizzes. Please try again.'}
        </div>
      ) : quizzes.length === 0 ? (
        <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-center">
          <h3 className="text-xl font-bold mb-2">No quizzes found</h3>
          <p className="text-white/70 mb-6">Get started by creating your first quiz</p>
          <button 
            onClick={handleOpenQuizModal}
            className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
          >
            <span className="flex items-center gap-2">
              <AddCircleOutlineIcon fontSize="small" />
              Create Quiz
            </span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {quizzes.map(quiz => (
            <QuizCard 
              key={quiz.id}
              id={quiz.id}
              title={quiz.title}
              description={quiz.description}
              questionCount={quiz.questionCount}
              difficulty={quiz.difficulty}
              time={quiz.time}
              tags={quiz.tags}
              isFavorite={quiz.isFavorite}
              onToggleFavorite={handleToggleFavorite}
              onDelete={handleQuizDeleted}
            />
          ))}
        </div>
      )}
      
      {/* Quiz creation modal */}
      {isQuizModalOpen && (
        <QuizCreationModal
          isOpen={isQuizModalOpen}
          onClose={handleCloseQuizModal}
          onQuizCreated={handleQuizCreated}
        />
      )}
    </Layout>
  );
}

export default Quizzes 