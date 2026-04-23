const mongoose = require('mongoose');
const bcrypt = require("bcrypt");
const db = require('../config/db');
const { Schema } = mongoose;

const vehicleSchema = new Schema({
  type: {
    type: String,
  },
  num: {
    type: String,
  }
});

const paymentSchema = new Schema({
  cardHolder: {
    type: String,  
  },
  cardNumber: {
    type: String,  
  },
  cardExpiry : {
    type:String
  },
  cardCVC : {
    type:String
  },
});

const userSchema = new Schema({
  username:{
    type:String,
    required:true,
  },
  email: {
    type: String,
    unique:true,
    lowercase: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  session: {
    type: String,
    enum: ['Superadmin', 'Supervisor', 'Admin', 'User'],
    default: 'User'
  },
  numtel:{
    type:Number,
    default:null
  },
  profilePhoto:{
    type:String,
    default:""
  },
  vehicles:[vehicleSchema],
  payment:[paymentSchema],
}, { 
  timestamps: true,
  discriminatorKey: 'session', // Le LSP repose sur cette clé pour identifier les sous-types
  collection: 'users' // Tous les types d'utilisateurs vivront dans cette collection unique
});

userSchema.pre('save', async function(next) {
  try {
    const user = this;
    if (!user.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    const hashpass = await bcrypt.hash(user.password, salt);
    user.password = hashpass;
    next();
  } catch (error) {
    return next(error);
  }
});

userSchema.methods.comparePassword = async function(userPassword) {
  try {
    return await bcrypt.compare(userPassword, this.password);
  } catch (error) {
    return false;
  }
}

userSchema.methods.updateUser = async function(newData) {
  try {
    if (newData.username) this.username = newData.username;
    if (newData.email) this.email = newData.email;
    if (newData.password) {
      const salt = await bcrypt.genSalt(10);
      const hashpass = await bcrypt.hash(newData.password, salt);
      this.password = hashpass;
    }
    if (newData.numtel) this.numtel = newData.numtel;

    await this.save();
    return true;
  } catch (error) {
    return false;
  }
}

const UserModel = db.model('User', userSchema);
module.exports = UserModel;
