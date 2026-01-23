const roleAuth = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }
    
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions'
      });
    }
    
    if (req.user.role === 'company' && req.user.verificationStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        message: 'Company account not verified. Please wait for admin verification'
      });
    }
    
    next();
  };
};

module.exports = roleAuth;