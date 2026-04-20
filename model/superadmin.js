const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const Schema = mongoose.Schema;

const superAdminSchema = new Schema({
  email: {
      type: String,
      required: true,
      unique: true
  },
  password: {
      type: String,
      required: true
  },
  session: {
      type: String,
      enum: ['Superadmin', 'Supervisor', 'Admin'],
      default: 'Superadmin'
  },
});

superAdminSchema.pre('save', async function(next) {
  try {
      if (!this.isModified('password')) {
          return next();
      }
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(this.password, salt);
      this.password = hash;
      next();
  } catch (error) {
      next(error);
  }
});

superAdminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
      return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
      return false;
  }
};

const sAdminModel = db.model('Superadmin', superAdminSchema, 'sadmin');

module.exports = sAdminModel;