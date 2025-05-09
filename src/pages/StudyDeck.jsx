import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import FocusStudyDeck from '../components/FocusStudyDeck'
import { useFlashcardSet, useUpdateStudyProgress } from '../api/queries/flashcards'

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

// localStorage key for saving study progress
const STUDY_PROGRESS_KEY = 'memorix_study_progress';
// Debounce delay for API calls (in ms)
const SAVE_DEBOUNCE_DELAY = 1000;

function StudyDeck() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [reviewLaterCards, setReviewLaterCards] = useState({})
  const [learnedCards, setLearnedCards] = useState({})
  const saveBackendTimeoutRef = useRef(null);
  
  // Fetch flashcard set using React Query
  const { 
    data: flashcardSet,
    isLoading: isLoadingFlashcardSet,
    error: flashcardError 
  } = useFlashcardSet(id);
  
  // Use React Query mutation for updating study progress
  const { mutate: updateStudyProgress } = useUpdateStudyProgress();
  
  // Initialize state when flashcard data is loaded
  useEffect(() => {
    if (flashcardSet && flashcardSet.studyProgress) {
      // Initialize state from server data
      if (flashcardSet.studyProgress.currentCardIndex !== undefined) {
        setCurrentCardIndex(flashcardSet.studyProgress.currentCardIndex);
      }
      
      if (flashcardSet.studyProgress.learnedCards) {
        setLearnedCards(flashcardSet.studyProgress.learnedCards);
      }
      
      if (flashcardSet.studyProgress.reviewLaterCards) {
        setReviewLaterCards(flashcardSet.studyProgress.reviewLaterCards);
      }
    } else if (flashcardSet) {
      // If no server data, try local storage
      loadSavedProgress();
    }
  }, [flashcardSet]);
  
  // Set loading and error states based on React Query state
  useEffect(() => {
    setIsLoading(isLoadingFlashcardSet);
    if (flashcardError) {
      setError(flashcardError.message || 'Failed to load flashcards');
      // Try loading from localStorage as fallback if there's an error
      loadSavedProgress();
    }
  }, [isLoadingFlashcardSet, flashcardError]);
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clear any pending save timeouts
      if (saveBackendTimeoutRef.current) {
        clearTimeout(saveBackendTimeoutRef.current);
      }
    };
  }, []);
  
  // Load saved progress from localStorage
  const loadSavedProgress = () => {
    try {
      const savedProgressJSON = localStorage.getItem(STUDY_PROGRESS_KEY);
      if (savedProgressJSON) {
        const savedProgress = JSON.parse(savedProgressJSON);
        
        // Only restore progress for the current deck
        if (savedProgress.deckId === id) {
          if (savedProgress.currentCardIndex !== undefined) {
            setCurrentCardIndex(savedProgress.currentCardIndex);
          }
          
          if (savedProgress.learnedCards) {
            setLearnedCards(savedProgress.learnedCards);
          }
          
          if (savedProgress.reviewLaterCards) {
            setReviewLaterCards(savedProgress.reviewLaterCards);
          }
        }
      }
    } catch (err) {
      // If there's an error, we just continue without the saved progress
    }
  };
  
  // Save progress with debouncing
  const saveProgress = (progressData) => {
    try {
      // Save to localStorage
      const progressToSave = {
        deckId: id,
        timestamp: Date.now(),
        ...progressData
      };
      
      localStorage.setItem(STUDY_PROGRESS_KEY, JSON.stringify(progressToSave));
      
      // Save to backend using debouncing
      if (saveBackendTimeoutRef.current) {
        clearTimeout(saveBackendTimeoutRef.current);
      }
      
      saveBackendTimeoutRef.current = setTimeout(() => {
        // Use the mutation instead of direct service call
        updateStudyProgress({ 
          id, 
          progressData 
        });
        
        saveBackendTimeoutRef.current = null;
      }, SAVE_DEBOUNCE_DELAY);
      
      // Update state if needed
      if (progressData.currentCardIndex !== undefined) {
        setCurrentCardIndex(progressData.currentCardIndex);
      }
      
      if (progressData.learnedCards) {
        setLearnedCards(progressData.learnedCards);
      }
      
      if (progressData.reviewLaterCards) {
        setReviewLaterCards(progressData.reviewLaterCards);
      }
    } catch (err) {
      // Silent fail - we don't want to interrupt the user experience
    }
  };
  
  // Handle card completion
  const handleCardComplete = (cardId) => {
    // Update learned cards
    const newLearnedCards = {
      ...learnedCards,
      [cardId]: true
    };
    setLearnedCards(newLearnedCards);
    
    // Remove from review if it was there
    if (reviewLaterCards[cardId]) {
      const newReviewLaterCards = { ...reviewLaterCards };
      delete newReviewLaterCards[cardId];
      setReviewLaterCards(newReviewLaterCards);
      
      // Save progress
      saveProgress({
        learnedCards: newLearnedCards,
        reviewLaterCards: newReviewLaterCards,
        currentCardIndex: currentCardIndex + 1
      });
    } else {
      // Save progress
      saveProgress({
        learnedCards: newLearnedCards,
        currentCardIndex: currentCardIndex + 1
      });
    }
  };
  
  // Handle review later toggling
  const handleReviewLaterToggle = (cardId, isMarkedForReview) => {
    // Update review later cards
    const newReviewLaterCards = { ...reviewLaterCards };
    
    if (isMarkedForReview) {
      newReviewLaterCards[cardId] = true;
    } else {
      delete newReviewLaterCards[cardId];
    }
    
    setReviewLaterCards(newReviewLaterCards);
    
    // Save progress
    saveProgress({
      reviewLaterCards: newReviewLaterCards,
      currentCardIndex: currentCardIndex + 1
    });
  };
  
  // Handle progress updates from the FocusStudyDeck component
  const handleProgressUpdate = (progressData) => {
    saveProgress(progressData);
  };
  
  // Handle deck completion
  const handleDeckComplete = (completionData) => {
    // Update states with completion data
    if (completionData.learnedCards) {
      setLearnedCards(completionData.learnedCards);
    }
    
    if (completionData.reviewLaterCards) {
      setReviewLaterCards(completionData.reviewLaterCards);
    }
    
    // Save final state
    saveProgress({
      learnedCards: completionData.learnedCards,
      reviewLaterCards: completionData.reviewLaterCards,
      studyMode: 'completed'
    });
  };
  
  // Handle deck reset
  const handleDeckReset = () => {
    setLearnedCards({});
    setReviewLaterCards({});
    setCurrentCardIndex(0);
    
    // Clear saved progress
    localStorage.removeItem(STUDY_PROGRESS_KEY);
    
    // Save reset state to backend
    updateStudyProgress({
      id,
      progressData: {
        learnedCards: {},
        reviewLaterCards: {},
        currentCardIndex: 0,
        studyMode: 'normal'
      }
    });
  };
  
  // Handle exit
  const handleExit = (exitData) => {
    // Save current state before exiting
    saveProgress(exitData);
    
    // Navigate back
    navigate('/dashboard');
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-white/20 border-t-[#00ff94] rounded-full animate-spin"></div>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex justify-center items-center p-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold mb-2">Error</h2>
          <p className="text-white/80 mb-4">{error}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }
  
  // Render main component
  return (
    <FocusStudyDeck
      flashcardSet={flashcardSet}
      currentCardIndex={currentCardIndex}
      learnedCards={learnedCards}
      reviewLaterCards={reviewLaterCards}
      onCardComplete={handleCardComplete}
      onReviewLaterToggle={handleReviewLaterToggle}
      onProgressUpdate={handleProgressUpdate}
      onDeckComplete={handleDeckComplete}
      onDeckReset={handleDeckReset}
      onExit={handleExit}
    />
  );
}

export default StudyDeck 