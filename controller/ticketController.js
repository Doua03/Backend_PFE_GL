const TicketService = require('../services/TicketService');

exports.createTicket = async (req, res) => {
  try {
    const savedTicket = await TicketService.createTicket(req.body);
    res.status(201).json(savedTicket);
  } catch (error) {
    res.status(error.status || 400).json({ message: error.message });
  }
};

exports.getTicketById = async (req, res) => {
  try {
    const ticket = await TicketService.getTicketById(req.params.id);
    res.status(200).json(ticket);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getTicketsByUserId = async (req, res) => {
  try {
    const tickets = await TicketService.getTicketsByUserId(req.params.userId);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getTicketsByParkingId = async (req, res) => {
  try {
    const tickets = await TicketService.getTicketsByParkingId(req.params.parkingId);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};

exports.getTicketsForAdminParking = async (req, res) => {
  try {
    const tickets = await TicketService.getTicketsByAdminEmail(req.params.adminEmail);
    res.status(200).json(tickets);
  } catch (error) {
    res.status(error.status || 500).json({ message: error.message });
  }
};