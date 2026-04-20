console.log('Starting script execution...');

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const db = require('./config/db');
const sAdminModel = require('./model/superadmin'); 

// Define the email and password for the super admin user
const superAdminData = {
  email: 'superadmin1@example.com',
  password: 'superadminpassword',
  session: 'Superadmin'
};

// Create a new instance of the super admin model with the provided data
console.log('Creating super admin instance...');
const superAdmin = new sAdminModel(superAdminData);

// Save the super admin data to the database
console.log('Saving super admin data to the database...');
superAdmin.save()
  .then(savedSuperAdmin => {
    console.log('Super admin data saved successfully:', savedSuperAdmin);
    mongoose.disconnect(); // Disconnect from the database after saving
  })
  .catch(error => {
    console.error('Error saving super admin data:', error);
    mongoose.disconnect(); // Disconnect from the database in case of error
  });
