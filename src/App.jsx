import { Routes, Route, Link } from 'react-router-dom'
import { useState, useEffect } from 'react'

// Feature icons
import BoltIcon from '@mui/icons-material/Bolt'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import PublicIcon from '@mui/icons-material/Public'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import CloseIcon from '@mui/icons-material/Close'
import QuizIcon from '@mui/icons-material/Quiz'
import AnalyticsIcon from '@mui/icons-material/Analytics'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import DevicesIcon from '@mui/icons-material/Devices'
import PersonalVideoIcon from '@mui/icons-material/PersonalVideo'
import TranslateIcon from '@mui/icons-material/Translate'

// Components
import FlashcardDeck from './components/FlashcardDeck'
import LoginButton from './components/LoginButton'
import ProtectedRoute from './auth/ProtectedRoute'
import Todo from './components/Todo'

// Pages
import Dashboard from './pages/Dashboard'
import Progress from './pages/Progress'
import Favorites from './pages/Favorites'
import Quizzes from './pages/Quizzes'
import Settings from './pages/Settings'
import SharedItem from './pages/SharedItem'
import ShareFeature from './pages/ShareFeature'
import Header from './Header'
// import Collections from './pages/Collections'

// Assets
import logoWhite from './assets/MemorixLogoWhite.png'

