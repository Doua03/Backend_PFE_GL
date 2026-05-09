// factories/FullParkingCreator.js
// Concrete Creator 1 — creates a complete Parking with all fields

const Parking        = require('../model/parking.model');
const ParkingCreator = require('./ParkingCreator');

class FullParkingCreator extends ParkingCreator {

  // Overrides the Factory Method
  // Decides HOW to build a full parking
  createParking(data) {
    return new Parking({
      supervisor:          data.userId,
      name:                data.name,
      longitude:           data.longitude,
      latitude:            data.latitude,
      admin:               data.admin,
      pricing:             data.pricing,
      floors:              data.floors,
      description:         data.description,
      imageUrl:            data.imageUrl,
    });
  }
}

module.exports = FullParkingCreator;