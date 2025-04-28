import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema({
  front: {
    type: String,
    required: true
  },
  back: {
    type: String,
    required: true
  },
  hint: String,
  difficulty: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  lastReviewed: Date,
  nextReviewDate: Date,
  reviewHistory: [{
    date: Date,
    performance: {
      type: Number,
      min: 0,
      max: 5
    },
    timeSpent: Number // in seconds
  }]
});

const flashcardSetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  category: String,
  tags: [String],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  cards: [flashcardSchema],
  studyStats: {
    totalStudySessions: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0
    },
    lastStudied: Date,
    masteryLevel: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for faster queries by userId
flashcardSetSchema.index({ userId: 1 });

// Index for text search on title and description
flashcardSetSchema.index({ 
  title: 'text', 
  description: 'text',
  tags: 'text'
});

// Method to calculate mastery level based on review history
flashcardSetSchema.methods.calculateMasteryLevel = function() {
  if (!this.cards.length) return 0;
  
  let totalCards = this.cards.length;
  let masteredCards = 0;
  
  this.cards.forEach(card => {
    if (card.reviewHistory && card.reviewHistory.length > 0) {
      // Get the latest review
      const latestReview = card.reviewHistory[card.reviewHistory.length - 1];
      if (latestReview.performance >= 4) {
        masteredCards++;
      }
    }
  });
  
  return Math.round((masteredCards / totalCards) * 100);
};

// Pre-save hook to update mastery level and timestamps
flashcardSetSchema.pre('save', function(next) {
  this.studyStats.masteryLevel = this.calculateMasteryLevel();
  this.updatedAt = Date.now();
  next();
});

const FlashcardSet = mongoose.model('FlashcardSet', flashcardSetSchema);

export default FlashcardSet; 