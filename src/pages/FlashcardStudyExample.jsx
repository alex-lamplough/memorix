import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FlashcardStudy from '../components/FlashcardStudy';
import { flashcardService } from '../services/api';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

function FlashcardStudyExample() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flashcardSet, setFlashcardSet] = useState(null);
  const [reviewLaterCards, setReviewLaterCards] = useState({});
  const [learnedCards, setLearnedCards] = useState({});

  // Fetch flashcard set
  useEffect(() => {
    const fetchFlashcardSet = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Demo data if no ID is provided
        if (!id) {
          const demoCards = [
            { id: '1', question: 'What is the capital of France?', answer: 'Paris' },
            { id: '2', question: 'What is the largest planet in our solar system?', answer: 'Jupiter' },
            { id: '3', question: 'What is the chemical symbol for gold?', answer: 'Au' },
            { id: '4', question: 'What year did the Titanic sink?', answer: '1912' },
            { id: '5', question: 'Who painted the Mona Lisa?', answer: 'Leonardo da Vinci' }
          ];
          
          setFlashcardSet({
            title: 'Demo Flashcards',
            cards: demoCards
          });
          
          setIsLoading(false);
          return;
        }
        
        // Fetch real data if ID is provided
        const data = await flashcardService.getFlashcardSet(id);
        
        // Transform the cards format if needed
        const formattedCards = data.cards.map(card => ({
          question: card.front,
          answer: card.back,
          id: card._id
        }));
        
        setFlashcardSet({
          ...data,
          cards: formattedCards
        });
        
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
        
      } catch (err) {
        console.error('Error fetching flashcard set:', err);
        setError(err.message || 'Failed to load flashcard set');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFlashcardSet();
  }, [id]);
  
  // Handle card completion
  const handleCardComplete = (cardId, status) => {
    console.log(`Card ${cardId} marked as ${status}`);
    
    // Update learned cards
    if (status === 'learned') {
      setLearnedCards(prev => ({
        ...prev,
        [cardId]: true
      }));
    }
  };
  
  // Handle review later toggle
  const handleReviewLaterToggle = (cardId, isMarkedForReview) => {
    console.log(`Card ${cardId} ${isMarkedForReview ? 'marked' : 'unmarked'} for review later`);
    
    // Update review later cards
    setReviewLaterCards(prev => {
      const updated = { ...prev };
      if (isMarkedForReview) {
        updated[cardId] = true;
      } else {
        delete updated[cardId];
      }
      return updated;
    });
  };
  
  // Handle deck completion
  const handleDeckComplete = () => {
    console.log('Deck completed!');
  };
  
  // Handle deck reset or review mode change
  const handleDeckReset = () => {
    console.log('Deck restarted or mode changed');
    // Reset our parent state to match the component's state
    setReviewLaterCards({});
    setLearnedCards({});
  };
  
  // Handle go back
  const handleGoBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] py-4">
      <div className="container mx-auto p-4">
        {isLoading ? (
          <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white text-center">
            <p>Loading flashcards...</p>
          </div>
        ) : error ? (
          <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white text-center">
            <p className="text-red-400">Error: {error}</p>
            <button 
              className="mt-4 bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
              onClick={handleGoBack}
            >
              Go Back
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <button
                className="bg-[#18092a]/60 text-white p-2 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors flex items-center"
                onClick={handleGoBack}
              >
                <ArrowBackIcon className="mr-1" /> Back
              </button>
            </div>
            
            <h1 className="text-2xl font-bold text-white mb-6">{flashcardSet.title}</h1>
            
            <FlashcardStudy
              cards={flashcardSet.cards}
              initialCardIndex={0}
              onCardComplete={handleCardComplete}
              onReviewLaterToggle={handleReviewLaterToggle}
              onDeckComplete={handleDeckComplete}
              reviewLaterCards={reviewLaterCards}
              learnedCards={learnedCards}
              onReset={handleDeckReset}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default FlashcardStudyExample; 