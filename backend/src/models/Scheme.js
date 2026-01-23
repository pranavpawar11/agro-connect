const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema({
  name: {
    en: {
      type: String,
      required: true
    },
    hi: String,
    mr: String
  },
  
  description: {
    en: {
      type: String,
      required: true
    },
    hi: String,
    mr: String
  },
  
  eligibility: {
    en: {
      type: String,
      required: true
    },
    hi: String,
    mr: String
  },
  
  steps: {
    en: {
      type: String,
      required: true
    },
    hi: String,
    mr: String
  },
  
  documents: {
    en: {
      type: String,
      required: true
    },
    hi: String,
    mr: String
  },
  
  benefits: {
    en: String,
    hi: String,
    mr: String
  },
  
  state: {
    type: String,
    required: true
  },
  
  category: {
    type: String,
    required: true,
    enum: ['subsidy', 'loan', 'insurance', 'training', 'equipment', 'other']
  },
  
  officialWebsite: {
    type: String,
    default: ''
  },
  
  contactNumber: {
    type: String,
    default: ''
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

schemeSchema.index({ state: 1, category: 1, isActive: 1 });
schemeSchema.index({ category: 1 });

module.exports = mongoose.model('Scheme', schemeSchema);