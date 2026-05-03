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

// OCL Constraints for Jihen Baccar
// 1. ticketDateConsistency: departureDate > arrivalDate
// 2. ticketMoneyPositive: money > 0
ticketSchema.pre('validate', function(next) {
  if (this.departureDate <= this.arrivalDate) {
    return next(new Error("OCL Violation (ticketDateConsistency): Departure date must be after arrival date."));
  }
  if (this.money <= 0) {
    return next(new Error("OCL Violation (ticketMoneyPositive): Ticket amount must be positive."));
  }
  next();
});

// Static method for manual validation as requested in the prompt
ticketSchema.statics.validateAll = function(data) {
  if (data.departureDate && data.arrivalDate) {
    const arrival = new Date(data.arrivalDate);
    const departure = new Date(data.departureDate);
    if (departure <= arrival) {
      throw new Error("OCL Violation (ticketDateConsistency): Departure date must be after arrival date.");
    }
  }
  if (data.money !== undefined && data.money <= 0) {
    throw new Error("OCL Violation (ticketMoneyPositive): Ticket amount must be positive.");
  }
};

const ticketModel = db.model('Ticket', ticketSchema, 'ticket');

module.exports = ticketModel;
