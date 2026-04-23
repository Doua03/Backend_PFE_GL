const express = require('express');
const router = express.Router();
const parkingController = require('../controller/parkingController');
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

// Ajouter la route pour gérer l'upload d'image
router.post('/uploadImage', upload.single('image'), parkingController.uploadImage);
router.post('/addParking', upload.single('image'), parkingController.addParking);
router.delete('/:id',parkingController.deleteParking);
router.get('/getparking/:id', parkingController.getParkingById);
router.put('/:id', upload.single('image'), parkingController.updateParking);
router.post('/addParkingData', parkingController.addParkingData); 
router.get('/floors/:parkingId', parkingController.getParkingFloors);
router.get('/parkings', parkingController.getParkings);
router.get('/count',parkingController.getParkingCount);
router.get('/getParkingsByAdminEmail', parkingController.getParkingsByAdminEmail);

module.exports = router;
