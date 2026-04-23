const AuthService = require('../services/auth.service');
const UserService = require('../services/user.services');
const UserModel = require('../model/user.model');
const { ObjectId } = require('mongodb');

exports.register = async (req, res) => {
  try {
    await AuthService.register(req.body);
    res.json({ status: true, success: "Un email de vérification a été envoyé." });
  } catch (error) {
    const status = error.message === 'Email already exists' ? 409 : 500;
    res.status(status).json({ message: error.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    AuthService.verifyEmailToken(req.query.token);
    res.redirect('/login');
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await AuthService.login(req.body);
    res.status(200).json({ status: true, token: result.token });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    await UserService.resetPassword(email, newPassword);
    res.status(200).json({ status: true, message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { email, username, newEmail, newPassword, numtel } = req.body;
    const newData = {};
    if (username) newData.username = username;
    if (newEmail) newData.email = newEmail;
    if (newPassword) newData.password = newPassword;
    if (numtel) newData.numtel = numtel;

    await UserService.updateUser(email, newData);
    res.status(200).json({ status: true, message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    await UserService.deleteByEmail(req.body.email);
    res.status(200).json({ status: true, message: "Account deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.uploadImage = (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
  res.status(200).json({ imageUrl: req.file.path });
};

exports.addVehicle = async (req, res) => {
  try {
    const { userId, type, num } = req.body;
    const result = await UserService.addVehicle(userId, type, num);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserVehicles = async (req, res) => {
  try {
    const user = await UserModel.findById(req.query.userId).populate('vehicles');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ vehicles: user.vehicles });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    await UserService.deleteVehicle(req.query.userId, req.query.num);
    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.list = async (req, res) => {
  try {
    const users = await UserModel.find({}).exec();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.delete = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.userId))
      return res.status(400).send(`No record with given id: ${req.params.userId}`);
    const deleted = await UserModel.findOneAndDelete({ _id: req.params.userId });
    if (!deleted) return res.status(404).send('User not found');
    res.json(deleted);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.addCreditCard = async (req, res) => {
  try {
    const { userId, cardHolder, cardNumber, cardExpiry, cardCVC } = req.body;
    const result = await UserService.addCreditCard(userId, cardHolder, cardNumber, cardExpiry, cardCVC);
    res.status(201).json(result);
  } catch (error) {
    const status = error.message.includes('required') || 
                   error.message.includes('Invalid') ? 400 : 500;
    res.status(status).json({ message: error.message });
  }
};

exports.getUserCreditCard = async (req, res) => {
  try {
    const user = await UserModel.findById(req.query.userId).populate('payment');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ payment: user.payment });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteCreditCard = async (req, res) => {
  try {
    await UserService.deleteCreditCard(req.query.userId, req.query.cardNumber);
    res.status(200).json({ message: 'Credit Card deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getUserCount = async (req, res) => {
  try {
    const userCount = await UserModel.countDocuments();
    res.status(200).json({ userCount });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};