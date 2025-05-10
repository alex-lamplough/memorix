import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import styles from './FocusStudyDeck.module.css';
import logger from '../utils/logger';

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
  initialStudyMode = 'normal'
}) => {
  // Main state
  const [currentCardIndex, setCurrentCardIndex] = useState(initialCardIndex);
  const [showingAnswer, setShowingAnswer] = useState(false);
  const [localReviewLaterCards, setLocalReviewLaterCards] = useState(reviewLaterCards);
  const [localLearnedCards, setLocalLearnedCards] = useState(learnedCards);
  const [progress, setProgress] = useState(0);
  const [isChangingCard, setIsChangingCard] = useState(false);
  const [showZoomAnimation, setShowZoomAnimation] = useState(true); // Re-add this for animations
  const [studyMode, setStudyMode] = useState(initialStudyMode); // Initialize with the provided mode
  
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
    const filteredReviewCards = cards.filter(card => localReviewLaterCards[card.id] && !localLearnedCards[card.id]);
    logger.debug(`Found ${filteredReviewCards.length} cards for review mode`);
    return filteredReviewCards;
  }, [cards, localReviewLaterCards, localLearnedCards]);
  
  const activeCards = useMemo(() => {
    // If we're in review mode but there are no review cards, use regular cards instead
    if (studyMode === 'review' && reviewCards.length === 0) {
      logger.debug('No review cards available, falling back to normal cards');
      return cards;
    }
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
    
    // If trying to transition to review mode with no cards, complete instead
    if (newMode === 'review' && reviewCards.length === 0) {
      logger.debug('Attempted to transition to review mode with no review cards, switching to completed instead');
      newMode = 'completed';
    }
    
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
          reviewLaterCards: reviewLaterCardsRef.current,
          studyMode: newMode
        });
      }
      
      // Notify parent about mode change
      if (onProgressUpdate) {
        onProgressUpdate({
          currentCardIndex: newIndex,
          learnedCards: learnedCardsRef.current,
          reviewLaterCards: reviewLaterCardsRef.current,
          studyMode: newMode
        });
      }
      
      // Complete animation
      setTimeout(() => {
        setIsChangingCard(false);
        isTransitioning.current = false;
      }, 100);
    }, 200);
  }, [onDeckComplete, onProgressUpdate, reviewCards.length]);
  
  // Set up effect to initialize review mode if needed
  useEffect(() => {
    // If we're starting in review mode, make sure we have the right cards filtered
    if (initialStudyMode === 'review') {
      if (reviewCards.length > 0) {
        logger.debug('Restoring review mode from saved state with available review cards');
        transitionToMode('review', 0);
      } else {
        logger.debug('Review mode requested but no review cards available, showing completion');
        transitionToMode('completed', 0);
      }
    }
  }, [initialStudyMode, reviewCards.length, transitionToMode]);
  
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
        const pendingReviewCount = Object.keys(reviewLaterCardsRef.current)
          .filter(id => !learnedCardsRef.current[id])
          .length;
          
        logger.debug(`checkCompletion: Found ${pendingReviewCount} cards pending review`);
        
        if (pendingReviewCount === 0) {
          // No review cards, transition to completed
          transitionToMode('completed');
        }
        // If there are pending review cards, do nothing - the Review Needed screen will be shown
        // based on the condition in the render method
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
    
    logger.debug(`Marking card ${cardId} for review at index ${currentCardIndex}/${activeCards.length-1}`);
    
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
      logger.debug(`Last card marked for review. Total review cards: ${Object.keys(newReviewLaterCards).length}`);
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
    // Save current state before exiting, preserving the current mode
    if (onExit) {
      // For review mode, we always want to continue with review mode when coming back
      // and start from card index 0
      if (studyMode === 'review') {
        onExit({
          currentCardIndex: 0, // Always restart at the beginning when returning to review mode
          learnedCards: learnedCardsRef.current,
          reviewLaterCards: reviewLaterCardsRef.current,
          studyMode: 'review',
          isExiting: true
        });
      } else {
        // For normal mode, just save the current state
        onExit({
          currentCardIndex,
          learnedCards: learnedCardsRef.current,
          reviewLaterCards: reviewLaterCardsRef.current,
          studyMode,
          isExiting: true
        });
      }
    }
  };
  
  // Start review mode
  const handleStartReview = () => {
    if (isTransitioning.current) return;
    
    // Check if we have any review cards first
    if (reviewCards.length === 0) {
      logger.debug('Attempted to start review mode with no review cards');
      // Show completion screen instead
      transitionToMode('completed', 0);
      return;
    }
    
    logger.debug(`Starting review mode with ${reviewCards.length} cards`);
    
    // Before transition, ensure the parent component knows we're starting review mode
    if (onProgressUpdate) {
      onProgressUpdate({
        studyMode: 'review',
        learnedCards: learnedCardsRef.current,
        reviewLaterCards: reviewLaterCardsRef.current,
        currentCardIndex: 0 // Always start review at the beginning
      });
    }
    
    // Then transition to review mode
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
  if (studyMode === 'normal' && 
      currentCardIndex >= activeCards.length - 1 && 
      cards.every(card => localLearnedCards[card.id] || localReviewLaterCards[card.id])) {
    
    const pendingReviewCount = Object.keys(localReviewLaterCards)
      .filter(id => !localLearnedCards[id])
      .length;
      
    logger.debug(`Review screen check: Pending review count: ${pendingReviewCount}`);
    
    // Only show the review needed screen if there are actually cards to review
    if (pendingReviewCount > 0) {
      // Special exit handler for review needed screen that FORCES review mode
      const handleReviewExit = () => {
        logger.debug('Exiting from review needed screen - forcing REVIEW mode for next session');
        
        // Force a direct exit to review mode
        if (onExit) {
          onExit({
            currentCardIndex: 0,
            learnedCards: learnedCardsRef.current,
            reviewLaterCards: reviewLaterCardsRef.current,
            studyMode: 'review', // FORCE review mode
            reviewPending: true,
            forceReviewMode: true // Add an extra flag just to be sure
          });
        }
      };
      
      return (
        <div className={styles.container}>
          <button
            onClick={handleReviewExit}
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
              You've marked {pendingReviewCount} {pendingReviewCount === 1 ? 'card' : 'cards'} for review.
            </p>
            <div className={styles.completionStats}>
              <div className={styles.statItem}>
                <BookmarkIcon style={{ color: '#ed8936' }} />
                <span>{pendingReviewCount} for review</span>
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
                onClick={handleReviewExit}
                className={styles.exitFullButton}
              >
                <CloseIcon fontSize="small" style={{ marginRight: '4px' }} /> Exit
              </button>
            </div>
          </div>
        </div>
      );
    }
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
  learnedCards: PropTypes.object,
  initialStudyMode: PropTypes.string
};

export default FocusStudyDeck;