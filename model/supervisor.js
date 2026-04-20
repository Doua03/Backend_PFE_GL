const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const Schema = mongoose.Schema;

const supervisorSchema = new Schema({
  license: {
    type: {
      type: String,
      default: '' // Add default values or leave it empty initially
    },
    period: {
      type: String,
      default: null // Add default values or leave it null initially
    },
    price: {
      type:Number,
      default: 0
    },
  },
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
      default: 'Supervisor'
  },
  name:{
    type:String,
    default:''
  },
  telephone:{
    type:Number,
    default:''
  },
  municipality:{
    type:String,
    default:''
  },
  postcode: {
    type:Number,
    default:''
  },
  jobpost:{
    type:String,
    default:''
  },
  
});

supervisorSchema.pre('save', async function(next) {
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

supervisorSchema.methods.comparePassword = async function(candidatePassword) {
  try {
      return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
      return false;
  }
};

const supervisorModel = db.model('Supervisor', supervisorSchema, 'supervisor');

module.exports = supervisorModel;