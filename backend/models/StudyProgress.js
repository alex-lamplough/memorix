const mongoose = require('mongoose');

const studyProgressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  deckId: {
    type: String,
    required: true,
    index: true
  },
  currentCardIndex: {
    type: Number,
    default: 0
  },
  learnedCards: {
    type: Map,
    of: Boolean,
    default: new Map()
  },
  reviewLaterCards: {
    type: Map,
    of: Boolean,
    default: new Map()
  },
  studyMode: {
    type: String,
    enum: ['normal', 'review', 'completed'],
    default: 'normal'
  },
  lastStudied: {
    type: Date,
    default: Date.now
  },
  totalCards: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
studyProgressSchema.index({ userId: 1, deckId: 1 }, { unique: true });

const StudyProgress = mongoose.model('StudyProgress', studyProgressSchema);

module.exports = StudyProgress; 