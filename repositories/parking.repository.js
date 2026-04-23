const BaseRepository = require('./base.repository');
const Parking = require('../model/parking.model');

class ParkingRepository extends BaseRepository {
  constructor() {
    super(Parking);
  }

  async findBySupervisor(supervisorId) {
    return await this.model.find({ supervisor: supervisorId });
  }

  async findByAdminEmail(adminEmail) {
    return await this.model.findOne({ admin: adminEmail });
  }

  async findByNameRegex(name) {
    return await this.model.find({ name: { $regex: new RegExp(name, 'i') } });
  }
}

module.exports = new ParkingRepository();
