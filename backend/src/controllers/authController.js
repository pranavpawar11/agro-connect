const User = require('../models/User');
const jwt = require('jsonwebtoken');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, farmerDetails, companyDetails } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }
    
    const userData = {
      name,
      email,
      password,
      phone,
      role
    };
    
    if (role === 'farmer' && farmerDetails) {
      userData.farmerDetails = farmerDetails;
    }
    
    if (role === 'company' && companyDetails) {
      userData.companyDetails = companyDetails;
      userData.verificationStatus = 'pending';
    }
    
    const user = await User.create(userData);
    
    const token = generateToken(user._id);
    
    // Get complete user data without password
    const userWithoutPassword = await User.findById(user._id).select('-password').lean();
    
    res.status(201).json({
      success: true,
      message: role === 'company' 
        ? 'Company registered successfully. Please wait for admin verification' 
        : 'Registration successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user and select password for comparison
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact admin'
      });
    }
    
    // For company users, check verification status
    if (user.role === 'company' && user.verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${user.verificationStatus}. Please wait for admin verification.`
      });
    }
    
    const token = generateToken(user._id);
    
    // Get complete user data without password
    const userWithoutPassword = await User.findById(user._id).select('-password').lean();
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email, role: 'admin' }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }
    
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid admin credentials'
      });
    }
    
    const token = generateToken(user._id);
    
    // Get complete admin data without password
    const adminWithoutPassword = await User.findById(user._id).select('-password').lean();
    
    res.status(200).json({
      success: true,
      message: 'Admin login successful',
      token,
      user: adminWithoutPassword
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, farmerDetails, companyDetails, language } = req.body;
    
    // Find the current user first
    const currentUser = await User.findById(req.userId);
    if (!currentUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Prepare update data
    const updateData = {};
    
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (language) updateData.language = language;
    
    // Handle role-specific details
    if (currentUser.role === 'farmer' && farmerDetails) {
      updateData.farmerDetails = {
        ...(currentUser.farmerDetails || {}),
        ...farmerDetails
      };
    }
    
    if (currentUser.role === 'company' && companyDetails) {
      // Always allow editing all company details
      updateData.companyDetails = {
        ...(currentUser.companyDetails || {}),
        ...companyDetails
      };
      
      // ALWAYS reset verification status to pending when company details are edited
      updateData.verificationStatus = 'pending';
      updateData.verificationRemarks = ''; // Clear any previous remarks
    }
    
    // Update the user
    const user = await User.findByIdAndUpdate(
      req.userId,
      updateData,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-password');
    
    const message = currentUser.role === 'company' 
      ? 'Profile updated successfully. Verification status reset to pending.'
      : 'Profile updated successfully';
    
    res.status(200).json({
      success: true,
      message,
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};