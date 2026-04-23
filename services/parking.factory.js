
class ParkingFactory {
  static async getParkings(params) {
    const strategy = ParkingFactory.getStrategy(params);
    return await strategy.execute(params);
  }

  static getStrategy(params) {
    if (params.lat && params.lng)  return new NearbyParkingStrategy();
    if (params.name)               return new SearchByNameStrategy();
    if (params.supervisorId)       return new BySupervisorStrategy();
    if (params.adminEmail)         return new ByAdminEmailStrategy();

    throw new Error('Invalid query params: provide lat/lng, name, supervisorId, or adminEmail');
  }
}