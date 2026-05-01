const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const db = require('../config/db');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
   // Add license attribute
   license: {
    type: {
      type: String,
      default: ''
    },
    period: {
      type: String,
      enum: {
        values: ['monthly', 'yearly', 'mensuel', 'annuel', null],
        message: 'La période de la licence est invalide'
      },
      default: null
    },
    price: {
      type: Number,
      default: 0,
      validate: {
        validator: function(v) {
          if (this.license && this.license.type && this.license.type !== '') {
            return v > 0;
          }
          return v >= 0;
        },
        message: 'Le prix doit être strictement positif'
      }
    }
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
  supervisor: {
    type: Schema.Types.ObjectId,
    ref: 'Supervisor',
    required: true,
  },
  session: {
      type: String,
      enum: ['Superadmin', 'Supervisor', 'Admin'],
      default: 'Admin'
  },
  name: {
    type: String,
    default:''
},
telephone: {
  type: Number,
  default:''

},
entreprise: {
  type: String,
  default:''

},
postcode: {
  type: Number,
  default:''

},
job: {
  type: String,
  default:''

},
});

adminSchema.pre('save', async function(next) {
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

adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
      return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
      return false;
  }
};

const adminModel = db.model('Admin', adminSchema, 'admin');

module.exports = adminModel;