const mongoose = require('mongoose');
const parkingSubject = require('../services/parkingObserver');
const db = require('../config/db');
const Schema = mongoose.Schema;

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

const Parking = db.model('Parking', parkingSchema);

// Mettre à jour les compteurs après chaque modification de place de parking
parkingPlaceSchema.post('save', async function(doc) {
  try {
    // Find the parent parking document
    // this.parent() is the floor, this.parent().parent() is the parking
    // The previous code used .parent().parent().parent() which might have been due to some specific nesting or error
    // Let's adjust it to be more robust or follow the working pattern.
    
    // In Mongoose subdocuments, this.parent() usually gives the parent doc.
    // floor is a subdoc in parking. floors is an array.
    let parking;
    try {
      const parkingId = this.parent().parent()._id;
      parking = await Parking.findById(parkingId);
    } catch (e) {
      // Fallback if nesting is different
      const parkingId = this.parent().parent().parent()._id;
      parking = await Parking.findById(parkingId);
    }
    
    if (parking) {
      await parkingSubject.notify(parking);
    }
  } catch (error) {
    console.error('Error in parkingPlaceSchema post-save observer notify:', error);
  }
});





module.exports = Parking;
