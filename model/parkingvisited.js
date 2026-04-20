const mongoose = require('mongoose');
const db = require('../config/db');
const Schema = mongoose.Schema;

const visitedParkingSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
  parkingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking' },
  visitTimestamp: { type: Date, default: Date.now }
});

const VisitedParking = db.model('VisitedParking', visitedParkingSchema);

module.exports = VisitedParking;
