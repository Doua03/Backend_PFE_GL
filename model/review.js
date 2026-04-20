const mongoose = require('mongoose');
const db = require('../config/db');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
  content: String,
  createdAt: { type: Date, default: Date.now }
});

const feedback = db.model('feedback', feedbackSchema, 'feedback' );

module.exports = feedback;
