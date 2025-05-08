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
  // Stripe customer information
  stripeCustomerId: {
    type: String,
    sparse: true
  },
  // Complete Stripe data storage
  stripeData: {
    customer: {
      id: String,
      created: Date,
      email: String,
      name: String,
      phone: String,
      address: Object,
      defaultPaymentMethod: String,
      currency: String,
      isDeleted: Boolean,
      deletedAt: Date,
      createdAt: Date,
      updatedAt: Date
    },
    subscription: {
      id: String,
      status: String,
      currentPeriodStart: Date,
      currentPeriodEnd: Date,
      cancelAtPeriodEnd: Boolean,
      cancelAt: Date,
      canceledAt: Date,
      trialStart: Date,
      trialEnd: Date,
      // Billing details for UI
      amount: Number,
      currency: String,
      interval: String,
      billingCycleAnchor: Date,
      items: [{
        id: String,
        priceId: String,
        productId: String,
        quantity: Number,
        unitAmount: Number,
        recurring: Object
      }],
      isDeleted: Boolean,
      endedAt: Date,
      createdAt: Date,
      updatedAt: Date
    },
    paymentMethods: [{
      id: String,
      type: String,
      card: {
        brand: String,
        last4: String,
        expMonth: Number,
        expYear: Number
      },
      isDetached: Boolean,
      detachedAt: Date,
      createdAt: Date,
      updatedAt: Date
    }],
    invoices: [{
      id: String,
      subscriptionId: String,
      amountPaid: Number,
      amountRemaining: Number,
      currency: String,
      status: String,
      failureMessage: String,
      paidAt: Date,
      periodStart: Date,
      periodEnd: Date,
      createdAt: Date
    }]
  },
  subscription: {
    plan: {
      type: String,
      enum: ['free', 'pro', 'creator', 'enterprise'],
      default: 'free'
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'past_due', 'canceled', 'trialing'],
      default: 'active'
    },
    stripeSubscriptionId: String,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false
    },
    trialEnd: Date,
    // Billing details for UI display
    amount: Number,
    currency: String,
    interval: String,
    formattedAmount: {
      type: String,
      get: function() {
        if (!this.amount) return null;
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: this.currency || 'gbp',
          minimumFractionDigits: 2
        }).format(this.amount / 100);
      }
    }
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

// Virtual for formatted next billing date
userSchema.virtual('subscription.nextBillingDate').get(function() {
  if (!this.subscription?.currentPeriodEnd) return null;
  
  return this.subscription.currentPeriodEnd.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

// Virtual for getting payment amount with currency
userSchema.virtual('subscription.paymentAmount').get(function() {
  if (!this.subscription?.amount) return null;
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: this.subscription.currency || 'gbp',
    minimumFractionDigits: 2
  }).format(this.subscription.amount / 100);
});

// Pre-save hook to update timestamps
userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Method to check if user has active Pro subscription
userSchema.methods.isProSubscriber = function() {
  return this.subscription?.plan === 'pro' && 
         this.subscription?.status === 'active';
};

// Method to check if specific feature is available for user's plan
userSchema.methods.canUseFeature = function(feature) {
  const plan = this.subscription?.plan || 'free';
  
  // Map of features available by plan level
  const featureMap = {
    // Free plan features
    free: [
      'view_community_cards',
      'basic_analytics',
      'standard_support'
    ],
    
    // Pro plan features (includes all free features plus more)
    pro: [
      'view_community_cards',
      'basic_analytics',
      'standard_support',
      'unlimited_flashcards',
      'unlimited_quizzes',
      'advanced_analytics',
      'priority_support',
      'download_content',
      'export_reports'
    ],
    
    // Creator plan features (includes all pro features plus more)
    creator: [
      'view_community_cards',
      'basic_analytics',
      'standard_support',
      'unlimited_flashcards',
      'unlimited_quizzes',
      'advanced_analytics',
      'priority_support',
      'download_content',
      'export_reports',
      'custom_communities',
      'social_media_content'
    ],
    
    // Enterprise plan features (includes all creator features plus more)
    enterprise: [
      'view_community_cards',
      'basic_analytics',
      'standard_support',
      'unlimited_flashcards',
      'unlimited_quizzes',
      'advanced_analytics',
      'priority_support',
      'download_content',
      'export_reports',
      'custom_communities',
      'social_media_content',
      'api_access',
      'multi_team_members',
      'admin_controls',
      'dedicated_support'
    ]
  };
  
  // Check if the requested feature is available for user's plan
  return featureMap[plan].includes(feature);
};

const User = mongoose.model('User', userSchema);

export default User; 