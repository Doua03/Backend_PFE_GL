const Parking = require('../model/parking.model');
const supervisorModel = require('../model/supervisor');

class ParkingFacade {

  static async getNearbyParkings(lat, lng, limit = 5) {
    const parkings = await Parking.find(
      {},
      'id name longitude latitude pricing imageUrl selectedPlacesCount'
    );
    const withDistance = parkings.map(p => ({
      ...p._doc,
      distance: this._calculateDistance(lat, lng, p.latitude, p.longitude)
    }));
    return withDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit);
  }

  static async searchByName(name) {
    return await Parking.find({
      name: { $regex: new RegExp(name, 'i') }
    });
  }

  static async getParkingsBySupervisor(supervisorId) {
    const supervisor = await supervisorModel.findById(supervisorId);
    if (!supervisor) throw new Error('Supervisor not found');
    return await Parking.find({ supervisor: supervisorId });
  }
  
  // Subsystème interne — caché du controller
  static _calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
module.exports = ParkingFacade;