// ticket.controller.js

const TicketService = require('../services/ticket.services');

exports.createTicket = async (req, res) => {
  try {
    const savedTicket = await TicketService.createTicket(req.body);
    res.status(201).json(savedTicket);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await TicketService.getTicketById(req.params.id);
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
    const tickets = await TicketService.getTicketsByUserId(req.params.userId);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTicketsByParkingId = async (req, res) => {
  try {
    const tickets = await TicketService.getTicketsByParkingId(req.params.parkingId);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTicketsForAdminParking = async (req, res) => {
  try {
    const tickets = await TicketService.getTicketsForAdminParking(req.params.adminEmail);
    res.status(200).json(tickets);
  } catch (error) {
    if (error.message.includes('not found')) {
        return res.status(404).json({ message: error.message });
    }
    console.error('Error getting tickets for admin parking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};