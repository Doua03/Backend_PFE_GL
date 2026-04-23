const Parking = require('../model/parking.model');
const adminModel = require('../model/admin');
const ParkingStrategy = require('./ParkingStrategy');

class ByAdminEmailStrategy extends ParkingStrategy {
  async execute({ adminEmail }) {
    if (!adminEmail) {
      throw new Error('Admin email is required');
    }

    const adminUser = await adminModel.findOne({ email: adminEmail });
    if (!adminUser) {
      throw new Error('Admin not found');
    }

    return await Parking.find({ admin: adminUser.email });
  }
}

module.exports = ByAdminEmailStrategy;