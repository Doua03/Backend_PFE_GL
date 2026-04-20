// ticket.model.js
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const Schema = mongoose.Schema;

const ticketSchema = new Schema({
  selectedMethod: {
    type: String,
    required: true
  },
  selectedPlate: {
    type: String,
    required: true
  },
  money: {
    type: Number,
    required: true
  },
  arrivalDate: {
    type: Date,
    required: true
  },
  departureDate: {
    type: Date,
    required: true
  },
  parkingLatitude: {
    type: Number, // Updated type to Number
    required: true
  },
  parkingLongitude: {
    type: Number, // Updated type to Number
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  parkingId: {
    type: String,
    required: true
  },
  selectedPlace: { type: Object }
});

const ticketModel = db.model('Ticket', ticketSchema, 'ticket');

module.exports = ticketModel;
