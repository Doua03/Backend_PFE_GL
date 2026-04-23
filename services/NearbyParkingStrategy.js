const Parking = require('../model/parking.model');
const ParkingStrategy = require('./ParkingStrategy');

class NearbyParkingStrategy extends ParkingStrategy {
  async execute({ lat, lng, limit = 5 }) {
    if (!lat || !lng) {
      throw new Error('Latitude and longitude are required');
    }

    const parkings = await Parking.find(
      {},
      'id name longitude latitude pricing imageUrl selectedPlacesCount'
    );

    const withDistance = parkings.map(parking => ({
      ...parking._doc,
      distance: this.#calculateDistance(
        parseFloat(lat),
        parseFloat(lng),
        parseFloat(parking.latitude),
        parseFloat(parking.longitude)
      )
    }));

    return withDistance
      .sort((a, b) => a.distance - b.distance)
      .slice(0, parseInt(limit));
  }

  // Private method (JS private field syntax)
  #calculateDistance(lat1, lon1, lat2, lon2) {
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

module.exports = NearbyParkingStrategy;