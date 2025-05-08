import { Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import logger from '../utils/logger';
import { useState, useEffect, lazy, Suspense, useRef } from 'react'

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
import Header from './Header'
import DemoModal from './components/DemoModal'
import CheckoutButton from './components/subscription/CheckoutButton'
import useSubscription from './hooks/useSubscription'

// Lazy load page components
// These components are only loaded when they are needed
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Progress = lazy(() => import('./pages/Progress'))
const Favorites = lazy(() => import('./pages/Favorites'))
const Quizzes = lazy(() => import('./pages/Quizzes'))
const Flashcards = lazy(() => import('./pages/Flashcards'))
const Settings = lazy(() => import('./pages/Settings'))
const SharedItem = lazy(() => import('./pages/SharedItem'))
const ShareFeature = lazy(() => import('./pages/ShareFeature'))
const StudyDeck = lazy(() => import('./pages/StudyDeck'))
const EditDeck = lazy(() => import('./pages/EditDeck'))
const EditQuiz = lazy(() => import('./pages/EditQuiz'))
const FlashcardStudyExample = lazy(() => import('./pages/FlashcardStudyExample'))
const OnboardingForm = lazy(() => import('./components/onboarding/OnboardingForm'))
const Privacy = lazy(() => import('./pages/Privacy'))
const Terms = lazy(() => import('./pages/Terms'))
const ContentCreators = lazy(() => import('./pages/ContentCreators'))

// Auth components
import OnboardingGuard from './components/OnboardingGuard'

// Assets
import logoGreen from './assets/MemorixBannerLogo.png'
import facebookLogo from './assets/facebookLogo.png'
import instagramLogo from './assets/instagramLogo.png'
import xLogo from './assets/xLogo.png'

// Services
import { flashcardService } from './services/api'
import { quizService } from './services/quiz-service'
import { todoService } from './services/todo-service'
import { createNavigationHandler } from './services/utils'

// ComingSoon component for features that are under development
function ComingSoon() {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] flex items-center justify-center">
      <div className="bg-[#18092a]/60 rounded-xl p-8 border border-gray-800/30 shadow-lg text-center max-w-md mx-4">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-[#00ff94]/10 rounded-full flex items-center justify-center border border-[#00ff94]/30">
            <AnalyticsIcon style={{ fontSize: 40 }} className="text-[#00ff94]" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">Progress Analytics</h2>
        <div className="border-t border-b border-gray-800/30 py-4 my-4">
          <p className="text-white/70 mb-2">
            We're working hard to bring you detailed analytics and insights about your learning progress.
          </p>
          <p className="text-white/70">
            This feature will be available soon!
          </p>
        </div>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-[#00ff94]/10 text-[#00ff94] px-6 py-3 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30 mt-2"
        >
          Return to Dashboard
        </button>
      </div>
    </div>
  );
}

function AnimatedHeading() {
  const phrases = [
    "Language Vocab",
    "Trivia Nights",
    "Medical Terms",
    "Coding Concepts",
    "Recipe Collections",
    "Workout Routines",
    "Wine Tasting Notes",
    "Travel Phrases",
    "Team Building",
    "Exam Preparation"
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
    <div className="text-center mb-4 sm:mb-8 w-full overflow-hidden px-2">
      <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold flex flex-wrap items-center justify-center gap-x-1">
        <span className="text-[#00ff94] drop-shadow-[0_0_12px_rgba(0,255,148,0.8)]">M/</span>
        <span>aster</span>
        <span className={`transition-all duration-500 mx-1 min-h-[1.5em] inline-flex items-center ${isChanging ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'}`}>
          {currentPhrase}
        </span>
        <span className="whitespace-nowrap">with Memorix</span>
      </h1>
    </div>
  )
}

// StickyNav component for smooth section navigation
function StickyNav({ activeSection }) {
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-[#18092a]/80 backdrop-blur-md px-4 py-2 rounded-full border border-gray-800/30 shadow-xl hidden md:flex">
      <div className="flex items-center space-x-6">
        <button 
          onClick={() => scrollToSection('features')} 
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeSection === 'features' ? 'bg-[#00ff94]/20 text-[#00ff94]' : 'text-white/70 hover:text-white'}`}
        >
          Features
        </button>
        <button 
          onClick={() => scrollToSection('pricing')} 
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeSection === 'pricing' ? 'bg-[#00ff94]/20 text-[#00ff94]' : 'text-white/70 hover:text-white'}`}
        >
          Pricing
        </button>
        <button 
          onClick={() => scrollToSection('testimonials')} 
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeSection === 'testimonials' ? 'bg-[#00ff94]/20 text-[#00ff94]' : 'text-white/70 hover:text-white'}`}
        >
          Testimonials
        </button>
        <button 
          onClick={() => scrollToSection('faq')} 
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${activeSection === 'faq' ? 'bg-[#00ff94]/20 text-[#00ff94]' : 'text-white/70 hover:text-white'}`}
        >
          FAQ
        </button>
      </div>
    </div>
  );
}

