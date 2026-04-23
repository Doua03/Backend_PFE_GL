// ticket.controller.js

const ticketRepository = require('../repositories/ticket.repository');
const parkingRepository = require('../repositories/parking.repository');
const adminRepository = require('../repositories/admin.repository');


exports.createTicket = async (req, res) => {
  try {
    const savedTicket = await ticketRepository.create(req.body);
    res.status(201).json(savedTicket);

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await ticketRepository.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    res.status(200).json(ticket);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getTicketsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    const tickets = await ticketRepository.findByUserId(userId);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getTicketsByParkingId = async (req, res) => {
  try {
    const parkingId = req.params.parkingId;
    const tickets = await ticketRepository.findByParkingId(parkingId);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getTicketsForAdminParking = async (req, res) => {
  try {
    const adminEmail = req.params.adminEmail;

    const admin = await adminRepository.findByEmail(adminEmail);
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found with this email' });
    }

    const parking = await parkingRepository.findByAdminEmail(admin.email);
    if (!parking) {
      return res.status(404).json({ message: 'Parking not found for this admin' });
    }

    const tickets = await ticketRepository.findByParkingId(parking._id);


    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error getting tickets for admin parking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};