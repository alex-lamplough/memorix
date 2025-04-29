import { useState, useEffect } from 'react'
import Flashcard from './Flashcard'

// Icons
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import TimerIcon from '@mui/icons-material/Timer'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import ReplayIcon from '@mui/icons-material/Replay'

function FlashcardDeck({ flashcards }) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [learnedCards, setLearnedCards] = useState([])
  const [reviewingCards, setReviewingCards] = useState([])
  const [studyMode, setStudyMode] = useState('learning') // 'learning', 'review', 'complete'
  
  // Debug the state for troubleshooting
  useEffect(() => {
    console.log({
      studyMode,
      currentCardIndex,
      reviewingCards,
      learnedCards
    })
  }, [studyMode, currentCardIndex, reviewingCards, learnedCards])
  
  // Reset study session or move to review mode when needed
  useEffect(() => {
    // Check if we need to change modes
    if (studyMode === 'learning') {
      // Calculate cards still to learn (not learned and not in review queue)
      const remainingToLearn = flashcards.map((_, i) => i)
        .filter(i => !learnedCards.includes(i) && !reviewingCards.includes(i));
      
      if (remainingToLearn.length === 0 && reviewingCards.length > 0) {
        // All initial learning is done, but we have review cards
        console.log("Moving to review mode");
        setStudyMode('review');
        setCurrentCardIndex(reviewingCards[0]);
        setIsFlipped(false);
      } else if (remainingToLearn.length === 0 && reviewingCards.length === 0) {
        // All cards learned, none to review
        console.log("All cards learned - complete!");
        setStudyMode('complete');
      }
    } else if (studyMode === 'review' && reviewingCards.length === 0) {
      // No more cards to review, study complete
      console.log("Review complete!");
      setStudyMode('complete');
    }
  }, [learnedCards, reviewingCards, flashcards.length, studyMode]);
  
  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  }
  
  const markAsLearned = () => {
    if (!isFlipped) {
      // Must flip the card to see the answer first
      setIsFlipped(true);
      return;
    }
    
    if (studyMode === 'learning') {
      // Add current card to learned cards
      setLearnedCards(prev => [...prev, currentCardIndex]);
    } else if (studyMode === 'review') {
      // Remove from reviewing array and add to learned
      setReviewingCards(prev => prev.filter(index => index !== currentCardIndex));
      setLearnedCards(prev => [...prev, currentCardIndex]);
    }
    
    // Move to next card
    moveToNextCard();
  }
  
  const markForReview = () => {
    if (!isFlipped) {
      // Must flip the card to see the answer first
      setIsFlipped(true);
      return;
    }
    
    if (studyMode === 'learning') {
      // In learning mode, add card to review queue if not already there
      if (!reviewingCards.includes(currentCardIndex)) {
        setReviewingCards(prev => [...prev, currentCardIndex]);
      }
    } else if (studyMode === 'review') {
      // In review mode, we need to make sure this card stays in the queue
      // First remove it from its current position
      const updatedQueue = reviewingCards.filter(index => index !== currentCardIndex);
      // Then add it to the end of the queue
      updatedQueue.push(currentCardIndex);
      setReviewingCards(updatedQueue);
    }
    
    // Move to next card
    moveToNextCard();
  }
  
  const moveToNextCard = () => {
    setIsFlipped(false); // Reset to question side
    
    if (studyMode === 'learning') {
      // Find next card that hasn't been marked as learned or for review
      const availableCards = flashcards.map((_, index) => index)
        .filter(index => 
          !learnedCards.includes(index) && 
          !reviewingCards.includes(index) && 
          index !== currentCardIndex
        );
      
      if (availableCards.length > 0) {
        // Still have cards to learn
        setCurrentCardIndex(availableCards[0]);
      } else if (reviewingCards.length > 0) {
        // Time to review cards
        setStudyMode('review');
        setCurrentCardIndex(reviewingCards[0]);
      } else {
        // All done!
        setStudyMode('complete');
      }
    } else if (studyMode === 'review') {
      // We're in review mode
      if (reviewingCards.length <= 1) {
        // This was the last card and we've either marked it learned or kept it for review
        if (reviewingCards.length === 0) {
          // All cards are now learned
          setStudyMode('complete');
        } else {
          // There's still one card in the review queue and it's the current one
          // So we just stay on this card (which should now be at the end of the queue)
          setCurrentCardIndex(reviewingCards[0]);
        }
      } else {
        // Find next card in the review queue
        // If current card is still in queue, it should be at the end now
        const nextCard = reviewingCards.find(index => index !== currentCardIndex);
        if (nextCard !== undefined) {
          setCurrentCardIndex(nextCard);
        }
      }
    }
  }
  
  const restartStudy = () => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setLearnedCards([]);
    setReviewingCards([]);
    setStudyMode('learning');
  }
  
  // Render success view if all cards are learned
  if (studyMode === 'complete') {
    return (
      <div className="w-full max-w-lg mx-auto bg-[#18092a]/80 border border-[#00ff94]/30 rounded-xl p-8 shadow-lg text-center">
        <div className="mb-4 text-[#00ff94] flex justify-center">
          <EmojiEventsIcon style={{ fontSize: '4rem' }} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Excellent work!</h2>
        <p className="text-white/80 mb-6">
          You've successfully learned all {flashcards.length} flashcards.
        </p>
        <button 
          onClick={restartStudy}
          className="bg-[#00ff94]/10 text-[#00ff94] px-6 py-3 rounded-lg border border-[#00ff94]/30 hover:bg-[#00ff94]/20 transition-colors flex items-center mx-auto"
        >
          <ReplayIcon className="mr-2" /> Study Again
        </button>
      </div>
    )
  }
  
  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Mode indicator */}
      <div className="flex justify-center mb-4">
        <div className={`px-3 py-1 rounded-full text-sm flex items-center gap-1 ${
          studyMode === 'review'
          ? 'bg-[#ffeb3b]/10 text-[#ffeb3b]'
          : 'bg-[#00ff94]/10 text-[#00ff94]'
        }`}>
          {studyMode === 'review' ? (
            <><TimerIcon fontSize="small" /> Review Mode</>
          ) : (
            <><CheckCircleOutlineIcon fontSize="small" /> Learning Mode</>
          )}
        </div>
      </div>
      
      <Flashcard
        question={flashcards[currentCardIndex].question}
        answer={flashcards[currentCardIndex].answer}
        isFlipped={isFlipped}
        onFlip={handleFlip}
      />
      
      {/* Progress indicators */}
      <div className="flex justify-between items-center mt-4 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-[#00ff94] flex items-center gap-1">
            <CheckCircleOutlineIcon fontSize="small" /> {learnedCards.length}
          </span>
          {reviewingCards.length > 0 && (
            <span className="text-[#ffeb3b] flex items-center gap-1">
              <TimerIcon fontSize="small" /> {reviewingCards.length}
            </span>
          )}
        </div>
        <div className="text-white text-sm">
          {currentCardIndex + 1} / {flashcards.length}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full h-1.5 bg-white/10 rounded-full mb-4 overflow-hidden">
        <div 
          className="h-full bg-[#00ff94]" 
          style={{ 
            width: `${(learnedCards.length / flashcards.length) * 100}%` 
          }}
        ></div>
      </div>
      
      {/* Action buttons */}
      <div className="flex gap-3">
        {!isFlipped && (
          <button 
            onClick={handleFlip}
            className="flex-1 bg-[#18092a]/60 text-white px-4 py-3 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors"
          >
            Reveal Answer
          </button>
        )}
        
        {isFlipped && (
          <>
            <button 
              onClick={markForReview}
              className="flex-1 bg-[#ffeb3b]/10 text-[#ffeb3b] px-4 py-3 rounded-lg border border-[#ffeb3b]/30 hover:bg-[#ffeb3b]/20 transition-colors flex items-center justify-center"
            >
              <TimerIcon fontSize="small" className="mr-2" /> 
              {studyMode === 'review' ? 'Still Learning' : 'Review Later'}
            </button>
            <button 
              onClick={markAsLearned}
              className="flex-1 bg-[#00ff94]/10 text-[#00ff94] px-4 py-3 rounded-lg border border-[#00ff94]/30 hover:bg-[#00ff94]/20 transition-colors flex items-center justify-center"
            >
              <CheckCircleOutlineIcon fontSize="small" className="mr-2" /> 
              Learned
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default FlashcardDeck 