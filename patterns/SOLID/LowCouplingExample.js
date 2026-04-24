/**
 * SOLID - Low Coupling Principle
 *
 * Objectif: Réduire les dépendances entre modules
 * Appliqué au: AdminController (methods: add, logina)
 *
 * AVANT (Haut couplage):
 * - AdminController importait et utilisait directement Admin, SupervisorService
 * - Changement dans ces dépendances casse le controller
 *
 * APRÈS (Bas couplage):
 * - AdminController utilise une interface abstraite
 * - Dépendances injectées au lieu d'être hardcodées
 */

/**
 * Interface abstraite pour l'accès aux données Admin
 */
class IAdminRepository {
  async create(data) {
    throw new Error("create method must be implemented");
  }

  async findByEmail(email) {
    throw new Error("findByEmail method must be implemented");
  }

  async comparePassword(hashedPassword, plainPassword) {
    throw new Error("comparePassword method must be implemented");
  }
}

/**
 * Implémentation concrète du repository
 */
class AdminRepository extends IAdminRepository {
  constructor(adminModel) {
    super();
    this.adminModel = adminModel;
  }

  async create(data) {
    const admin = new this.adminModel(data);
    return await admin.save();
  }

  async findByEmail(email) {
    return await this.adminModel.findOne({ email });
  }

  async comparePassword(hashedPassword, plainPassword) {
    const bcrypt = require("bcrypt");
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

/**
 * Service d'authentification découplé
 */
class AdminAuthService {
  constructor(repository, tokenService) {
    this.repository = repository;
    this.tokenService = tokenService;
  }

  async login(email, password) {
    const admin = await this.repository.findByEmail(email);
    if (!admin) {
      throw new Error("Invalid credentials");
    }

    const isValid = await this.repository.comparePassword(
      admin.password,
      password,
    );
    if (!isValid) {
      throw new Error("Invalid credentials");
    }

    return this.tokenService.generateToken(admin);
  }
}

/**
 * Service de token découplé
 */
class TokenService {
  constructor(config) {
    this.config = config;
  }

  generateToken(user) {
    const jwt = require("jsonwebtoken");
    return jwt.sign(
      { _id: user._id, email: user.email },
      this.config.secretKey,
      { expiresIn: "1h" },
    );
  }
}

module.exports = {
  IAdminRepository,
  AdminRepository,
  AdminAuthService,
  TokenService,
};
