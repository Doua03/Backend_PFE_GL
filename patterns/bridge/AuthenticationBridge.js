/**
 * Bridge Pattern - Authentication Bridge
 *
 * PROBLÈME RÉSOLU:
 * Sans Bridge: loginsa() contient la logique JWT en dur.
 *   → Changer vers Session = réécrire loginsa() + tester tout le controller.
 *
 * Avec Bridge:
 *   - Abstraction  (SuperAdminAuthenticator) : logique métier, validation, codes HTTP
 *   - Implémentation (JWTAuth / SessionAuth)  : UNIQUEMENT comment générer le token/session
 *   - Le controller n'importe JAMAIS jwt, bcrypt, ni le model → zéro couplage
 *
 * COMMENT LE BRIDGE EST RÉELLEMENT UTILISÉ:
 *   L'implémentation est choisie DYNAMIQUEMENT dans le controller
 *   selon req.headers["x-auth-method"] (ou n'importe quel autre critère).
 *   Le même authenticator sert les deux cas sans aucune modification.
 *
 * Référence: Gang of Four - Bridge Pattern
 */

// ─────────────────────────────────────────────────────────────────────────────
// Erreurs métier typées → permet à l'abstraction de mapper proprement les HTTP codes
// ─────────────────────────────────────────────────────────────────────────────

class AuthError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.name = "AuthError";
    this.statusCode = statusCode;
  }
}

class ValidationError extends AuthError {
  constructor(message) {
    super(message, 400);
    this.name = "ValidationError";
  }
}

class CredentialsError extends AuthError {
  constructor() {
    super("Incorrect email, password, or user type", 401);
    this.name = "CredentialsError";
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// ABSTRACTION
// Responsabilité: validation des entrées + mapping vers réponses HTTP structurées
// Elle NE SAIT PAS si c'est JWT ou Session — c'est le rôle de l'implémentation
// ─────────────────────────────────────────────────────────────────────────────

class SuperAdminAuthenticator {
  /**
   * @param {AuthImplementation} authImpl - L'implémentation injectée (JWT ou Session)
   */
  constructor(authImpl) {
    this.authImpl = authImpl;
  }

  /**
   * Change l'implémentation à chaud sans toucher au controller
   * Cas d'usage: migration progressive JWT → Session, A/B testing, multi-tenant
   */
  setImplementation(authImpl) {
    this.authImpl = authImpl;
  }

  /**
   * Point d'entrée unique pour l'authentification.
   * L'abstraction gère: validation + appel impl + format de réponse HTTP unifié.
   *
   * @param {Object} credentials - { email, password, userType }
   * @returns {Object} - { httpStatus, body } — le controller fait juste res.status().json()
   */
  async authenticate(credentials) {
    // Validation: responsabilité de l'abstraction, PAS de l'implémentation
    if (!credentials.email || !credentials.password || !credentials.userType) {
      throw new ValidationError("Please provide email, password, and user type");
    }

    // Délègue UNIQUEMENT la génération du token/session à l'implémentation
    const authResult = await this.authImpl.performAuthentication(credentials);

    // Format de réponse unifié — le controller ne connaît pas la structure interne
    return {
      httpStatus: 200,
      body: {
        status: true,
        method: authResult.method,
        ...(authResult.token    && { token:     authResult.token }),
        ...(authResult.sessionId && { sessionId: authResult.sessionId }),
        expiresIn: authResult.expiresIn,
      },
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPLÉMENTATION CONCRÈTE 1 — JWT
// Responsabilité UNIQUE: vérifier les credentials en base et émettre un JWT
// Elle ne connaît pas HTTP, req, res, ni le format de réponse final
// ─────────────────────────────────────────────────────────────────────────────

class JWTAuthImplementation {
  /**
   * @param {Object} config - { secretKey }
   */
  constructor(config) {
    this.secretKey = config.secretKey;
  }

  async performAuthentication({ email, password, userType }) {
    const jwt            = require("jsonwebtoken");
    const bcrypt         = require("bcrypt");
    const SuperAdminModel = require("../../model/superadmin");

    const user = await SuperAdminModel.findOne({ email });
    if (!user || user.session !== userType) {
      throw new CredentialsError();
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new CredentialsError();
    }

    const token = jwt.sign(
      { _id: user._id, email: user.email },
      this.secretKey,
      { expiresIn: "1h" }
    );

    return { method: "JWT", token, expiresIn: "1h" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPLÉMENTATION CONCRÈTE 2 — Session
// Responsabilité UNIQUE: vérifier les credentials et retourner un sessionId
// Même interface que JWTAuthImplementation → interchangeable sans rien casser
// ─────────────────────────────────────────────────────────────────────────────

class SessionAuthImplementation {
  async performAuthentication({ email, password, userType }) {
    const bcrypt         = require("bcrypt");
    const SuperAdminModel = require("../../model/superadmin");

    const user = await SuperAdminModel.findOne({ email });
    if (!user || user.session !== userType) {
      throw new CredentialsError();
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      throw new CredentialsError();
    }

    return { method: "SESSION", sessionId: user._id.toString(), expiresIn: "1h" };
  }
}

// ─────────────────────────────────────────────────────────────────────────────

module.exports = {
  SuperAdminAuthenticator,
  JWTAuthImplementation,
  SessionAuthImplementation,
  ValidationError,
  CredentialsError,
  AuthError,
};
