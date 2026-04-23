const jwt = require('jsonwebtoken');

class TokenService {
  static #VERIFICATION_SECRET = 'verificationSecret';
  static #AUTH_SECRET = 'secretKey';
  static #BASE_URL = 'http://192.168.207.75:3000';

  static generateVerificationToken(email) {
    const token = jwt.sign({ email }, this.#VERIFICATION_SECRET, { expiresIn: '1d' });
    return `${this.#BASE_URL}/verify-email?token=${token}`;
  }

  static verifyEmailToken(token) {
    return jwt.verify(token, this.#VERIFICATION_SECRET);
  }

  static generateAuthToken(userData) {
    return jwt.sign(userData, this.#AUTH_SECRET, { expiresIn: '1h' });
  }
}

module.exports = TokenService;