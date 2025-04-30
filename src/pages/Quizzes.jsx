import { useState, useEffect } from 'react'
import { useMediaQuery } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

// Components
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import ShareModal from '../components/ShareModal'
import QuizCreationModal from '../components/Quizzes/QuizCreationModal'

// Icons
import ShareIcon from '@mui/icons-material/Share'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

// Services
import { quizService } from '../services/quiz-service'

function QuizCard({ title, description, questionCount, difficulty, time, tags, id = 1, onDelete }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const navigate = useNavigate()
  
  const handleEditClick = () => {
    navigate(`/edit-quiz/${id}`)
  }
  
  const handleDeleteClick = () => {
    setShowDeleteConfirm(true)
  }
  
  const confirmDelete = async () => {
    try {
      setIsDeleting(true)
      console.log('Starting delete operation for quiz ID:', id);
      
      // First, fetch the quiz to confirm we can delete it
      try {
        const quizData = await quizService.getQuiz(id);
        console.log('Quiz data before deletion:', quizData);
      } catch (error) {
        console.log('Error fetching quiz data (non-critical):', error);
      }
      
      const response = await quizService.deleteQuiz(id);
      console.log('Delete response:', response);
      setIsDeleting(false)
      
      if (onDelete) {
        console.log('Calling onDelete with ID:', id);
        onDelete(id)
      }
    } catch (error) {
      console.error('Detailed error deleting quiz:', error)
      
      if (error.response) {
        // If 403, user is not authorized (owner ID mismatch)
        if (error.response.status === 403) {
          console.error('Error 403: You are not authorized to delete this quiz. Contact the administrator.');
          // Handle by removing from UI anyway for better UX
          if (onDelete) {
            console.log('Calling onDelete with ID (despite error):', id);
            onDelete(id);
          }
        } else {
          console.error('Error response data:', error.response.data);
          console.error('Error response status:', error.response.status);
        }
      }
      setIsDeleting(false)
    }
    setShowDeleteConfirm(false)
  }
  
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold truncate pr-2">{title}</h3>
        <div className="flex gap-1">
          <button 
            className="text-white/60 hover:text-white p-1"
            title="Share quiz"
            onClick={() => setIsShareModalOpen(true)}
          >
            <ShareIcon fontSize="small" />
          </button>
          <button 
            className="text-white/60 hover:text-white p-1"
            title="Delete quiz"
            onClick={handleDeleteClick}
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        </div>
      </div>
      
      <p className="text-white/70 text-sm mb-4 line-clamp-2">{description}</p>
      
      <div className="flex flex-wrap gap-2 mb-4">
        <div className="bg-white/10 px-3 py-1 rounded-full text-xs text-white/80 flex items-center gap-1">
          <span>{questionCount} Questions</span>
        </div>
        <div className="bg-white/10 px-3 py-1 rounded-full text-xs text-white/80 flex items-center gap-1">
          <span>{time}</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${
          difficulty === 'Easy' 
            ? 'bg-green-500/10 text-green-400' 
            : difficulty === 'Medium'
              ? 'bg-yellow-500/10 text-yellow-400'
              : 'bg-red-500/10 text-red-400'
        }`}>
          <span>{difficulty}</span>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-1 mb-5">
        {tags && tags.map((tag, index) => (
          <span key={index} className="bg-[#00ff94]/10 px-2 py-0.5 rounded-full text-xs text-[#00ff94]">
            {tag}
          </span>
        ))}
      </div>
      
      <div className="flex gap-2">
        <button className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex-1">
          Start Quiz
        </button>
        <button 
          onClick={handleEditClick}
          className="bg-[#18092a]/60 text-white px-4 py-2 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors"
        >
          Edit
        </button>
      </div>
      
      {/* Delete confirmation dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#18092a] rounded-xl p-6 border border-gray-800/30 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold mb-2">Delete Quiz</h3>
            <p className="text-white/70 mb-4">
              Are you sure you want to delete "{title}"? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-4 py-2 rounded-lg border border-gray-700 text-white/80 hover:bg-white/5"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <ShareModal 
        open={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        itemToShare={{
          id,
          type: "quiz",
          title
        }}
      />
    </div>
  )
}

function Quizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  
  // Fetch user's quizzes
  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await quizService.getAllQuizzes();
        console.log('Fetched quizzes:', response);
        
        // Transform data to match our component requirements if needed
        const transformedQuizzes = response.map(quiz => ({
          id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          questionCount: quiz.questionCount || quiz.totalQuestions || 0,
          difficulty: quiz.difficulty || 'Medium',
          time: quiz.estimatedTime || '15 min',
          tags: quiz.tags || []
        }));
        
        setQuizzes(transformedQuizzes);
      } catch (err) {
        console.error('Error fetching quizzes:', err);
        setError('Failed to load your quizzes. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchQuizzes();
  }, []);
  
  const handleOpenQuizModal = () => {
    setIsQuizModalOpen(true);
  }
  
  const handleCloseQuizModal = () => {
    setIsQuizModalOpen(false);
  }

  // Refresh quizzes after creating a new one
  const handleQuizCreated = () => {
    // Fetch quizzes again
    setIsLoading(true);
    quizService.getAllQuizzes()
      .then(response => {
        const transformedQuizzes = response.map(quiz => ({
          id: quiz._id,
          title: quiz.title,
          description: quiz.description,
          questionCount: quiz.questionCount || quiz.totalQuestions || 0,
          difficulty: quiz.difficulty || 'Medium',
          time: quiz.estimatedTime || '15 min',
          tags: quiz.tags || []
        }));
        
        setQuizzes(transformedQuizzes);
      })
      .catch(err => {
        console.error('Error refreshing quizzes:', err);
        setError('Failed to refresh your quizzes. Please try again later.');
      })
      .finally(() => {
        setIsLoading(false);
      });
  }
  
  // Handle quiz deletion
  const handleQuizDeleted = (quizId) => {
    setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex flex-col md:flex-row">
      {/* Mobile menu button */}
      {isMobile && (
        <div className="bg-[#18092a]/80 p-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex-1"></div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 text-white rounded-lg bg-[#18092a] hover:bg-[#18092a]/80"
          >
            <MenuIcon />
          </button>
        </div>
      )}
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
      
      {/* Sidebar - hidden on mobile by default */}
      <div className={`z-40 ${isMobile ? 'fixed inset-0 transform transition-transform duration-300 ease-in-out' : ''} ${isMobile && !sidebarOpen ? '-translate-x-full' : ''} ${isMobile && sidebarOpen ? 'translate-x-0' : ''}`}>
        <Sidebar activePage="quizzes" />
      </div>
      
      <div className={`flex-1 flex flex-col ${isMobile && sidebarOpen ? 'blur-sm' : ''}`}>
        {!isMobile && (
          <DashboardHeader
            title="Quizzes"
            actionButton="Create Quiz"
            searchEnabled={true}
            filterEnabled={true}
            onActionButtonClick={handleOpenQuizModal}
          />
        )}
        
        <div className="flex-1 p-4 md:p-6">
          <div className="container mx-auto max-w-6xl">
            {isMobile && (
              <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold text-white">Quizzes</h1>
                <div className="flex gap-2">
                  <button className="p-2 text-white rounded-lg bg-[#18092a]/60 border border-gray-800/30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </button>
                  <button className="p-2 text-white rounded-lg bg-[#18092a]/60 border border-gray-800/30">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 11-3 0m3 0a1.5 1.5 0 10-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m-9.75 0h9.75" />
                    </svg>
                  </button>
                  <button 
                    className="bg-[#00ff94]/10 text-[#00ff94] px-3 py-1.5 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex items-center gap-1"
                    onClick={handleOpenQuizModal}
                  >
                    <AddCircleOutlineIcon fontSize="small" />
                    <span>Create</span>
                  </button>
                </div>
              </div>
            )}
            
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#00ff94]"></div>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 text-red-400 p-4 rounded-lg text-center">
                {error}
              </div>
            ) : quizzes.length === 0 ? (
              <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-center">
                <h3 className="text-xl font-bold mb-2">No Quizzes Yet</h3>
                <p className="text-white/70 mb-4">You haven't created any quizzes yet. Create your first quiz to get started!</p>
                <button 
                  className="bg-[#00ff94]/10 text-[#00ff94] px-4 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 inline-flex items-center gap-2"
                  onClick={handleOpenQuizModal}
                >
                  <AddCircleOutlineIcon fontSize="small" />
                  <span>Create Your First Quiz</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                {quizzes.map(quiz => (
                  <QuizCard 
                    key={quiz.id}
                    id={quiz.id}
                    title={quiz.title}
                    description={quiz.description}
                    questionCount={quiz.questionCount}
                    difficulty={quiz.difficulty}
                    time={quiz.time}
                    tags={quiz.tags}
                    onDelete={handleQuizDeleted}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Quiz Creation Modal */}
        <QuizCreationModal
          open={isQuizModalOpen}
          onClose={handleCloseQuizModal}
          onQuizCreated={handleQuizCreated}
        />
      </div>
    </div>
  )
}

export default Quizzes 