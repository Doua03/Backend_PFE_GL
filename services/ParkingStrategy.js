class ParkingStrategy {
  constructor() {
    if (new.target === ParkingStrategy) {
      throw new Error('ParkingStrategy is abstract and cannot be instantiated directly');
    }
  }

  async execute(params) {
    throw new Error(`${this.constructor.name} must implement execute()`);
  }
}

module.exports = ParkingStrategy;