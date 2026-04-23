const express = require('express');
const router = express.Router(); // Utilisez router pour définir les routes
const UserController = require("../controller/user.controller");
const multer = require('multer');
const path = require('path');

// Définir le dossier de destination pour les fichiers uploadés
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Extraire l'extension du fichier d'origine
    const ext = path.extname(file.originalname);
    // Générer un nom de fichier unique avec l'extension
    cb(null, file.fieldname + '-' + Date.now() + ext);
  }
});
const upload = multer({ storage: storage,});

router.post('/registration', UserController.register);
router.get('/verify-email', UserController.verifyEmail);
router.post('/login', UserController.login);
router.get('/auth/facebook', UserController.loginFacebook);
router.get('/auth/facebook/callback', UserController.loginFacebookCallback);
router.post('/reset-password', UserController.resetPassword);
router.put('/update', UserController.updateUser);
router.delete('/delete_account', UserController.deleteAccount);
router.post('/add-vehicle', UserController.addVehicle);
router.post('/uploadImage', upload.single('image'), UserController.uploadImage);
router.get('/get-vehicle', (req, res) => {
  const { userId } = req.query; // Utilisez req.query pour récupérer l'ID de l'utilisateur
  UserController.getUserVehicles(req, res, userId);
});
router.delete('/delete-vehicle', (req, res) => {
  const { userId, num } = req.query; // Récupérer userId et num des paramètres de l'URL
  UserController.deleteVehicle(req, res, userId, num); // Appeler la fonction de contrôleur avec les paramètres
});
router.get('/all', UserController.list); // Route pour récupérer tous les utilisateurs
router.delete('/delete/:userId', UserController.delete);

router.post('/addCard', UserController.addCreditCard);

router.get('/getCard', (req, res) => {
  const { userId } = req.query; // Utilisez req.query pour récupérer l'ID de l'utilisateur
  UserController.getUserCreditCard(req, res, userId);
});
router.delete('/deleteCard', (req, res) => {
  const { userId, cardNumber } = req.query; // Récupérer userId et num des paramètres de l'URL
  UserController.deleteCreditCard(req, res, userId, cardNumber); // Appeler la fonction de contrôleur avec les paramètres
});
router.get('/user/count', UserController.getUserCount);








// Exportez router pour l'utiliser dans votre fichier principal
module.exports = router;
