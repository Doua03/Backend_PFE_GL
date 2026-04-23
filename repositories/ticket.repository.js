const BaseRepository = require('./base.repository');
const Ticket = require('../model/ticket');

class TicketRepository extends BaseRepository {
  constructor() {
    super(Ticket);
  }

  async findByUserId(userId) {
    return await this.model.find({ userId });
  }

  async findByParkingId(parkingId) {
    return await this.model.find({ parkingId }).sort({ _id: -1 });
  }
}

module.exports = new TicketRepository();
