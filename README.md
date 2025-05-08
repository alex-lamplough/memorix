# Memorix

A modern flashcard and quiz application powered by AI, designed to help users learn and remember any subject efficiently.

<div align="center">
  <img src="src/assets/MemorixBannerLogo.png" alt="Memorix Logo" width="200" />
</div>

## Features

- **AI-Powered Flashcards**: Turn your notes into effective flashcards instantly
- **Spaced Repetition**: Optimized learning algorithms help you remember for the long-term
- **Share & Collaborate**: Share flashcard sets and quizzes with others
- **Beautiful UI**: Intuitive, modern interface with dark theme
- **Responsive Design**: Works on all devices from mobile to desktop
- **Universal Flashcard Study Component**: Consistent interface for studying flashcards across the entire application

## Technology Stack

- **Frontend**: React.js with Vite
- **Styling**: Tailwind CSS
- **UI Components**: Material-UI (MUI)
- **Routing**: React Router
- **Design**: Custom dark theme with accent color #00ff94

## Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/memorix.git
   cd memorix
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Set up environment variables
   ```
   npm run setup
   ```
   
4. Start the development server
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Environment Configuration

Memorix uses environment variables to manage configuration for different environments:

### Development Environment

In development mode, Memorix uses credentials from `.env.local` file. To set up:

1. Run the setup script:
   ```
   npm run setup
   ```

2. Follow the prompts to enter your Auth0 credentials and other settings.

3. The script creates a `.env.local` file that is excluded from git.

### Production Environment

For production deployment:

1. Set environment variables in your hosting platform (e.g., Railway, Vercel, Netlify).

2. Required variables:
   - `VITE_AUTH0_DOMAIN`: Your Auth0 domain
   - `VITE_AUTH0_CLIENT_ID`: Your Auth0 client ID
   - `VITE_AUTH0_AUDIENCE`: (Optional) Your Auth0 API audience
   - `VITE_ENV`: Set to "production"
   - `VITE_API_URL`: Your production API URL

3. The app automatically detects the environment and uses the appropriate configuration.

### Validating Environment Setup

To validate your environment variables:

```
npm run validate-env
```

## Project Structure

- `/src`: Source code
  - `/components`: Reusable React components
  - `/pages`: Page components corresponding to routes
  - `/assets`: Static assets like images
  - `/styles`: Global styles and themes
  - `/utils`: Utility functions and helpers

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- All contributors who have helped make Memorix better
- The open-source community for the amazing tools and libraries

## Components

### FlashcardStudy Component

The `FlashcardStudy` component provides a universal interface for studying flashcards throughout the application.

#### Features
- Clean, consistent UI for studying flashcards
- Next/Previous card navigation
- Progress tracking (card count and percentage)
- "Learned it" / "Review Later" functionality
- Card flipping to show question/answer

#### Usage

```jsx
import { FlashcardStudy } from '../components';

function YourComponent() {
  // Sample flashcard data
  const cards = [
    { 
      id: '1', 
      question: 'What is the capital of France?', 
      answer: 'Paris' 
    },
    // More cards...
  ];

  // Optional state for tracking learned/review cards
  const [reviewLaterCards, setReviewLaterCards] = useState({});
  const [learnedCards, setLearnedCards] = useState({});

  // Handlers
  const handleCardComplete = (cardId, status) => {
    console.log(`Card ${cardId} marked as ${status}`);
    // Update your state/database
  };

  const handleReviewLaterToggle = (cardId, isMarkedForReview) => {
    console.log(`Card ${cardId} ${isMarkedForReview ? 'marked' : 'unmarked'} for review`);
    // Update your state/database
  };

  const handleDeckComplete = () => {
    console.log('Deck completed!');
    // Show completion UI or navigate
  };

  return (
    <FlashcardStudy
      cards={cards}
      initialCardIndex={0}
      onCardComplete={handleCardComplete}
      onReviewLaterToggle={handleReviewLaterToggle}
      onDeckComplete={handleDeckComplete}
      reviewLaterCards={reviewLaterCards}
      learnedCards={learnedCards}
    />
  );
}
```

#### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `cards` | Array | Yes | Array of card objects with `id`, `question` and `answer` properties |
| `initialCardIndex` | Number | No | Starting index for the cards (default: 0) |
| `onCardComplete` | Function | No | Callback when card is marked as learned |
| `onReviewLaterToggle` | Function | No | Callback when review status is toggled |
| `onDeckComplete` | Function | No | Callback when all cards have been reviewed |
| `reviewLaterCards` | Object | No | Object tracking which cards are marked for review |
| `learnedCards` | Object | No | Object tracking which cards are marked as learned |
