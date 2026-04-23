const UserService = require("../services/user.services");
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const userRepository = require('../repositories/user.repository');
const parkingRepository = require('../repositories/parking.repository'); // Using parkingRepository for DIP

const path = require('path');
const config = require('../config/config');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { ObjectId } = require('mongodb');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bouazzadoua03@gmail.com',
    pass: 'wvio qrbh wymt lcgj'
  }
});
exports.register = async(req,res,next)=>{
  try{
    const {username,email,password} = req.body;
    const verificationToken = jwt.sign({ email }, 'verificationSecret', { expiresIn: '1d' });
    const verificationLink = `${'http://192.168.207.75:3000'}/verify-email?token=${verificationToken}`;
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      return res.status(409).send('Email already exists');
    }

    await sendVerificationEmail(email, verificationLink);
    const successRes = await UserService.registerUser(username,email,password);
    res.json({status:true,success:"Un email de vérification a été envoyé. Veuillez vérifier votre boîte de réception."});
  } catch(error){
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
    

  }
}
exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    const decodedToken = jwt.verify(token, 'verificationSecret');
    const { email } = decodedToken;

    // Ici, tu peux ajouter le code pour marquer l'e-mail de l'utilisateur comme vérifié dans ta base de données

    // Une fois l'e-mail de l'utilisateur vérifié, tu peux rediriger l'utilisateur vers une page de connexion
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const sendVerificationEmail = async (toEmail, verificationLink) => {
  try {
    const mailOptions = {
      from: 'benameur808@gmail.com',
      to: toEmail,
      subject: 'Veuillez vérifier votre e-mail',
      html: `<p>Cliquez sur le lien suivant pour vérifier votre e-mail :</p><p><a href="${verificationLink}">${verificationLink}</a></p>`
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent');
  } catch (error) {
    console.error('Error sending verification email:', error);
  }
};
exports.login = async(req,res,next)=>{
  try{
    const {email,password} = req.body;
    const user = await UserService.checkuser(email);
    console.log("............user..........",user);
    if(!user){
      return res.status(401).json({ message: "Email or password is incorrect" });
    }
    const isMatch = await user.comparePassword(password);
    if(!isMatch){
      return res.status(401).json({ message: "Email or password is incorrect" });
    }
    let tokenData = { _id: user._id, email: user.email, username: user.username };
    const token = await UserService.generateToken(tokenData, "secretKey", '1h');
    res.status(200).json({ status: true, token: token });
  } catch(error){
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    // Vérifier si le nouveau mot de passe est valide
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    // Générer un sel pour le hachage du mot de passe
    const salt = await bcrypt.genSalt(10);

    // Hasher le nouveau mot de passe avec le sel généré
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Mettre à jour le mot de passe dans la base de données
    user.password = hashedPassword;
    await user.save();

    res.status(200).json({ status: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    // Extraire les nouvelles données à partir du corps de la requête
    const { username, newEmail, newPassword, numtel } = req.body;

    // Créer un objet contenant les données à mettre à jour
    const newData = {};
    if (username) newData.username = username;
    if (newEmail) newData.email = newEmail;
    if (newPassword) newData.password = newPassword;
    if (numtel) newData.numtel = numtel;

    // Mettre à jour les informations utilisateur
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

    // Vérifier si l'utilisateur existe
    const user = await userRepository.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    // Supprimer l'utilisateur de la base de données
    await userRepository.delete(user._id);


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
  const imageUrl = req.file.path;
  res.status(200).json({ imageUrl });
};

exports.addVehicle = async (req, res) => {
  try {
    const { userId, type, num } = req.body;
    console.log("Request body:", req.body);
    const result = await UserService.addVehicle(userId, type, num);
    console.log("Add vehicle result:", result);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserVehicles = async (req, res) => {
  try {
    const { userId } = req.query; // Assurez-vous que l'ID de l'utilisateur est correctement extrait de la requête
    const user = await userRepository.findById(userId); // Population handled in model or repository


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
    const { userId, num } = req.query; // Utiliser req.query pour obtenir les paramètres de l'URL

    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    const vehicleIndex = user.vehicles.findIndex(vehicle => vehicle.num === num);
    if (vehicleIndex === -1) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    user.vehicles.splice(vehicleIndex, 1); // Supprimer le véhicule du tableau des véhicules de l'utilisateur
    await user.save();

    res.status(200).json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
  try {
      const user = await userRepository.findAll();
      res.json(user);

  } catch (error) {
      console.error("Error while fetching admins:", error);
      res.status(500).json({ error: "Internal server error" });
  }
};
exports.delete = async (req, res) => {
  try {
      if (!ObjectId.isValid(req.params.userId))
          return res.status(400).send(`No record with given id : ${req.params.userId}`);

      const deletedUser = await userRepository.delete(req.params.userId);
      if (!deletedUser) {
          return res.status(404).send(`User not found with ID: ${req.params.userId}`);
      }
      res.json(deletedUser);

  } catch (error) {
      console.error("Error while deleting user:", error);
      res.status(500).json({ error: "Internal server error" });
  }
};

exports.addCreditCard = async (req, res) => {
  try {
    const { userId, cardHolder, cardNumber, cardExpiry, cardCVC } = req.body;

    // Check if any field is empty or null
    if (!userId || !cardHolder || !cardNumber || !cardExpiry || !cardCVC) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if cardExpiry has MM/YY format
    const expiryRegex = /^\d{2}\/\d{2}$/;
    if (!expiryRegex.test(cardExpiry)) {
      return res.status(400).json({ message: "Invalid card expiration date format. Please use MM/YY" });
    }

    console.log("Request body:", req.body);
    const result = await UserService.addPayment(userId, cardHolder, cardNumber, cardExpiry, cardCVC);
    console.log("Add Credit Card data:", result);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserCreditCard = async (req, res) => {
  try {
    const { userId } = req.query; // Assurez-vous que l'ID de l'utilisateur est correctement extrait de la requête
    const user = await userRepository.findById(userId);


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
    const { userId, cardNumber } = req.query; // Utiliser req.query pour obtenir les paramètres de l'URL

    const user = await userRepository.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }


    const cardIndex = user.payment.findIndex(card => card.cardNumber === cardNumber);
    if (cardIndex === -1) {
      return res.status(404).json({ message: 'Credit Card not found' });
    }

    user.payment.splice(cardIndex, 1); // Supprimer le véhicule du tableau des véhicules de l'utilisateur
    await user.save();

    res.status(200).json({ message: 'Credit Card deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }};
  exports.getUserCount = async (req, res) => {
    try {
    const userCount = await userRepository.count();

      res.status(200).json({ userCount });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };