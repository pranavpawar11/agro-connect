const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

router.get('/companies/pending', auth, roleAuth('admin'), userController.getPendingCompanies);
router.get('/companies', auth, roleAuth('admin'), userController.getAllCompanies);
router.put('/companies/:companyId/verify', auth, roleAuth('admin'), userController.verifyCompany);
router.put('/users/:userId/block', auth, roleAuth('admin'), userController.blockUser);
router.put('/users/:userId/unblock', auth, roleAuth('admin'), userController.unblockUser);

module.exports = router;