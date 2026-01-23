const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { registerValidation, loginValidation, validate } = require('../utils/validators');

router.post('/register', validate, authController.register);
router.post('/login', loginValidation, validate, authController.login);
router.post('/admin/login', loginValidation, validate, authController.adminLogin);
router.get('/profile', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);

module.exports = router;