import { useState, useEffect, useRef } from 'react'
import logger from '../utils/logger';
import PropTypes from 'prop-types'

// Icons
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import FlipIcon from '@mui/icons-material/Flip'
import ShuffleIcon from '@mui/icons-material/Shuffle'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import BookmarkIcon from '@mui/icons-material/Bookmark'
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import RefreshIcon from '@mui/icons-material/Refresh'

function FlashcardDeck({ flashcards, onCardComplete, reviewLaterCards = {}, onReviewLaterToggle, onDeckEvent }) {
  const [refreshKey, setRefreshKey] = useState(0); // For forcing re-render
  const originalCardsRef = useRef([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [progress, setProgress] = useState(0)
  const [cards, setCards] = useState([])
  const [learnedCards, setLearnedCards] = useState({})
  const [localReviewLaterCards, setLocalReviewLaterCards] = useState({})
  const [activeFilter, setActiveFilter] = useState('all') // 'all', 'learned', 'review'
  const [filteredCards, setFilteredCards] = useState([])
  const [isDeckCompleted, setIsDeckCompleted] = useState(false)
  
  // Initialize cards on component mount or when flashcards prop changes
  useEffect(() => {
    if (flashcards && flashcards.length > 0) {
      logger.debug("FlashcardDeck: Initializing cards from props:", {
        flashcardsLength: flashcards.length,
        firstCardQuestion: flashcards[0]?.question
      });
      
      // Store original cards for reference
      originalCardsRef.current = [...flashcards];
      
      // Initialize the deck with a complete reset
      setCards([...flashcards]);
      setFilteredCards([...flashcards]);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setIsDeckCompleted(false);
      setActiveFilter('all'); // Reset to 'all' filter when receiving new cards
      updateProgress(0);
    }
  }, [flashcards]) // We don't need refreshKey anymore since parent will reload us
  
  // Sync with parent reviewLaterCards
  useEffect(() => {
    setLocalReviewLaterCards(reviewLaterCards)
  }, [reviewLaterCards])
  
  // Apply filters when cards or filter state changes
  useEffect(() => {
    if (cards.length === 0) return;
    
    let filtered = [...cards];
    
    switch (activeFilter) {
      case 'learned':
        filtered = cards.filter(card => learnedCards[card.id]);
        break;
      case 'review':
        filtered = cards.filter(card => localReviewLaterCards[card.id]);
        break;
      default:
        // 'all' - no filtering needed
        break;
    }
    
    setFilteredCards(filtered);
    
    // Reset current card index if needed
    if (currentCardIndex >= filtered.length) {
      setCurrentCardIndex(filtered.length > 0 ? 0 : currentCardIndex);
    }
    
    updateProgress(currentCardIndex);
  }, [cards, activeFilter, learnedCards, localReviewLaterCards, currentCardIndex]);

  // Check if deck is completed when we reach the last card
  useEffect(() => {
    if (filteredCards.length > 0 && currentCardIndex === filteredCards.length - 1 && isFlipped) {
      if (!isDeckCompleted) {
        setIsDeckCompleted(true);
        
        // Notify parent that deck is completed
        if (onDeckEvent) {
          onDeckEvent({ type: 'deck_completed' });
        }
      }
    }
  }, [currentCardIndex, filteredCards.length, isFlipped, isDeckCompleted, onDeckEvent]);

  // Check if all cards are learned and show completion screen
  useEffect(() => {
    // Only check when in 'all' filter mode to avoid confusion
    if (activeFilter === 'all' && cards.length > 0) {
      const allLearned = cards.every(card => learnedCards[card.id]);
      
      if (allLearned && !isDeckCompleted && cards.length > 0) {
        setIsDeckCompleted(true);
        
        // Notify parent that deck is completed
        if (onDeckEvent) {
          onDeckEvent({ type: 'deck_completed' });
        }
      }
    }
  }, [learnedCards, cards, activeFilter, isDeckCompleted, onDeckEvent]);

  // Update progress calculation
  const updateProgress = (index) => {
    if (!filteredCards || filteredCards.length === 0) {
      setProgress(0);
      return;
    }
    
    const calculatedProgress = filteredCards.length > 0 
      ? Math.round(((Math.min(index + 1, filteredCards.length)) / filteredCards.length) * 100) 
      : 0;
    setProgress(calculatedProgress);
  }
  
  // Handle card flipping
  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }
  
  // Mark card as learned
  const markAsLearned = () => {
    if (!filteredCards[currentCardIndex]?.id) return;
    
    const cardId = filteredCards[currentCardIndex].id;
    
    // Update local state
    setLearnedCards(prev => ({
      ...prev,
      [cardId]: true
    }));
    
    // Remove from review later if it was marked for review
    if (localReviewLaterCards[cardId]) {
      const updatedReviewLater = { ...localReviewLaterCards };
      delete updatedReviewLater[cardId];
      setLocalReviewLaterCards(updatedReviewLater);
      
      if (onReviewLaterToggle) {
        onReviewLaterToggle(cardId, false);
      }
    }
    
    // Call the callback if provided
    if (onCardComplete) {
      onCardComplete(cardId, 5); // Use 5 as the highest rating
    }
    
    // Move to next card if available
    if (currentCardIndex < filteredCards.length - 1) {
      handleNext();
    } else if (currentCardIndex === filteredCards.length - 1) {
      // We've reached the end of the deck
      setIsDeckCompleted(true);
      if (onDeckEvent) {
        onDeckEvent({ type: 'deck_completed' });
      }
    }
  }
  
  // Reset learned status for card
  const resetLearnedStatus = () => {
    if (!filteredCards[currentCardIndex]?.id) return;
    
    const cardId = filteredCards[currentCardIndex].id;
    
    if (learnedCards[cardId]) {
      setLearnedCards(prev => {
        const updated = { ...prev };
        delete updated[cardId];
        return updated;
      });
      
      // Call the callback if provided
      if (onCardComplete) {
        onCardComplete(cardId, 0); // Use 0 to indicate reset
      }
    }
  }
  
  // Toggle review later status for current card
  const toggleReviewLater = () => {
    if (!filteredCards[currentCardIndex]?.id) return;
    
    const cardId = filteredCards[currentCardIndex].id;
    const isCurrentlyMarked = !!localReviewLaterCards[cardId];
    
    // Update local state
    setLocalReviewLaterCards(prev => {
      const updated = { ...prev };
      if (updated[cardId]) {
        delete updated[cardId];
      } else {
        updated[cardId] = true;
      }
      return updated;
    });
    
    // Notify parent component
    if (onReviewLaterToggle) {
      onReviewLaterToggle(cardId, !isCurrentlyMarked);
    }
  }
  
  // Reset all learned cards
  const resetAllLearnedCards = () => {
    const learnedCardIds = Object.keys(learnedCards);
    
    if (learnedCardIds.length === 0) return;
    
    // Remove learned status for all cards
    setLearnedCards({});
    
    // Notify about reset if callback provided
    if (onCardComplete) {
      learnedCardIds.forEach(cardId => {
        onCardComplete(cardId, 0);
      });
    }
    
    // Reset the deck
    handleRestart();
  }
  
  // Navigate to next card
  const handleNext = () => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(prevIndex => {
        const newIndex = prevIndex + 1
        updateProgress(newIndex)
        return newIndex
      })
      setIsFlipped(false)
    }
  }
  
  // Navigate to previous card
  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prevIndex => {
        const newIndex = prevIndex - 1
        updateProgress(newIndex)
        return newIndex
      })
      setIsFlipped(false)
    }
  }
  
  // Reset deck to beginning - ONE SIMPLE FUNCTION
  const handleRestart = () => {
    logger.debug('RESTARTING DECK - Hard reset');
    
    // First notify parent that deck is restarted before any state changes
    if (onDeckEvent) {
      onDeckEvent({ type: 'deck_restarted' });
    }
    
    // Force immediate state resets in specific order
    setActiveFilter('all');
    setIsDeckCompleted(false);
    setIsFlipped(false);
    
    // Reset to original cards in a separate render cycle
    // This is the most reliable way to handle nested state updates in React
    setTimeout(() => {
      const originalCardsCopy = [...originalCardsRef.current];
      setCards(originalCardsCopy);
      setFilteredCards(originalCardsCopy);
      setCurrentCardIndex(0);
      updateProgress(0);
      
      logger.debug('RESTARTING DECK - Reset complete', {
        cardsLength: originalCardsCopy.length,
        isDeckCompleted: false,
        currentCardIndex: 0
      });
    }, 0);
  }
  
  // Change active filter
  const handleFilterChange = (filter) => {
    if (filter === activeFilter) return; // No change needed
    
    setActiveFilter(filter);
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsDeckCompleted(false);
    
    // Notify parent that deck is essentially restarted with a filter
    if (onDeckEvent) {
      onDeckEvent({ type: 'deck_restarted' });
    }
  }
  
  // If no cards are provided, display a message
  if (!cards || !Array.isArray(cards) || cards.length === 0) {
    return (
      <div className="bg-[#18092a]/60 rounded-xl p-4 text-center">
        <p className="text-white/80">No flashcards available in this set.</p>
      </div>
    )
  }
  
  // Show message if filtered set is empty
  if (!filteredCards || filteredCards.length === 0) {
    return (
      <div className="bg-[#18092a]/60 rounded-xl p-4 text-center">
        <p className="text-white/80">No cards match the current filter.</p>
        <div className="mt-2 flex justify-center">
          <button
            onClick={() => handleFilterChange('all')}
            className="bg-[#00ff94]/10 text-[#00ff94] px-3 py-1 text-sm rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
          >
            View All Cards
          </button>
        </div>
      </div>
    )
  }
  
  const currentCard = filteredCards[currentCardIndex]
  // Safety check for undefined current card
  if (!currentCard) {
    return (
      <div className="bg-[#18092a]/60 rounded-xl p-4 text-center">
        <p className="text-white/80">Error: Current card not found.</p>
        <div className="mt-2 flex justify-center">
          <button
            onClick={handleRestart}
            className="bg-[#00ff94]/10 text-[#00ff94] px-3 py-1 text-sm rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
          >
            Restart Deck
          </button>
        </div>
      </div>
    )
  }
  
  const currentCardId = currentCard?.id;
  const isCurrentCardLearned = !!learnedCards[currentCardId];
  const isMarkedForReview = !!localReviewLaterCards[currentCardId];
  
  // Calculate counts for filters
  const learnedCount = Object.keys(learnedCards).length;
  const reviewCount = Object.keys(localReviewLaterCards).length;
  const completionPercentage = Math.round((learnedCount / cards.length) * 100);
  
  // Show deck completion message if applicable
  if (isDeckCompleted) {
    return (
      <div className="flex flex-col">
        {/* Filters and controls in same row */}
        <div className="mb-3 flex justify-between items-center">
          <div className="bg-[#18092a]/60 rounded-lg flex overflow-hidden text-xs">
            <button
              onClick={() => handleFilterChange('all')}
              className={`px-2 py-1 ${
                activeFilter === 'all' 
                  ? 'bg-[#00ff94]/10 text-[#00ff94]' 
                  : 'text-white/70 hover:bg-gray-800/30'
              }`}
            >
              All ({cards.length})
            </button>
            <button
              onClick={() => handleFilterChange('learned')}
              className={`px-2 py-1 ${
                activeFilter === 'learned' 
                  ? 'bg-[#00ff94]/10 text-[#00ff94]' 
                  : 'text-white/70 hover:bg-gray-800/30'
              }`}
            >
              Learned ({learnedCount})
            </button>
            <button
              onClick={() => handleFilterChange('review')}
              className={`px-2 py-1 ${
                activeFilter === 'review' 
                  ? 'bg-[#00ff94]/10 text-[#00ff94]' 
                  : 'text-white/70 hover:bg-gray-800/30'
              }`}
            >
              For Review ({reviewCount})
            </button>
          </div>
        </div>
        
        {/* Progress bar showing full completion */}
        <div className="w-full mb-3">
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#00ff94] transition-all duration-300 ease-out"
              style={{ width: '100%' }}
            ></div>
          </div>
          <div className="flex justify-between mt-0.5 text-xs text-white/60">
            <span>Completed</span>
            <span>{completionPercentage}% Learned</span>
          </div>
        </div>
        
        {/* Completion message */}
        <div className="w-full aspect-[4/2.5] mb-3 cursor-pointer relative">
          <div className="absolute w-full h-full bg-gradient-to-br from-[#260041] to-[#18092a] rounded-xl p-4 flex flex-col justify-center items-center shadow-lg border border-gray-800/30">
            <div className="text-center">
              <h2 className="text-xl font-bold text-[#00ff94] mb-4">Deck Completed!</h2>
              <p className="text-white/80 mb-4">You've gone through all the flashcards in this set.</p>
              <button
                onClick={handleRestart}
                className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 inline-flex items-center"
              >
                <RestartAltIcon fontSize="small" className="mr-1" /> Restart Deck
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col">
      {/* Filters and controls in same row */}
      <div className="mb-3 flex justify-between items-center">
        <div className="bg-[#18092a]/60 rounded-lg flex overflow-hidden text-xs">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-2 py-1 ${
              activeFilter === 'all' 
                ? 'bg-[#00ff94]/10 text-[#00ff94]' 
                : 'text-white/70 hover:bg-gray-800/30'
            }`}
          >
            All ({cards.length})
          </button>
          <button
            onClick={() => handleFilterChange('learned')}
            className={`px-2 py-1 ${
              activeFilter === 'learned' 
                ? 'bg-[#00ff94]/10 text-[#00ff94]' 
                : 'text-white/70 hover:bg-gray-800/30'
            }`}
          >
            Learned ({learnedCount})
          </button>
          <button
            onClick={() => handleFilterChange('review')}
            className={`px-2 py-1 ${
              activeFilter === 'review' 
                ? 'bg-[#00ff94]/10 text-[#00ff94]' 
                : 'text-white/70 hover:bg-gray-800/30'
            }`}
          >
            For Review ({reviewCount})
          </button>
        </div>
        
        <div className="flex gap-1">
          <button
            onClick={handleRestart}
            className="bg-[#18092a]/60 text-white px-2 py-1 text-xs rounded-lg hover:bg-[#18092a] transition-colors"
            title="Restart deck"
          >
            <RestartAltIcon fontSize="small" />
          </button>
          <button
            onClick={resetAllLearnedCards}
            className="bg-[#18092a]/60 text-white px-2 py-1 text-xs rounded-lg hover:bg-[#18092a] transition-colors"
            title="Reset all learned cards"
            disabled={learnedCount === 0}
          >
            <RefreshIcon fontSize="small" />
          </button>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full mb-3">
        <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00ff94] transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between mt-0.5 text-xs text-white/60">
          <span>Card {currentCardIndex + 1} of {filteredCards.length}</span>
          <span>{completionPercentage}% Learned</span>
        </div>
      </div>
      
      {/* Card display with reduced height */}
      <div className="w-full aspect-[4/2.5] mb-3 cursor-pointer relative">
        {/* Front of card - Shown when not flipped */}
        <div 
          className={`absolute w-full h-full bg-gradient-to-br from-[#260041] to-[#18092a] rounded-xl p-4 flex flex-col justify-center items-center shadow-lg border border-gray-800/30 transition-opacity duration-500 ${
            isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
          onClick={handleFlip}
        >
          <div className="text-center max-w-full overflow-auto">
            <div className="text-white text-lg md:text-xl">{currentCard.question}</div>
          </div>
          <div className="absolute bottom-1 right-2 text-white/40 text-xs flex items-center">
            <FlipIcon fontSize="small" className="mr-0.5" />
            <span>Tap to flip</span>
          </div>
          
          {/* Status indicators */}
          <div className="absolute top-1 right-1 flex">
            {isMarkedForReview && (
              <BookmarkIcon className="text-[#00ff94] mr-1" fontSize="small" />
            )}
            {isCurrentCardLearned && (
              <CheckCircleIcon className="text-[#00ff94]" fontSize="small" />
            )}
          </div>
        </div>
        
        {/* Back of card - Shown when flipped */}
        <div 
          className={`absolute w-full h-full bg-gradient-to-br from-[#260041] to-[#18092a] rounded-xl p-4 flex flex-col justify-center items-center shadow-lg border border-gray-800/30 transition-opacity duration-500 ${
            isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={handleFlip}
        >
          <div className="text-center max-w-full overflow-auto">
            <div className="text-[#00ff94] text-lg md:text-xl">{currentCard.answer}</div>
          </div>
          <div className="absolute bottom-1 right-2 text-white/40 text-xs flex items-center">
            <FlipIcon fontSize="small" className="mr-0.5" />
            <span>Tap to flip</span>
          </div>
          
          {/* Status indicators */}
          <div className="absolute top-1 right-1 flex">
            {isMarkedForReview && (
              <BookmarkIcon className="text-[#00ff94] mr-1" fontSize="small" />
            )}
            {isCurrentCardLearned && (
              <CheckCircleIcon className="text-[#00ff94]" fontSize="small" />
            )}
          </div>
        </div>
      </div>
      
      {/* Controls */}
      <div className="flex justify-between items-center mb-3">
        {/* Navigation */}
        <div className="flex space-x-1">
          <button
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            className={`rounded-full p-1 ${
              currentCardIndex === 0 
                ? 'bg-gray-800/50 text-white/40 cursor-not-allowed' 
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            <NavigateBeforeIcon fontSize="small" />
          </button>
          
          <button
            onClick={handleFlip}
            className="bg-[#00ff94]/10 text-[#00ff94] rounded-full p-1 hover:bg-[#00ff94]/20 transition-colors"
          >
            <FlipIcon fontSize="small" />
          </button>
          
          <button
            onClick={handleNext}
            disabled={currentCardIndex === filteredCards.length - 1}
            className={`rounded-full p-1 ${
              currentCardIndex === filteredCards.length - 1 
                ? 'bg-gray-800/50 text-white/40 cursor-not-allowed' 
                : 'bg-gray-800 text-white hover:bg-gray-700'
            }`}
          >
            <NavigateNextIcon fontSize="small" />
          </button>
        </div>
        
        {/* Card action buttons */}
        <div className="flex space-x-2">
          <button
            onClick={toggleReviewLater}
            className={`flex items-center px-2 py-1 text-xs rounded-lg transition-colors ${
              isMarkedForReview
                ? 'bg-[#00ff94]/20 text-[#00ff94]'
                : 'bg-[#18092a]/60 text-white/80 hover:bg-[#18092a]'
            }`}
          >
            {isMarkedForReview ? 
              <BookmarkIcon className="mr-1" fontSize="small" /> : 
              <BookmarkBorderIcon className="mr-1" fontSize="small" />
            }
            {isMarkedForReview ? 'Unmark Review' : 'Mark for Review'}
          </button>
          
          {isCurrentCardLearned ? (
            <button
              onClick={resetLearnedStatus}
              className="flex items-center bg-[#00ff94]/20 text-[#00ff94] px-2 py-1 text-xs rounded-lg hover:bg-[#00ff94]/30 transition-colors"
            >
              <RefreshIcon className="mr-1" fontSize="small" />
              Reset Learned
            </button>
          ) : (
            <button
              onClick={markAsLearned}
              className="flex items-center bg-[#18092a]/60 text-white/80 px-2 py-1 text-xs rounded-lg hover:bg-[#18092a] transition-colors"
            >
              <CheckCircleOutlineIcon className="mr-1" fontSize="small" />
              Learned It
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

FlashcardDeck.propTypes = {
  flashcards: PropTypes.arrayOf(
    PropTypes.shape({
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired,
      id: PropTypes.string
    })
  ).isRequired,
  onCardComplete: PropTypes.func,
  reviewLaterCards: PropTypes.object,
  onReviewLaterToggle: PropTypes.func,
  onDeckEvent: PropTypes.func
}

export default FlashcardDeck 