const Parking = require('../model/parking.model');
const supervisorModel = require('../model/supervisor');
const ParkingStrategy = require('./ParkingStrategy');
const ParkingFactory = require('./parking.factory');

class BySupervisorStrategy extends ParkingStrategy {
  async execute({ supervisorId }) {
    if (!supervisorId) {
      throw new Error('Supervisor ID is required');
    }

    const supervisor = await supervisorModel.findById(supervisorId);
    if (!supervisor) {
      throw new Error('Supervisor not found');
    }

    return await Parking.find({ supervisor: supervisorId });
  }
}

ParkingFactory.register('supervisorId', BySupervisorStrategy);
module.exports = BySupervisorStrategy;