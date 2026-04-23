const Parking = require('../model/parking.model');
const ParkingStrategy = require('./ParkingStrategy');

class SearchByNameStrategy extends ParkingStrategy {
  async execute({ name }) {
    if (!name) {
      throw new Error('Parking name is required');
    }

    return await Parking.find({
      name: { $regex: new RegExp(name, 'i') }
    });
  }
}

module.exports = SearchByNameStrategy;