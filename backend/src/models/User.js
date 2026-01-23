const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['farmer', 'company', 'admin'],
    required: true
  },
  
  // Farmer specific fields
  farmerDetails: {
    address: String,
    village: String,
    district: String,
    state: String,
    pincode: String,
    landSize: Number,
    crops: [String]
  },
  
  // Company specific fields
companyDetails: {
    companyName: {
      type: String,
      required: function() { return this.role === 'company'; }
    },
    registrationNumber: String,
    gstNumber: String,
    businessType: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    website: String
  },
  
  // Company verification status
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'blocked'],
    default: function() {
      return this.role === 'company' ? 'pending' : 'verified';
    }
  },
  
  verificationRemarks: {
    type: String,
    default: ''
  },
  
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  verifiedAt: {
    type: Date
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  language: {
    type: String,
    enum: ['en', 'hi', 'mr'],
    default: 'en'
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);