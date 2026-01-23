const mongoose = require('mongoose');

const cropPredictionSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  inputParameters: {
    N: {
      type: Number,
      required: true
    },
    P: {
      type: Number,
      required: true
    },
    K: {
      type: Number,
      required: true
    },
    temperature: {
      type: Number,
      required: true
    },
    humidity: {
      type: Number,
      required: true
    },
    ph: {
      type: Number,
      required: true
    },
    rainfall: {
      type: Number,
      required: true
    }
  },
  
  primaryCrop: {
    type: String,
    required: true
  },
  
  primaryConfidence: {
    type: Number,
    required: true
  },
  
  otherRecommendations: [{
    crop: String,
    confidence: Number
  }],
  
  location: {
    village: String,
    district: String,
    state: String
  },
  
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

cropPredictionSchema.index({ farmer: 1, createdAt: -1 });

module.exports = mongoose.model('CropPrediction', cropPredictionSchema);