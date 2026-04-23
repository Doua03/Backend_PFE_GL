const Ticket = require('../model/ticket');
const Parking = require('../model/parking.model');
const Admin = require('../model/admin');

class TicketService {
    static async createTicket(ticketData) {
        try {
            const ticket = new Ticket(ticketData);
            return await ticket.save();
        } catch (error) {
            throw error;
        }
    }

    static async getTicketById(id) {
        try {
            return await Ticket.findById(id);
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
            return await Ticket.find({ parkingId });
        } catch (error) {
            throw error;
        }
    }

    static async getTicketsForAdminParking(adminEmail) {
        try {
            const admin = await Admin.findOne({ email: adminEmail });
            if (!admin) {
                throw new Error('Admin not found with this email');
            }

            const parking = await Parking.findOne({ admin: admin.email });
            if (!parking) {
                throw new Error('Parking not found for this admin');
            }

            return await Ticket.find({ parkingId: parking._id }).sort({ _id: -1 });
        } catch (error) {
            throw error;
        }
    }
}

module.exports = TicketService;
