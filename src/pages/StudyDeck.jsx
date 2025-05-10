import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import FocusStudyDeck from '../components/FocusStudyDeck'
import { useFlashcardSet, useUpdateStudyProgress } from '../api/queries/flashcards'
import logger from '../utils/logger';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

// localStorage key prefix for saving study progress
const STUDY_PROGRESS_KEY = 'memorix_study_progress';
// Debounce delay for API calls (in ms)
const SAVE_DEBOUNCE_DELAY = 1000;
// Number of cards to process before syncing to server
const SYNC_CARD_THRESHOLD = 5;
// Special key for tracking review mode
const REVIEW_MODE_KEY = 'memorix_review_mode_flag';

function StudyDeck() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [reviewLaterCards, setReviewLaterCards] = useState({})
  const [learnedCards, setLearnedCards] = useState({})
  const [studyMode, setStudyMode] = useState('normal')
  const saveBackendTimeoutRef = useRef(null);
  const cardsProcessedRef = useRef(0);
  const localStorageKey = `${STUDY_PROGRESS_KEY}_${id}`;
  const reviewModeKey = `${REVIEW_MODE_KEY}_${id}`;
  
  // Check for forced review mode in localStorage
  useEffect(() => {
    try {
      const reviewModeFlag = localStorage.getItem(reviewModeKey);
      if (reviewModeFlag === 'true') {
        logger.debug('FOUND REVIEW MODE FLAG - Forcing review mode');
        // We'll let the component decide if review mode is possible
        // based on the actual availability of review cards
        setStudyMode('review');
        setCurrentCardIndex(0);
      }
    } catch (err) {
      logger.error('Error checking review mode flag:', err);
    }
  }, [reviewModeKey]);
  
  // Fetch flashcard set using React Query
  const { 
    data: flashcardSet,
    isLoading: isLoadingFlashcardSet,
    error: flashcardError 
  } = useFlashcardSet(id, {
    suspense: false, // Don't use React Suspense - we'll handle loading states manually
    useErrorBoundary: false, // We'll handle errors manually
    enabled: !!id,
    onSuccess: (data) => {
      if (!data) return;
      
      // First check for the direct review mode flag - this takes highest priority
      const hasReviewModeFlag = localStorage.getItem(reviewModeKey) === 'true';
      if (hasReviewModeFlag) {
        logger.debug('DIRECT REVIEW MODE FLAG DETECTED - Loading with review mode enforced');
      }
      
      // Load stored progress data
      const localData = loadSavedProgress();
      
      // Initialize basic data
      if (localData) {
        // Load learned and review cards
        setLearnedCards(localData.learnedCards || {});
        setReviewLaterCards(localData.reviewLaterCards || {});
      } else if (data.studyProgress) {
        // Or from server if no local data
        setLearnedCards(data.studyProgress.learnedCards || {});
        setReviewLaterCards(data.studyProgress.reviewLaterCards || {});
      }
      
      // Now determine the mode and position based on priority:
      // 1. Direct review mode flag has highest priority
      // 2. Saved study mode in local storage next
      // 3. Server data has lowest priority
      if (hasReviewModeFlag) {
        // If review flag is directly set, force review mode
        setStudyMode('review');
        setCurrentCardIndex(0);
      } else if (localData) {
        // Otherwise use local data if available
        const shouldBeInReviewMode = 
          localData.reviewPending || 
          localData.studyMode === 'review' || 
          localData.forceReviewMode;
        
        if (shouldBeInReviewMode) {
          setStudyMode('review');
          setCurrentCardIndex(0);
        } else {
          setStudyMode(localData.studyMode || 'normal');
          setCurrentCardIndex(localData.currentCardIndex || 0);
        }
      } else if (data.studyProgress) {
        // Fall back to server data
        if (data.studyProgress.studyMode === 'review') {
          setStudyMode('review');
          setCurrentCardIndex(0);
        } else {
          setStudyMode(data.studyProgress.studyMode || 'normal');
          setCurrentCardIndex(data.studyProgress.currentCardIndex || 0);
        }
      }
    }
  });
  
  // Use React Query mutation for updating study progress
  const { mutate: updateStudyProgress } = useUpdateStudyProgress();
  
  // Set loading and error states based on React Query state
  useEffect(() => {
    setIsLoading(isLoadingFlashcardSet);
    if (flashcardError) {
      setError(flashcardError.message || 'Failed to load flashcards');
    }
  }, [isLoadingFlashcardSet, flashcardError]);
  
  // Set up visibility change listener to sync when tab becomes hidden
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // User is navigating away - sync current progress
        syncToServer({
          learnedCards,
          reviewLaterCards,
          currentCardIndex,
          studyMode
        });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      // Clear any pending save timeouts
      if (saveBackendTimeoutRef.current) {
        clearTimeout(saveBackendTimeoutRef.current);
      }
    };
  }, [id, learnedCards, reviewLaterCards, currentCardIndex, studyMode]);
  
  // Immediate save to localStorage - no delay
  const saveLocalProgress = (progressData) => {
    try {
      // Save to localStorage
      const progressToSave = {
        deckId: id,
        timestamp: Date.now(),
        ...progressData,
        needsSync: true // Flag to indicate this needs server sync
      };
      
      localStorage.setItem(localStorageKey, JSON.stringify(progressToSave));
      logger.debug('Saved progress to localStorage:', progressToSave);
    } catch (err) {
      logger.error('Error saving to localStorage:', err);
    }
  };
  
  // Load saved progress from localStorage
  const loadSavedProgress = () => {
    try {
      const savedProgressJSON = localStorage.getItem(localStorageKey);
      if (savedProgressJSON) {
        const savedProgress = JSON.parse(savedProgressJSON);
        
        // Only restore progress for the current deck
        if (savedProgress.deckId === id) {
          logger.debug('Found saved study progress in localStorage:', savedProgress);
          return savedProgress;
        }
      }
      return null;
    } catch (err) {
      logger.error('Error loading from localStorage:', err);
      return null;
    }
  };
  
  // Sync to server with debouncing
  const syncToServer = (progressData) => {
    // Cancel existing timeout
    if (saveBackendTimeoutRef.current) {
      clearTimeout(saveBackendTimeoutRef.current);
    }
    
    // Start new timeout
    saveBackendTimeoutRef.current = setTimeout(() => {
      logger.debug('Syncing to server:', progressData);
      
      updateStudyProgress({ 
        id, 
        progressData 
      })
      .then(() => {
        // On success, update local storage to clear the needsSync flag
        const storedDataStr = localStorage.getItem(localStorageKey);
        if (storedDataStr) {
          try {
            const storedData = JSON.parse(storedDataStr);
            localStorage.setItem(localStorageKey, 
              JSON.stringify({...storedData, needsSync: false}));
            logger.debug('Server sync successful, updated localStorage');
          } catch (err) {
            logger.error('Error updating localStorage after sync:', err);
          }
        }
      })
      .catch(err => {
        logger.error('Error syncing to server:', err);
        // Keep needsSync flag true for retry later
      });
      
      saveBackendTimeoutRef.current = null;
    }, SAVE_DEBOUNCE_DELAY);
  };
  
  // Unified progress update function that handles both local and remote saving
  const updateProgress = (progressData, syncStrategy = 'auto') => {
    try {
      // Check if we have review cards to process
      const hasReviewCards = progressData.reviewLaterCards &&
        Object.keys(progressData.reviewLaterCards)
          .filter(id => !(progressData.learnedCards || {})[id])
          .length > 0;
      
      if (hasReviewCards) {
        logger.debug(`updateProgress: Detected ${
          Object.keys(progressData.reviewLaterCards)
            .filter(id => !(progressData.learnedCards || {})[id])
            .length
        } cards for review`);
      }
      
      // Always update state if needed
      if (progressData.currentCardIndex !== undefined) {
        setCurrentCardIndex(progressData.currentCardIndex);
      }
      
      if (progressData.learnedCards) {
        setLearnedCards(progressData.learnedCards);
      }
      
      if (progressData.reviewLaterCards) {
        setReviewLaterCards(progressData.reviewLaterCards);
      }
      
      if (progressData.studyMode) {
        setStudyMode(progressData.studyMode);
      }
      
      // Special handling for review pending state
      if (progressData.reviewPending || 
          (hasReviewCards && progressData.forceReviewMode)) {
        // If review is pending, we definitely want to save this flag
        // so we remember to start in review mode next time
        logger.debug('Setting study mode to review (pending)', progressData);
        setStudyMode('review');
        
        // Also set the localStorage flag for redundancy
        try {
          localStorage.setItem(reviewModeKey, 'true');
        } catch (err) {
          logger.error('Error setting review mode flag:', err);
        }
      }
      
      // Save locally immediately
      saveLocalProgress(progressData);
      
      // Determine if we should sync to server based on strategy
      if (syncStrategy === 'always') {
        syncToServer(progressData);
      } 
      else if (syncStrategy === 'auto') {
        // Increment cards processed count
        cardsProcessedRef.current += 1;
        
        // Sync every N cards or on special events
        if (
          progressData.studyMode === 'completed' || 
          progressData.isExiting ||
          progressData.reviewPending ||
          progressData.studyMode === 'review' && studyMode !== 'review' || // Mode changed to review
          cardsProcessedRef.current % SYNC_CARD_THRESHOLD === 0
        ) {
          syncToServer(progressData);
        }
      }
    } catch (err) {
      // Silent fail - we don't want to interrupt the user experience
      logger.error('Error in updateProgress:', err);
    }
  };
  
  // Handle card completion
  const handleCardComplete = (cardId, status) => {
    // Update learned cards
    const newLearnedCards = {
      ...learnedCards,
      [cardId]: true
    };
    
    // Remove from review if it was there
    let newReviewLaterCards = { ...reviewLaterCards };
    if (reviewLaterCards[cardId]) {
      // Create a new object without this property
      newReviewLaterCards = { ...reviewLaterCards };
      delete newReviewLaterCards[cardId];
    }
    
    // Update progress
    updateProgress({
      learnedCards: newLearnedCards,
      reviewLaterCards: newReviewLaterCards,
      currentCardIndex: currentCardIndex + 1,
      studyMode
    });
  };
  
  // Handle review later toggling
  const handleReviewLaterToggle = (cardId, isMarkedForReview) => {
    // Update review later cards
    const newReviewLaterCards = { ...reviewLaterCards };
    
    if (isMarkedForReview) {
      newReviewLaterCards[cardId] = true;
    } else {
      // Create a new object without this property
      delete newReviewLaterCards[cardId];
    }
    
    // Update progress
    updateProgress({
      reviewLaterCards: newReviewLaterCards,
      currentCardIndex: currentCardIndex + 1,
      studyMode
    });
  };
  
  // Handle progress updates from the FocusStudyDeck component
  const handleProgressUpdate = (progressData) => {
    updateProgress({
      ...progressData,
      studyMode: progressData.studyMode || studyMode
    });
  };
  
  // Handle deck completion
  const handleDeckComplete = (completionData) => {
    // Clear the review mode flag when completing a deck
    if (completionData.studyMode === 'completed' && studyMode === 'review') {
      try {
        localStorage.removeItem(reviewModeKey);
        logger.debug('Review completed - cleared review mode flag');
      } catch (err) {
        logger.error('Error clearing review mode flag:', err);
      }
    }
    
    // Update progress with completion data - always sync to server
    updateProgress({
      learnedCards: completionData.learnedCards,
      reviewLaterCards: completionData.reviewLaterCards,
      studyMode: 'completed'
    }, 'always');
  };
  
  // Handle deck reset
  const handleDeckReset = () => {
    // Reset all state
    const resetData = {
      learnedCards: {},
      reviewLaterCards: {},
      currentCardIndex: 0,
      studyMode: 'normal'
    };
    
    setLearnedCards({});
    setReviewLaterCards({});
    setCurrentCardIndex(0);
    setStudyMode('normal');
    
    // Clear saved progress and sync reset to server
    localStorage.removeItem(localStorageKey);
    syncToServer(resetData);
  };
  
  // Handle exit
  const handleExit = (exitData) => {
    // Log the exit data for debugging
    logger.debug('Exiting study deck with data:', exitData);
    
    // Only set review mode flag if we have review cards to review
    const hasReviewCards = Object.keys(exitData.reviewLaterCards || {})
      .filter(id => !(exitData.learnedCards || {})[id])
      .length > 0;
    
    logger.debug(`Exit handler: Has review cards: ${hasReviewCards} (${
      Object.keys(exitData.reviewLaterCards || {})
        .filter(id => !(exitData.learnedCards || {})[id])
        .length
    } cards)`);
    
    // Check if we're exiting from the review screen or with pending reviews
    const isExitingFromReviewScreen = 
      exitData.reviewPending || 
      exitData.studyMode === 'review' || 
      exitData.forceReviewMode ||
      hasReviewCards; // Also check if there are actual review cards
    
    // If we're exiting with review mode, set a direct flag in localStorage
    if (isExitingFromReviewScreen && hasReviewCards) {
      try {
        // Set a special direct flag for review mode
        localStorage.setItem(reviewModeKey, 'true');
        logger.debug('SET REVIEW MODE FLAG TO TRUE - has review cards:', hasReviewCards);
      } catch (err) {
        logger.error('Error setting review mode flag:', err);
      }
    } else {
      // Clear the flag if not in review mode or no review cards
      try {
        localStorage.removeItem(reviewModeKey);
        logger.debug('Removed review mode flag');
      } catch (err) {
        logger.error('Error removing review mode flag:', err);
      }
    }
    
    // Forcefully set the studyMode to 'review' if needed
    const exitDataWithReviewMode = {
      ...exitData,
      // If we're exiting from review screen or with review mode, ensure it's preserved
      studyMode: (isExitingFromReviewScreen && hasReviewCards) ? 'review' : exitData.studyMode,
      isExiting: true
    };
    
    // Save current state before exiting - always sync to server
    updateProgress(exitDataWithReviewMode, 'always');
    
    // Also save directly to localStorage for redundancy
    try {
      const directSaveData = {
        deckId: id,
        timestamp: Date.now(),
        ...exitDataWithReviewMode,
        needsSync: true
      };
      
      localStorage.setItem(localStorageKey, JSON.stringify(directSaveData));
      logger.debug('Directly saved exit state to localStorage:', directSaveData);
    } catch (err) {
      logger.error('Error saving exit state directly to localStorage:', err);
    }
    
    // Navigate back
    navigate('/dashboard');
  };
  
  // Effect to sync state to server after loading
  useEffect(() => {
    // Skip if we're still loading
    if (isLoading) return;
    
    // Check if we have the flashcard set data
    if (flashcardSet) {
      // Sync current state to server
      syncToServer({
        learnedCards,
        reviewLaterCards,
        currentCardIndex,
        studyMode
      });
      
      logger.debug('Synced initial state to server:', {
        cardCount: flashcardSet.cards?.length || 0,
        learnedCount: Object.keys(learnedCards).length,
        reviewCount: Object.keys(reviewLaterCards).length,
        currentCardIndex,
        studyMode
      });
    }
  }, [isLoading, flashcardSet]);
  
  // Render loading state
  if (isLoading || !flashcardSet || (flashcardSet.cards && flashcardSet.cards.length === 0)) {
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
      cards={flashcardSet?.cards || []}
      initialCardIndex={currentCardIndex}
      learnedCards={learnedCards}
      reviewLaterCards={reviewLaterCards}
      onCardComplete={handleCardComplete}
      onReviewLaterToggle={handleReviewLaterToggle}
      onProgressUpdate={handleProgressUpdate}
      onDeckComplete={handleDeckComplete}
      onReset={handleDeckReset}
      onExit={handleExit}
      initialStudyMode={studyMode}
    />
  );
}

export default StudyDeck 