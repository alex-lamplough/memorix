import { useState } from 'react'
import { useMediaQuery } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'

// Components
import Sidebar from '../components/Sidebar'
import DashboardHeader from '../components/DashboardHeader'
import ShareModal from '../components/ShareModal'

// Icons
import ShareIcon from '@mui/icons-material/Share'
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'

function QuizCard({ title, description, questionCount, difficulty, time, tags, id = 1 }) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [showOptionsMenu, setShowOptionsMenu] = useState(false)
  
  return (
    <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-xl font-bold truncate pr-2">{title}</h3>
        <div className="relative">
          <button 
            className="text-white/60 hover:text-white p-1"
            onClick={() => setShowOptionsMenu(!showOptionsMenu)}
          >
            <MoreHorizIcon fontSize="small" />
          </button>
          
          {showOptionsMenu && (
            <div className="absolute right-0 top-full mt-2 bg-[#18092a] border border-gray-800/50 rounded-lg shadow-xl w-40 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    setIsShareModalOpen(true)
                    setShowOptionsMenu(false)
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/80 hover:bg-white/5 text-left"
                >
                  <ShareIcon fontSize="small" />
                  <span>Share</span>
                </button>
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/80 hover:bg-white/5 text-left"
                >
                  <span>Edit</span>
                </button>
                <button
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-white/80 hover:bg-white/5 text-left"
                >
                  <span>Delete</span>
                </button>
              </div>
            </div>
          )}
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
        {tags.map((tag, index) => (
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
          onClick={() => setIsShareModalOpen(true)}
          className="bg-[#18092a]/60 text-white px-4 py-2 rounded-lg border border-gray-800/30 hover:bg-[#18092a] transition-colors flex items-center justify-center"
        >
          <ShareIcon fontSize="small" />
        </button>
      </div>
      
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
  const [quizzes] = useState([
    {
      id: 1,
      title: 'Physics Fundamentals Quiz',
      description: 'Test your knowledge on basic physics concepts and formulas',
      questionCount: 15,
      difficulty: 'Medium',
      time: '15 min',
      tags: ['Physics', 'Science']
    },
    {
      id: 2,
      title: 'Spanish Vocabulary Test',
      description: 'Challenge your Spanish vocabulary knowledge with this comprehensive quiz',
      questionCount: 20,
      difficulty: 'Easy',
      time: '20 min',
      tags: ['Spanish', 'Languages']
    },
    {
      id: 3,
      title: 'Web Development Challenge',
      description: 'Advanced quiz covering HTML, CSS, JavaScript and modern frameworks',
      questionCount: 25,
      difficulty: 'Hard',
      time: '30 min',
      tags: ['Programming', 'Web Dev']
    },
    {
      id: 4,
      title: 'IELTS Practice Quiz',
      description: 'Prepare for your IELTS exam with this practice quiz focusing on vocabulary and grammar',
      questionCount: 30,
      difficulty: 'Medium',
      time: '25 min',
      tags: ['IELTS', 'English']
    }
  ]);
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:768px)');
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex flex-col md:flex-row">
      {/* Mobile menu button */}
      {isMobile && (
        <div className="bg-[#18092a]/80 p-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black tracking-widest text-[#00ff94]">M/</span>
            <span className="text-white font-bold">Memorix</span>
          </div>
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
                  <button className="bg-[#00ff94]/10 text-[#00ff94] px-3 py-1.5 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 flex items-center gap-1">
                    <AddCircleOutlineIcon fontSize="small" />
                    <span>Create</span>
                  </button>
                </div>
              </div>
            )}
            
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
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Quizzes 