// ticket.routes.js

const express = require('express');
const router = express.Router();
const ticketController = require('../controller/ticketController');

router.post('/tickets', ticketController.createTicket);
router.get('/tickets/:id', ticketController.getTicketById);
router.get('/tickets/user/:userId', ticketController.getTicketsByUserId);
router.get('/:parkingId', ticketController.getTicketsByParkingId); // Nouvelle route
router.get('/admin/:adminEmail', ticketController.getTicketsForAdminParking); 
// Route ajustée avec un préfixe distinct

module.exports = router;

