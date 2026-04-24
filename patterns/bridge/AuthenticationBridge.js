/**
 * Bridge Pattern (Pont) - Authentication Bridge
 *
 * Objectif: Découpler l'abstraction (SuperAdmin Login) de son implémentation
 * (JWT vs Session-based authentication)
 *
 * Référence: Gang of Four - Bridge Pattern
 * Appliqué au: SuperAdminController (method: loginsa)
 */

/**
 * Abstraction - Représente la logique métier du login
 */
class SuperAdminAuthenticator {
  constructor(authImplementation) {
    this.authImpl = authImplementation;
  }

  async authenticate(credentials) {
    // Validation commune
    if (!credentials.email || !credentials.password || !credentials.userType) {
      throw new Error("Email, password, and userType are required");
    }

    // Délègue à l'implémentation concrète
    return await this.authImpl.performAuthentication(credentials);
  }

  // Change l'implémentation à la volée si besoin
  setImplementation(newImpl) {
    this.authImpl = newImpl;
  }
}

/**
 * Implémentation concrète 1: JWT Authentication
 */
class JWTAuthImplementation {
  constructor(config) {
    this.config = config;
  }

  async performAuthentication(credentials) {
    // Logique JWT
    const jwt = require("jsonwebtoken");
    const SuperAdminModel = require("../../model/superadmin");
    const bcrypt = require("bcrypt");

    const user = await SuperAdminModel.findOne({ email: credentials.email });
    if (!user || user.session !== credentials.userType) {
      throw new Error("User not found or invalid userType");
    }

    const isPasswordMatch = await bcrypt.compare(
      credentials.password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new Error("Invalid password");
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email },
      this.config.secretKey,
      { expiresIn: "1h" },
    );

    return { status: true, token, method: "JWT" };
  }
}

/**
 * Implémentation concrète 2: Session-based Authentication
 */
class SessionAuthImplementation {
  constructor(config) {
    this.config = config;
  }

  async performAuthentication(credentials) {
    // Logique Session-based
    const SuperAdminModel = require("../../model/superadmin");
    const bcrypt = require("bcrypt");

    const user = await SuperAdminModel.findOne({ email: credentials.email });
    if (!user || user.session !== credentials.userType) {
      throw new Error("User not found or invalid userType");
    }

    const isPasswordMatch = await bcrypt.compare(
      credentials.password,
      user.password,
    );
    if (!isPasswordMatch) {
      throw new Error("Invalid password");
    }

    return {
      status: true,
      sessionId: user._id.toString(),
      method: "SESSION",
      expiresIn: "1h",
    };
  }
}

module.exports = {
  SuperAdminAuthenticator,
  JWTAuthImplementation,
  SessionAuthImplementation,
};
