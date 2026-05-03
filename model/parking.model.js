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

// OCL Constraint for Doua Bouazza
// occupiedAndReservedNotExceedTotal: self.occupiedPlacesCount + self.reservedPlacesCount <= self.floors->collect(f | f.places)->size()
parkingSchema.pre('validate', function(next) {
  let totalPhysicalPlaces = 0;
  if (this.floors && this.floors.length > 0) {
    this.floors.forEach(floor => {
      if (floor.places) {
        totalPhysicalPlaces += floor.places.length;
      }
    });
  }

  const occupied = this.occupiedPlacesCount || 0;
  const reserved = this.reservedPlacesCount || 0;

  if (occupied + reserved > totalPhysicalPlaces) {
    return next(new Error(`OCL Violation (occupiedAndReservedNotExceedTotal): Total occupied and reserved places (${occupied + reserved}) exceeds physical capacity (${totalPhysicalPlaces}).`));
  }
  next();
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
