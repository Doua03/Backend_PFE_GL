const Parking = require('../model/parking.model');

class ParkingBuilder {
  constructor() {
    this._name               = null;
    this._longitude          = null;
    this._latitude           = null;
    this._admin              = null;
    this._supervisor         = null;
    this._pricing            = null;
    this._floors             = [];
    this._description        = '';
    this._imageUrl           = '';
    this._selectedPlacesCount = 0;
  }

  setName(name) {
    this._name = name;
    return this;
  }

  setLocation(longitude, latitude) {
    this._longitude = longitude;
    this._latitude  = latitude;
    return this;
  }

  setAdmin(admin) {
    this._admin = admin;
    return this;
  }

  setSupervisor(supervisorId) {
    this._supervisor = supervisorId;
    return this;
  }

  setPricing(pricing) {
    this._pricing = pricing;
    return this;
  }

  setFloors(floors) {
    this._floors = floors;
    return this;
  }

  setDescription(description) {
    this._description = description;
    return this;
  }

  setImageUrl(imageUrl) {
    this._imageUrl = imageUrl;
    return this;
  }

  build() {
    if (!this._name || !this._longitude || !this._latitude || !this._admin || !this._supervisor || !this._pricing) {
      throw new Error('ParkingBuilder: name, location, admin, supervisor and pricing are required');
    }

    return new Parking({
      name:                this._name,
      longitude:           this._longitude,
      latitude:            this._latitude,
      admin:               this._admin,
      supervisor:          this._supervisor,
      pricing:             this._pricing,
      floors:              this._floors,
      description:         this._description,
      imageUrl:            this._imageUrl,
      selectedPlacesCount: this._selectedPlacesCount,
    });
  }
}

module.exports = ParkingBuilder;