const express = require('express');
const router = express.Router();
const disputeController = require('../controllers/disputeController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

router.post('/', auth, roleAuth('farmer', 'company'), disputeController.raiseDispute);
router.get('/my-disputes', auth, roleAuth('farmer', 'company'), disputeController.getMyDisputes);
router.get('/', auth, roleAuth('admin'), disputeController.getAllDisputes);
router.get('/:disputeId', auth, disputeController.getDisputeById);
router.put('/:disputeId/status', auth, roleAuth('admin'), disputeController.updateDisputeStatus);

module.exports = router;