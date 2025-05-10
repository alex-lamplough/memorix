import { useState, useEffect } from 'react'
import logger from '../utils/logger'

// Hooks
import useNavigationWithCancellation from '../hooks/useNavigationWithCancellation'

// Icons
import ShareIcon from '@mui/icons-material/Share'
import DeleteIcon from '@mui/icons-material/Delete'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import BookmarkIcon from '@mui/icons-material/Bookmark'

// Components
import ShareModal from './ShareModal'

function FlashcardSetCard({ 
  title, 
  cards, 
  lastStudied, 
  progress, 
  id, 
  onDelete, 
  isFavorite = false, 
  onToggleFavorite, 
  learnedCount = 0,
  reviewLaterCount = 0  
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [favorite, setFavorite] = useState(isFavorite)
  const navigate = useNavigationWithCancellation()
  
  // Ensure progress is always a number between 0-100
  const safeProgress = typeof progress === 'number' && progress >= 0 && progress <= 100 
    ? progress 
    : 0;
  
  // Calculate learned/total ratio
  const learnedRatio = cards > 0 ? `${learnedCount || 0}/${cards}` : '0/0';
  
  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    try {
      const newFavoriteStatus = !favorite
      setFavorite(newFavoriteStatus)
      
      // Call the parent callback to update the state
      if (onToggleFavorite) {
        onToggleFavorite(id, newFavoriteStatus)
      }
    } catch (error) {
      logger.error('Error toggling favorite:', error)
      // Revert the UI state on error
      setFavorite(favorite)
    }
  }
  
  const handleStudyClick = () => {
    navigate(`/study/${id}`)
  }
  
  const handleEditClick = () => {
    navigate(`/edit/${id}`)
  }
  
  const handleShareClick = () => {
    setIsShareModalOpen(true)
  }
  
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }
  
  const confirmDelete = async () => {
    try {
      setIsDeleting(true)
      await onDelete(id)
      setIsDeleting(false)
    } catch (error) {
      logger.error('Error deleting flashcard set:', error)
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
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete} 
                className="px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg"
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
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
      
      {/* Progress and card count */}
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-white/70 text-sm">
            {cards} {cards === 1 ? 'card' : 'cards'}
          </span>
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00ff94]" 
            style={{ width: `${safeProgress}%` }}
          ></div>
        </div>
      </div>
      
      {/* Stats section - simplified to show only key metrics */}
      <div className="mb-5 bg-[#15052a]/50 p-3 rounded-lg border border-gray-800/20">
        <div className="grid grid-cols-2 gap-2">
          {/* Last studied info */}
          <div className="col-span-2 flex justify-between items-center mb-2 pb-2 border-b border-gray-800/20">
            <div className="text-white/70 text-sm flex items-center gap-1">
              <AccessTimeIcon fontSize="small" />
              <span>Last studied: {lastStudied}</span>
            </div>
          </div>
          
          {/* Learned cards */}
          <div className="flex items-center gap-1 text-white/70 text-sm">
            <CheckCircleOutlineIcon fontSize="small" className="text-[#00ff94]" />
            <span>Learned: <span className="text-[#00ff94] font-medium">{learnedRatio}</span></span>
          </div>
          
          {/* Cards for review */}
          <div className="flex items-center gap-1 text-white/70 text-sm">
            <BookmarkIcon fontSize="small" className={reviewLaterCount > 0 ? "text-[#ff9f3e]" : "text-white/50"} />
            <span>For review: 
              <span className={reviewLaterCount > 0 ? "text-[#ff9f3e] font-medium ml-1" : "text-white/50 ml-1"}>
                {reviewLaterCount}
              </span>
            </span>
          </div>
        </div>
      </div>
      
      {/* Action buttons */}
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

export default FlashcardSetCard