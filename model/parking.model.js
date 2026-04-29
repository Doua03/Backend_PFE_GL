const mongoose = require('mongoose');
const db = require('../config/db');
const Schema = mongoose.Schema;
const { applyParkingConstraints } = require('../constraints/parking.constraints');

const parkingPlaceSchema = new Schema({
  floorIndex: String,
  row: Number,
  column: Number,
  name: String,
  status: Boolean,
  code: String,
  battery: Number
});

const parkingFloorSchema = new Schema({
  floorIndex: String,
  rows: Number,
  columns: Number,
  parkingData: [[Boolean]],
  places: [parkingPlaceSchema],
});

const parkingPricingSchema = new Schema({
  perHour: Number,
  perDay: Number,
  perMonth: Number,
  perSixMonths: Number,
});

const parkingSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  longitude: {
    type: String,
    required: true,
  },
  latitude: {
    type: String,
    required: true,
  },
  admin: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
  },
  supervisor: {
    type: Schema.Types.ObjectId,
    ref: 'Supervisor',
    required: true,
  },
  pricing: {
    type: parkingPricingSchema,
    required: true,
  },
  description: String,
  imageUrl: String,
  floors: [parkingFloorSchema],
  selectedPlacesCount: Number,
  occupiedPlacesCount: Number, // Utiliser le champ occupé calculé
  reservedPlacesCount: Number
});

// Apply Parking Constraints to the parking schema
applyParkingConstraints(parkingSchema);

const Parking = db.model('Parking', parkingSchema);

module.exports = Parking;
