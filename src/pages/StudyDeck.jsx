import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { flashcardService } from '../services/api'
import FocusStudyDeck from '../components/FocusStudyDeck'
import { useQuery } from '@tanstack/react-query'

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
  } = useQuery({
    queryKey: ['flashcardSet', id],
    queryFn: () => flashcardService.getFlashcardSet(id),
    onSuccess: (data) => {
      if (data && data.studyProgress) {
        // Initialize state from server data
        if (data.studyProgress.currentCardIndex !== undefined) {
          setCurrentCardIndex(data.studyProgress.currentCardIndex);
        }
        
        if (data.studyProgress.learnedCards) {
          setLearnedCards(data.studyProgress.learnedCards);
        }
        
        if (data.studyProgress.reviewLaterCards) {
          setReviewLaterCards(data.studyProgress.reviewLaterCards);
        }
      } else {
        // If no server data, try local storage
        loadSavedProgress();
      }
    },
    onError: (err) => {
      // Try loading from localStorage as fallback
      loadSavedProgress();
    }
  });
  
  // Set loading and error states based on React Query state
  useEffect(() => {
    setIsLoading(isLoadingFlashcardSet);
    if (flashcardError) {
      setError(flashcardError.message || 'Failed to load flashcards');
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
        flashcardService.updateStudyProgress(id, progressData)
          .catch(() => {
            // Silent fail - we don't want to interrupt the user experience
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
    flashcardService.updateStudyProgress(id, {
      learnedCards: {},
      reviewLaterCards: {},
      currentCardIndex: 0,
      studyMode: 'normal'
    }).catch(() => {
      // Silent fail
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
      <div className="flex items-center justify-center min-h-screen bg-[#18092a] text-white p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00ff94] mb-4"></div>
          <p>Loading flashcards...</p>
        </div>
      </div>
    )
  }
  
  // Render error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#18092a] text-white p-4">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold mb-2">Error Loading Flashcards</h2>
          <p className="mb-4">{error}</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-[#00ff94] text-[#18092a] rounded-lg font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }
  
  // Render empty state
  if (!flashcardSet) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#18092a] text-white p-4">
        <div className="text-center max-w-md">
          <div className="text-amber-500 text-5xl mb-4">🤔</div>
          <h2 className="text-xl font-bold mb-2">No Flashcards Found</h2>
          <p className="mb-4">This flashcard set appears to be empty or not found.</p>
          <button 
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-[#00ff94] text-[#18092a] rounded-lg font-medium"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }
    
  // Render study deck
  return (
    <div className="flex flex-col min-h-screen bg-[#18092a]">
      <div className="flex items-center p-4 bg-[#18092a]/80 backdrop-blur-sm border-b border-gray-800/30">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-white/5 transition-colors"
          aria-label="Go back"
        >
          <ArrowBackIcon className="text-white" />
        </button>
        <h1 className="ml-4 text-xl font-medium text-white truncate">
          {flashcardSet.title}
        </h1>
      </div>
      
      <div className="flex-1">
        <FocusStudyDeck
          cards={flashcardSet.cards}
          initialCardIndex={currentCardIndex}
          onCardComplete={handleCardComplete}
          onReviewLaterToggle={handleReviewLaterToggle}
          onDeckComplete={handleDeckComplete}
          onReset={handleDeckReset}
          onExit={handleExit}
          onProgressUpdate={handleProgressUpdate}
          reviewLaterCards={reviewLaterCards}
          learnedCards={learnedCards}
        />
      </div>
    </div>
  );
}

export default StudyDeck; 