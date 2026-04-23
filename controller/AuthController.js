const UserService = require("../services/user.services");
const UserModel = require('../model/user.model');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'bouazzadoua03@gmail.com',
    pass: 'wvio qrbh wymt lcgj'
  }
});

const sendVerificationEmail = async (toEmail, verificationLink) => {
  const mailOptions = {
    from: 'benameur808@gmail.com',
    to: toEmail,
    subject: 'Veuillez vérifier votre e-mail',
    html: `<p>Cliquez sur le lien suivant pour vérifier votre e-mail :</p><p><a href="${verificationLink}">${verificationLink}</a></p>`
  };
  await transporter.sendMail(mailOptions);
};

exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(409).send('Email already exists');
    }
    const verificationToken = jwt.sign({ email }, 'verificationSecret', { expiresIn: '1d' });
    const verificationLink = `${'http://192.168.207.75:3000'}/verify-email?token=${verificationToken}`;
    await sendVerificationEmail(email, verificationLink);
    await UserService.registerUser(username, email, password);
    res.json({ status: true, success: "Un email de vérification a été envoyé. Veuillez vérifier votre boîte de réception." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ message: 'Invalid token' });
    }
    jwt.verify(token, 'verificationSecret');
    res.redirect('/login');
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await UserService.checkuser(email);
    if (!user) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }
    const tokenData = { _id: user._id, email: user.email, username: user.username };
    const token = await UserService.generateToken(tokenData, "secretKey", '1h');
    res.status(200).json({ status: true, token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    const user = await UserModel.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();
    res.status(200).json({ status: true, message: "Password reset successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};