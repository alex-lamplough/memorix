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
    description: 'Track your improvement with detailed analytics and insights.',
    longDescription: 'Get detailed insights into your learning journey with comprehensive analytics. See your retention rates, study patterns, and progress over time. Identify your weak areas and get recommendations for focused study.',
    benefits: [
      'Detailed charts of your learning progress',
      'Track retention rates for each flashcard deck',
      'See your daily/weekly/monthly study habits',
      'Identify difficult cards that need more attention'
    ],
    image: 'progress-tracking.png'
  },
  'Language Learning': {
    title: 'Language Learning',
    description: 'Special templates for learning vocabulary in any language.',
    longDescription: 'Our specialized language learning templates include pronunciation guides, example sentences, and context. Perfect for vocabulary acquisition in any language. The system supports audio pronunciation and native speaker recordings.',
    benefits: [
      'Specialized templates for vocabulary acquisition',
      'Example sentences for context',
      'Audio pronunciation guides',
      'Support for over 50 languages'
    ],
    image: 'language-learning.png'
  },
  'Web Accessibility': {
    title: 'Web Accessibility',
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
  'Smart Templates': {
    title: 'Smart Templates',
    description: 'Choose from a variety of templates for different subjects.',
    longDescription: 'Specialized templates for different subjects ensure you create the most effective study materials. From math equations to chemical formulas, from coding snippets to historical timelines, our templates are designed for optimal learning in each discipline.',
    benefits: [
      'Subject-specific templates for optimal learning',
      'Support for math equations and diagrams',
      'Code syntax highlighting for programming',
      'Timeline templates for historical events'
    ],
    image: 'smart-templates.png'
  },
  'Presentation Mode': {
    title: 'Presentation Mode',
    description: 'Practice your presentation skills with presenter view.',
    longDescription: 'Turn your flashcards into presentation slides with our presentation mode. Great for practicing speeches, presentations, or lectures. You can see your notes while your audience sees only the main content.',
    benefits: [
      'Practice presentations with speaker notes',
      'Full-screen presentation mode',
      'Timer and progress tracking',
      'Export to PowerPoint or PDF'
    ],
    image: 'presentation-mode.png'
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