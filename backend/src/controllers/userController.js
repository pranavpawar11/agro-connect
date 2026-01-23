const User = require('../models/User');

exports.getPendingCompanies = async (req, res) => {
  try {
    const companies = await User.find({
      role: 'company',
      verificationStatus: 'pending'
    }).select('-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: companies.length,
      companies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await User.find({
      role: 'company'
    }).select('-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: companies.length,
      companies
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.verifyCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { status, remarks } = req.body;
    
    if (!['verified', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be verified or rejected'
      });
    }
    
    const company = await User.findOne({
      _id: companyId,
      role: 'company'
    });
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    company.verificationStatus = status;
    company.verificationRemarks = remarks || '';
    company.verifiedBy = req.userId;
    company.verifiedAt = new Date();
    
    await company.save();
    
    res.status(200).json({
      success: true,
      message: `Company ${status} successfully`,
      company: {
        id: company._id,
        name: company.name,
        companyName: company.companyDetails.companyName,
        verificationStatus: company.verificationStatus,
        verificationRemarks: company.verificationRemarks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot block admin users'
      });
    }
    
    user.isActive = false;
    user.verificationStatus = 'blocked';
    user.verificationRemarks = reason || 'Blocked by admin';
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'User blocked successfully',
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.unblockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    user.isActive = true;
    if (user.role === 'company') {
      user.verificationStatus = 'verified';
    }
    user.verificationRemarks = '';
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'User unblocked successfully',
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
        isActive: user.isActive
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};