const mongoose = require('mongoose');
const UserModel = require('./user.model');
const { Schema } = mongoose;

const adminSchema = new Schema({
  license: {
    type: {
      type: String,
      default: ''
    },
    period: {
      type: String,
      default: null
    },
    price: {
      type: Number,
      default: 0
    },
  },
  supervisor: {
    type: Schema.Types.ObjectId,
    ref: 'Supervisor',
    required: true,
  },
  entreprise: {
    type: String,
    default: ''
  },
  postcode: {
    type: Number,
    default: null
  },
  job: {
    type: String,
    default: ''
  },
});

// Utilisation du Principe de Substitution de Liskov (LSP)
// Admin est un sous-type de User, il hérite de ses méthodes (comparePassword, etc.)
const AdminModel = UserModel.discriminator('Admin', adminSchema);

module.exports = AdminModel;