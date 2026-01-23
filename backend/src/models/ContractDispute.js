const mongoose = require('mongoose');

const contractDisputeSchema = new mongoose.Schema({
  contract: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Contract',
    required: true
  },
  
  raisedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  raisedByRole: {
    type: String,
    enum: ['farmer', 'company'],
    required: true
  },
  
  subject: {
    type: String,
    required: true
  },
  
  message: {
    type: String,
    required: true
  },
  
  status: {
    type: String,
    enum: ['open', 'under_review', 'resolved', 'closed'],
    default: 'open'
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  adminRemarks: {
    type: String,
    default: ''
  },
  
  actionTaken: {
    type: String,
    default: ''
  },
  
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  resolvedAt: {
    type: Date
  },
  
  closedAt: {
    type: Date
  }
}, {
  timestamps: true
});

contractDisputeSchema.index({ contract: 1, status: 1 });
contractDisputeSchema.index({ raisedBy: 1, status: 1 });
contractDisputeSchema.index({ status: 1, priority: 1 });

module.exports = mongoose.model('ContractDispute', contractDisputeSchema);