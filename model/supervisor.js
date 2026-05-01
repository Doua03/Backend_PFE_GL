const mongoose = require('mongoose');
const UserModel = require('./user.model');
const { Schema } = mongoose;

const supervisorSchema = new Schema({
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
  municipality:{
    type:String,
    default:''
  },
  postcode: {
    type:Number,
    default:null
  },
  jobpost:{
    type:String,
    default:''
  },
});

const SupervisorModel = UserModel.discriminator('Supervisor', supervisorSchema);

module.exports = SupervisorModel;