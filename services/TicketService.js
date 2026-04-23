const Ticket = require('../model/ticket');
const Parking = require('../model/parking.model');
const Admin = require('../model/admin');

class TicketService {
  static async createTicket(ticketData) {
    const ticket = new Ticket(ticketData);
    return await ticket.save();
  }

  static async getTicketById(id) {
    const ticket = await Ticket.findById(id);
    if (!ticket) throw { status: 404, message: 'Ticket not found' };
    return ticket;
  }

  static async getTicketsByUserId(userId) {
    return await Ticket.find({ userId });
  }

  static async getTicketsByParkingId(parkingId) {
    return await Ticket.find({ parkingId });
  }

  static async getTicketsByAdminEmail(adminEmail) {
    const admin = await Admin.findOne({ email: adminEmail });
    if (!admin) throw { status: 404, message: 'Admin not found with this email' };

    const parking = await Parking.findOne({ admin: admin.email });
    if (!parking) throw { status: 404, message: 'Parking not found for this admin' };

    return await Ticket.find({ parkingId: parking._id }).sort({ _id: -1 });
  }
}

module.exports = TicketService;