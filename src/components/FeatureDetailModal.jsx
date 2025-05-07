import React from 'react';
import CloseIcon from '@mui/icons-material/Close';

const featureDetails = {
  'AI-powered flashcards': {
    title: 'AI-powered flashcards',
    description: 'Turn your notes into effective flashcards instantly using our advanced AI.',
    longDescription: 'Our AI understands context and creates balanced question-answer pairs from your notes. It can identify key concepts, definitions, and relationships to create effective study materials. The AI also optimizes each card for memorization based on learning science principles.',
    benefits: [
      'Save hours of manual flashcard creation',
      'Identify important concepts you might miss',
      'Get balanced question/answer pairs',
      'Generate cards from PDFs, lecture notes, or textbooks'
    ],
    image: 'ai-flashcards.png' // You would need to add these images to your assets folder
  },
  'Interactive Quizzes': {
    title: 'Interactive Quizzes',
    description: 'Test your knowledge with quizzes generated from your flashcards.',
    longDescription: 'Move beyond simple flashcard review with interactive quizzes. Our system automatically creates multiple-choice, true/false, and fill-in-the-blank questions from your existing flashcards. Track your progress and identify weak areas.',
    benefits: [
      'Variety of question types to test your knowledge',
      'Immediate feedback on your answers',
      'Quiz mode with timing and scoring',
      'Automatic creation from your existing flashcards'
    ],
    image: 'quizzes.png'
  },
  'Spaced Repetition': {
    title: 'Spaced Repetition',
    description: 'Our algorithm helps you remember what you learn for the long-term.',
    longDescription: 'Based on cognitive science, our spaced repetition system schedules your reviews at optimal intervals to maximize retention while minimizing study time. The system adapts to your performance, showing difficult cards more frequently.',
    benefits: [
      'Study effectively with scientifically-proven methods',
      'Remember information for longer with less review time',
      'Automatic scheduling of card reviews',
      'Personalized to your individual learning pace'
    ],
    image: 'spaced-repetition.png'
  },
  'Progress Tracking': {
    title: 'Progress Tracking',
    description: 'Track your improvement with detailed analytics and insights. (Coming Soon)',
    longDescription: 'Our upcoming Progress dashboard will provide detailed insights into your learning journey with comprehensive analytics. You\'ll be able to see your retention rates, study patterns, and progress over time. The system will identify your weak areas and give recommendations for focused study.',
    benefits: [
      'Detailed charts of your learning progress (Coming Soon)',
      'Track retention rates for each flashcard deck (Coming Soon)',
      'See your daily/weekly/monthly study habits (Coming Soon)',
      'Identify difficult cards that need more attention (Coming Soon)'
    ],
    image: 'progress-tracking.png'
  },
  'Language Learning': {
    title: 'Language Learning',
    description: 'Specialized features for learning vocabulary in any language.',
    longDescription: 'Our platform is optimized for language learning with features for vocabulary acquisition, example sentences, and context. Perfect for mastering new languages efficiently with our AI assistance.',
    benefits: [
      'Specialized vocabulary learning features',
      'Example sentences for context',
      'AI-powered vocabulary suggestions',
      'Support for over 50 languages'
    ],
    image: 'language-learning.png'
  },
  'Cross-Platform Access': {
    title: 'Cross-Platform Access',
    description: 'Access your study materials from any browser on any device.',
    longDescription: 'Study anytime, anywhere with our responsive web application. Your flashcards and progress sync across all your devices instantly. No need to install anything - just open your browser and continue studying where you left off.',
    benefits: [
      'Study on desktop, tablet, or mobile',
      'Instant syncing across all devices',
      'No installation required',
      'Works offline with Progressive Web App features'
    ],
    image: 'web-accessibility.png'
  },
  'Community Content': {
    title: 'Community Content',
    description: 'Access a growing library of community-created flashcards.',
    longDescription: 'Tap into our community library of flashcards created by other learners. Find ready-made decks for popular subjects, courses, and topics. Save time by using high-quality content created by other students and educators.',
    benefits: [
      'Access thousands of pre-made flashcard decks',
      'Browse content by subject area or popularity',
      'Rate and save community decks to your library',
      'Contribute your own decks to help others learn'
    ],
    image: 'community-content.png'
  },
  'Export & Share': {
    title: 'Export & Share',
    description: 'Export your flashcards or share them with friends and classmates.',
    longDescription: 'Easily share your flashcards with classmates, friends, or study groups. Our community sharing lets you publish your decks publicly. Private sharing and export features are coming soon to enable offline use and targeted sharing with specific study groups.',
    benefits: [
      'Community sharing via public links',
      'Export to PDF, CSV, or other formats (Coming Soon)',
      'Private sharing with specific users (Coming Soon)',
      'Track shared content usage and engagement'
    ],
    image: 'export-share.png'
  }
};

const FeatureDetailModal = ({ feature, onClose }) => {
  // If no feature is provided or the feature doesn't exist in our details, don't render
  if (!feature || !featureDetails[feature]) {
    return null;
  }

  const details = featureDetails[feature];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#18092a] rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 flex flex-col">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-white">{details.title}</h2>
            <button 
              onClick={onClose}
              className="text-white/60 hover:text-white p-1 rounded-full hover:bg-white/10"
            >
              <CloseIcon />
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-white/80 mb-4">{details.longDescription}</p>
          </div>
          
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-[#00ff94] mb-3">Key Benefits</h3>
            <ul className="space-y-2">
              {details.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00ff94] mt-1.5 mr-2"></span>
                  <span className="text-white/80">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>
          
          <div className="mt-auto pt-4 border-t border-gray-800/50">
            <button 
              onClick={onClose}
              className="bg-[#00ff94]/10 text-[#00ff94] px-6 py-2 rounded-lg hover:bg-[#00ff94]/20 transition-colors border border-[#00ff94]/30"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureDetailModal; 