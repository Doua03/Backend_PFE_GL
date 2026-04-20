const express = require('express');
const router = express.Router();
const parkingVisitedController = require('../controller/parkingvisitedController');

router.post('/visit', parkingVisitedController.visit );
router.get('/latestVisited', parkingVisitedController.latestVisited );
router.get('/alllatestVisited', parkingVisitedController.alllatestVisited );
module.exports = router;