function Hero() {
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);

  const openDemoModal = () => {
    setIsDemoModalOpen(true);
  };

  const closeDemoModal = () => {
    setIsDemoModalOpen(false);
  };

  const scrollToFeatures = () => {
    const featuresSection = document.getElementById('features');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="container mx-auto px-4 flex flex-col items-center text-white">
      {/* Top spacer */}
      <div className="h-[10vh] sm:h-[15vh]"></div>
      
      {/* Title section with responsive height */}
      <div className="min-h-[150px] py-4 flex flex-col items-center justify-center">
        <AnimatedHeading />
        
        <p className="text-sm sm:text-base md:text-lg text-white/80 mt-2 max-w-xl text-center px-2">
          Notes to flashcards in seconds, with your personal AI tutor
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 mt-12 sm:mt-16">
          <button
            onClick={openDemoModal}
            className="relative group bg-[#00ff94] text-[#18092a] px-8 py-3 rounded-lg font-medium hover:bg-[#00ff94]/90 transition-all transform hover:scale-105 shadow-lg hover:shadow-[#00ff94]/20 flex items-center"
          >
            <span className="mr-2">Watch Demo</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span className="absolute -top-9 left-1/2 transform -translate-x-1/2 bg-[#00ff94] text-[#18092a] text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
              Watch our platform tutorial
            </span>
          </button>
          
          <button 
            onClick={scrollToFeatures}
            className="bg-transparent text-white hover:text-[#00ff94] border border-white/30 hover:border-[#00ff94]/50 px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 flex items-center"
          >
            <span className="mr-2">Explore Features</span>
            <ArrowForwardIcon fontSize="small" />
          </button>
        </div>
        
        <div className="mt-16 animate-pulse opacity-75">
          <ExpandMoreIcon onClick={scrollToFeatures} className="text-[#00ff94] cursor-pointer text-3xl" />
        </div>
      </div>
      
      {/* Responsive spacer - reduced height */}
      <div className="h-[40px] sm:h-[60px]"></div>

      {/* Demo Modal */}
      <DemoModal isOpen={isDemoModalOpen} onClose={closeDemoModal} />
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
    desc: 'Track your improvement with detailed analytics and insights. (Coming Soon)',
  },
  {
    icon: <TranslateIcon fontSize="large" />,
    color: 'bg-[#00ff94]',
    title: 'Language Learning',
    desc: 'Specialized features for learning vocabulary in any language.',
  },
  {
    icon: <PublicIcon fontSize="large" />,
    color: 'bg-[#a259ff]',
    title: 'Cross-Platform Access',
    desc: 'Access your study materials from any browser on any device.',
  },
  {
    icon: <DevicesIcon fontSize="large" />,
    color: 'bg-[#3ec1ff]',
    title: 'Community Content',
    desc: 'Access a growing library of community-created flashcards.',
  },
  {
    icon: <RocketLaunchIcon fontSize="large" />,
    color: 'bg-[#ff7262]',
    title: 'Export & Share',
    desc: 'Share publicly with community, with private sharing and export coming soon.',
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
    <div className="py-16 relative">
      {/* Section Title with decorative elements */}
      <div className="flex flex-col items-center mb-16 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#00ff94]/10 rounded-full blur-2xl"></div>
        <h2 className="text-3xl font-bold text-center relative z-10">Features</h2>
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#00ff94] to-transparent mt-4"></div>
      </div>
      
      {/* Features grid - reorganized into a cleaner grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <div 
            key={index}
            className="bg-[#15052a]/60 rounded-2xl shadow-xl p-6 text-white border border-gray-800/50 hover:border-[#00ff94]/30 hover:shadow-[0_0_15px_rgba(0,255,148,0.15)] transition-all h-full flex flex-col group"
          >
            <div className={`${feature.color} w-14 h-14 rounded-full flex items-center justify-center mb-5 border border-gray-800/30 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
            <p className="text-white/70 mb-5 flex-grow text-sm">{feature.desc}</p>
            <button 
              className="text-[#00ff94] py-2 px-4 rounded-lg font-semibold hover:bg-[#00ff94]/10 transition-colors w-fit mt-auto flex items-center gap-2 text-sm group-hover:bg-[#00ff94]/10"
              onClick={() => openFeatureModal(feature.title)}
            >
              <span>Learn more</span>
              <ArrowForwardIcon fontSize="small" className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        ))}
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
      'Access Community Cards',
      'Basic Analytics',
      'Standard Support',
      'Web access'
    ],
    cta: 'Get Started',
    popular: false,
    bgColor: 'bg-[#15052a]/60',
    ctaColor: 'bg-[#00ff94]/10 text-[#00ff94] border border-[#00ff94]/30 hover:bg-[#00ff94]/20'
  },
  {
    name: 'Pro',
    price: '7.99',
    period: 'per month',
    description: 'For serious students and educators',
    features: [
      'Everything in Free plan',
      'Unlimited Flashcard & Quiz creation',
      'Advanced Analytics',
      'Priority Support',
      'Downloadable Content',
      'Export Reports'
    ],
    cta: 'Start Free Trial',
    popular: true,
    bgColor: 'bg-gradient-to-b from-[#18092a] to-[#260041]',
    ctaColor: 'bg-[#00ff94] text-black hover:bg-[#00ff94]/90'
  },
  {
    name: 'Creator',
    price: '17.99',
    period: 'per month',
    description: 'For content creators and educators',
    features: [
      'Everything in Pro plan',
      'Custom Communities',
      'Custom Social Media Content',
      'Advanced sharing options',
      'Early access to new features'
    ],
    cta: 'Coming Soon',
    popular: false,
    bgColor: 'bg-[#15052a]/60',
    ctaColor: 'bg-[#00ff94]/10 text-[#00ff94] border border-[#00ff94]/30 hover:bg-[#00ff94]/20',
    comingSoon: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For organizations and institutions',
    features: [
      'Dedicated Support',
      'API Access',
      'Multiple Team Members',
      'Admin Controls',
      'Custom integrations',
      'SLA guarantees'
    ],
    cta: 'Coming Soon',
    popular: false,
    bgColor: 'bg-[#15052a]/60',
    ctaColor: 'bg-[#00ff94]/10 text-[#00ff94] border border-[#00ff94]/30 hover:bg-[#00ff94]/20',
    comingSoon: true
  }
];

function PricingSection() {
  // Get currency symbol based on user's locale
  const [currencySymbol, setCurrencySymbol] = useState('£');
  const { subscription, isProSubscriber } = useSubscription();
  
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
      logger.error('Error setting currency symbol:', error);
      // Default to £ if there's an error
      setCurrencySymbol('£');
    }
  }, []);

  return (
    <div className="py-16 relative">
      {/* Section Title with decorative elements */}
      <div className="flex flex-col items-center mb-8 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#a259ff]/10 rounded-full blur-2xl"></div>
        <h2 className="text-3xl font-bold text-center relative z-10">Pricing</h2>
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#a259ff] to-transparent mt-4"></div>
      </div>
      
      <p className="text-white/70 text-center mb-10 max-w-xl mx-auto text-sm md:text-base">
        Choose the plan that fits your needs. All plans include core features and regular updates.
      </p>
      
      <div className="flex flex-col md:flex-row gap-8 max-w-5xl mx-auto justify-center">
        {pricingPlans.map((plan, index) => (
          <div 
            key={plan.name} 
            className={`${plan.bgColor} rounded-2xl p-8 border ${plan.popular ? 'border-[#00ff94]/30 shadow-[0_0_20px_rgba(0,255,148,0.15)] md:scale-105 md:-translate-y-3' : 'border-gray-800/50'} relative flex flex-col h-full flex-1 max-w-md mx-auto md:mx-0 transition-all duration-300 hover:shadow-lg ${plan.popular ? 'hover:shadow-[#00ff94]/20' : 'hover:shadow-white/5'}`}
          >
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#00ff94] text-black text-xs font-bold py-1 px-4 rounded-full shadow-md">
                Most Popular
              </div>
            )}
            {plan.comingSoon && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#a259ff] text-white text-xs font-bold py-1 px-4 rounded-full shadow-md">
                Coming Soon
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
            
            {plan.name === 'Free' ? (
              <button 
                className={`${plan.ctaColor} w-full py-3 rounded-xl font-semibold transition-colors mt-auto`}
              >
                {plan.cta}
              </button>
            ) : plan.name === 'Pro' ? (
              isProSubscriber() ? (
                <button 
                  className={`bg-[#00ff94]/10 text-white border border-[#00ff94]/30 w-full py-3 rounded-xl font-semibold transition-colors mt-auto`}
                  disabled
                >
                  Current Plan
                </button>
              ) : (
                <CheckoutButton
                  plan="pro"
                  text={plan.cta}
                  className={`${plan.ctaColor} w-full py-3 rounded-xl font-semibold transition-colors mt-auto`}
                />
              )
            ) : (
              <button 
                className={`${plan.ctaColor} w-full py-3 rounded-xl font-semibold transition-colors mt-auto ${plan.comingSoon ? 'opacity-75 cursor-not-allowed' : ''}`}
                disabled={plan.comingSoon}
              >
                {plan.cta}
              </button>
            )}
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
    a: 'We offer a free tier with access to community cards, basic analytics, and standard support. Our Pro subscription (£7.99/month) unlocks unlimited flashcard creation, advanced analytics, priority support, and more. We also have upcoming Creator and Enterprise plans for content creators and organizations.',
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
    a: 'The Progress dashboard with detailed analytics about your study habits, retention rates, and learning progress is coming soon. This feature will show statistics for each deck, identify challenging cards, and provide recommendations for what to study next. Currently, basic progress information is available in your account.',
  },
  {
    q: 'Can I share my flashcards with friends or classmates?',
    a: 'Yes! You can share any flashcard deck or quiz with others via a link, even if they don\'t have an account. For collaborative study, Premium users can create shared decks that multiple people can edit.',
  },
  {
    q: 'Which subjects work best with Memorix?',
    a: 'Memorix works well for almost any subject that requires memorization, including languages, sciences, history, law, medicine, and more. Our AI is optimized for different learning needs and subject areas.',
  },
  {
    q: 'Is Memorix accessible on mobile devices?',
    a: 'Memorix is a responsive web application that works great on desktop, tablet, and mobile browsers. Simply visit our website on any device to access your flashcards and study on the go.',
  },
]

function TestimonialCard({ quote, author, role, avatar }) {
  return (
    <div className="bg-[#15052a]/60 rounded-xl p-6 border border-gray-800/30 shadow-lg hover:border-[#00ff94]/10 transition-all group">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-[#00ff94] to-[#a259ff] rounded-full flex items-center justify-center text-white font-bold shadow-md group-hover:scale-105 transition-transform duration-300">
          {avatar}
        </div>
        <div>
          <h4 className="font-semibold text-white">{author}</h4>
          <p className="text-white/60 text-sm">{role}</p>
        </div>
      </div>
      <p className="text-white/80 italic">{quote}</p>
    </div>
  )
}

function Testimonials() {
  return (
    <div className="py-16 relative">
      {/* Section Title with decorative elements */}
      <div className="flex flex-col items-center mb-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#3ec1ff]/10 rounded-full blur-2xl"></div>
        <h2 className="text-3xl font-bold text-center relative z-10">What Our Users Say</h2>
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#3ec1ff] to-transparent mt-4"></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
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

function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null)

  const toggleFaq = (index) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <div className="py-16 relative">
      {/* Section Title with decorative elements */}
      <div className="flex flex-col items-center mb-12 relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#ff7262]/10 rounded-full blur-2xl"></div>
        <h2 className="text-3xl font-bold text-center relative z-10">Frequently Asked Questions</h2>
        <div className="w-20 h-0.5 bg-gradient-to-r from-transparent via-[#ff7262] to-transparent mt-4"></div>
      </div>
      
      <div className="max-w-3xl mx-auto">
        {faqs.map((faq, index) => (
          <div 
            key={faq.q} 
            className={`bg-[#15052a]/60 rounded-xl mb-4 overflow-hidden border transition-all duration-300 ${openIndex === index ? 'border-[#00ff94]/30 shadow-[0_0_15px_rgba(0,255,148,0.08)]' : 'border-gray-800/50 shadow-lg hover:border-gray-700/70'}`}
          >
            <button
              className="w-full px-6 py-4 text-left font-bold text-white flex justify-between items-center"
              onClick={() => toggleFaq(index)}
              aria-expanded={openIndex === index}
            >
              {faq.q}
              <ExpandMoreIcon className={`text-[#00ff94] transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`} />
            </button>
            <div 
              className={`px-6 overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 py-4' : 'max-h-0'}`}
            >
              <p className="text-white/80 text-sm">{faq.a}</p>
            </div>
          </div>
        ))}
        <div className="flex justify-center mt-10">
          <button className="text-white border-2 border-[#00ff94] px-8 py-3 rounded-xl font-bold text-lg hover:bg-[#00ff94] hover:text-[#18092a] transition-all duration-300 shadow-md shadow-[#00ff94]/10 hover:shadow-[#00ff94]/20">
            Get started free
          </button>
        </div>
      </div>
    </div>
  )
}

function Footer() {
  const currentYear = new Date().getFullYear();
  
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  
  return (
    <footer className="py-8 border-t border-gray-800/30 relative">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-6">
          <div className="flex items-center mb-4 md:mb-0 gap-6">
            <img src={logoGreen} alt="Memorix" className="h-8 w-auto" />
            <div className="flex items-center gap-3">
              <a href="https://facebook.com/memorixapp" target="_blank" rel="noopener noreferrer" 
                className="hover:opacity-80 transition-opacity">
                <img src={facebookLogo} alt="Facebook" className="h-5 w-auto" />
              </a>
              <a href="https://instagram.com/memorixapp" target="_blank" rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity">
                <img src={instagramLogo} alt="Instagram" className="h-5 w-auto" />
              </a>
              <a href="https://x.com/memorixapp" target="_blank" rel="noopener noreferrer"
                className="hover:opacity-80 transition-opacity">
                <img src={xLogo} alt="X" className="h-5 w-auto" />
              </a>
            </div>
          </div>
          
          <div className="flex space-x-8">
            <a href="#features" className="text-white/70 hover:text-[#00ff94] transition-colors text-sm">Features</a>
            <a href="#pricing" className="text-white/70 hover:text-[#00ff94] transition-colors text-sm">Pricing</a>
            <a href="#testimonials" className="text-white/70 hover:text-[#00ff94] transition-colors text-sm">Testimonials</a>
            <a href="#faq" className="text-white/70 hover:text-[#00ff94] transition-colors text-sm">FAQ</a>
            <Link to="/partnerships" className="text-white/70 hover:text-[#00ff94] transition-colors text-sm">Partnerships</Link>
            <Link to="/privacy" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#00ff94] transition-colors text-sm">Privacy</Link>
            <Link to="/terms" target="_blank" rel="noopener noreferrer" className="text-white/70 hover:text-[#00ff94] transition-colors text-sm">Terms</Link>
          </div>
          
          <button 
            onClick={scrollToTop}
            className="bg-[#00ff94]/10 text-[#00ff94] p-2 rounded-full hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        
        <div className="border-t border-gray-800/30 pt-6 text-center">
          <p className="text-white/50 text-sm">
            © {currentYear} Readler Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

// Loading component for suspense fallback
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="w-16 h-16 border-4 border-[#00ff94]/20 border-t-[#00ff94] rounded-full animate-spin mb-4"></div>
        <p className="text-[#00ff94] font-medium">Loading...</p>
      </div>
    </div>
  );
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState(null);
  
  // Function to handle scroll and update active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 300;
      
      const featuresSection = document.getElementById('features');
      const pricingSection = document.getElementById('pricing');
      const testimonialsSection = document.getElementById('testimonials');
      const faqSection = document.getElementById('faq');
      
      if (featuresSection && scrollPosition >= featuresSection.offsetTop && 
          pricingSection && scrollPosition < pricingSection.offsetTop) {
        setActiveSection('features');
      } else if (pricingSection && scrollPosition >= pricingSection.offsetTop && 
                testimonialsSection && scrollPosition < testimonialsSection.offsetTop) {
        setActiveSection('pricing');
      } else if (testimonialsSection && scrollPosition >= testimonialsSection.offsetTop && 
                faqSection && scrollPosition < faqSection.offsetTop) {
        setActiveSection('testimonials');
      } else if (faqSection && scrollPosition >= faqSection.offsetTop) {
        setActiveSection('faq');
      } else {
        setActiveSection(null);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Cancel all pending API requests when navigating between routes
  useEffect(() => {
    // Create a function that cancels all active requests
    const cancelAllActiveRequests = () => {
      // Import these functions from the respective services
      const { cancelAllRequests: cancelAllFlashcardRequests } = flashcardService;
      const { cancelAllRequests: cancelAllQuizRequests } = quizService;
      const { cancelAllRequests: cancelAllTodoRequests } = todoService;
      
      // Only cancel requests if these functions exist
      if (typeof cancelAllFlashcardRequests === 'function') {
        cancelAllFlashcardRequests();
      }
      
      if (typeof cancelAllQuizRequests === 'function') {
        cancelAllQuizRequests();
      }
      
      if (typeof cancelAllTodoRequests === 'function') {
        cancelAllTodoRequests();
      }
      
      logger.debug('Cancelled all pending requests due to navigation');
    };
    
    // Cancel requests when the location changes
    cancelAllActiveRequests();
    
    // Also cancel requests when unmounting the app
    return cancelAllActiveRequests;
  }, [location.pathname]);
  
  // Wrap the navigate function to cancel requests before navigation
  useEffect(() => {
    const originalPush = navigate;
    
    // Replace the navigate function with one that cancels requests first
    window.navigateWithCancellation = createNavigationHandler(originalPush, () => {
      if (flashcardService && typeof flashcardService.cancelAllRequests === 'function') {
        flashcardService.cancelAllRequests();
      }
      
      if (quizService && typeof quizService.cancelAllRequests === 'function') {
        quizService.cancelAllRequests();
      }
      
      if (todoService && typeof todoService.cancelAllRequests === 'function') {
        todoService.cancelAllRequests();
      }
    });
    
    return () => {
      // Clean up
      window.navigateWithCancellation = undefined;
    };
  }, [navigate]);
  
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        <Route path="/onboarding" element={<ProtectedRoute element={<OnboardingForm />} />} />
        <Route path="/dashboard" element={<ProtectedRoute element={<OnboardingGuard><Dashboard /></OnboardingGuard>} />} />
        <Route path="/flashcards" element={<ProtectedRoute element={<OnboardingGuard><Flashcards /></OnboardingGuard>} />} />
        <Route path="/progress" element={<ProtectedRoute element={<OnboardingGuard><ComingSoon /></OnboardingGuard>} />} />
        <Route path="/favorites" element={<ProtectedRoute element={<OnboardingGuard><Favorites /></OnboardingGuard>} />} />
        <Route path="/quizzes" element={<ProtectedRoute element={<OnboardingGuard><Quizzes /></OnboardingGuard>} />} />
        <Route path="/settings" element={<ProtectedRoute element={<OnboardingGuard><Settings /></OnboardingGuard>} />} />
        <Route path="/study/:id" element={<ProtectedRoute element={<OnboardingGuard><StudyDeck /></OnboardingGuard>} />} />
        <Route path="/edit/:id" element={<ProtectedRoute element={<OnboardingGuard><EditDeck /></OnboardingGuard>} />} />
        <Route path="/edit-quiz/:id" element={<ProtectedRoute element={<OnboardingGuard><EditQuiz /></OnboardingGuard>} />} />
        <Route path="/share/:type/:id" element={<SharedItem />} />
        <Route path="/share" element={<ShareFeature />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/partnerships" element={<ContentCreators />} />
        <Route path="/flashcard-study-example" element={<FlashcardStudyExample />} />
        <Route path="/flashcard-study-example/:id" element={<FlashcardStudyExample />} />
        <Route path="/" element={
          <div className="min-h-screen bg-gradient-to-b from-[#2E0033] via-[#260041] to-[#1b1b2f] text-white relative overflow-x-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/src/assets/noise-pattern.png')] opacity-[0.02] pointer-events-none mix-blend-overlay"></div>
            
            {/* Decorative elements */}
            <div className="absolute top-[20%] left-[5%] w-72 h-72 bg-[#00ff94]/5 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute top-[60%] right-[10%] w-96 h-96 bg-[#a259ff]/5 rounded-full blur-[150px] pointer-events-none"></div>
            
            <Header />
            <StickyNav activeSection={activeSection} />
            <main>
              <Hero />
              <div className="container mx-auto px-4 pb-16">
                <div id="features" className="scroll-mt-16 border-b border-gray-800/20"><Features /></div>
                <div id="pricing" className="scroll-mt-16 border-b border-gray-800/20"><PricingSection /></div>
                <div id="testimonials" className="scroll-mt-16 border-b border-gray-800/20"><Testimonials /></div>
                <div id="faq" className="scroll-mt-16"><FAQSection /></div>
              </div>
            </main>
            <Footer />
          </div>
        } />
      </Routes>
    </Suspense>
  )
}

export default App
