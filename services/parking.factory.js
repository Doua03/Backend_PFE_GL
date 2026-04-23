require('./index');
const strategies = {};

class ParkingFactory {
  // Open for extension: anyone can register a new strategy
  static register(paramKey, StrategyClass) {
    strategies[paramKey] = StrategyClass;
  }

  // Closed for modification: this logic never changes
  static getStrategy(params) {
    const key = Object.keys(strategies).find(k => params[k]);
    if (!key) throw new Error('Invalid query params');
    return new strategies[key]();
  }

  static async getParkings(params) {
    const strategy = ParkingFactory.getStrategy(params);
    return await strategy.execute(params);
  }
}

module.exports = ParkingFactory;