function AnimatedHeading() {
  const phrases = [
    "Any Subject",
    "Note Taking",
    "Meeting Notes",
    "Study Sessions",
    "Language Learning",
    "Math Problems"
  ]
  
  const [currentPhrase, setCurrentPhrase] = useState(phrases[0])
  const [isChanging, setIsChanging] = useState(false)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setIsChanging(true)
      
      setTimeout(() => {
        const currentIndex = phrases.indexOf(currentPhrase)
        const nextIndex = (currentIndex + 1) % phrases.length
        setCurrentPhrase(phrases[nextIndex])
        
        setTimeout(() => {
          setIsChanging(false)
        }, 150)
      }, 500)
    }, 1500)
    
    return () => clearInterval(interval)
  }, [currentPhrase, phrases])
  
  return (
    <div className="text-center mb-8 max-w-full overflow-hidden">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold inline-flex items-center justify-center flex-wrap">
        <span className="text-[#00ff94] drop-shadow-[0_0_12px_rgba(0,255,148,0.8)]">M/</span>
        <span>aster </span>
        <span className={`transition-all duration-500 mx-1 ${isChanging ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
          {currentPhrase}
        </span>
        <span>with AI</span>
      </h1>
    </div>
  )
}

function Hero() {
  const [showFlashcards, setShowFlashcards] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState("Explain the key concepts of photosynthesis in simple terms.")
  
  const handleInputChange = (e) => {
    setInputValue(e.target.value)
  }
  
  const handleArrowClick = () => {
    if (inputValue.trim() === '') return
    
    setIsLoading(true)
    
    // Simulate AI processing time
    setTimeout(() => {
      setIsLoading(false)
      setShowFlashcards(true)
    }, 1500)
  }
  
  const handleCloseFlashcards = () => {
    setShowFlashcards(false)
  }
  
  const demoFlashcards = [
    {
      question: "What is photosynthesis?",
      answer: "Photosynthesis is the process by which plants convert light energy into chemical energy to fuel their activities."
    },
    {
      question: "What are the main components needed for photosynthesis?",
      answer: "Sunlight, water, carbon dioxide, and chlorophyll."
    },
    {
      question: "What is the primary product of photosynthesis?",
      answer: "Glucose (sugar) and oxygen as a byproduct."
    },
    {
      question: "Where does photosynthesis take place in plant cells?",
      answer: "Primarily in the chloroplasts, specialized organelles containing chlorophyll."
    },
    {
      question: "What is the chemical equation for photosynthesis?",
      answer: "6CO₂ + 6H₂O + Light Energy → C₆H₁₂O₆ + 6O₂"
    }
  ];
  
  return (
    <div className="container mx-auto px-4 flex flex-col items-center text-white">
      {/* Top spacer */}
      <div className="h-[15vh]"></div>
      
      {/* Title section with fixed height */}
      <div className="h-[140px] flex flex-col items-center justify-center">
        <AnimatedHeading />
        
        <p className="text-base text-white/80 mt-2 max-w-xl">
          Notes to flashcards in seconds, with your personal AI tutor
        </p>
      </div>
      
      {/* Fixed spacer between title and input */}
      <div className="h-[80px]"></div>
      
      {/* "Try it out!" label */}
      <div className="mb-3 bg-[#00ff94]/10 px-4 py-1 rounded-full border border-[#00ff94]/30 text-[#00ff94] text-sm font-semibold animate-pulse">
        Try it out!
      </div>
      
      {/* Input box with fixed width */}
      <div className="w-full max-w-lg mx-auto px-4">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Enter any concept you want to learn..."
            className="w-full bg-[#18092a]/60 text-white rounded-xl px-5 py-3.5 border border-gray-800/30 focus:outline-none focus:border-[#00ff94]/50 focus:ring-1 focus:ring-[#00ff94]/30 text-sm shadow-lg"
            disabled={isLoading}
          />
          <button 
            className={`absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-full border transition-colors ${
              isLoading 
                ? 'bg-gray-700/50 text-gray-500 border-gray-700 cursor-not-allowed' 
                : 'bg-[#00ff94]/10 text-[#00ff94] border-[#00ff94]/30 hover:bg-[#00ff94]/20'
            }`}
            onClick={handleArrowClick}
            disabled={isLoading}
          >
            {isLoading ? (
              <svg className="animate-spin h-5 w-5 text-[#00ff94]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <ArrowForwardIcon fontSize="small" />
            )}
          </button>
        </div>
      </div>
      
      {/* Loading message */}
      {isLoading && (
        <div className="w-full max-w-lg mx-auto mt-6 text-center">
          <p className="text-[#00ff94] animate-pulse">Generating flashcards...</p>
        </div>
      )}
      
      {/* Flashcards Section */}
      {showFlashcards && !isLoading && (
        <div className="relative w-full max-w-lg mt-8 mb-16">
          <button 
            onClick={handleCloseFlashcards}
            className="absolute -top-2 -right-2 z-10 bg-[#18092a] text-white p-1 rounded-full border border-[#00ff94]/30 hover:bg-[#00ff94]/20 transition-colors"
            aria-label="Close flashcards"
          >
            <CloseIcon fontSize="small" />
          </button>
          <div>
            <div className="mb-4 text-center">
              <h3 className="text-lg font-semibold text-white">Track your progress as you learn</h3>
              <p className="text-white/70 text-sm">
                Mark cards as "Learned" or "Review Later" to optimize your learning journey
              </p>
            </div>
            <FlashcardDeck flashcards={demoFlashcards} />
          </div>
        </div>
      )}
      
      {/* Empty space when no flashcards shown */}
      {!showFlashcards && !isLoading && <div className="mb-24"></div>}
    </div>
  )
}

const features = [
  {
    icon: <BoltIcon fontSize="large" />,
    color: 'bg-[#a259ff]',
    title: 'AI-powered flashcards',
    desc: 'Turn your notes into effective flashcards instantly using our advanced AI.',
  },
  {
    icon: <QuizIcon fontSize="large" />,
    color: 'bg-[#3ec1ff]',
    title: 'Interactive Quizzes',
    desc: 'Test your knowledge with quizzes generated from your flashcards.',
  },
  {
    icon: <AccessTimeIcon fontSize="large" />,
    color: 'bg-[#ff7262]',
    title: 'Spaced Repetition',
    desc: 'Our algorithm helps you remember what you learn for the long-term.',
  },
  {
    icon: <AnalyticsIcon fontSize="large" />,
    color: 'bg-[#ffeb3b]',
    title: 'Progress Tracking',
    desc: 'Track your improvement with detailed analytics and insights.',
  },
  {
    icon: <TranslateIcon fontSize="large" />,
    color: 'bg-[#00ff94]',
    title: 'Language Learning',
    desc: 'Special templates for learning vocabulary in any language.',
  },
  {
    icon: <PublicIcon fontSize="large" />,
    color: 'bg-[#a259ff]',
    title: 'Web Accessibility',
    desc: 'Access your study materials from any browser on any device.',
  },
  {
    icon: <AutoFixHighIcon fontSize="large" />,
    color: 'bg-[#3ec1ff]',
    title: 'Smart Templates',
    desc: 'Choose from a variety of templates for different subjects.',
  },
  {
    icon: <PersonalVideoIcon fontSize="large" />,
    color: 'bg-[#ff7262]',
    title: 'Presentation Mode',
    desc: 'Practice your presentation skills with presenter view.',
  },
]

function Features() {
  return (
    <div className="py-8">
      <h2 className="text-3xl font-bold text-center mb-10">Feature Packed Learning</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature) => (
          <div 
            key={feature.title}
            className="bg-[#15052a]/60 rounded-2xl shadow-xl p-7 text-white flex flex-col min-h-[220px] border border-gray-800/50 hover:border-[#00ff94]/30 hover:shadow-[0_0_15px_rgba(0,255,148,0.15)] transition-all"
          >
            <div className={`${feature.color} w-12 h-12 rounded-full flex items-center justify-center mb-5 border border-gray-800/30`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-white/70 mb-5 text-sm">{feature.desc}</p>
            <button className="mt-auto text-[#00ff94] py-2 px-4 rounded-lg font-semibold hover:bg-[#00ff94]/10 transition-colors w-fit">
              Learn more
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

const faqs = [
  {
    q: 'How does Memorix work?',
    a: 'Simply paste your notes or enter a concept you want to learn about. Our AI instantly turns this into flashcards optimized for learning. You can then study these cards using our spaced repetition system, take quizzes, and track your progress over time.',
  },
  {
    q: 'Is Memorix free to use?',
    a: 'We offer a free tier with up to 50 cards per day and basic features. Our Premium subscription ($9.99/month) unlocks unlimited cards, advanced analytics, offline mode, and removes ads.',
  },
  {
    q: 'How accurate are the AI-generated flashcards?',
    a: 'Our AI is trained on educational content and optimized for learning efficiency. While the AI is very accurate, you can always edit any card if needed. We continuously improve our AI based on user feedback.',
  },
  {
    q: 'Can I create my own flashcards manually?',
    a: 'Absolutely! While our AI can generate cards automatically, you can also create, edit, or import your own flashcards manually. You have complete control over your learning materials.',
  },
  {
    q: 'How do I track my progress?',
    a: 'The Progress dashboard shows detailed analytics about your study habits, retention rates, and learning progress. You can see statistics for each deck, identify challenging cards, and get recommendations for what to study next.',
  },
  {
    q: 'Can I share my flashcards with friends or classmates?',
    a: 'Yes! You can share any flashcard deck or quiz with others via a link, even if they don\'t have an account. For collaborative study, Premium users can create shared decks that multiple people can edit.',
  },
  {
    q: 'Which subjects work best with Memorix?',
    a: 'Memorix works well for almost any subject that requires memorization, including languages, sciences, history, law, medicine, and more. Our specialized templates are optimized for different learning needs.',
  },
  {
    q: 'Is Memorix accessible on mobile devices?',
    a: 'Memorix is a responsive web application that works great on desktop, tablet, and mobile browsers. Simply visit our website on any device to access your flashcards and study on the go.',
  },
]

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="py-16">
      <h2 className="text-3xl font-extrabold text-center text-white mb-10">
        Frequently Asked Questions
      </h2>
      <div className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <div 
            key={faq.q} 
            className="bg-[#15052a]/60 rounded-xl mb-4 overflow-hidden border border-gray-800/50 shadow-lg hover:border-gray-700/70 transition-colors"
          >
            <button
              className="w-full px-6 py-4 text-left font-bold text-white flex justify-between items-center"
              onClick={() => toggleFaq(index)}
            >
              {faq.q}
              <ExpandMoreIcon className={`text-[#00ff94] transition-transform ${openIndex === index ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === index && (
              <div className="px-6 py-4 text-white/80 text-sm">
                {faq.a}
              </div>
            )}
          </div>
        ))}
        <div className="flex justify-center mt-10">
          <button className="text-[#00ff94] border-2 border-[#00ff94] px-8 py-3 rounded-xl font-bold text-lg hover:bg-[#00ff94]/10 transition-colors shadow-md shadow-[#00ff94]/20">
            Get started free
          </button>
        </div>
      </div>
    </div>
  )
}

