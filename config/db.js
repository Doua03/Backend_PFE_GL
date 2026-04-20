const mongoose = require('mongoose');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://bouazzadoua03:projetGL@ac-ybo6gbz-shard-00-00.cbpzvnx.mongodb.net:27017,ac-ybo6gbz-shard-00-01.cbpzvnx.mongodb.net:27017,ac-ybo6gbz-shard-00-02.cbpzvnx.mongodb.net:27017/?ssl=true&replicaSet=atlas-zet4eb-shard-0&authSource=admin&appName=Cluster0';

mongoose.connect(MONGO_URI);

const db = mongoose.connection;

db.on('connected', () => {
  console.log('MongoDB connected successfully');
});

db.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

db.on('disconnected', () => {
  console.log('MongoDB disconnected');
});

module.exports = mongoose;