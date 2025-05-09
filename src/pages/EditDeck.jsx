import { useState, useEffect, useRef } from 'react'
import logger from '../utils/logger';
import { useParams, useNavigate } from 'react-router-dom'
import { useFlashcardSet, useUpdateFlashcardSet } from '../api/queries/flashcards'

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
  const [error, setError] = useState(null)
  const [showSnackbar, setShowSnackbar] = useState(false)
  const [snackbarMessage, setSnackbarMessage] = useState('')
  const [snackbarSeverity, setSnackbarSeverity] = useState('success')
  const isMountedRef = useRef(true)
  
  // Fetch flashcard set using React Query
  const { 
    data: fetchedFlashcardSet, 
    isLoading,
    error: fetchError 
  } = useFlashcardSet(id);
  
  // Use React Query mutation for updating flashcard set
  const { 
    mutate: updateFlashcardSet,
    isPending: isSaving
  } = useUpdateFlashcardSet();
  
  // Set up isMountedRef for cleanup
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Initialize the state when data is loaded
  useEffect(() => {
    if (fetchedFlashcardSet && isMountedRef.current) {
      setFlashcardSet(fetchedFlashcardSet);
    }
  }, [fetchedFlashcardSet]);
  
  // Handle fetch errors
  useEffect(() => {
    if (fetchError && isMountedRef.current) {
      setError(fetchError.message || 'Failed to load flashcard set');
    }
  }, [fetchError]);
  
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
      // Use React Query mutation to update flashcard set
      updateFlashcardSet({ id, flashcardSet }, {
        onSuccess: () => {
          showSnackbarMessage('Flashcard set saved successfully!', 'success');
        },
        onError: (err) => {
          logger.error('Error saving flashcard set:', { value: err });
          showSnackbarMessage('Failed to save changes. Please try again.', 'error');
        }
      });
    } catch (err) {
      logger.error('Error saving flashcard set:', { value: err });
      showSnackbarMessage('Failed to save changes. Please try again.', 'error');
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
          <p className="text-white/70 text-sm">
            Make changes to your flashcard set and click Save Changes when you're done.
          </p>
        </div>
        
        <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg mb-8">
          <div className="mb-6">
            <label htmlFor="title" className="block text-white font-medium mb-2">Title</label>
            <input
              id="title"
              type="text"
              value={flashcardSet.title}
              onChange={handleTitleChange}
              className="w-full bg-[#2E0033]/30 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff94]/50 focus:border-transparent"
              placeholder="Enter flashcard set title"
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="description" className="block text-white font-medium mb-2">Description</label>
            <textarea
              id="description"
              value={flashcardSet.description || ''}
              onChange={handleDescriptionChange}
              className="w-full bg-[#2E0033]/30 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff94]/50 focus:border-transparent min-h-[100px]"
              placeholder="Enter flashcard set description"
            ></textarea>
          </div>
        </div>
        
        <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Flashcards</h2>
            <button
              onClick={handleAddCard}
              className="bg-[#00ff94]/10 text-[#00ff94] px-3 py-1.5 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 inline-flex items-center"
            >
              <AddCircleOutlineIcon fontSize="small" className="mr-1" /> Add Card
            </button>
          </div>
          
          {flashcardSet.cards.map((card, index) => (
            <div key={index} className="bg-[#2E0033]/30 rounded-lg p-4 mb-4 border border-gray-800/50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium">Card {index + 1}</h3>
                <button
                  onClick={() => handleDeleteCard(index)}
                  className="text-red-400 hover:text-red-300 p-1"
                  disabled={flashcardSet.cards.length <= 1}
                  title="Delete card"
                >
                  <DeleteOutlineIcon fontSize="small" />
                </button>
              </div>
              
              <div className="mb-3">
                <label htmlFor={`card-front-${index}`} className="block text-white/70 text-sm mb-1">Front</label>
                <textarea
                  id={`card-front-${index}`}
                  value={card.front}
                  onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                  className="w-full bg-[#18092a]/60 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff94]/50 focus:border-transparent min-h-[80px]"
                  placeholder="Enter card front content"
                ></textarea>
              </div>
              
              <div>
                <label htmlFor={`card-back-${index}`} className="block text-white/70 text-sm mb-1">Back</label>
                <textarea
                  id={`card-back-${index}`}
                  value={card.back}
                  onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                  className="w-full bg-[#18092a]/60 border border-gray-800/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-[#00ff94]/50 focus:border-transparent min-h-[80px]"
                  placeholder="Enter card back content"
                ></textarea>
              </div>
            </div>
          ))}
          
          <button
            onClick={handleAddCard}
            className="w-full bg-[#2E0033]/30 border border-gray-800/50 rounded-lg p-3 text-white/70 hover:bg-[#2E0033]/50 transition-colors flex items-center justify-center"
          >
            <AddCircleOutlineIcon fontSize="small" className="mr-1" /> Add Another Card
          </button>
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleGoBack}
            className="bg-[#18092a]/60 text-white px-4 py-2 rounded-lg hover:bg-[#18092a] transition-colors border border-gray-800/30"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className={`px-6 py-2 rounded-lg inline-flex items-center ${
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
      
      <Snackbar
        open={showSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  )
}

export default EditDeck 