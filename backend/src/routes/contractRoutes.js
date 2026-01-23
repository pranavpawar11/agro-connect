const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');
const { uploadContract } = require('../middleware/upload');

// Create contract (no file upload here)
router.post('/', auth, roleAuth('company'), contractController.createContract);

router.get('/', auth, contractController.getAllContracts);
router.get('/my-contracts', auth, roleAuth('company'), contractController.getCompanyContracts);
router.get('/:contractId', auth, contractController.getContractById);

// Farmer application
router.post('/:contractId/apply', auth, roleAuth('farmer'), contractController.applyToContract);
router.get('/:contractId/applications', auth, roleAuth('company'), contractController.getContractApplications);
router.get('/applications/my-applications', auth, roleAuth('farmer'), contractController.getFarmerApplications);

// Company selects farmer
router.put('/:contractId/applications/:applicationId/select', auth, roleAuth('company'), contractController.selectFarmer);

// Upload legal contract AFTER selecting farmer
router.post('/:contractId/upload-legal-contract', auth, roleAuth('company'), uploadContract.single('legalContract'), contractController.uploadLegalContract);

// Payment & delivery tracking
router.put('/:contractId/payment', auth, roleAuth('company'), contractController.updatePayment);
router.post('/:contractId/delivery', auth, roleAuth('company', 'farmer'), contractController.addDelivery);

// Status updates
router.put('/:contractId/mark-in-progress', auth, roleAuth('company', 'farmer'), contractController.markAsInProgress);
router.put('/:contractId/mark-completed', auth, roleAuth('company', 'farmer'), contractController.markAsCompleted);
router.put('/:contractId/cancel', auth, roleAuth('company', 'admin'), contractController.cancelContract);

// Admin
router.put('/:contractId/verify-legal', auth, roleAuth('admin'), contractController.verifyLegalContract);
router.put('/:contractId/status', auth, roleAuth('admin'), contractController.updateContractStatus);

module.exports = router;