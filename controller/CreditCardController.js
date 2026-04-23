const UserService = require("../services/user.services");
const UserModel = require('../model/user.model');

exports.addCreditCard = async (req, res) => {
  try {
    const { userId, cardHolder, cardNumber, cardExpiry, cardCVC } = req.body;
    if (!userId || !cardHolder || !cardNumber || !cardExpiry || !cardCVC) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const expiryRegex = /^\d{2}\/\d{2}$/;
    if (!expiryRegex.test(cardExpiry)) {
      return res.status(400).json({ message: "Invalid card expiration date format. Please use MM/YY" });
    }
    const result = await UserService.addPayment(userId, cardHolder, cardNumber, cardExpiry, cardCVC);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserCreditCard = async (req, res) => {
  try {
    const { userId } = req.query;
    const user = await UserModel.findById(userId).populate('payment');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ payment: user.payment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteCreditCard = async (req, res) => {
  try {
    const { userId, cardNumber } = req.query;
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const cardIndex = user.payment.findIndex(c => c.cardNumber === cardNumber);
    if (cardIndex === -1) {
      return res.status(404).json({ message: 'Credit Card not found' });
    }
    user.payment.splice(cardIndex, 1);
    await user.save();
    res.status(200).json({ message: 'Credit Card deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};