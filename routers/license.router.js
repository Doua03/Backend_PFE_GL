const express = require('express');
const router = express.Router();
const licenseController = require('../controller/licenseController');

router.post('/addlicenses', licenseController.addLicense);
router.delete('/:id', licenseController.deleteLicense);
router.get('/getlicensesS', licenseController.getlicensesS);
router.get('/getlicenses', licenseController.getlicenses);
router.get('/getlicensesA', licenseController.getlicensesA);

router.get('/:id', licenseController.getLicenseById);
router.put('/:id', licenseController.updateLicense);
module.exports = router;
