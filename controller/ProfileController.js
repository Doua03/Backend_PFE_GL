const UserModel = require('../model/user.model');
const path = require('path');
const { ObjectId } = require('mongodb');

exports.updateUser = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const { username, newEmail, newPassword, numtel } = req.body;
    const newData = {};
    if (username)   newData.username = username;
    if (newEmail)   newData.email    = newEmail;
    if (newPassword) newData.password = newPassword;
    if (numtel)     newData.numtel   = numtel;
    const success = await user.updateUser(newData);
    if (success) {
      res.status(200).json({ status: true, message: "User information updated successfully" });
    } else {
      res.status(500).json({ message: "Failed to update user information" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await UserModel.deleteOne({ email });
    res.status(200).json({ status: true, message: "User account deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.uploadImage = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image uploaded' });
  }
  res.status(200).json({ imageUrl: req.file.path });
};

exports.list = async (req, res) => {
  try {
    const users = await UserModel.find({}).exec();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.delete = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.userId))
      return res.status(400).send(`No record with given id : ${req.params.userId}`);
    const deletedUser = await UserModel.findOneAndDelete({ _id: req.params.userId });
    if (!deletedUser) {
      return res.status(404).send(`User not found with ID: ${req.params.userId}`);
    }
    res.json(deletedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getUserCount = async (req, res) => {
  try {
    const userCount = await UserModel.countDocuments();
    res.status(200).json({ userCount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};