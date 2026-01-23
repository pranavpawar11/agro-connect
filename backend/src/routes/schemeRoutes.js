const express = require('express');
const router = express.Router();
const schemeController = require('../controllers/schemeController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

router.post('/', auth, roleAuth('admin'), schemeController.createScheme);
router.get('/', auth, schemeController.getAllSchemes);
router.get('/:schemeId', auth, schemeController.getSchemeById);
router.put('/:schemeId', auth, roleAuth('admin'), schemeController.updateScheme);
router.delete('/:schemeId', auth, roleAuth('admin'), schemeController.deleteScheme);

module.exports = router;