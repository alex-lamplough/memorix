import mongoose from 'mongoose';

/**
 * Schema for partnership requests from content creators
 */
const partnershipRequestSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  creatorType: {
    type: String,
    enum: ['Language Tutor', 'Subject Tutor', 'Content Creator', 'Community Leader', 'Other'],
    required: true
  },
  otherCreatorType: {
    type: String,
    trim: true
  },
  communitySize: {
    type: String,
    enum: ['0-100', '101-500', '501-1000', '1001-5000', '5000+'],
    required: true
  },
  contentType: {
    type: [String],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one content type must be selected'
    }
  },
  platformLinks: {
    website: String,
    instagram: String,
    youtube: String,
    tiktok: String,
    other: String
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'contacted', 'approved', 'declined'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    trim: true
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

// Index for faster queries
partnershipRequestSchema.index({ email: 1 });
partnershipRequestSchema.index({ status: 1 });
partnershipRequestSchema.index({ creatorType: 1 });

const PartnershipRequest = mongoose.model('PartnershipRequest', partnershipRequestSchema);

export default PartnershipRequest; 