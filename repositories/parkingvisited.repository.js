const BaseRepository = require('./base.repository');
const ParkingVisited = require('../model/parkingvisited');

class ParkingVisitedRepository extends BaseRepository {
  constructor() {
    super(ParkingVisited);
  }
}

module.exports = new ParkingVisitedRepository();
