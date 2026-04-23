const Parking = require('../model/parking.model');
const ParkingBuilder = require('./ParkingBuilder');
const SupervisorModel = require('../model/supervisor');
const jwt = require('jsonwebtoken');
const Admin = require('../model/admin');

class SupervisorService {
  static async findSupervisorByEmail(email) {
    try {
      return await SupervisorModel.findOne({ email });
    } catch (error) {
      throw error;
    }
  }

  static async checkSupervisor(email) {
    try {
      return await SupervisorModel.findOne({ email });
    } catch (error) {
      throw error;
    }
  }

  static async generateToken(tokenData, secretKey, jwtExpire) {
    return jwt.sign(tokenData, secretKey, { expiresIn: jwtExpire });
  }

  static async findSupervisorById(supervisorId) {
    try {
      return await SupervisorModel.findById(supervisorId);
    } catch (error) {
      throw error;
    }
  }

  static async addParking(userId, name, longitude, latitude, admin, pricing, floors, description, imageUrl) {
    try {
      const supervisor = await SupervisorModel.findById(userId);

      if (!supervisor) {
        throw new Error('Supervisor not found');
      }

      const newParking = new ParkingBuilder()
        .setName(name)
        .setLocation(longitude, latitude)
        .setAdmin(admin)
        .setSupervisor(userId)
        .setPricing(pricing)
        .setFloors(floors)
        .setDescription(description)
        .setImageUrl(imageUrl)
        .build();

      const savedParking = await newParking.save();

      return {
        message: 'Parking added successfully',
        parkingId: savedParking._id
      };
    } catch (error) {
      throw error;
    }
  }

  static async addAdmin(supervisorId, email, password) {
    try {
      console.log('Supervisor ID:', supervisorId);
      const supervisor = await SupervisorModel.findById(supervisorId);
      
      if (!supervisor) {
        throw new Error('Supervisor not found');
      }

      const admin = new Admin({
        email,
        password,
        supervisor: supervisorId,
      });

      const savedAdmin = await admin.save();
      
      return { 
        message: 'Admin added successfully',
        email: savedAdmin.email
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = SupervisorService;
