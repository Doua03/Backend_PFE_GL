# OCL Constraints Documentation

This directory contains all Object Constraint Language (OCL) constraints for the Parking Management System.

## Overview

OCL constraints are business rules that ensure data integrity and consistency across the system. All constraints are automatically applied to their respective Mongoose schemas.

## Current Constraints

### 1. Parking Constraints (`parking.constraints.js`)

#### Constraint: `occupiedAndReservedNotExceedTotal`

**OCL Notation:**
```ocl
context Parking
inv occupiedAndReservedNotExceedTotal:
  occupiedPlacesCount + reservedPlacesCount <= floors->collect(f | f.places)->size()
```

**Description:**
The total number of occupied and reserved parking places must not exceed the total number of available places across all floors.

**Implementation Details:**
- **Virtual Property:** `totalPlaces` - Calculates total places from all floors
- **Pre-validation Hook:** Checks constraint before saving to database
- **Helper Methods:**
  - `isConstraintValid()` - Returns boolean indicating if constraint is satisfied
  - `getConstraintDetails()` - Returns detailed constraint information including available places

**Example Usage:**
```javascript
// Check if constraint is valid
const isValid = parking.isConstraintValid();

// Get constraint details
const details = parking.getConstraintDetails();
// Returns:
// {
//   totalPlaces: 100,
//   occupiedPlacesCount: 45,
//   reservedPlacesCount: 30,
//   availablePlaces: 25,
//   isValid: true
// }
```

## Adding New Constraints

To add constraints for other models:

1. Create a new file: `model.constraints.js` (e.g., `user.constraints.js`)
2. Export a function that applies constraints to the schema
3. Add the export to `ocl.constraints.js`
4. Import and apply in the respective model file

Example:
```javascript
// constraints/user.constraints.js
module.exports = function applyUserConstraints(userSchema) {
  // Define constraints here
};

// constraints/ocl.constraints.js
const applyUserConstraints = require('./user.constraints');
module.exports = {
  applyParkingConstraints,
  applyUserConstraints,
};

// model/user.model.js
const { applyUserConstraints } = require('../constraints/ocl.constraints');
applyUserConstraints(userSchema);
```

## Testing Constraints

Constraints are automatically validated when:
- Creating a new document
- Updating an existing document
- Calling `save()` or `updateOne()`, `updateMany()`, etc.

If a constraint is violated, a validation error is thrown with a descriptive message.

## File Structure

```
constraints/
├── ocl.constraints.js        (Entry point for all OCL constraints)
├── parking.constraints.js    (Parking model constraints)
└── README.md                 (This file)
```
