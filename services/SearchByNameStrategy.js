const Parking = require('../model/parking.model');
const ParkingStrategy = require('./ParkingStrategy');
const ParkingFactory = require('./ParkingFactory');

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

ParkingFactory.register('name', SearchByNameStrategy);
module.exports = SearchByNameStrategy;