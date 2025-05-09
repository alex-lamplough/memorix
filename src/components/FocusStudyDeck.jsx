import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './FocusStudyDeck.module.css';

// Icons
import FlipIcon from '@mui/icons-material/Flip';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

const FocusStudyDeck = ({
  cards = [],
  initialCardIndex = 0,
  onCardComplete,
  onReviewLaterToggle,
  onDeckComplete,
  onReset,
  onExit,
  onProgressUpdate,
  reviewLaterCards = {},
  learnedCards = {},
}) => {
  // Main state
  const [currentCardIndex, setCurrentCardIndex] = useState(initialCardIndex);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [localReviewLaterCards, setLocalReviewLaterCards] = useState(reviewLaterCards);
  const [localLearnedCards, setLocalLearnedCards] = useState(learnedCards);
  const [progress, setProgress] = useState(0);
  const [isChangingCard, setIsChangingCard] = useState(false);
  const [showZoomAnimation, setShowZoomAnimation] = useState(true); // Re-add this for animations
  const [studyMode, setStudyMode] = useState('normal'); // 'normal', 'review', 'completed'
  
  // Track transitions to prevent multiple state changes
  const isTransitioning = useRef(false);
  
  // Store refs to latest state for accurate calculations
  const learnedCardsRef = useRef({});
  const reviewLaterCardsRef = useRef({});
  
  // Initialize local state from props
  useEffect(() => {
    setLocalReviewLaterCards({...reviewLaterCards});
    setLocalLearnedCards({...learnedCards});
    
    // Update refs to match
    learnedCardsRef.current = {...learnedCards};
    reviewLaterCardsRef.current = {...reviewLaterCards};
  }, []); // Only run once on mount to initialize
  
  // Reset zoom animation after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowZoomAnimation(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);
  
  // Create filtered arrays for review cards and active cards
  const reviewCards = useMemo(() => {
    return cards.filter(card => localReviewLaterCards[card.id] && !localLearnedCards[card.id]);
  }, [cards, localReviewLaterCards, localLearnedCards]);
  
  const activeCards = useMemo(() => {
    return studyMode === 'review' ? reviewCards : cards;
  }, [studyMode, reviewCards, cards]);
  
  // Get counts for stats
  const learnedCount = useMemo(() => {
    return Object.keys(localLearnedCards).length;
  }, [localLearnedCards]);
  
  const reviewCount = useMemo(() => {
    return Object.keys(localReviewLaterCards).filter(id => !localLearnedCards[id]).length;
  }, [localReviewLaterCards, localLearnedCards]);

  // Calculate progress based on current position
  useEffect(() => {
    if (cards.length === 0) return;
    
    // Progress shows current position in deck
    const positionBasedProgress = Math.min(
      Math.round(((currentCardIndex + 1) / cards.length) * 100),
      100
    );
    
    setProgress(positionBasedProgress);
  }, [cards.length, currentCardIndex]);
  
  // Update parent component with progress
  const triggerProgressUpdate = useCallback(() => {
    if (!onProgressUpdate) return;
    
    onProgressUpdate({
      currentCardIndex,
      learnedCards: learnedCardsRef.current,
      reviewLaterCards: reviewLaterCardsRef.current,
      studyMode
    });
  }, [currentCardIndex, studyMode, onProgressUpdate]);
  
  // Safely transition to a new mode
  const transitionToMode = useCallback((newMode, newIndex = 0) => {
    // Prevent multiple transitions
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    
    setIsChangingCard(true);
    
    // Add small delay for animation
    setTimeout(() => {
      setStudyMode(newMode);
      setCurrentCardIndex(newIndex);
      setShowingAnswer(false);
      
      // Notify parent of completion
      if (newMode === 'completed' && onDeckComplete) {
        onDeckComplete({
          learnedCards: learnedCardsRef.current,
          reviewLaterCards: reviewLaterCardsRef.current
        });
      }
      
      // Update progress
      triggerProgressUpdate();
      
      // Complete animation
      setTimeout(() => {
        setIsChangingCard(false);
        isTransitioning.current = false;
      }, 100);
    }, 200);
  }, [onDeckComplete, triggerProgressUpdate]);
  
  // Check if deck is completed
  const checkCompletion = useCallback(() => {
    // Don't check if already completed or transitioning
    if (studyMode === 'completed' || isTransitioning.current) return;
    
    // In review mode, check if all review cards are completed
    if (studyMode === 'review') {
      const allReviewsCompleted = reviewCards.every(card => learnedCardsRef.current[card.id]);
      
      if (allReviewsCompleted || reviewCards.length === 0) {
        // All reviews are done, show completion screen
        transitionToMode('completed');
      }
      return;
    }
    
    // Check if we're at the end of the deck
    if (currentCardIndex >= activeCards.length - 1) {
      // In normal mode, check if all cards have been acted on
      const allCardsActedOn = cards.every(
        card => learnedCardsRef.current[card.id] || reviewLaterCardsRef.current[card.id]
      );
      
      if (allCardsActedOn) {
        // If there are review cards, stay in current state and show review prompt
        // If no review cards, complete the deck
        if (reviewCards.length === 0) {
          transitionToMode('completed');
        }
      }
    }
  }, [cards, reviewCards, studyMode, currentCardIndex, activeCards, transitionToMode]);
  
  // Check completion when relevant state changes
  useEffect(() => {
    if (cards.length > 0 && activeCards.length > 0) {
      // Only check completion at the end of the deck
      if (currentCardIndex >= activeCards.length - 1) {
        checkCompletion();
      }
    }
  }, [learnedCount, reviewCount, currentCardIndex, checkCompletion, cards.length, activeCards.length]);

  // Handle card flipping
  const handleFlip = () => {
    if (isTransitioning.current) return;
    setShowingAnswer(!showingAnswer);
  };

  // Navigate to next card
  const handleNext = () => {
    if (studyMode === 'completed' || isTransitioning.current) return;
    
    if (currentCardIndex < activeCards.length - 1) {
      setIsChangingCard(true);
      
      // Wait for fade out animation
      setTimeout(() => {
        setCurrentCardIndex(prevIndex => prevIndex + 1);
        setShowingAnswer(false);
        
        setTimeout(() => {
          setIsChangingCard(false);
          
          // Update progress after advancing
          triggerProgressUpdate();
        }, 100);
      }, 200);
    } else {
      // At the end of active cards, update progress
      triggerProgressUpdate();
      
      // Check for completion
      checkCompletion();
    }
  };

  // Navigate to previous card
  const handlePrevious = () => {
    if (studyMode === 'completed' || isTransitioning.current) return;
    
    if (currentCardIndex > 0) {
      setIsChangingCard(true);
      
      setTimeout(() => {
        setCurrentCardIndex(prevIndex => prevIndex - 1);
        setShowingAnswer(false);
        
        setTimeout(() => {
          setIsChangingCard(false);
          
          // Update progress after going back
          triggerProgressUpdate();
        }, 100);
      }, 200);
    }
  };

  // Mark card as learned
  const markAsLearned = () => {
    if (studyMode === 'completed' || isTransitioning.current || !activeCards[currentCardIndex]) return;
    
    const cardId = activeCards[currentCardIndex].id;
    if (!cardId) return;
    
    // Update learned cards
    const newLearnedCards = {
      ...learnedCardsRef.current,
      [cardId]: true
    };
    
    setLocalLearnedCards(newLearnedCards);
    learnedCardsRef.current = newLearnedCards;
    
    // Remove from review later if marked
    let newReviewLaterCards = { ...reviewLaterCardsRef.current };
    if (newReviewLaterCards[cardId]) {
      delete newReviewLaterCards[cardId];
      
      setLocalReviewLaterCards(newReviewLaterCards);
      reviewLaterCardsRef.current = newReviewLaterCards;
      
      if (onReviewLaterToggle) {
        onReviewLaterToggle(cardId, false);
      }
    }
    
    // Call callback
    if (onCardComplete) {
      onCardComplete(cardId, 'learned');
    }
    
    // Update progress
    triggerProgressUpdate();
    
    // Check if this was the last card
    if (currentCardIndex === activeCards.length - 1) {
      checkCompletion();
    } else {
      // Move to next card
      handleNext();
    }
  };

  // Mark card for review later
  const toggleReviewLater = () => {
    if (studyMode === 'completed' || studyMode === 'review' || 
        isTransitioning.current || !activeCards[currentCardIndex]) return;
    
    const cardId = activeCards[currentCardIndex].id;
    if (!cardId) return;
    
    // Update review later cards
    const newReviewLaterCards = {
      ...reviewLaterCardsRef.current,
      [cardId]: true
    };
    
    setLocalReviewLaterCards(newReviewLaterCards);
    reviewLaterCardsRef.current = newReviewLaterCards;
    
    // Call callback
    if (onReviewLaterToggle) {
      onReviewLaterToggle(cardId, true);
    }
    
    // Update progress
    triggerProgressUpdate();
    
    // Check if this was the last card
    if (currentCardIndex === activeCards.length - 1) {
      checkCompletion();
    } else {
      // Move to next card
      handleNext();
    }
  };

  // Restart deck
  const handleRestartDeck = () => {
    if (isTransitioning.current) return;
    isTransitioning.current = true;
    
    setIsChangingCard(true);
    
    setTimeout(() => {
      setCurrentCardIndex(0);
      setShowingAnswer(false);
      setStudyMode('normal');
      
      // Reset cards
      const resetLearnedCards = {};
      const resetReviewCards = {};
      
      setLocalLearnedCards(resetLearnedCards);
      setLocalReviewLaterCards(resetReviewCards);
      
      learnedCardsRef.current = resetLearnedCards;
      reviewLaterCardsRef.current = resetReviewCards;
      
      if (onReset) {
        onReset();
      }
      
      triggerProgressUpdate();
      
      setTimeout(() => {
        setIsChangingCard(false);
        isTransitioning.current = false;
      }, 100);
    }, 200);
  };

  // Exit study mode
  const handleExit = () => {
    // Save current state before exiting
    triggerProgressUpdate();
    
    if (onExit) {
      onExit({
        currentCardIndex,
        learnedCards: learnedCardsRef.current,
        reviewLaterCards: reviewLaterCardsRef.current,
        studyMode
      });
    }
  };
  
  // Start review mode
  const handleStartReview = () => {
    if (isTransitioning.current) return;
    transitionToMode('review', 0);
  };

  // Current card
  const currentCard = activeCards[currentCardIndex];
  
  // Completion screen
  if (studyMode === 'completed') {
    const finalLearnedCount = Object.keys(learnedCardsRef.current).length;
    
    return (
      <div className={styles.container}>
        {/* Exit button */}
        <button
          onClick={handleExit}
          className={styles.exitButton}
          aria-label="Exit study mode"
        >
          <CloseIcon />
        </button>
        
        <div className={`${styles.completionScreen} ${showZoomAnimation ? styles.zoomIn : ''}`}>
          <div className={styles.completionIcon}>
            <EmojiEventsIcon style={{ fontSize: '4rem', color: '#00ff94' }} />
          </div>
          <h2 className={styles.completionTitle}>Deck Completed!</h2>
          <p className={styles.completionText}>
            You've completed all {cards.length} cards in this deck.
          </p>
          <div className={styles.completionStats}>
            <div className={styles.statItem}>
              <CheckCircleIcon style={{ color: '#00ff94' }} />
              <span>{finalLearnedCount} learned</span>
            </div>
          </div>
          <div className={styles.completionButtons}>
            <button 
              onClick={handleRestartDeck}
              className={styles.restartButton}
            >
              <RestartAltIcon fontSize="small" style={{ marginRight: '4px' }} /> Restart Deck
            </button>
            <button 
              onClick={handleExit}
              className={styles.exitFullButton}
            >
              <CloseIcon fontSize="small" style={{ marginRight: '4px' }} /> Exit
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Review needed screen
  if (studyMode === 'normal' && reviewCards.length > 0 && 
      currentCardIndex >= activeCards.length - 1 && 
      cards.every(card => localLearnedCards[card.id] || localReviewLaterCards[card.id])) {
    return (
      <div className={styles.container}>
        <button
          onClick={handleExit}
          className={styles.exitButton}
          aria-label="Exit study mode"
        >
          <CloseIcon />
        </button>
        
        <div className={`${styles.completionScreen} ${showZoomAnimation ? styles.zoomIn : ''}`}>
          <div className={styles.completionIcon}>
            <FormatListBulletedIcon style={{ fontSize: '4rem', color: '#ed8936' }} />
          </div>
          <h2 className={styles.completionTitle}>Review Needed</h2>
          <p className={styles.completionText}>
            You've marked {reviewCount} {reviewCount === 1 ? 'card' : 'cards'} for review.
          </p>
          <div className={styles.completionStats}>
            <div className={styles.statItem}>
              <BookmarkIcon style={{ color: '#ed8936' }} />
              <span>{reviewCount} for review</span>
            </div>
            <div className={styles.statItem}>
              <CheckCircleIcon style={{ color: '#00ff94' }} />
              <span>{learnedCount} learned</span>
            </div>
          </div>
          <div className={styles.completionButtons}>
            <button 
              onClick={handleStartReview}
              className={styles.reviewButton}
            >
              <BookmarkIcon fontSize="small" style={{ marginRight: '4px' }} /> Review Cards
            </button>
            <button 
              onClick={handleExit}
              className={styles.exitFullButton}
            >
              <CloseIcon fontSize="small" style={{ marginRight: '4px' }} /> Exit
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  // Main study screen
  return (
    <div className={styles.container}>
      {/* Exit button */}
      <button
        onClick={handleExit}
        className={styles.exitButton}
        aria-label="Exit study mode"
      >
        <CloseIcon />
      </button>
      
      {/* Mode indicator for review mode */}
      {studyMode === 'review' && (
        <div className={styles.modeIndicator}>
          <BookmarkIcon fontSize="small" style={{ marginRight: '4px' }} />
          Review Mode
        </div>
      )}
      
      {/* Progress bar */}
      <div className={styles.progressContainer}>
        <div className={styles.progressBar}>
          <div 
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={styles.progressText}>
          {currentCardIndex + 1} / {activeCards.length} {studyMode === 'review' ? '(Review)' : ''}
        </div>
      </div>

      {/* Flashcard container - restored the container div for proper styling */}
      <div className={`${styles.cardContainer} ${showZoomAnimation ? styles.zoomIn : ''}`}>
        {/* Flashcard */}
        {currentCard && (
          <div 
            className={styles.card}
            onClick={handleFlip}
            style={{ opacity: isChangingCard ? 0 : 1, transition: 'opacity 0.2s' }}
          >
            {!showingAnswer ? (
              <div className={styles.cardContent}>
                <div className={styles.question}>
                  {currentCard?.question || 'Question'}
                </div>
                <div className={styles.flipHint}>
                  <FlipIcon fontSize="small" style={{ marginRight: '4px' }} /> Tap to see answer
                </div>
              </div>
            ) : (
              <div className={styles.cardContent}>
                <div className={styles.answer}>
                  {currentCard?.answer || 'Answer'}
                </div>
                <div className={styles.flipHint}>
                  <FlipIcon fontSize="small" style={{ marginRight: '4px' }} /> Tap to see question
                </div>
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className={styles.controlsContainer}>
          {/* Previous button */}
          <button
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
            className={`${styles.controlButton} ${styles.buttonPrev}`}
            aria-label="Previous card"
          >
            <NavigateBeforeIcon />
          </button>

          {/* Mark for review - only in normal mode */}
          {studyMode === 'normal' && (
            <button
              onClick={toggleReviewLater}
              className={`${styles.controlButton} ${styles.buttonReview}`}
              aria-label="Mark for review"
            >
              <BookmarkIcon />
            </button>
          )}

          {/* Learned it */}
          <button
            onClick={markAsLearned}
            className={`${styles.controlButton} ${styles.buttonLearned}`}
            aria-label="Learned it"
          >
            <CheckCircleIcon />
          </button>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={currentCardIndex === activeCards.length - 1}
            className={`${styles.controlButton} ${styles.buttonNext}`}
            aria-label="Next card"
          >
            <NavigateNextIcon />
          </button>
        </div>

        {/* Restart button */}
        <div className={styles.restartContainer}>
          <button
            onClick={handleRestartDeck}
            className={styles.restartButton}
            aria-label="Restart deck"
          >
            <RestartAltIcon fontSize="small" style={{ marginRight: '4px' }} /> Restart Deck
          </button>
        </div>
      </div>
    </div>
  );
};

FocusStudyDeck.propTypes = {
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
  onExit: PropTypes.func,
  onProgressUpdate: PropTypes.func,
  reviewLaterCards: PropTypes.object,
  learnedCards: PropTypes.object
};

export default FocusStudyDeck;