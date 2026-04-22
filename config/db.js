'use strict';
const mongoose = require('mongoose');
require('dotenv').config();

class DatabaseConnection {

  static #instance = null;
  #connection = null;

  constructor() {
    if (DatabaseConnection.#instance) {
      throw new Error(
        '[Singleton] Instanciation directe interdite. ' +
        'Utilisez DatabaseConnection.getInstance()'
      );
    }
  }

  static getInstance() {
    if (!DatabaseConnection.#instance) {
      DatabaseConnection.#instance = new DatabaseConnection();
      DatabaseConnection.#instance._connect();
    }
    return DatabaseConnection.#instance;
  }

  _connect() {
    const MONGO_URI =
      process.env.MONGO_URI ||
      'mongodb://bouazzadoua03:projetGL@ac-ybo6gbz-shard-00-00.cbpzvnx.mongodb.net:27017,ac-ybo6gbz-shard-00-01.cbpzvnx.mongodb.net:27017,ac-ybo6gbz-shard-00-02.cbpzvnx.mongodb.net:27017/?ssl=true&replicaSet=atlas-zet4eb-shard-0&authSource=admin&appName=Cluster0';

    mongoose.connect(MONGO_URI);

    this.#connection = mongoose.connection;

    this.#connection.on('connected', () => {
      console.log('MongoDB connected successfully');
    });

    this.#connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
    });

    this.#connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
  }

  model(name, schema) {
    return mongoose.model(name, schema);
  }

  getConnection() {
    return this.#connection;
  }
}

module.exports = DatabaseConnection.getInstance();