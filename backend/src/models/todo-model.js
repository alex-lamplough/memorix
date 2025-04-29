import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'completed', 'archived'],
    default: 'pending'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  dueDate: {
    type: Date
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.Mixed, // Accept both ObjectId and String
    required: true
  },
  related: {
    // Optional relation to a flashcard set
    flashcardSetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FlashcardSet'
    }
  },
  completedAt: {
    type: Date
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
todoSchema.index({ userId: 1 });

// Index for filtering by status and sorting by due date
todoSchema.index({ status: 1, dueDate: 1 });

// Pre-save hook to update timestamps and handle completion
todoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  
  // Set completedAt timestamp when a task is marked complete
  if (this.isCompleted && !this.completedAt) {
    this.completedAt = Date.now();
    this.status = 'completed';
  }
  
  // If task is marked incomplete, remove completedAt
  if (!this.isCompleted && this.completedAt) {
    this.completedAt = undefined;
  }
  
  next();
});

const Todo = mongoose.model('Todo', todoSchema);

export default Todo; 