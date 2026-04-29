/**
 * OCL Constraints for Parking Model
 *
 * OCL Constraint 1:
 * context Parking
 * inv occupiedAndReservedNotExceedTotal:
 *   occupiedPlacesCount + reservedPlacesCount <= floors->collect(f | f.places)->size()
 *
 * This constraint ensures that the total number of occupied and reserved parking places
 * does not exceed the total available places in all floors.
 */

/**
 * Helper: vérifie la contrainte OCL sur un objet contenant les champs du parking.
 * Utilisé à la fois par le hook pre('validate') et par le hook pre('findOneAndUpdate').
 */
function checkOccupiedReservedConstraint(occupiedPlacesCount, reservedPlacesCount, totalPlaces) {
  const occupied = occupiedPlacesCount || 0;
  const reserved = reservedPlacesCount || 0;
  if (occupied + reserved > totalPlaces) {
    return new Error(
      `OCL Constraint Violation (occupiedAndReservedNotExceedTotal): ` +
      `occupiedPlacesCount (${occupied}) + reservedPlacesCount (${reserved}) ` +
      `exceeds totalPlaces (${totalPlaces})`
    );
  }
  return null;
}

module.exports = function applyParkingConstraints(parkingSchema) {
  // Virtual property to calculate total places
  parkingSchema.virtual('totalPlaces').get(function() {
    return this.floors
      ? this.floors.reduce((total, floor) => total + (floor.places ? floor.places.length : 0), 0)
      : 0;
  });

  // Include virtuals in JSON output
  parkingSchema.set('toJSON', { virtuals: true });

  /**
   * OCL Constraint — hook pre('validate') :
   * Couvre save() / create()
   */
  parkingSchema.pre('validate', function(next) {
    const error = checkOccupiedReservedConstraint(
      this.occupiedPlacesCount,
      this.reservedPlacesCount,
      this.totalPlaces
    );
    next(error || undefined);
  });

  /**
   * OCL Constraint — hook pre('findOneAndUpdate') :
   * Couvre findByIdAndUpdate() / findOneAndUpdate()
   * Récupère le document courant puis applique les nouvelles valeurs avant de vérifier.
   */
  parkingSchema.pre('findOneAndUpdate', async function(next) {
    try {
      const update = this.getUpdate();
      const docToUpdate = await this.model.findOne(this.getQuery());
      if (!docToUpdate) return next();

      // Calcul du totalPlaces sur le document existant (les floors ne changent pas ici)
      const totalPlaces = docToUpdate.floors
        ? docToUpdate.floors.reduce((total, floor) => total + (floor.places ? floor.places.length : 0), 0)
        : 0;

      // Nouvelles valeurs après mise à jour (fallback sur les valeurs actuelles)
      const newOccupied = update.$set && update.$set.occupiedPlacesCount !== undefined
        ? update.$set.occupiedPlacesCount
        : (update.occupiedPlacesCount !== undefined ? update.occupiedPlacesCount : docToUpdate.occupiedPlacesCount);

      const newReserved = update.$set && update.$set.reservedPlacesCount !== undefined
        ? update.$set.reservedPlacesCount
        : (update.reservedPlacesCount !== undefined ? update.reservedPlacesCount : docToUpdate.reservedPlacesCount);

      const error = checkOccupiedReservedConstraint(newOccupied, newReserved, totalPlaces);
      next(error || undefined);
    } catch (err) {
      next(err);
    }
  });

  /**
   * Helper method to check constraint validity
   */
  parkingSchema.methods.isConstraintValid = function() {
    const total = this.totalPlaces;
    const occupied = this.occupiedPlacesCount || 0;
    const reserved = this.reservedPlacesCount || 0;
    return (occupied + reserved) <= total;
  };

  /**
   * Helper method to get constraint details
   */
  parkingSchema.methods.getConstraintDetails = function() {
    return {
      totalPlaces: this.totalPlaces,
      occupiedPlacesCount: this.occupiedPlacesCount || 0,
      reservedPlacesCount: this.reservedPlacesCount || 0,
      availablePlaces: this.totalPlaces - ((this.occupiedPlacesCount || 0) + (this.reservedPlacesCount || 0)),
      isValid: this.isConstraintValid()
    };
  };
};
