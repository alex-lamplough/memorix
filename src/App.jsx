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
import FeatureDetailModal from './components/FeatureDetailModal'

// Pages
import Dashboard from './pages/Dashboard'
import Progress from './pages/Progress'
import Favorites from './pages/Favorites'
import Quizzes from './pages/Quizzes'
import Settings from './pages/Settings'
import SharedItem from './pages/SharedItem'
import ShareFeature from './pages/ShareFeature'
import StudyDeck from './pages/StudyDeck'
import EditDeck from './pages/EditDeck'
import EditQuiz from './pages/EditQuiz'
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
    <div className="text-center mb-8 w-full overflow-hidden px-2">
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold flex flex-wrap items-center justify-center gap-x-1">
        <span className="text-[#00ff94] drop-shadow-[0_0_12px_rgba(0,255,148,0.8)]">M/</span>
        <span>aster</span>
        <span className={`transition-all duration-500 mx-1 ${isChanging ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
          {currentPhrase}
        </span>
        <span className="whitespace-nowrap">with Memorix</span>
      </h1>
    </div>
  )
}

function Hero() {
  return (
    <div className="container mx-auto px-4 flex flex-col items-center text-white">
      {/* Top spacer */}
      <div className="h-[10vh] sm:h-[15vh]"></div>
      
      {/* Title section with responsive height */}
      <div className="min-h-[150px] py-4 flex flex-col items-center justify-center">
        <AnimatedHeading />
        
        <p className="text-sm sm:text-base text-white/80 mt-2 max-w-xl text-center px-2">
          Notes to flashcards in seconds, with your personal AI tutor
        </p>
      </div>
      
      {/* Responsive spacer */}
      <div className="h-[80px] sm:h-[120px]"></div>
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
  const [selectedFeature, setSelectedFeature] = useState(null);
  
  const openFeatureModal = (featureTitle) => {
    setSelectedFeature(featureTitle);
  };
  
  const closeFeatureModal = () => {
    setSelectedFeature(null);
  };
  
  return (
    <div className="py-16">
      <h2 className="text-3xl font-bold text-center mb-16">Features</h2>
      
      <div className="space-y-20">
        {/* First row */}
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 px-4 mb-10 lg:mb-0">
            <div 
              className="bg-[#15052a]/60 rounded-2xl shadow-xl p-8 text-white border border-gray-800/50 hover:border-[#00ff94]/30 hover:shadow-[0_0_15px_rgba(0,255,148,0.15)] transition-all h-full flex flex-col"
            >
              <div className={`${features[0].color} w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-gray-800/30`}>
                {features[0].icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{features[0].title}</h3>
              <p className="text-white/70 mb-6 flex-grow">{features[0].desc}</p>
              <button 
                className="text-[#00ff94] py-2 px-5 rounded-lg font-semibold hover:bg-[#00ff94]/10 transition-colors w-fit mt-auto"
                onClick={() => openFeatureModal(features[0].title)}
              >
                Learn more
              </button>
            </div>
          </div>
          <div className="lg:mt-24 w-full lg:w-1/2 px-4">
            <div 
              className="bg-[#15052a]/60 rounded-2xl shadow-xl p-8 text-white border border-gray-800/50 hover:border-[#00ff94]/30 hover:shadow-[0_0_15px_rgba(0,255,148,0.15)] transition-all h-full flex flex-col"
            >
              <div className={`${features[1].color} w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-gray-800/30`}>
                {features[1].icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{features[1].title}</h3>
              <p className="text-white/70 mb-6 flex-grow">{features[1].desc}</p>
              <button 
                className="text-[#00ff94] py-2 px-5 rounded-lg font-semibold hover:bg-[#00ff94]/10 transition-colors w-fit mt-auto"
                onClick={() => openFeatureModal(features[1].title)}
              >
                Learn more
              </button>
            </div>
          </div>
        </div>
        
        {/* Second row */}
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 px-4 mb-10 lg:mb-0 lg:mt-24">
            <div 
              className="bg-[#15052a]/60 rounded-2xl shadow-xl p-8 text-white border border-gray-800/50 hover:border-[#00ff94]/30 hover:shadow-[0_0_15px_rgba(0,255,148,0.15)] transition-all h-full flex flex-col"
            >
              <div className={`${features[2].color} w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-gray-800/30`}>
                {features[2].icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{features[2].title}</h3>
              <p className="text-white/70 mb-6 flex-grow">{features[2].desc}</p>
              <button 
                className="text-[#00ff94] py-2 px-5 rounded-lg font-semibold hover:bg-[#00ff94]/10 transition-colors w-fit mt-auto"
                onClick={() => openFeatureModal(features[2].title)}
              >
                Learn more
              </button>
            </div>
          </div>
          <div className="w-full lg:w-1/2 px-4">
            <div 
              className="bg-[#15052a]/60 rounded-2xl shadow-xl p-8 text-white border border-gray-800/50 hover:border-[#00ff94]/30 hover:shadow-[0_0_15px_rgba(0,255,148,0.15)] transition-all h-full flex flex-col"
            >
              <div className={`${features[3].color} w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-gray-800/30`}>
                {features[3].icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{features[3].title}</h3>
              <p className="text-white/70 mb-6 flex-grow">{features[3].desc}</p>
              <button 
                className="text-[#00ff94] py-2 px-5 rounded-lg font-semibold hover:bg-[#00ff94]/10 transition-colors w-fit mt-auto"
                onClick={() => openFeatureModal(features[3].title)}
              >
                Learn more
              </button>
            </div>
          </div>
        </div>
        
        {/* Third row */}
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 px-4 mb-10 lg:mb-0">
            <div 
              className="bg-[#15052a]/60 rounded-2xl shadow-xl p-8 text-white border border-gray-800/50 hover:border-[#00ff94]/30 hover:shadow-[0_0_15px_rgba(0,255,148,0.15)] transition-all h-full flex flex-col"
            >
              <div className={`${features[4].color} w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-gray-800/30`}>
                {features[4].icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{features[4].title}</h3>
              <p className="text-white/70 mb-6 flex-grow">{features[4].desc}</p>
              <button 
                className="text-[#00ff94] py-2 px-5 rounded-lg font-semibold hover:bg-[#00ff94]/10 transition-colors w-fit mt-auto"
                onClick={() => openFeatureModal(features[4].title)}
              >
                Learn more
              </button>
            </div>
          </div>
          <div className="lg:mt-24 w-full lg:w-1/2 px-4">
            <div 
              className="bg-[#15052a]/60 rounded-2xl shadow-xl p-8 text-white border border-gray-800/50 hover:border-[#00ff94]/30 hover:shadow-[0_0_15px_rgba(0,255,148,0.15)] transition-all h-full flex flex-col"
            >
              <div className={`${features[5].color} w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-gray-800/30`}>
                {features[5].icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{features[5].title}</h3>
              <p className="text-white/70 mb-6 flex-grow">{features[5].desc}</p>
              <button 
                className="text-[#00ff94] py-2 px-5 rounded-lg font-semibold hover:bg-[#00ff94]/10 transition-colors w-fit mt-auto"
                onClick={() => openFeatureModal(features[5].title)}
              >
                Learn more
              </button>
            </div>
          </div>
        </div>
        
        {/* Fourth row */}
        <div className="flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 px-4 mb-10 lg:mb-0 lg:mt-24">
            <div 
              className="bg-[#15052a]/60 rounded-2xl shadow-xl p-8 text-white border border-gray-800/50 hover:border-[#00ff94]/30 hover:shadow-[0_0_15px_rgba(0,255,148,0.15)] transition-all h-full flex flex-col"
            >
              <div className={`${features[6].color} w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-gray-800/30`}>
                {features[6].icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{features[6].title}</h3>
              <p className="text-white/70 mb-6 flex-grow">{features[6].desc}</p>
              <button 
                className="text-[#00ff94] py-2 px-5 rounded-lg font-semibold hover:bg-[#00ff94]/10 transition-colors w-fit mt-auto"
                onClick={() => openFeatureModal(features[6].title)}
              >
                Learn more
              </button>
            </div>
          </div>
          <div className="w-full lg:w-1/2 px-4">
            <div 
              className="bg-[#15052a]/60 rounded-2xl shadow-xl p-8 text-white border border-gray-800/50 hover:border-[#00ff94]/30 hover:shadow-[0_0_15px_rgba(0,255,148,0.15)] transition-all h-full flex flex-col"
            >
              <div className={`${features[7].color} w-16 h-16 rounded-full flex items-center justify-center mb-6 border border-gray-800/30`}>
                {features[7].icon}
              </div>
              <h3 className="text-2xl font-bold mb-4">{features[7].title}</h3>
              <p className="text-white/70 mb-6 flex-grow">{features[7].desc}</p>
              <button 
                className="text-[#00ff94] py-2 px-5 rounded-lg font-semibold hover:bg-[#00ff94]/10 transition-colors w-fit mt-auto"
                onClick={() => openFeatureModal(features[7].title)}
              >
                Learn more
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feature Detail Modal */}
      {selectedFeature && (
        <FeatureDetailModal 
          feature={selectedFeature} 
          onClose={closeFeatureModal} 
        />
      )}
    </div>
  )
}

const pricingPlans = [
  {
    name: 'Free',
    price: '0',
    description: 'Perfect for casual learners',
    features: [
      'Up to 50 flashcards per day',
      'Basic analytics',
      'Standard templates',
      'Community support',
      'Web access'
    ],
    cta: 'Get Started',
    popular: false,
    bgColor: 'bg-[#15052a]/60',
    ctaColor: 'bg-[#00ff94]/10 text-[#00ff94] border border-[#00ff94]/30 hover:bg-[#00ff94]/20'
  },
  {
    name: 'Pro',
    price: '9.99',
    period: 'per month',
    description: 'For serious students and educators',
    features: [
      'Unlimited flashcards',
      'Advanced analytics & insights',
      'All templates & customization',
      'Priority email support',
      'Web & mobile access',
      'Offline mode'
    ],
    cta: 'Start Free Trial',
    popular: true,
    bgColor: 'bg-gradient-to-b from-[#18092a] to-[#260041]',
    ctaColor: 'bg-[#00ff94] text-black hover:bg-[#00ff94]/90'
  },
  {
    name: 'Teams',
    price: '29.99',
    period: 'per month',
    description: 'For teachers and study groups',
    features: [
      'Everything in Pro plan',
      'Up to 5 team members',
      'Collaborative decks',
      'Shared analytics',
      'Admin controls',
      'Dedicated support'
    ],
    cta: 'Contact Sales',
    popular: false,
    bgColor: 'bg-[#15052a]/60',
    ctaColor: 'bg-[#00ff94]/10 text-[#00ff94] border border-[#00ff94]/30 hover:bg-[#00ff94]/20'
  }
];

function PricingSection() {
  // Get currency symbol based on user's locale
  const [currencySymbol, setCurrencySymbol] = useState('£');
  
  useEffect(() => {
    try {
      // Get currency symbol based on user's locale
      const userLocale = navigator.language || 'en-GB';
      const formatter = new Intl.NumberFormat(userLocale, {
        style: 'currency',
        currency: userLocale.includes('US') ? 'USD' : 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      });
      
      // Extract just the currency symbol
      const symbol = formatter.format(0).replace(/\d/g, '').trim();
      setCurrencySymbol(symbol);
    } catch (error) {
      console.error('Error setting currency symbol:', error);
      // Default to £ if there's an error
      setCurrencySymbol('£');
    }
  }, []);

  return (
    <div className="py-16">
      <h2 className="text-3xl font-bold text-center mb-4">Pricing</h2>
      <p className="text-white/70 text-center mb-10 max-w-xl mx-auto">
        Choose the plan that fits your needs. All plans include core features and regular updates.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        {pricingPlans.map((plan) => (
          <div 
            key={plan.name} 
            className={`${plan.bgColor} rounded-2xl p-8 border ${plan.popular ? 'border-[#00ff94]/30 shadow-[0_0_20px_rgba(0,255,148,0.15)]' : 'border-gray-800/50'} relative flex flex-col h-full`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#00ff94] text-black text-xs font-bold py-1 px-4 rounded-full">
                Most Popular
              </div>
            )}
            <h3 className="text-xl font-bold mb-1 mt-2">{plan.name}</h3>
            <div className="flex items-end mb-4">
              <span className="text-3xl font-bold">{plan.price === '0' ? 'Free' : `${currencySymbol}${plan.price}`}</span>
              {plan.period && <span className="text-white/60 ml-1 mb-1">{plan.period}</span>}
            </div>
            <p className="text-white/70 text-sm mb-6">{plan.description}</p>
            
            <ul className="space-y-3 mb-8 flex-grow">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-start text-sm">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00ff94] mt-1.5 mr-2"></span>
                  <span className="text-white/80">{feature}</span>
                </li>
              ))}
            </ul>
            
            <button 
              className={`${plan.ctaColor} w-full py-3 rounded-xl font-semibold transition-colors mt-auto`}
            >
              {plan.cta}
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
      <Route path="/study/:id" element={<ProtectedRoute element={<StudyDeck />} />} />
      <Route path="/edit/:id" element={<ProtectedRoute element={<EditDeck />} />} />
      <Route path="/edit-quiz/:id" element={<ProtectedRoute element={<EditQuiz />} />} />
      <Route path="/share/:type/:id" element={<SharedItem />} />
      <Route path="/share" element={<ShareFeature />} />
      <Route path="/" element={
        <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white">
          <Header />
          <main>
            <Hero />
            <div className="container mx-auto px-4 pb-16">
              <Features />
              <PricingSection />
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
