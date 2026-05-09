// factories/EmptyParkingCreator.js
// Concrete Creator 2 — creates an empty Parking (no floors yet)

const Parking        = require('../model/parking.model');
const ParkingCreator = require('./ParkingCreator');

class EmptyParkingCreator extends ParkingCreator {

  // Overrides the Factory Method
  // Decides HOW to build an empty parking shell
  createParking(data) {
    return new Parking({
      supervisor:          data.userId,
      name:                data.name,
      longitude:           data.longitude,
      latitude:            data.latitude,
      floors:              [],
      selectedPlacesCount: 0,
    });
  }
}

module.exports = EmptyParkingCreator;