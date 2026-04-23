const UserModel = require('../model/user.model');
const UserService = require('./user.services');
const EmailService = require('./email.service');
const TokenService = require('./token.service');

class AuthService {
  static async register({ username, email, password }) {
    const existingUser = await UserModel.findOne({ email });
    if (existingUser) throw new Error('Email already exists');

    const verificationLink = TokenService.generateVerificationToken(email);
    await EmailService.sendVerification(email, verificationLink);
    await UserService.registerUser(username, email, password);
  }

  static async login({ email, password }) {
    const user = await UserService.checkuser(email);
    if (!user) throw new Error('Email or password is incorrect');

    const isMatch = await user.comparePassword(password);
    if (!isMatch) throw new Error('Email or password is incorrect');

    const token = TokenService.generateAuthToken({
      _id: user._id,
      email: user.email,
      username: user.username
    });

    return { token };
  }

  static verifyEmailToken(token) {
    if (!token) throw new Error('Invalid token');
    return TokenService.verifyEmailToken(token);
  }
}

module.exports = AuthService;