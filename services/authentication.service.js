const UserService = require("./user.services");
const jwt = require("jsonwebtoken");

/**
 * Interface AuthenticationService - Responsabilité unique : Authentification
 * Principe ISP : Cette interface ne contient QUE les méthodes d'authentification
 * Le contrôleur dépend uniquement de ce qu'il utilise réellement
 */
class AuthenticationService {
  async login(email, password) {
    try {
      const user = await UserService.checkuser(email);
      if (!user) {
        throw new Error("Email or password is incorrect");
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        throw new Error("Email or password is incorrect");
      }

      const tokenData = {
        _id: user._id,
        email: user.email,
        username: user.username,
      };
      const token = await UserService.generateToken(
        tokenData,
        "secretKey",
        "1h",
      );

      return { status: true, token: token };
    } catch (error) {
      throw error;
    }
  }

  async verifyEmailToken(token, secret = "verificationSecret") {
    try {
      const decodedToken = jwt.verify(token, secret);
      return decodedToken;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  generateVerificationToken(
    email,
    secret = "verificationSecret",
    expiresIn = "1d",
  ) {
    try {
      const token = jwt.sign({ email }, secret, { expiresIn });
      return token;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new AuthenticationService();
