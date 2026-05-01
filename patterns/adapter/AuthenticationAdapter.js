/**
 * Adapter Pattern (Monteur) - Authentication Adapter
 *
 * Objectif: Adapter les différentes méthodes de validation de mot de passe
 * pour une interface unifiée (comparePassword)
 *
 * Référence: Gang of Four - Adapter Pattern
 * Appliqué au: AdminController (methods: add, logina)
 */

const bcrypt = require("bcrypt");

/**
 * Classe abstraite représentant l'interface cible
 */
class IPasswordValidator {
  async validatePassword(password, hashedPassword) {
    throw new Error("Method validatePassword must be implemented");
  }
}

/**
 * Adaptateur pour la validation de mot de passe avec bcrypt
 */
class BcryptPasswordAdapter extends IPasswordValidator {
  async validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

/**
 * Adaptateur pour la validation simple (utile pour les tests)
 */
class SimplePasswordAdapter extends IPasswordValidator {
  async validatePassword(password, hashedPassword) {
    // Simple comparison - à utiliser uniquement en dev/test
    return password === hashedPassword;
  }
}

/**
 * Adaptateur unifié - combine les adaptateurs existants
 */
class UnifiedAuthenticationAdapter {
  constructor(type = "bcrypt") {
    this.adapter =
      type === "bcrypt"
        ? new BcryptPasswordAdapter()
        : new SimplePasswordAdapter();
  }

  async validate(password, hashedPassword) {
    return await this.adapter.validatePassword(password, hashedPassword);
  }

  // Change dynamiquement d'adaptateur si nécessaire
  switchAdapter(type) {
    this.adapter =
      type === "bcrypt"
        ? new BcryptPasswordAdapter()
        : new SimplePasswordAdapter();
  }
}

module.exports = {
  UnifiedAuthenticationAdapter,
  BcryptPasswordAdapter,
  SimplePasswordAdapter,
  IPasswordValidator,
};
