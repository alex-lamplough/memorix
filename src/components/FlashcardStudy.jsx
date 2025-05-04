import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Icons
import FlipIcon from '@mui/icons-material/Flip';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';

function FlashcardStudy({
  cards = [],
  initialCardIndex = 0,
  onCardComplete,
  onReviewLaterToggle,
  onDeckComplete,
  onReset,
  reviewLaterCards = {},
  learnedCards = {},
}) {
  const [currentCardIndex, setCurrentCardIndex] = useState(initialCardIndex);
  const [isFlipped, setIsFlipped] = useState(false);
  const [localReviewLaterCards, setLocalReviewLaterCards] = useState(reviewLaterCards);
  const [localLearnedCards, setLocalLearnedCards] = useState(learnedCards);
  const [progress, setProgress] = useState(0);
  const [isDeckCompleted, setIsDeckCompleted] = useState(false);
  const [showReviewOnly, setShowReviewOnly] = useState(false);
  const [filteredCards, setFilteredCards] = useState(cards);
  
  // Calculate progress when cards are completed
  useEffect(() => {
    if (filteredCards.length > 0) {
      // Only count cards that have been explicitly marked
      let completedCount = 0;
      
      // Count differently depending on mode
      if (showReviewOnly) {
        // In review mode, we're only looking at cards marked for review
        // So we count cards that were marked for review but are now learned
        completedCount = filteredCards.reduce((count, card) => {
          // If it was marked for review but is now learned, count it as completed
          if (localLearnedCards[card.id]) {
            return count + 1;
          }
          return count;
        }, 0);
      } else {
        // In normal mode, count all cards that have been acted upon
        completedCount = filteredCards.reduce((count, card) => {
          if (localLearnedCards[card.id] || localReviewLaterCards[card.id]) {
            return count + 1;
          }
          return count;
        }, 0);
      }
      
      const calculatedProgress = Math.round((completedCount / filteredCards.length) * 100);
      setProgress(calculatedProgress);
    }
  }, [filteredCards, localLearnedCards, localReviewLaterCards, showReviewOnly]);

  // Initialize local state from props
  useEffect(() => {
    setLocalReviewLaterCards(reviewLaterCards);
    setLocalLearnedCards(learnedCards);
  }, [reviewLaterCards, learnedCards]);
  
  // Initialize filtered cards
  useEffect(() => {
    setFilteredCards(cards);
  }, [cards]);
  
  // Check if all cards have been reviewed
  useEffect(() => {
    const allCardsReviewed = cards.every(
      card => localLearnedCards[card.id] || localReviewLaterCards[card.id]
    );
    
    if (allCardsReviewed && filteredCards.length > 0 && currentCardIndex >= filteredCards.length) {
      setIsDeckCompleted(true);
      
      if (onDeckComplete) {
        onDeckComplete();
      }
    }
  }, [currentCardIndex, filteredCards, localLearnedCards, localReviewLaterCards, onDeckComplete, cards]);

  // Handle card flipping
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Navigate to next card
  const handleNext = () => {
    if (currentCardIndex < filteredCards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    } else {
      // We've reached the end - check if all cards have been reviewed
      // Include the current card in our check since we just interacted with it
      const updatedLearnedCards = { ...localLearnedCards };
      const updatedReviewCards = { ...localReviewLaterCards };
      const currentCardId = filteredCards[currentCardIndex]?.id;
      
      // Ensure current card is counted if we're checking at the end
      if (currentCardId && !updatedLearnedCards[currentCardId] && !updatedReviewCards[currentCardId]) {
        // Force the current card to be counted as reviewed
        updatedReviewCards[currentCardId] = true;
      }
      
      const allCardsReviewed = cards.every(
        card => updatedLearnedCards[card.id] || updatedReviewCards[card.id]
      );
      
      if (allCardsReviewed) {
        setIsDeckCompleted(true);
        
        if (onDeckComplete) {
          onDeckComplete();
        }
      }
    }
  };

  // Navigate to previous card
  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  // Mark card as learned and go to next card
  const markAsLearned = () => {
    if (!filteredCards[currentCardIndex]?.id) return;
    
    const cardId = filteredCards[currentCardIndex].id;
    
    // Update local state
    const newLearnedCards = {
      ...localLearnedCards,
      [cardId]: true
    };
    setLocalLearnedCards(newLearnedCards);
    
    // Remove from review later if it was marked for review
    let newReviewLaterCards = { ...localReviewLaterCards };
    if (localReviewLaterCards[cardId]) {
      delete newReviewLaterCards[cardId];
      setLocalReviewLaterCards(newReviewLaterCards);
      
      if (onReviewLaterToggle) {
        onReviewLaterToggle(cardId, false);
      }
    }
    
    // Call the callback if provided
    if (onCardComplete) {
      onCardComplete(cardId, 'learned');
    }
    
    // Update progress immediately
    updateProgressAfterAction(newLearnedCards, newReviewLaterCards);
    
    // Check if this was the last card
    if (currentCardIndex === filteredCards.length - 1) {
      // Check if we've completed all cards
      const allCardsReviewed = cards.every(
        card => newLearnedCards[card.id] || newReviewLaterCards[card.id] || card.id === cardId
      );
      
      if (allCardsReviewed) {
        setIsDeckCompleted(true);
        if (onDeckComplete) {
          onDeckComplete();
        }
        return;
      }
    }
    
    // Move to next card
    handleNext();
  };

  // Toggle review later status and go to next card
  const toggleReviewLater = () => {
    if (!filteredCards[currentCardIndex]?.id) return;
    
    const cardId = filteredCards[currentCardIndex].id;
    
    // Update local state - always mark for review here
    const newReviewLaterCards = {
      ...localReviewLaterCards,
      [cardId]: true
    };
    setLocalReviewLaterCards(newReviewLaterCards);
    
    // Call the callback if provided
    if (onReviewLaterToggle) {
      onReviewLaterToggle(cardId, true);
    }
    
    // Update progress immediately
    updateProgressAfterAction(localLearnedCards, newReviewLaterCards);
    
    // Check if this was the last card
    if (currentCardIndex === filteredCards.length - 1) {
      // Check if we've completed all cards
      const allCardsReviewed = cards.every(
        card => localLearnedCards[card.id] || newReviewLaterCards[card.id] || card.id === cardId
      );
      
      if (allCardsReviewed) {
        setIsDeckCompleted(true);
        if (onDeckComplete) {
          onDeckComplete();
        }
        return;
      }
    }
    
    // Move to next card
    handleNext();
  };
  
  // Helper function to update progress after marking a card
  const updateProgressAfterAction = (learnedCardsState, reviewLaterCardsState) => {
    if (filteredCards.length > 0) {
      let completedCount = 0;
      
      if (showReviewOnly) {
        // In review mode
        completedCount = filteredCards.reduce((count, card) => {
          if (learnedCardsState[card.id]) {
            return count + 1;
          }
          return count;
        }, 0);
      } else {
        // In normal mode
        completedCount = filteredCards.reduce((count, card) => {
          if (learnedCardsState[card.id] || reviewLaterCardsState[card.id]) {
            return count + 1;
          }
          return count;
        }, 0);
      }
      
      const calculatedProgress = Math.round((completedCount / filteredCards.length) * 100);
      setProgress(calculatedProgress);
    }
  };
  
  // Reset deck to start from beginning
  const handleRestartDeck = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setIsDeckCompleted(false);
    setShowReviewOnly(false);
    setProgress(0);
    // Reset all learned and review later status
    setLocalLearnedCards({});
    setLocalReviewLaterCards({});
    setFilteredCards(cards);
    
    // Notify parent component
    if (onReset) {
      onReset();
    }
  };
  
  // Start reviewing only the cards marked for review
  const handleReviewMarked = () => {
    const reviewCards = cards.filter(card => localReviewLaterCards[card.id]);
    
    if (reviewCards.length > 0) {
      setFilteredCards(reviewCards);
      setCurrentCardIndex(0);
      setIsFlipped(false);
      setIsDeckCompleted(false);
      setShowReviewOnly(true);
      setProgress(0);
    }
  };

  // If no cards are provided, show a message
  if (!cards || cards.length === 0) {
    return (
      <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white text-center">
        <p>No flashcards available to study.</p>
      </div>
    );
  }
  
  // Completion screen
  if (isDeckCompleted) {
    const totalCards = cards.length;
    const learnedCount = Object.keys(localLearnedCards).length;
    const reviewCount = Object.keys(localReviewLaterCards).length;
    const completionPercentage = Math.round((learnedCount / totalCards) * 100);
    
    return (
      <div className="w-full flex flex-col items-center">
        <div className="bg-[#18092a]/80 border border-[#00ff94]/30 rounded-xl p-8 shadow-lg w-full max-w-lg mx-auto mb-6">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-[#00ff94]/10 rounded-full flex items-center justify-center border border-[#00ff94]/30">
              <DoneAllIcon style={{ fontSize: 32 }} className="text-[#00ff94]" />
            </div>
          </div>
          
          <h2 className="text-2xl font-bold text-white text-center mb-4">
            {reviewCount === 0 ? 'Deck Completed!' : 'Review Needed'}
          </h2>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-white/70 text-sm">Progress</span>
              <span className="text-white/70 text-sm">{completionPercentage}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#00ff94]" style={{ width: `${completionPercentage}%` }} />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#18092a]/60 p-4 rounded-lg border border-gray-800/30">
              <div className="text-white/70 text-sm">Learned</div>
              <div className="text-white text-2xl font-bold flex items-center">
                <CheckCircleIcon className="text-[#00ff94] mr-2" />
                {learnedCount} <span className="text-base font-normal text-white/50 ml-1">of {totalCards}</span>
              </div>
            </div>
            
            <div className="bg-[#18092a]/60 p-4 rounded-lg border border-gray-800/30">
              <div className="text-white/70 text-sm">To Review</div>
              <div className="text-white text-2xl font-bold flex items-center">
                <BookmarkIcon className="text-amber-400 mr-2" />
                {reviewCount}
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {reviewCount > 0 && (
              <button 
                className="bg-amber-500/20 text-amber-400 px-4 py-3 rounded-lg hover:bg-amber-500/30 transition-colors border border-amber-500/30 flex items-center justify-center"
                onClick={handleReviewMarked}
              >
                <PlaylistAddCheckIcon className="mr-2" />
                Review Marked Cards
              </button>
            )}
            
            <button 
              className="bg-[#18092a]/60 text-white px-4 py-3 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors flex items-center justify-center"
              onClick={handleRestartDeck}
            >
              <RestartAltIcon className="mr-2" />
              Restart Deck
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Current card display
  const currentCard = filteredCards[currentCardIndex];
  const isCardMarkedForReview = !!localReviewLaterCards[currentCard.id];
  const isCardLearned = !!localLearnedCards[currentCard.id];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Progress bar */}
      <div className="w-full mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white/70 text-sm">
            Card {currentCardIndex + 1} of {filteredCards.length}
          </span>
          <span className="text-white/70 text-sm">
            {progress}% Completed
          </span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div 
            className="h-full bg-[#00ff94]" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div 
        className="w-full max-w-lg mx-auto h-64 cursor-pointer perspective-1000 mb-6"
        onClick={handleFlip}
      >
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
          {/* Question side */}
          <div className={`absolute inset-0 bg-[#18092a]/80 border border-[#00ff94]/30 rounded-xl p-6 shadow-lg backface-hidden ${isFlipped ? 'hidden' : 'block'}`}>
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-white mb-4">Question</h3>
              <FlipIcon className="text-[#00ff94]" />
            </div>
            <div className="flex items-center justify-center h-[calc(100%-4rem)]">
              <p className="text-white/90 text-center text-lg">{currentCard.question}</p>
            </div>
            
            <div className="absolute bottom-3 left-0 right-0 text-center text-white/50 text-sm">
              Tap to flip
            </div>
          </div>
          
          {/* Answer side */}
          <div className={`absolute inset-0 bg-[#18092a]/80 border border-[#00ff94]/30 rounded-xl p-6 shadow-lg backface-hidden rotate-y-180 ${isFlipped ? 'block' : 'hidden'}`}>
            <div className="flex justify-between items-start">
              <h3 className="text-xl font-bold text-white mb-4">Answer</h3>
              <FlipIcon className="text-[#00ff94]" />
            </div>
            <div className="flex items-center justify-center h-[calc(100%-4rem)]">
              <p className="text-white/90 text-center text-lg">{currentCard.answer}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation and action buttons */}
      <div className="flex flex-col w-full max-w-lg">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <button 
            className={`bg-[#00ff94]/10 text-[#00ff94] px-4 py-3 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex items-center justify-center ${isCardLearned ? 'bg-[#00ff94]/30' : ''}`}
            onClick={markAsLearned}
          >
            <CheckCircleIcon className="mr-2" />
            I Know This
          </button>
          
          <button 
            className={`bg-[#18092a]/60 text-white px-4 py-3 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors flex items-center justify-center ${isCardMarkedForReview ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : ''}`}
            onClick={toggleReviewLater}
          >
            <BookmarkBorderIcon className="mr-2" />
            Review Later
          </button>
        </div>
        
        <div className="flex justify-between">
          <button 
            className="bg-[#18092a]/60 text-white p-2 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
          >
            <NavigateBeforeIcon /> Previous
          </button>
          
          <button 
            className="bg-[#18092a]/60 text-white p-2 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleNext}
            disabled={currentCardIndex === filteredCards.length - 1}
          >
            Next <NavigateNextIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

FlashcardStudy.propTypes = {
  cards: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      question: PropTypes.string.isRequired,
      answer: PropTypes.string.isRequired
    })
  ).isRequired,
  initialCardIndex: PropTypes.number,
  onCardComplete: PropTypes.func,
  onReviewLaterToggle: PropTypes.func,
  onDeckComplete: PropTypes.func,
  onReset: PropTypes.func,
  reviewLaterCards: PropTypes.object,
  learnedCards: PropTypes.object
};

export default FlashcardStudy; 