import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { flashcardService } from '../services/api'

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import SaveIcon from '@mui/icons-material/Save'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'

// MUI components for Snackbar
import { Snackbar, Alert } from '@mui/material'

function EditDeck() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [flashcardSet, setFlashcardSet] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  
  // Fetch the flashcard set
  useEffect(() => {
    const fetchFlashcardSet = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log(`Fetching flashcard set with ID: ${id}`)
        const data = await flashcardService.getFlashcardSet(id)
        
        setFlashcardSet(data)
      } catch (err) {
        console.error('Error fetching flashcard set:', err)
        setError(err.message || 'Failed to load flashcard set')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchFlashcardSet()
  }, [id])
  
  const showSnackbarMessage = (message, severity) => {
    setSnackbarMessage(message)
    setSnackbarSeverity(severity)
    setShowSnackbar(true)
  }
  
  const handleTitleChange = (e) => {
    setFlashcardSet(prev => ({
      ...prev,
      title: e.target.value
    }))
  }
  
  const handleDescriptionChange = (e) => {
    setFlashcardSet(prev => ({
      ...prev,
      description: e.target.value
    }))
  }
  
  const handleCardChange = (index, field, value) => {
    setFlashcardSet(prev => {
      const updatedCards = [...prev.cards]
      updatedCards[index] = {
        ...updatedCards[index],
        [field]: value
      }
      return {
        ...prev,
        cards: updatedCards
      }
    })
  }
  
  const handleAddCard = () => {
    setFlashcardSet(prev => ({
      ...prev,
      cards: [
        ...prev.cards,
        { front: '', back: '' }
      ]
    }))
  }
  
  const handleDeleteCard = (index) => {
    setFlashcardSet(prev => {
      const updatedCards = [...prev.cards]
      updatedCards.splice(index, 1)
      return {
        ...prev,
        cards: updatedCards
      }
    })
  }
  
  const handleSave = async () => {
    try {
      setIsSaving(true)
      await flashcardService.updateFlashcardSet(id, flashcardSet)
      showSnackbarMessage('Flashcard set saved successfully!', 'success')
    } catch (err) {
      console.error('Error saving flashcard set:', err)
      showSnackbarMessage('Failed to save changes. Please try again.', 'error')
    } finally {
      setIsSaving(false)
    }
  }
  
  const handleGoBack = () => {
    navigate('/dashboard')
  }
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-[#00ff94] rounded-full animate-spin"></div>
      </div>
    )
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex flex-col justify-center items-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-white/80 mb-4">{error}</p>
          <button 
            onClick={handleGoBack}
            className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 inline-flex items-center"
          >
            <ArrowBackIcon fontSize="small" className="mr-1" /> Back to Dashboard
          </button>
        </div>
      </div>
    )
  }
  
  // No flashcard set found state
  if (!flashcardSet) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex flex-col justify-center items-center p-4">
        <div className="bg-[#18092a]/60 rounded-xl p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-2">Flashcard Set Not Found</h2>
          <p className="text-white/80 mb-4">The flashcard set you're looking for doesn't exist or might have been deleted.</p>
          <button 
            onClick={handleGoBack}
            className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 inline-flex items-center"
          >
            <ArrowBackIcon fontSize="small" className="mr-1" /> Back to Dashboard
          </button>
        </div>
      </div>
    )
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white">
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex justify-between items-center">
          <button 
            onClick={handleGoBack}
            className="bg-[#18092a]/60 text-white px-3 py-1.5 rounded-lg hover:bg-[#18092a] transition-colors border border-gray-800/30 inline-flex items-center"
          >
            <ArrowBackIcon fontSize="small" className="mr-1" /> Back
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(`/study/${id}`)}
              className="bg-[#a259ff]/10 text-[#a259ff] px-3 py-1.5 rounded-lg hover:bg-[#a259ff]/20 transition-colors border border-[#a259ff]/30 inline-flex items-center"
            >
              Study Deck
            </button>
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className={`px-4 py-2 rounded-lg inline-flex items-center ${
                isSaving 
                  ? 'bg-gray-700/50 text-gray-400 cursor-not-allowed' 
                  : 'bg-[#00ff94]/10 text-[#00ff94] hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30'
              }`}
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/20 border-t-[#00ff94] rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <SaveIcon fontSize="small" className="mr-1" /> Save Changes
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center mb-2">
            <EditIcon className="text-[#00ff94] mr-2" />
            <h1 className="text-2xl font-bold">Edit Flashcard Set</h1>
          </div>
          
          {/* Title and description */}
          <div className="bg-[#18092a]/60 rounded-xl p-6 mb-6 border border-gray-800/30">
            <div className="mb-4">
              <label htmlFor="title" className="block text-white/70 mb-1 text-sm">Title</label>
              <input
                type="text"
                id="title"
                value={flashcardSet.title || ''}
                onChange={handleTitleChange}
                className="w-full bg-[#15052a]/80 text-white rounded-lg px-4 py-2 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50 focus:ring-1 focus:ring-[#00ff94]/30"
              />
            </div>
            
            <div>
              <label htmlFor="description" className="block text-white/70 mb-1 text-sm">Description (optional)</label>
              <textarea
                id="description"
                value={flashcardSet.description || ''}
                onChange={handleDescriptionChange}
                className="w-full bg-[#15052a]/80 text-white rounded-lg px-4 py-2 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50 focus:ring-1 focus:ring-[#00ff94]/30 h-24 resize-none"
              ></textarea>
            </div>
          </div>
          
          {/* Cards */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Flashcards ({flashcardSet.cards?.length || 0})</h2>
              <button
                onClick={handleAddCard}
                className="bg-[#00ff94]/10 text-[#00ff94] px-3 py-1.5 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 inline-flex items-center"
              >
                <AddCircleOutlineIcon fontSize="small" className="mr-1" /> Add Card
              </button>
            </div>
            
            {flashcardSet.cards?.map((card, index) => (
              <div key={index} className="bg-[#18092a]/60 rounded-xl p-5 border border-gray-800/30 relative">
                <button
                  onClick={() => handleDeleteCard(index)}
                  className="absolute top-3 right-3 text-white/40 hover:text-white/70 transition-colors"
                >
                  <DeleteOutlineIcon />
                </button>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/70 mb-1 text-sm">Front (Question)</label>
                    <textarea
                      value={card.front || ''}
                      onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                      className="w-full bg-[#15052a]/80 text-white rounded-lg px-4 py-2 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50 focus:ring-1 focus:ring-[#00ff94]/30 h-24 resize-none"
                    ></textarea>
                  </div>
                  
                  <div>
                    <label className="block text-white/70 mb-1 text-sm">Back (Answer)</label>
                    <textarea
                      value={card.back || ''}
                      onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                      className="w-full bg-[#15052a]/80 text-white rounded-lg px-4 py-2 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50 focus:ring-1 focus:ring-[#00ff94]/30 h-24 resize-none"
                    ></textarea>
                  </div>
                </div>
                
                <div className="mt-2 text-white/50 text-xs">
                  Card {index + 1} of {flashcardSet.cards.length}
                </div>
              </div>
            ))}
            
            {(!flashcardSet.cards || flashcardSet.cards.length === 0) && (
              <div className="bg-[#18092a]/60 rounded-xl p-8 text-center border border-gray-800/30">
                <p className="text-white/70 mb-4">No cards in this set yet. Add your first card to get started.</p>
                <button
                  onClick={handleAddCard}
                  className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 inline-flex items-center"
                >
                  <AddCircleOutlineIcon fontSize="small" className="mr-1" /> Add First Card
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Snackbar for notifications */}
      <Snackbar 
        open={showSnackbar} 
        autoHideDuration={4000} 
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ 
            backgroundColor: snackbarSeverity === 'success' ? '#00ff94' : undefined,
            color: snackbarSeverity === 'success' ? '#18092a' : undefined,
            fontWeight: snackbarSeverity === 'success' ? 'bold' : undefined
          }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default EditDeck 