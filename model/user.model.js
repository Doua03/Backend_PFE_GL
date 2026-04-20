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
  numtel:{
    type:Number,
    default:""  
  },
  profilePhoto:{
    type:String,
    default:""
  },
  vehicles:[vehicleSchema],
  payment:[paymentSchema],
},{timestamps:true});

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
    const isMatch = await bcrypt.compare(userPassword, this.password);
    return isMatch;
  } catch (error) {
    return false;
  }
}

userSchema.methods.updateUser = async function(newData) {
  try {
    // Mettre à jour les champs modifiables uniquement
    if (newData.username) this.username = newData.username;
    if (newData.email) this.email = newData.email;
    if (newData.password) {
      const salt = await bcrypt.genSalt(10);
      const hashpass = await bcrypt.hash(newData.password, salt);
      this.password = hashpass;
    }
    if (newData.numtel) this.numtel = newData.numtel;

    // Enregistrer les modifications dans la base de données
    await this.save();
    return true;
  } catch (error) {
    return false;
  }
}

const UserModel = db.model('user', userSchema);
module.exports = UserModel;
