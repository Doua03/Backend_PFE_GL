const router = require('express').Router();
const adminController = require("../controller/adminController");
const superAdminController = require('../controller/superadminController');
const supervisorController = require('../controller/supervisorController');


// Admin routes
router.post('/admin/login', adminController.logina);
router.post('/admins/:adminId/license',adminController.modifyLicense);
router.get('/getadmin', (req, res) => {
  const { email } = req.query; // Utilisez req.query pour récupérer l'ID de l'utilisateur
adminController.getadmin(req, res, email);
});
router.get('/admin/list', adminController.list); // Changed to GET
router.delete('/admin/delete/:id', adminController.delete); // Changed to DELETE and added parameter
router.post('/admin/add', adminController.add); // Changed to DELETE and added parameter
router.get('/admin/listSuper', (req, res) => {
  const { userId } = req.query; // Utilisez req.query pour récupérer l'ID de l'utilisateur
adminController.listSuper(req, res, userId);
});

// Superadmin routes
router.post('/superadmin/login', superAdminController.loginsa);
router.get('/superadmin/list', superAdminController.listSuperadmins); // Changed to GET
router.get('/superadmin/get/:id', superAdminController.getSuperadminById); // Changed to GET and added parameter
router.delete('/superadmin/delete/:id', superAdminController.deleteSuperadminById); // Changed to DELETE and added parameter

// Supervisor routes
router.post('/supervisor/login', supervisorController.logins);
router.get('/supervisor/list', supervisorController.listSupervisors); // Changed to GET
router.get('/supervisor/get/:id', supervisorController.getSupervisorById); // Changed to GET and added parameter
router.delete('/supervisor/delete/:id', supervisorController.deleteSupervisorById); // Changed to DELETE and added parameter
router.post('/supervisor/add', supervisorController.addSupervisor);
router.post('/supervisor/:supervisorId', supervisorController.updateSupervisor);
router.post('/update/:adminId', adminController.updateAdmin);
router.get('/count',supervisorController.getSupervisorCount);
router.get('/admin/count',adminController.getAdminCount);
router.get('/admin/get/:id', adminController.getAdminById);
router.get('/list', supervisorController.listSupervisors);
router.post('/:supervisorId/license',supervisorController.modifyLicense);
router.get('/admin/license/total-price', adminController.calculateTotalLicensePrice);
router.get('/supervisor/license/total-price', supervisorController.calculateTotalLicensePrice);

module.exports = router;
