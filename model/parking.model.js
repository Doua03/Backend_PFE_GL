const mongoose = require('mongoose');
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
    const parkingId = this.parent().parent().parent()._id;
    
    const parking = await Parking.findById(parkingId);
    let occupiedCount = 0;
    let reservedCount = 0;
    
    for (const floor of parking.floors) {
      for (const place of floor.places) {
        if (place.status === false) {
          occupiedCount++;
        } else {
          reservedCount++;
        }
      }
    }

    parking.occupiedPlacesCount = occupiedCount;
    parking.reservedPlacesCount = reservedCount;

    await parking.save();
  } catch (error) {
    console.error('Error updating parking counters:', error);
  }
});





module.exports = Parking;
