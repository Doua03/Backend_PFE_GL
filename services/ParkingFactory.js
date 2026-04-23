const Parking = require('../model/parking.model');

class ParkingFactory {
    
  static createFullParking(userId, name, longitude, latitude,
                            admin, pricing, floors, description, imageUrl) {
    return new Parking({
      supervisor: userId,
      name, longitude, latitude,
      admin, pricing, floors,
      description, imageUrl
    });
  }

  static createEmptyParking(userId, name, longitude, latitude) {
    return new Parking({
      supervisor: userId,
      name, longitude, latitude,
      floors: [],
      selectedPlacesCount: 0
    });
  }
}
module.exports = ParkingFactory;