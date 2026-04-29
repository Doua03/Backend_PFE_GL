/**
 * OCL Constraints Entry Point
 * 
 * This module centralizes all OCL (Object Constraint Language) constraints
 * for the parking management system.
 * 
 * Usage:
 *   const { applyParkingConstraints } = require('../constraints/ocl.constraints');
 *   applyParkingConstraints(parkingSchema);
 */

const applyParkingConstraints = require('./parking.constraints');

module.exports = {
  applyParkingConstraints,
  // Other constraints can be added here as the project grows
  // applyUserConstraints,
  // applyLicenseConstraints,
  // etc.
};
