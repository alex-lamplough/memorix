import mongoose from 'mongoose';

// Schema for individual options in multiple choice questions
const optionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  }
});

// Schema for quiz questions
const questionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['multiple', 'boolean'],
    required: true
  },
  question: {
    type: String,
    required: true
  },
  options: [String],
  correctAnswer: {
    type: Number,
    required: true
  }
});

// Main quiz schema
const quizSchema = new mongoose.Schema({
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
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    default: 'Medium'
  },
  questionCount: {
    type: Number,
    default: 0
  },
  time: {
    type: String,
    default: '5 min'
  },
  questions: [questionSchema],
  studyStats: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    totalTimeSpent: {
      type: Number,
      default: 0
    },
    lastAttempted: Date,
    averageScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    },
    bestScore: {
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

// Indexes for faster queries
quizSchema.index({ userId: 1 });
quizSchema.index({ 
  title: 'text', 
  description: 'text',
  tags: 'text'
});

// Pre-save hook to set questionCount
quizSchema.pre('save', function(next) {
  this.questionCount = this.questions.length;
  this.updatedAt = Date.now();
  next();
});

const Quiz = mongoose.model('Quiz', quizSchema);

export default Quiz; 