const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['weather', 'mandi_price', 'system', 'contract'],
    required: true
  },
  
  // Weather Alert fields
  weatherAlert: {
    district: String,
    state: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical']
    },
    message: {
      en: String,
      hi: String,
      mr: String
    }
  },
  
  // Mandi Price fields
  mandiPrice: {
    crop: String,
    market: String,
    district: String,
    state: String,
    price: Number,
    unit: {
      type: String,
      default: 'quintal'
    },
    date: Date
  },
  
  // System/Contract notification fields
  notification: {
    title: {
      en: String,
      hi: String,
      mr: String
    },
    message: {
      en: String,
      hi: String,
      mr: String
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    targetRole: {
      type: String,
      enum: ['farmer', 'company', 'all']
    },
    relatedContract: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contract'
    }
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  expiresAt: {
    type: Date
  },
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

alertSchema.index({ type: 1, isActive: 1 });
alertSchema.index({ 'weatherAlert.district': 1, 'weatherAlert.state': 1 });
alertSchema.index({ 'mandiPrice.crop': 1, 'mandiPrice.district': 1 });
alertSchema.index({ 'notification.targetUser': 1 });
alertSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Alert', alertSchema);