const mongoose = require('mongoose');

const contractApplicationSchema = new mongoose.Schema({
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  proposedQuantity: {
    type: Number,
    required: true
  },
  
  farmerLocation: {
    village: String,
    district: String,
    state: String
  },
  
  farmerMessage: {
    type: String,
    default: ''
  },
  
  experience: {
    type: String,
    default: ''
  },
  
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  
  companyRemarks: {
    type: String,
    default: ''
  },
  
  acceptedAt: {
    type: Date
  },
  
  rejectedAt: {
    type: Date
  }
}, {
  timestamps: true
});

contractApplicationSchema.index({ contract: 1, farmer: 1 }, { unique: true });
contractApplicationSchema.index({ farmer: 1, status: 1 });
contractApplicationSchema.index({ contract: 1, status: 1 });

module.exports = mongoose.model('ContractApplication', contractApplicationSchema);