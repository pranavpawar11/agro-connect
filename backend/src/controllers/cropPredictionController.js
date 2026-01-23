const axios = require('axios');
const CropPrediction = require('../models/CropPrediction');

exports.predictCrop = async (req, res) => {
  try {
    const { N, P, K, temperature, humidity, ph, rainfall, location, notes } = req.body;
    
    if (!N || !P || !K || !temperature || !humidity || !ph || !rainfall) {
      return res.status(400).json({
        success: false,
        message: 'All soil and weather parameters are required'
      });
    }
    
    const mlServiceUrl = process.env.ML_SERVICE_URL || 'http://localhost:5001';
    
    const mlResponse = await axios.post(`${mlServiceUrl}/predict`, {
      N,
      P,
      K,
      temperature,
      humidity,
      ph,
      rainfall
    });
    
    if (!mlResponse.data.success) {
      return res.status(500).json({
        success: false,
        message: 'Crop prediction failed'
      });
    }
    
    const prediction = await CropPrediction.create({
      farmer: req.userId,
      inputParameters: {
        N,
        P,
        K,
        temperature,
        humidity,
        ph,
        rainfall
      },
      primaryCrop: mlResponse.data.primary_crop,
      primaryConfidence: mlResponse.data.primary_confidence,
      otherRecommendations: mlResponse.data.other_recommendations,
      location: location || {},
      notes: notes || ''
    });
    
    res.status(200).json({
      success: true,
      message: 'Crop prediction successful',
      prediction: {
        id: prediction._id,
        primaryCrop: prediction.primaryCrop,
        primaryConfidence: prediction.primaryConfidence,
        otherRecommendations: prediction.otherRecommendations,
        inputParameters: prediction.inputParameters,
        date: prediction.createdAt
      }
    });
  } catch (error) {
    if (error.response) {
      return res.status(500).json({
        success: false,
        message: 'ML service error: ' + error.response.data.message
      });
    }
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPredictionHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const predictions = await CropPrediction.find({ farmer: req.userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await CropPrediction.countDocuments({ farmer: req.userId });
    
    res.status(200).json({
      success: true,
      count: predictions.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      predictions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.getPredictionById = async (req, res) => {
  try {
    const { predictionId } = req.params;
    
    const prediction = await CropPrediction.findOne({
      _id: predictionId,
      farmer: req.userId
    });
    
    if (!prediction) {
      return res.status(404).json({
        success: false,
        message: 'Prediction not found'
      });
    }
    
    res.status(200).json({
      success: true,
      prediction
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};