function TestimonialCard({ quote, author, role, avatar }) {
  return (
    <div className="bg-[#15052a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#00ff94] to-[#a259ff] rounded-full flex items-center justify-center text-white font-bold">
          {avatar}
        </div>
        <div>
          <h4 className="font-semibold text-white">{author}</h4>
          <p className="text-white/60 text-sm">{role}</p>
        </div>
      </div>
      <p className="text-white/80 italic">"{quote}"</p>
    </div>
  )
}

function Testimonials() {
  return (
    <div className="py-16">
      <h2 className="text-3xl font-bold text-center mb-10">What Our Users Say</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <TestimonialCard 
          quote="Memorix transformed how I study for med school. I've cut my study time in half while retaining more information."
          author="Sarah J."
          role="Medical Student"
          avatar="SJ"
        />
        <TestimonialCard 
          quote="I was struggling with vocabulary in my Spanish class until I found Memorix. The AI generates perfect language learning cards."
          author="Michael T."
          role="Language Learner"
          avatar="MT"
        />
        <TestimonialCard 
          quote="As a teacher, I use Memorix to create interactive quizzes for my students. They love the engaging format and I love the time it saves me."
          author="Lisa R."
          role="High School Teacher"
          avatar="LR"
        />
      </div>
    </div>
  )
}

function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-6 border-t border-gray-800/30">
      <div className="container mx-auto px-4 text-center">
        <p className="text-white/50 text-sm">
          © {currentYear} Readler Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
      <Route path="/progress" element={<ProtectedRoute element={<Progress />} />} />
      <Route path="/favorites" element={<ProtectedRoute element={<Favorites />} />} />
      <Route path="/quizzes" element={<ProtectedRoute element={<Quizzes />} />} />
      <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
      <Route path="/share/:type/:id" element={<SharedItem />} />
      <Route path="/share" element={<ShareFeature />} />
      <Route path="/" element={
        <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white">
          <Header />
          <main>
            <Hero />
            <div className="container mx-auto px-4 pb-16">
              <Features />
              <Testimonials />
              <FAQSection />
            </div>
          </main>
          <Footer />
        </div>
      } />
    </Routes>
  )
}

export default App
