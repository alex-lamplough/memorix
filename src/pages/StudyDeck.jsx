import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { flashcardService } from '../services/api'
import FlashcardDeck from '../components/FlashcardDeck'

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import BarChartIcon from '@mui/icons-material/BarChart'
import StarIcon from '@mui/icons-material/Star'
import TimerIcon from '@mui/icons-material/Timer'
import BookmarkIcon from '@mui/icons-material/Bookmark'

function StudyDeck() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [flashcardSet, setFlashcardSet] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [studyStartTime, setStudyStartTime] = useState(null)
  const [studyStats, setStudyStats] = useState({
    timeSpent: 0,
    cardsStudied: 0,
    masteryLevel: 0,
    totalSessions: 0,
    reviewLaterCount: 0,
    learnedCount: 0
  })
  const [timeElapsed, setTimeElapsed] = useState(0)
  const [isTimerActive, setIsTimerActive] = useState(true)
  const [cardPerformance, setCardPerformance] = useState({})
  const [reviewLaterCards, setReviewLaterCards] = useState({})
  const [learnedCards, setLearnedCards] = useState({})
  const [isDeckCompleted, setIsDeckCompleted] = useState(false)
  
  // Fetch the flashcard set
  useEffect(() => {
    const fetchFlashcardSet = async () => {
      try {
        setIsLoading(true)
        setError(null)
        
        console.log(`Fetching flashcard set with ID: ${id}`)
        const data = await flashcardService.getFlashcardSet(id)
        
        // Verify cards are present and in the right format
        if (!data.cards || !Array.isArray(data.cards) || data.cards.length === 0) {
          throw new Error('No cards found in this flashcard set')
        }
        
        // Transform the cards format if needed
        const formattedCards = data.cards.map(card => ({
          question: card.front,
          answer: card.back,
          id: card._id
        }))
        
        // Set the flashcard set with formatted cards
        setFlashcardSet({
          ...data,
          cards: formattedCards
        })
        
        // Initialize review later cards from saved data if available
        if (data.studyStats?.reviewLaterCards) {
          const reviewLaterObj = {};
          data.studyStats.reviewLaterCards.forEach(cardId => {
            reviewLaterObj[cardId] = true;
          });
          setReviewLaterCards(reviewLaterObj);
        }
        
        // Initialize learned cards from saved data if available
        if (data.studyStats?.learnedCards) {
          const learnedObj = {};
          data.studyStats.learnedCards.forEach(cardId => {
            learnedObj[cardId] = true;
          });
          setLearnedCards(learnedObj);
        }
        
        // Set study stats from the flashcard set data
        setStudyStats({
          timeSpent: data.studyStats?.totalTimeSpent || 0,
          cardsStudied: data.cards.filter(card => card.lastReviewed).length,
          masteryLevel: data.studyStats?.masteryLevel || 0,
          totalSessions: data.studyStats?.totalStudySessions || 0,
          reviewLaterCount: data.studyStats?.reviewLaterCards?.length || 0,
          learnedCount: data.studyStats?.learnedCards?.length || 0
        })
        
        // Record study start time
        setStudyStartTime(Date.now())
        setIsTimerActive(true)
      } catch (err) {
        console.error('Error fetching flashcard set:', err)
        setError(err.message || 'Failed to load flashcard set')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchFlashcardSet()
    
    // Clean up function to record the study session when unmounting
    return () => {
      recordSessionOnExit();
    }
  }, [id])
  
  // Record session when exiting or unmounting
  const recordSessionOnExit = () => {
    if (studyStartTime && flashcardSet) {
      const studyDuration = Math.floor((Date.now() - studyStartTime) / 1000) // in seconds
      
      if (studyDuration > 10) { // Only record if studied for more than 10 seconds
        console.log(`Recording study session: ${studyDuration} seconds`)
        recordStudySession(studyDuration)
      }
    }
  }
  
  // Update elapsed time every second when timer is active
  useEffect(() => {
    if (!studyStartTime || !isTimerActive) return;
    
    const intervalId = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - studyStartTime) / 1000);
      setTimeElapsed(elapsedSeconds);
    }, 1000);
    
    return () => clearInterval(intervalId);
  }, [studyStartTime, isTimerActive]);
  
  // Format time for display (e.g., "5m 30s")
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };
  
  // Format total study time (e.g., "2h 15m")
  const formatTotalTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };
  
  // Handle card completion
  const handleCardCompletion = (cardId, performance) => {
    // Update local state for learned cards
    if (performance === 5) {
      // Card is marked as learned
      setLearnedCards(prev => ({
        ...prev,
        [cardId]: true
      }));
    } else if (performance === 0) {
      // Card is reset
      setLearnedCards(prev => {
        const updated = { ...prev };
        delete updated[cardId];
        return updated;
      });
    }
    
    // Update local stats for UI feedback
    setStudyStats(prev => ({
      ...prev,
      cardsStudied: prev.cardsStudied + 1,
      learnedCount: Object.keys(learnedCards).length
    }));
    
    // Track card performance for the study session
    setCardPerformance(prev => ({
      ...prev,
      [cardId]: performance
    }));
  }
  
  // Handle review later toggling
  const handleReviewLaterToggle = (cardId, isMarkedForReview) => {
    setReviewLaterCards(prev => {
      const updated = { ...prev };
      if (isMarkedForReview) {
        updated[cardId] = true;
      } else {
        delete updated[cardId];
      }
      return updated;
    });
    
    // Update stats
    setStudyStats(prev => ({
      ...prev,
      reviewLaterCount: isMarkedForReview 
        ? prev.reviewLaterCount + 1 
        : Math.max(0, prev.reviewLaterCount - 1)
    }));
  }
  
  // Handle deck navigation events
  const handleDeckEvent = (event) => {
    console.log('StudyDeck received deck event:', event);
    
    switch (event.type) {
      case 'deck_completed':
        setIsTimerActive(false);
        setIsDeckCompleted(true);
        // Record the session when deck is completed
        recordSessionOnExit();
        break;
      case 'deck_restarted':
        console.log('Restarting deck in StudyDeck component');
        // Always reset the timer when deck is restarted, not just if it was completed
        setStudyStartTime(Date.now());
        setTimeElapsed(0);
        setIsTimerActive(true);
        setIsDeckCompleted(false);
        
        // Reload the flashcard set to ensure we have a fresh state
        // This helps synchronize with child component
        if (flashcardSet) {
          setFlashcardSet(prev => ({
            ...prev,
            _reloadTrigger: Date.now() // Force a refresh
          }));
        }
        break;
      default:
        break;
    }
  }
  
  // Record study session when component unmounts or deck completes
  const recordStudySession = async (timeSpent) => {
    try {
      // Format card reviews for API
      const cardReviews = Object.entries(cardPerformance).map(([cardId, performance]) => ({
        cardId,
        performance,
        timeSpent: Math.floor(timeSpent / Object.keys(cardPerformance).length) // Distribute time evenly
      }));
      
      const response = await flashcardService.recordStudySession(id, {
        timeSpent,
        cardReviews,
        reviewLaterCards: Object.keys(reviewLaterCards),
        learnedCards: Object.keys(learnedCards)
      });
      
      console.log('Study session recorded successfully', response);
    } catch (err) {
      console.error('Error recording study session:', err);
    }
  }
  
  const handleGoBack = () => {
    // Record session before navigating away
    recordSessionOnExit();
    navigate('/dashboard');
  }
  
  // Calculate completion percentage
  const getCompletionPercentage = () => {
    if (!flashcardSet || !flashcardSet.cards.length) return 0;
    return Math.round((Object.keys(learnedCards).length / flashcardSet.cards.length) * 100);
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
  
  const completionPercentage = getCompletionPercentage();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white">
      <div className="container mx-auto max-w-4xl px-3 py-3">
        {/* Header and Stats Combined Row */}
        <div className="flex justify-between items-center mb-3">
          <button 
            onClick={handleGoBack}
            className="bg-[#18092a]/60 text-white px-2 py-1 text-sm rounded-lg hover:bg-[#18092a] transition-colors border border-gray-800/30 inline-flex items-center"
          >
            <ArrowBackIcon fontSize="small" className="mr-1" /> Back
          </button>
          
          <h1 className="text-lg font-bold truncate max-w-[50%]">{flashcardSet.title}</h1>
          
          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center text-[#00ff94]">
              <StarIcon fontSize="small" className="mr-0.5" />
              <span>{completionPercentage}%</span>
            </div>
            <div className="flex items-center text-[#a259ff]">
              <TimerIcon fontSize="small" className="mr-0.5" />
              <span>{formatTime(timeElapsed)}</span>
            </div>
          </div>
        </div>
        
        {/* Study Statistics Compact Row */}
        <div className="bg-[#18092a]/60 rounded-lg p-2 mb-3 flex justify-between items-center">
          {/* Cards Studied */}
          <div className="flex items-center">
            <CheckCircleIcon className="text-[#3ec1ff] mr-1" fontSize="small" />
            <div className="text-xs flex items-baseline">
              <span className="font-bold">{Object.keys(learnedCards).length}</span>
              <span className="text-white/60 ml-1">/ {flashcardSet.cards.length}</span>
            </div>
          </div>
          
          {/* Review Later */}
          <div className="flex items-center">
            <BookmarkIcon className="text-[#ff6b6b] mr-1" fontSize="small" />
            <div className="text-xs">
              <span className="font-bold">{Object.keys(reviewLaterCards).length}</span>
            </div>
          </div>
        </div>
        
        <FlashcardDeck 
          key={isDeckCompleted ? 'completed' : 'active'}
          flashcards={flashcardSet.cards} 
          onCardComplete={handleCardCompletion}
          reviewLaterCards={reviewLaterCards}
          onReviewLaterToggle={handleReviewLaterToggle}
          onDeckEvent={handleDeckEvent}
        />
      </div>
    </div>
  )
}

export default StudyDeck 