const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const Schema = mongoose.Schema;

const licenseSchema = new Schema({
  name: {
    type:String,
    required:true
  },
  type: {
    type:String,
    required:true
  },
  user: {
    type:String,
    enum: ['Admin', 'Supervisor'],
    required:true
  },
  price: {
    type:Number,
    min: [1, 'Le prix doit être strictement positif'],
    required:true
  },
  period: {
    type:String,
    enum: ['mensuel', 'annuel', 'monthly', 'yearly'],
    required:true
  },
  description: {
    type:String,
    required:true
  },
});

const License = db.model('License', licenseSchema);

module.exports = License;
