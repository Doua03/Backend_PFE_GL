const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');

const AuthController       = require("../controller/AuthController");
const ProfileController    = require("../controller/ProfileController");
const VehicleController    = require("../controller/VehicleController");
const CreditCardController = require("../controller/CreditCardController");

const storage = multer.diskStorage({
  destination: function (req, file, cb) { cb(null, 'uploads/'); },
  filename:    function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage });

// Auth
router.post('/registration',   AuthController.register);
router.get('/verify-email',    AuthController.verifyEmail);
router.post('/login',          AuthController.login);
router.post('/reset-password', AuthController.resetPassword);

// Profile
router.put('/update',              ProfileController.updateUser);
router.delete('/delete_account',   ProfileController.deleteAccount);
router.post('/uploadImage', upload.single('image'), ProfileController.uploadImage);
router.get('/all',                 ProfileController.list);
router.delete('/delete/:userId',   ProfileController.delete);
router.get('/user/count',          ProfileController.getUserCount);

// Vehicles
router.post('/add-vehicle',    VehicleController.addVehicle);
router.get('/get-vehicle',     VehicleController.getUserVehicles);
router.delete('/delete-vehicle', VehicleController.deleteVehicle);

// Credit Cards
router.post('/addCard',        CreditCardController.addCreditCard);
router.get('/getCard',         CreditCardController.getUserCreditCard);
router.delete('/deleteCard',   CreditCardController.deleteCreditCard);

module.exports = router;