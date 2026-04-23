const mongoose = require('mongoose');
const UserModel = require('./user.model');
const { Schema } = mongoose;

const superAdminSchema = new Schema({});

// Application du Principe de Substitution de Liskov (LSP)
// Superadmin est un sous-type pur de User sans champs additionnels
const SuperAdminModel = UserModel.discriminator('Superadmin', superAdminSchema);

module.exports = SuperAdminModel;