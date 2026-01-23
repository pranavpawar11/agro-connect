const express = require('express');
const router = express.Router();
const cropPredictionController = require('../controllers/cropPredictionController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

router.post('/predict', auth, roleAuth('farmer'), cropPredictionController.predictCrop);
router.get('/history', auth, roleAuth('farmer'), cropPredictionController.getPredictionHistory);
router.get('/:predictionId', auth, roleAuth('farmer'), cropPredictionController.getPredictionById);

module.exports = router;