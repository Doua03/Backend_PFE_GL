/**
 * SOLID - Liskov Substitution Principle (LSP)
 *
 * Objectif: Les sous-classes doivent être substituables à leurs classes parentes
 * sans casser le comportement du programme
 *
 * Appliqué au: SupervisorController (method: addSupervisor)
 *
 * AVANT (LSP violation):
 * - AdminRepository et SupervisorRepository avaient des comportements incompatibles
 * - Impossible de les substituer l'une à l'autre
 *
 * APRÈS (LSP conforme):
 * - Toutes les implémentations respectent le contrat
 * - Peuvent être utilisées de façon interchangeable
 */

/**
 * Classe de base abstraite - Définit le contrat
 */
class UserRepository {
  async save(userData) {
    throw new Error("save method must be implemented");
  }

  async findById(id) {
    throw new Error("findById method must be implemented");
  }

  async delete(id) {
    throw new Error("delete method must be implemented");
  }

  /**
   * IMPORTANT: Cette méthode doit toujours retourner le même type de résultat
   * pour respecter LSP
   */
  async create(email, password) {
    throw new Error("create method must be implemented");
  }

  /**
   * Valide que le mot de passe est conforme aux règles
   * Respecte le contrat: retourne toujours un objet avec {valid, message}
   */
  validatePassword(password) {
    throw new Error("validatePassword method must be implemented");
  }
}

/**
 * Implémentation pour Supervisor - Respecte LSP
 */
class SupervisorRepository extends UserRepository {
  constructor(supervisorModel) {
    super();
    this.supervisorModel = supervisorModel;
  }

  async save(userData) {
    const supervisor = new this.supervisorModel(userData);
    return await supervisor.save();
  }

  async findById(id) {
    return await this.supervisorModel.findById(id);
  }

  async delete(id) {
    return await this.supervisorModel.findByIdAndRemove(id);
  }

  async create(email, password) {
    // Respecte le contrat: valide, puis crée et retourne
    const validation = this.validatePassword(password);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(password, 10);

    const supervisor = new this.supervisorModel({
      email,
      password: hashedPassword,
      session: "Supervisor",
    });

    return await supervisor.save();
  }

  validatePassword(password) {
    // Règles communes pour tous les utilisateurs
    if (password.length < 8) {
      return {
        valid: false,
        message: "Password must be at least 8 characters",
      };
    }
    return { valid: true, message: "Password is valid" };
  }
}

/**
 * Implémentation pour Admin - Respecte aussi LSP
 */
class AdminRepository extends UserRepository {
  constructor(adminModel) {
    super();
    this.adminModel = adminModel;
  }

  async save(userData) {
    const admin = new this.adminModel(userData);
    return await admin.save();
  }

  async findById(id) {
    return await this.adminModel.findById(id);
  }

  async delete(id) {
    return await this.adminModel.findByIdAndRemove(id);
  }

  async create(email, password) {
    // Respecte le même contrat que SupervisorRepository
    const validation = this.validatePassword(password);
    if (!validation.valid) {
      throw new Error(validation.message);
    }

    const bcrypt = require("bcrypt");
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = new this.adminModel({
      email,
      password: hashedPassword,
      session: "Admin",
    });

    return await admin.save();
  }

  validatePassword(password) {
    // Mêmes règles - respecte le contrat
    if (password.length < 8) {
      return {
        valid: false,
        message: "Password must be at least 8 characters",
      };
    }
    return { valid: true, message: "Password is valid" };
  }
}

/**
 * Service générique qui peut utiliser n'importe quel repository LSP-conforme
 */
class UserCreationService {
  constructor(repository) {
    // Accepte n'importe quel UserRepository (ou sous-classe)
    this.repository = repository;
  }

  async createUser(email, password) {
    // Fonctionne avec n'importe quel repository conforme à LSP
    return await this.repository.create(email, password);
  }
}

module.exports = {
  UserRepository,
  SupervisorRepository,
  AdminRepository,
  UserCreationService,
};
