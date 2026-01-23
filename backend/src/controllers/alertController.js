const Alert = require('../models/Alert');

exports.createWeatherAlert = async (req, res) => {
  try {
    const { district, state, severity, message, expiresAt } = req.body;
    
    const alert = await Alert.create({
      type: 'weather',
      weatherAlert: {
        district,
        state,
        severity,
        message
      },
      expiresAt,
      createdBy: req.userId
    });
    
    res.status(201).json({
      success: true,
      message: 'Weather alert created successfully',
      alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createMandiPrice = async (req, res) => {
  try {
    const { crop, market, district, state, price, unit, date } = req.body;
    
    const alert = await Alert.create({
      type: 'mandi_price',
      mandiPrice: {
        crop,
        market,
        district,
        state,
        price,
        unit: unit || 'quintal',
        date: date || new Date()
      },
      createdBy: req.userId
    });
    
    res.status(201).json({
      success: true,
      message: 'Mandi price added successfully',
      alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.createNotification = async (req, res) => {
  try {
    const { title, message, targetUser, targetRole, relatedContract } = req.body;
    
    const alert = await Alert.create({
      type: req.body.type || 'system',
      notification: {
        title,
        message,
        targetUser,
        targetRole,
        relatedContract
      },
      createdBy: req.userId
    });
    
    res.status(201).json({
      success: true,
      message: 'Notification created successfully',
      alert
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getWeatherAlerts = async (req, res) => {
  try {
    const { district, state } = req.query;
    
    const filter = {
      type: 'weather',
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gte: new Date() } }
      ]
    };
    
    if (district) filter['weatherAlert.district'] = district;
    if (state) filter['weatherAlert.state'] = state;
    
    const alerts = await Alert.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json({
      success: true,
      count: alerts.length,
      alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMandiPrices = async (req, res) => {
  try {
    const { crop, district, state } = req.query;
    
    const filter = {
      type: 'mandi_price',
      isActive: true
    };
    
    if (crop) filter['mandiPrice.crop'] = crop;
    if (district) filter['mandiPrice.district'] = district;
    if (state) filter['mandiPrice.state'] = state;
    
    const prices = await Alert.find(filter).sort({ 'mandiPrice.date': -1 });
    
    res.status(200).json({
      success: true,
      count: prices.length,
      prices
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getMyNotifications = async (req, res) => {
  try {
    const filter = {
      $or: [
        { 'notification.targetUser': req.userId },
        { 'notification.targetRole': req.user.role },
        { 'notification.targetRole': 'all' }
      ],
      isActive: true
    };
    
    const notifications = await Alert.find(filter).sort({ createdAt: -1 }).limit(50);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.deleteAlert = async (req, res) => {
  try {
    const { alertId } = req.params;
    
    const alert = await Alert.findByIdAndUpdate(
      alertId,
      { isActive: false },
      { new: true }
    );
    
    if (!alert) {
      return res.status(404).json({
        success: false,
        message: 'Alert not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Alert deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};