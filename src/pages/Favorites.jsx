import { useState, useEffect, useRef } from 'react'
import { useMediaQuery } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'

// Components
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import FlashcardSet from '../components/FlashcardSet'

// Services
import { flashcardService } from '../services/api'
import { quizService } from '../services/quiz-service'
import { handleRequestError } from '../services/utils'

// Custom hooks
import useNavigationWithCancellation from '../hooks/useNavigationWithCancellation'

// Icons
import AppsIcon from '@mui/icons-material/Apps'
import FilterListIcon from '@mui/icons-material/FilterList'
import SortIcon from '@mui/icons-material/Sort'
import SegmentIcon from '@mui/icons-material/Segment'
import MenuBookIcon from '@mui/icons-material/MenuBook'
import QuizIcon from '@mui/icons-material/Quiz'
import StarIcon from '@mui/icons-material/Star'

function Favorites() {
  const [favoriteFlashcards, setFavoriteFlashcards] = useState([]);
  const [favoriteQuizzes, setFavoriteQuizzes] = useState([]);
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'flashcards', 'quizzes'
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  const isMountedRef = useRef(true);
  const navigate = useNavigationWithCancellation();

  // Fetch favorites on component mount
  useEffect(() => {
    fetchFavorites();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch favorite items
  const fetchFavorites = async () => {
    if (!isMountedRef.current) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch flashcards and quizzes in parallel
      const [flashcardsResponse, quizzesResponse] = await Promise.all([
        flashcardService.getFavorites(),
        quizService.getFavorites()
      ]);
      
      // Guard against setting state on unmounted component
      if (!isMountedRef.current) return;
      
      // Process flashcards
      const transformedFlashcards = flashcardsResponse.map(set => ({
        id: set._id || set.id,
        title: set.title,
        cards: set.cardCount || (set.cards ? set.cards.length : 0),
        lastStudied: set.lastStudied || 'Never',
        progress: set.progress || 0,
        isFavorite: true
      }));
      
      // Process quizzes
      const transformedQuizzes = quizzesResponse.map(quiz => ({
        id: quiz._id || quiz.id,
        title: quiz.title,
        description: quiz.description || '',
        questionCount: quiz.questionCount || quiz.totalQuestions || 0,
        difficulty: quiz.difficulty || 'Medium',
        time: quiz.estimatedTime || '15 min',
        tags: quiz.tags || [],
        isFavorite: true
      }));
      
      setFavoriteFlashcards(transformedFlashcards);
      setFavoriteQuizzes(transformedQuizzes);
      setIsLoading(false);
    } catch (err) {
      // Only log and update state for non-cancellation errors
      if (!handleRequestError(err, 'Favorites fetch')) {
        console.error('Error fetching favorites:', err);
        if (isMountedRef.current) {
          setError('Failed to load your favorites. Please try again.');
          setIsLoading(false);
        }
      }
    }
  };

  // Filter favorites based on search query and active tab
  const filteredFavorites = {
    flashcards: favoriteFlashcards.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    ),
    quizzes: favoriteQuizzes.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  };

  // Handle search input change
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Handle favorite toggle for flashcard sets
  const handleFlashcardFavoriteToggle = (id, newStatus) => {
    if (!newStatus) {
      // Remove from favorites list
      setFavoriteFlashcards(prev => prev.filter(item => item.id !== id));
    }
  };

  // Handle favorite toggle for quizzes
  const handleQuizFavoriteToggle = (id, newStatus) => {
    if (!newStatus) {
      // Remove from favorites list
      setFavoriteQuizzes(prev => prev.filter(item => item.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex flex-col md:flex-row">
      {/* Mobile menu button */}
      {isMobile && (
        <div className="p-4 flex items-center justify-end sticky top-0 z-30">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-white rounded-lg hover:bg-white/10"
          >
            <MenuIcon />
          </button>
        </div>
      )}
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar - fixed position on desktop, overlay on mobile */}
      <div className={`fixed top-0 left-0 bottom-0 w-64 transform transition-transform duration-300 ease-in-out z-40 ${isMobile && !sidebarOpen ? '-translate-x-full' : ''} ${isMobile && sidebarOpen ? 'translate-x-0' : ''}`}>
        <Sidebar activePage="favorites" />
      </div>
      
      {/* Main content - adjusted margin to account for fixed sidebar */}
      <div className={`flex-1 flex flex-col ${isMobile ? '' : 'md:ml-64'} ${isMobile && sidebarOpen ? 'blur-sm' : ''}`}>
        {!isMobile && (
          <DashboardHeader 
            title="Favorites" 
            searchEnabled={true}
            filterEnabled={true}
            searchValue={searchQuery}
            onSearchChange={handleSearchChange}
          />
        )}
        
        <div className="flex-1 p-4 md:p-6">
          <div className="container mx-auto max-w-6xl">
            {isMobile && (
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white">Favorites</h1>
                <div className="flex gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder="Search..."
                      className="py-2 px-3 pl-9 bg-[#18092a]/60 border border-gray-800/30 rounded-lg text-white w-full focus:outline-none focus:border-[#00ff94]/50"
                    />
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-white/50 absolute left-2 top-1/2 -translate-y-1/2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                </div>
              </div>
            )}
            
            {/* Filter tabs */}
            <div className="flex mb-6 bg-[#18092a]/40 p-1 rounded-lg">
              <button
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'all' ? 'bg-[#18092a] text-white' : 'text-white/70 hover:bg-white/5'}`}
                onClick={() => handleTabChange('all')}
              >
                <div className="flex items-center justify-center gap-2">
                  <AppsIcon fontSize="small" />
                  <span>All</span>
                </div>
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'flashcards' ? 'bg-[#18092a] text-white' : 'text-white/70 hover:bg-white/5'}`}
                onClick={() => handleTabChange('flashcards')}
              >
                <div className="flex items-center justify-center gap-2">
                  <MenuBookIcon fontSize="small" />
                  <span>Flashcards</span>
                </div>
              </button>
              <button
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${activeTab === 'quizzes' ? 'bg-[#18092a] text-white' : 'text-white/70 hover:bg-white/5'}`}
                onClick={() => handleTabChange('quizzes')}
              >
                <div className="flex items-center justify-center gap-2">
                  <QuizIcon fontSize="small" />
                  <span>Quizzes</span>
                </div>
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 rounded-full border-4 border-[#00ff94]/20 border-t-[#00ff94] animate-spin"></div>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-white/70 mb-4">{error}</p>
                <button 
                  onClick={fetchFavorites}
                  className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <>
                {/* Flashcards Section */}
                {(activeTab === 'all' || activeTab === 'flashcards') && filteredFavorites.flashcards.length > 0 && (
                  <div className="mb-8">
                    {activeTab === 'all' && (
                      <h2 className="text-xl font-bold mb-4 px-2">Flashcard Sets</h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {filteredFavorites.flashcards.map(set => (
                        <FlashcardSet 
                          key={set.id}
                          id={set.id}
                          title={set.title}
                          cards={set.cards}
                          lastStudied={set.lastStudied}
                          progress={set.progress}
                          isFavorite={set.isFavorite}
                          onToggleFavorite={handleFlashcardFavoriteToggle}
                        />
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Quizzes Section */}
                {(activeTab === 'all' || activeTab === 'quizzes') && filteredFavorites.quizzes.length > 0 && (
                  <div>
                    {activeTab === 'all' && (
                      <h2 className="text-xl font-bold mb-4 px-2">Quizzes</h2>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                      {filteredFavorites.quizzes.map(quiz => (
                        <div key={quiz.id} className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
                          <div className="flex justify-between items-start mb-4">
                            <h3 className="text-xl font-bold truncate pr-2">{quiz.title}</h3>
                            <div className="flex gap-1">
                              <button 
                                onClick={() => handleQuizFavoriteToggle(quiz.id, false)}
                                className="text-[#FFD700] hover:text-[#FFD700] p-1"
                                title="Remove from favorites"
                              >
                                <StarIcon fontSize="small" />
                              </button>
                            </div>
                          </div>
                          
                          <p className="text-white/70 text-sm mb-4 line-clamp-2">{quiz.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            <div className="bg-white/10 px-3 py-1 rounded-full text-xs text-white/80 flex items-center gap-1">
                              <span>{quiz.questionCount} Questions</span>
                            </div>
                            <div className="bg-white/10 px-3 py-1 rounded-full text-xs text-white/80 flex items-center gap-1">
                              <span>{quiz.time}</span>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${
                              quiz.difficulty === 'Easy' 
                                ? 'bg-green-500/10 text-green-400' 
                                : quiz.difficulty === 'Medium'
                                  ? 'bg-yellow-500/10 text-yellow-400'
                                  : 'bg-red-500/10 text-red-400'
                            }`}>
                              <span>{quiz.difficulty}</span>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-1 mb-5">
                            {quiz.tags && quiz.tags.map((tag, index) => (
                              <span key={index} className="bg-[#00ff94]/10 px-2 py-0.5 rounded-full text-xs text-[#00ff94]">
                                {tag}
                              </span>
                            ))}
                          </div>
                          
                          <div className="flex gap-2">
                            <button 
                              onClick={() => navigate(`/edit-quiz/${quiz.id}`)}
                              className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex-1"
                            >
                              Start Quiz
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* No favorites message */}
                {filteredFavorites.flashcards.length === 0 && filteredFavorites.quizzes.length === 0 && (
                  <div className="text-center py-16">
                    <div className="bg-[#18092a]/60 rounded-xl p-8 border border-gray-800/30 shadow-lg inline-block max-w-md">
                      <div className="text-[#00ff94] mb-4">
                        <StarIcon style={{ fontSize: 48 }} />
                      </div>
                      <h3 className="text-xl font-bold mb-2">No favorites yet</h3>
                      <p className="text-white/70 mb-6">
                        Add flashcard sets and quizzes to your favorites by clicking the star icon.
                      </p>
                      <div className="flex gap-4 justify-center">
                        <button 
                          onClick={() => navigate('/flashcards')}
                          className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
                        >
                          Browse Flashcards
                        </button>
                        <button 
                          onClick={() => navigate('/quizzes')}
                          className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
                        >
                          Browse Quizzes
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Favorites 