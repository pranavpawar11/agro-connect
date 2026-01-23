const mongoose = require('mongoose');

const contractSchema = new mongoose.Schema({
  company: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  cropType: {
    type: String,
    required: true
  },
  
  quantity: {
    type: Number,
    required: true
  },
  
  unit: {
    type: String,
    default: 'quintal'
  },
  
  agreedPrice: {
    type: Number,
    required: true
  },
  
  duration: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  
  location: {
    district: {
      type: String,
      required: true
    },
    state: {
      type: String,
      required: true
    },
    pincode: String
  },
  
  description: {
    type: String,
    required: true
  },
  
  terms: {
    type: String,
    default: ''
  },
  
  // Selected farmer for this contract
  selectedFarmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  // Legal contract uploaded after farmer selection
  legalContractFile: {
    filename: String,
    path: String,
    uploadedAt: Date
  },
  
  legalContractVerification: {
    status: {
      type: String,
      enum: ['pending', 'verified', 'rejected'],
      default: 'pending'
    },
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    verifiedAt: Date,
    remarks: String
  },
  
  // Payment details
  paymentDetails: {
    advancePayment: {
      amount: Number,
      paidDate: Date,
      status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
      }
    },
    finalPayment: {
      amount: Number,
      paidDate: Date,
      status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
      }
    },
    totalPaid: {
      type: Number,
      default: 0
    }
  },
  
  // Delivery tracking
  deliveryStatus: {
    quantityDelivered: {
      type: Number,
      default: 0
    },
    deliveries: [{
      quantity: Number,
      date: Date,
      notes: String
    }]
  },
  
  status: {
    type: String,
    enum: ['pending', 'approved', 'active', 'in_progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  applicationsCount: {
    type: Number,
    default: 0
  },
  
  completedAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}, {
  timestamps: true
});

contractSchema.index({ company: 1, status: 1 });
contractSchema.index({ cropType: 1, status: 1 });
contractSchema.index({ 'location.district': 1, 'location.state': 1 });
contractSchema.index({ selectedFarmer: 1 });

module.exports = mongoose.model('Contract', contractSchema);