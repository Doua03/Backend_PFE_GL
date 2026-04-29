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

module.exports = function applyParkingConstraints(parkingSchema) {
  // Virtual property to calculate total places
  parkingSchema.virtual('totalPlaces').get(function() {
    return this.floors ? this.floors.reduce((total, floor) => total + (floor.places ? floor.places.length : 0), 0) : 0;
  });

  // Include virtuals in JSON output
  parkingSchema.set('toJSON', { virtuals: true });

  /**
   * OCL Constraint: occupiedPlacesCount + reservedPlacesCount <= totalPlaces
   * Validates before saving to ensure data integrity
   */
  parkingSchema.pre('validate', function(next) {
    const total = this.totalPlaces;
    const occupied = this.occupiedPlacesCount || 0;
    const reserved = this.reservedPlacesCount || 0;

    if (occupied + reserved > total) {
      const error = new Error(
        `OCL Constraint Violation (occupiedAndReservedNotExceedTotal): ` +
        `occupiedPlacesCount (${occupied}) + reservedPlacesCount (${reserved}) ` +
        `exceeds totalPlaces (${total})`
      );
      next(error);
    } else {
      next();
    }
  });

  /**
   * Helper method to check constraint validity
   * Can be used for pre-save validations
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
