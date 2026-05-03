class Superadmin {
  constructor() {
    this.email = "";
    this.password = "";
    this.session = "";
  }
}

class Supervisor {
  constructor() {
    this.email = "";
    this.password = "";
    this.session = "";
    this.name = "";
    this.telephone = 0;
    this.municipality = "";
    this.jobpost = "";
  }
}

class Admin {
  constructor() {
    this.email = "";
    this.password = "";
    this.session = "";
    this.name = "";
    this.telephone = 0;
    this.entreprise = "";
    this.postcode = 0;
    this.job = "";
  }
}

class User {
  constructor() {
    this.username = "";
    this.email = "";
    this.password = "";
    this.numTel = 0;
    this.profilePhoto = "";
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }
}

class Vehicule {
  constructor() {
    this.type = "";
    this.num = "";
  }
}

class Payment {
  constructor() {
    this.cardHolder = "";
    this.cardNumber = "";
    this.cardExpiry = "";
    this.cardCVC = "";
  }
}

class Ticket {
  constructor() {
    this.selectedMethod = "";
    this.selectedPlate = "";
    this.money = 0;
    this.arrivalDate = new Date();
    this.departureDate = new Date();
    this.parkingLatitude = 0;
    this.parkingLongitude = 0;
    this.code = "";
    this.selectedPlace = {};
  }
}

class Parking {
  constructor() {
    this.name = "";
    this.longitude = "";
    this.latitude = "";
    this.description = "";
    this.imageUrl = "";
    this.selectedPlacesCount = 0;
    this.occupiedPlacesCount = 0;
    this.reservedPlacesCount = 0;
  }
}

class ParkingFloor {
  constructor() {
    this.floorIndex = "";
    this.rows = 0;
    this.columns = 0;
  }
}

class ParkingPlace {
  constructor() {
    this.floorIndex = "";
    this.row = 0;
    this.column = 0;
    this.name = "";
    this.status = false;
    this.code = "";
    this.battery = 0;
  }
}

class ParkingPricing {
  constructor() {
    this.perHour = 0;
    this.perDay = 0;
    this.perMonth = 0;
    this.perSixMonths = 0;
  }
}

class License {
  constructor() {
    this.name = "";
    this.type = "";
    this.price = "";
    this.period = "";
    this.description = "";
  }
}

