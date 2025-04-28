import { useState, useEffect } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'

// Icons
import LockIcon from '@mui/icons-material/Lock'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'

// Components
import FlashcardDeck from '../components/FlashcardDeck'

function SharedItem() {
  const { type, id } = useParams()
  const [searchParams] = useSearchParams()
  const accessType = searchParams.get('access') || 'view'
  const isProtected = searchParams.get('protected') === 'true'
  const expires = searchParams.get('expires')
  
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [passwordRequired, setPasswordRequired] = useState(isProtected)
  const [password, setPassword] = useState('')
  const [item, setItem] = useState(null)
  
  useEffect(() => {
    // In a real app, this would fetch the shared item from an API
    // For this demo, we'll simulate loading and then return mock data
    
    setIsLoading(true)
    
    const loadItem = setTimeout(() => {
      if (isProtected && !passwordRequired) {
        // Password has been validated
        fetchMockItem()
      } else if (!isProtected) {
        // No password required
        fetchMockItem()
      } else {
        // Still needs password
        setIsLoading(false)
      }
    }, 1000)
    
    return () => clearTimeout(loadItem)
  }, [passwordRequired, isProtected])
  
  const fetchMockItem = () => {
    // In a real app, this would make an API call with the ID
    
    // Mock data
    if (type === 'flashcards') {
      setItem({
        title: 'Physics Fundamentals',
        description: 'Essential physics concepts and formulas',
        cards: [
          {
            question: "What is Newton's First Law?",
            answer: "An object at rest stays at rest, and an object in motion stays in motion with the same speed and direction unless acted upon by an external force."
          },
          {
            question: "What is the formula for calculating force?",
            answer: "F = ma (Force equals mass times acceleration)"
          },
          {
            question: "What is the law of conservation of energy?",
            answer: "Energy cannot be created or destroyed, only transformed from one form to another."
          }
        ]
      })
    } else if (type === 'quiz') {
      setItem({
        title: 'Physics Quiz',
        description: 'Test your knowledge of basic physics',
        questions: [
          {
            question: "Which scientist is known for the theory of relativity?",
            options: ["Isaac Newton", "Albert Einstein", "Niels Bohr", "Galileo Galilei"],
            correctAnswer: 1
          },
          {
            question: "What is the SI unit of force?",
            options: ["Joule", "Newton", "Watt", "Pascal"],
            correctAnswer: 1
          }
        ]
      })
    }
    
    setIsLoading(false)
  }
  
  const checkPassword = () => {
    // In a real app, this would verify the password with the server
    
    // For this demo, any non-empty password works
    if (password.trim()) {
      setPasswordRequired(false)
    } else {
      setError("Please enter a password")
    }
  }
  
  // Render password screen if needed
  if (passwordRequired) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex items-center justify-center">
        <div className="w-full max-w-md p-8 bg-[#18092a]/60 rounded-xl border border-gray-800/30 shadow-lg">
          <div className="mb-6 text-center">
            <div className="w-16 h-16 mx-auto bg-[#00ff94]/10 rounded-full flex items-center justify-center mb-4">
              <LockIcon className="text-[#00ff94]" style={{ fontSize: '2rem' }} />
            </div>
            <h1 className="text-2xl font-bold">Password Protected</h1>
            <p className="text-white/70 mt-2">
              This {type === 'flashcards' ? 'flashcard deck' : 'quiz'} is password protected
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/70 text-sm mb-2">Enter password to access</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#18092a]/80 text-white rounded-lg px-4 py-3 border border-gray-800/50 focus:outline-none focus:border-[#00ff94]/50" 
                placeholder="Enter password"
              />
              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </div>
            
            <button 
              onClick={checkPassword}
              className="w-full bg-[#00ff94]/10 text-[#00ff94] px-6 py-3 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
            >
              Access Content
            </button>
          </div>
        </div>
      </div>
    )
  }
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-white/20 border-t-[#00ff94] rounded-full animate-spin mb-4 mx-auto"></div>
          <p className="text-white/70">Loading content...</p>
        </div>
      </div>
    )
  }
  
  // Render flashcards
  if (type === 'flashcards' && item) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white">
        <header className="py-6 border-b border-gray-800/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center">
              <Link to="/" className="text-white/70 hover:text-white mr-4">
                <ArrowBackIcon />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{item.title}</h1>
                <p className="text-white/70 text-sm">{item.description}</p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-12">
          <FlashcardDeck flashcards={item.cards} />
          
          {accessType === 'view' && (
            <div className="mt-8 text-center">
              <p className="text-white/70 mb-4">Create your own flashcards with Memorix</p>
              <Link 
                to="/"
                className="bg-[#00ff94]/10 text-[#00ff94] px-6 py-3 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 inline-block"
              >
                Sign up for free
              </Link>
            </div>
          )}
        </main>
      </div>
    )
  }
  
  // Render quiz
  if (type === 'quiz' && item) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white">
        <header className="py-6 border-b border-gray-800/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center">
              <Link to="/" className="text-white/70 hover:text-white mr-4">
                <ArrowBackIcon />
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{item.title}</h1>
                <p className="text-white/70 text-sm">{item.description}</p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-12">
          <div className="bg-[#18092a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg text-white max-w-2xl mx-auto">
            <h2 className="text-xl font-bold mb-6">Quiz Preview</h2>
            
            <div className="space-y-6">
              {item.questions.map((q, index) => (
                <div key={index} className="bg-[#000]/20 p-4 rounded-lg">
                  <h3 className="font-medium mb-3">Question {index + 1}: {q.question}</h3>
                  <div className="space-y-2">
                    {q.options.map((option, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input 
                          type="radio" 
                          name={`question-${index}`} 
                          id={`q${index}-opt${i}`}
                          className="h-4 w-4 text-[#00ff94] focus:ring-[#00ff94]/50 border-gray-800/50 bg-[#000]/20"
                        />
                        <label htmlFor={`q${index}-opt${i}`} className="text-white/90">{option}</label>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 text-center">
              <button className="bg-[#00ff94] text-[#18092a] font-medium px-6 py-3 rounded-lg hover:bg-[#00ff94]/90 transition-colors w-full max-w-xs">
                Start Quiz
              </button>
              
              {accessType === 'view' && (
                <div className="mt-8">
                  <p className="text-white/70 mb-4">Create your own quizzes with Memorix</p>
                  <Link 
                    to="/"
                    className="bg-[#00ff94]/10 text-[#00ff94] px-6 py-3 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 inline-block"
                  >
                    Sign up for free
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }
  
  // Fallback for error
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Content Not Found</h1>
        <p className="text-white/70 mb-6">The shared content you're looking for doesn't exist or has expired.</p>
        <Link 
          to="/"
          className="bg-[#00ff94]/10 text-[#00ff94] px-6 py-3 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 inline-block"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  )
}

export default SharedItem 