/**
 * Base Component
 */
class ParkingComponent {
  getAvailablePlaces() {
    throw new Error('Method getAvailablePlaces() must be implemented');
  }

  getData() {
    throw new Error('Method getData() must be implemented');
  }
}

/**
 * Leaf: ParkingPlace
 */
class ParkingPlace extends ParkingComponent {
  constructor(place) {
    super();
    this.place = place;
  }

  getAvailablePlaces() {
    // status true means available, false means occupied
    return this.place.status === true ? 1 : 0;
  }

  getData() {
    return this.place;
  }
}

/**
 * Composite: ParkingFloor
 */
class ParkingFloor extends ParkingComponent {
  constructor(floor) {
    super();
    this.floor = floor;
    this.children = (floor.places || []).map(p => new ParkingPlace(p));
  }

  getAvailablePlaces() {
    return this.children.reduce((sum, child) => sum + child.getAvailablePlaces(), 0);
  }

  getData() {
    return this.floor;
  }

  getPlaces() {
    return this.children.map(child => child.getData());
  }
}

/**
 * Composite: ParkingGroup (Root)
 */
class ParkingGroup extends ParkingComponent {
  constructor(parking) {
    super();
    this.parking = parking;
    this.children = (parking.floors || []).map(f => new ParkingFloor(f));
  }

  getAvailablePlaces() {
    return this.children.reduce((sum, child) => sum + child.getAvailablePlaces(), 0);
  }

  getData() {
    return this.parking;
  }

  getFloors() {
    return this.children.map(child => child.getData());
  }

  getAllPlaces() {
    return this.children.flatMap(floor => floor.getPlaces());
  }
}

module.exports = {
  ParkingPlace,
  ParkingFloor,
  ParkingGroup
};
