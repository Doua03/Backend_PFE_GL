const Ticket = require('../model/ticket');

class TicketService {
  /**
   * Patron GRASP Creator : TicketService est responsable de la création des objets Ticket.
   * Il centralise la logique d'instanciation.
   */
  static async createTicket(ticketData) {
    try {
      const ticket = new Ticket(ticketData);
      return await ticket.save();
    } catch (error) {
      throw error;
    }
  }

  static async getTicketsByUserId(userId) {
    try {
      return await Ticket.find({ userId });
    } catch (error) {
      throw error;
    }
  }

  static async getTicketsByParkingId(parkingId) {
    try {
      return await Ticket.find({ parkingId }).sort({ _id: -1 });
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      return await Ticket.findById(id);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = TicketService;
