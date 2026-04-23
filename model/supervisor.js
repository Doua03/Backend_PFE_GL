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

// Application du Principe de Substitution de Liskov (LSP)
// Supervisor est un sous-type de User
const SupervisorModel = UserModel.discriminator('Supervisor', supervisorSchema);

module.exports = SupervisorModel;