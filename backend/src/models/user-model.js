import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  nickname: String,
  picture: String,
  lastLogin: {
    type: Date,
    default: Date.now
  },
  profile: {
    displayName: String,
    bio: String,
    userType: {
      type: String,
      enum: ['Student', 'Educator', 'Creator', 'General User'],
    },
    interests: [String],
    learningGoals: [String],
    profileCompleted: {
      type: Boolean,
      default: false
    },
    onboardingStage: {
      type: String,
      enum: ['not_started', 'basic_info', 'interests', 'completed'],
      default: 'not_started'
    }
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    emailNotifications: {
      type: Boolean,
      default: true
    },
    studyReminders: {
      type: Boolean,
      default: true
    },
    contentUpdates: {
      type: Boolean,
      default: true
    },
    defaultStudyTime: {
      type: Number,
      default: 20 // minutes
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
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for getting user's flashcard sets
userSchema.virtual('flashcardSets', {
  ref: 'FlashcardSet',
  localField: '_id',
  foreignField: 'userId'
});

// Pre-save hook to update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const User = mongoose.model('User', userSchema);

export default User; 