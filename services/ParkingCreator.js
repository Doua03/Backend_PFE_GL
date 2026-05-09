// factories/ParkingCreator.js
// Abstract Creator — defines the template algorithm
// Subclasses override createParking() to decide which object to build

const Parking = require('../model/parking.model');

class ParkingCreator {

  // Template method — fixed algorithm skeleton
  // Step 1: call createParking() (delegated to subclass)
  // Step 2: save to DB
  // Step 3: return result
  async addParking(data) {
    const parking = this.createParking(data);
    await parking.save();
    return parking;
  }

  // Factory Method — ABSTRACT
  // Subclasses MUST override this
  createParking(data) {
    throw new Error(
      `${this.constructor.name} must implement createParking()`
    );
  }
}

module.exports = ParkingCreator;