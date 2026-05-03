// ticket.controller.js

const Ticket = require('../model/ticket');
const Parking = require('../model/parking.model');
const Admin = require('../model/admin');

exports.createTicket = async (req, res) => {
  try {
    // Appel manuel de la validation OCL (Jihen Baccar)
    Ticket.validateAll(req.body);

    const ticket = new Ticket(req.body);
    const savedTicket = await ticket.save();
    res.status(201).json(savedTicket);
  } catch (error) {
    if (error.message.includes('OCL Violation')) {
      return res.status(400).json({ status: 'OCL Violation', message: error.message });
    }
    res.status(400).json({ message: error.message });
  }
};



exports.getTicketById = async (req, res) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
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
    const tickets = await Ticket.find({ userId });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTicketsByParkingId = async (req, res) => {
  try {
    const parkingId = req.params.parkingId;
    const tickets = await Ticket.find({ parkingId });
    res.status(200).json(tickets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTicketsForAdminParking = async (req, res) => {
  try {
    const adminEmail = req.params.adminEmail;

    const admin = await Admin.findOne({ email: adminEmail });
    if (!admin) {
      return res.status(404).json({ message: 'Admin not found with this email' });
    }

    const parking = await Parking.findOne({ admin: admin.email });
    if (!parking) {
      return res.status(404).json({ message: 'Parking not found for this admin' });
    }

    const tickets = await Ticket.find({ parkingId: parking._id }).sort({ _id: -1 }); // Sort by _id in descending order

    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error getting tickets for admin parking:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};