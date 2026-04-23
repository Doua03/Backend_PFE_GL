const UserService = require("../services/user.services");
const UserModel = require('../model/user.model');

exports.addVehicle = async (req, res) => {
  try {
    const { userId, type, num } = req.body;
    const result = await UserService.addVehicle(userId, type, num);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserVehicles = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await UserModel.findById(userId).populate('vehicles');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ vehicles: user.vehicles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const { userId, num } = req.query;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const vehicleIndex = user.vehicles.findIndex(v => v.num === num);
    if (vehicleIndex === -1) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    user.vehicles.splice(vehicleIndex, 1);
    await user.save();
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};