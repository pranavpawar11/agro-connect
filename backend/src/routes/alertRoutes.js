const express = require('express');
const router = express.Router();
const alertController = require('../controllers/alertController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

router.post('/weather', auth, roleAuth('admin'), alertController.createWeatherAlert);
router.post('/mandi-price', auth, roleAuth('admin'), alertController.createMandiPrice);
router.post('/notification', auth, roleAuth('admin'), alertController.createNotification);

router.get('/weather', auth, alertController.getWeatherAlerts);
router.get('/mandi-prices', auth, alertController.getMandiPrices);
router.get('/notifications', auth, alertController.getMyNotifications);

router.delete('/:alertId', auth, roleAuth('admin'), alertController.deleteAlert);

module.exports = router;