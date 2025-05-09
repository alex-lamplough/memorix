import { useState } from 'react'
import logger from '../utils/logger';
import { useNavigate } from 'react-router-dom'

// Icons
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import ShareIcon from '@mui/icons-material/Share'
import StarIcon from '@mui/icons-material/Star'
import StarBorderIcon from '@mui/icons-material/StarBorder'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

// Components
import ShareModal from './ShareModal'

// Services
import { flashcardService } from '../services/api'

function FlashcardSet({ title, cards, lastStudied, progress, id = 1, isFavorite = false, onToggleFavorite, correctPercentage = 0, totalStudied = 0 }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  const [favorite, setFavorite] = useState(isFavorite)
  const navigate = useNavigate()
  
  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    try {
      const newFavoriteStatus = !favorite
      setFavorite(newFavoriteStatus)
      
      // Call the API to update the favorite status
      await flashcardService.toggleFavorite(id, newFavoriteStatus)
      
      // If there's a parent callback, invoke it
      if (onToggleFavorite) {
        onToggleFavorite(id, newFavoriteStatus)
      }
    } catch (error) {
      logger.error('Error toggling favorite:', error)
      // Revert the UI state on error
      setFavorite(favorite)
    }
  }
  
  // Handle study button click
  const handleStudyClick = () => {
    navigate(`/study/${id}`)
  }
  
  // Handle edit button click
  const handleEditClick = () => {
    navigate(`/edit/${id}`)
    setShowOptionsMenu(false)
  }
  
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="flex items-center gap-2">
          <button 
            onClick={handleToggleFavorite}
            className={`text-${favorite ? '[#FFD700]' : 'white/60'} hover:text-${favorite ? '[#FFD700]' : 'white'} p-1`}
            aria-label={favorite ? "Remove from favorites" : "Add to favorites"}
            title={favorite ? "Remove from favorites" : "Add to favorites"}
          >
            {favorite ? <StarIcon className="text-[#FFD700]" fontSize="small" /> : <StarBorderIcon className="text-white/60 hover:text-white" fontSize="small" />}
          </button>
          <div className="relative">
            <button 
              className="text-white/60 hover:text-white p-1"
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
            >
              <MoreHorizIcon fontSize="small" />
            </button>
            
            {showOptionsMenu && (
              <div className="absolute right-0 top-full mt-2 bg-[#18092a] border border-gray-800/50 rounded-lg shadow-xl w-40 z-10">
                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsShareModalOpen(true)
                      setShowOptionsMenu(false)
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/80 hover:bg-white/5 text-left"
                  >
                    <ShareIcon fontSize="small" />
                    <span>Share</span>
                  </button>
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/80 hover:bg-white/5 text-left"
                  >
                    <span>Edit</span>
                  </button>
                  <button
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/80 hover:bg-white/5 text-left"
                  >
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between mb-2">
          <span className="text-white/70 text-sm">
            {cards} {cards === 1 ? 'card' : 'cards'}
          </span>
          {totalStudied > 0 && (
            <span className="text-white/70 text-sm flex items-center gap-1">
              <CheckCircleOutlineIcon fontSize="small" className="text-[#00ff94]" />
              {correctPercentage}% correct
            </span>
          )}
        </div>
        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00ff94]" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>
      
      <div className="flex justify-between mb-5">
        <div className="text-white/70 text-sm flex items-center gap-1">
          <AccessTimeIcon fontSize="small" />
          <span>Last studied: {lastStudied}</span>
        </div>
        {totalStudied > 0 && (
          <div className="text-white/70 text-sm">
            {totalStudied} {totalStudied === 1 ? 'session' : 'sessions'}
          </div>
        )}
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={handleStudyClick}
          className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex-1"
        >
          Study
        </button>
        <button 
          onClick={() => setIsShareModalOpen(true)}
          className="bg-[#18092a]/60 text-white px-4 py-2 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors flex items-center justify-center"
        >
          <ShareIcon fontSize="small" />
        </button>
      </div>
      
      <ShareModal 
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        itemToShare={{
          id,
          type: "flashcards",
          title
        }}
      />
    </div>
  )
}

export default FlashcardSet 