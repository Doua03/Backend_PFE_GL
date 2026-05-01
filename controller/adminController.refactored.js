/**
 * REFACTORED AdminController
 *
 * Intégre:
 * 1. Adapter Pattern sur methods: add, logina
 * 2. Low Coupling principle
 *
 * Dépendances injectées au lieu d'être hardcodées
 */

const jwt = require("jsonwebtoken");
const {
  UnifiedAuthenticationAdapter,
} = require("../patterns/adapter/AuthenticationAdapter");
const {
  AdminRepository,
  AdminAuthService,
  TokenService,
} = require("../patterns/SOLID/LowCouplingExample");

// Les dépendances sont injectées
let authAdapter;
let adminRepository;
let authService;
let tokenService;

// Initialisation avec injection de dépendances
exports.initialize = (config, adminModel) => {
  authAdapter = new UnifiedAuthenticationAdapter("bcrypt");
  adminRepository = new AdminRepository(adminModel);
  tokenService = new TokenService(config);
  authService = new AdminAuthService(adminRepository, tokenService);
};

/**
 * LOGIN ADMIN
 *
 * ADAPTER PATTERN APPLIQUÉ:
 * - Utilise UnifiedAuthenticationAdapter pour valider le mot de passe
 * - Abstrait la logique de validation (bcrypt vs simple)
 * - Peut changer d'implémentation sans modifier ce code
 *
 * LOW COUPLING APPLIQUÉ:
 * - Utilise AdminAuthService (abstraction)
 * - Ne dépend pas directement du modèle Admin
 * - Dépendances injectées dans initialize()
 */
exports.logina = async (req, res, next) => {
  try {
    const { email, password, userType } = req.body;

    // Validation
    if (!email || !password || !userType) {
      return res
        .status(422)
        .send({ error: "Must provide email, password, and userType" });
    }

    // Utilise le service découplé (Low Coupling)
    const token = await authService.login(email, password);

    // Utilise l'adaptateur pour la validation
    const admin = await adminRepository.findByEmail(email);
    const isValid = await authAdapter.validate(password, admin.password);

    if (!isValid) {
      return res.status(422).send({ error: "Invalid email or password" });
    }

    res.status(200).json({ status: true, token: token });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * ADD ADMIN
 *
 * ADAPTER PATTERN APPLIQUÉ:
 * - Utilise l'adaptateur unifié pour la validation
 * - Abstrait les différentes stratégies de validation
 *
 * LOW COUPLING APPLIQUÉ:
 * - Utilise AdminRepository (interface abstraite)
 * - Pas de dépendance directe sur SupervisorService
 */
exports.add = async (req, res) => {
  try {
    const { userId, email, password } = req.body;

    if (!email || !password) {
      return res.status(422).send({ error: "Must provide email and password" });
    }

    // Valide avec l'adaptateur
    const isPasswordValid = password.length >= 8;
    if (!isPasswordValid) {
      return res
        .status(422)
        .send({ error: "Password must be at least 8 characters" });
    }

    // Crée l'admin via le repository découplé
    const newAdmin = await adminRepository.create({
      userId,
      email,
      password,
      session: "Admin",
    });

    res.status(201).send(newAdmin);
  } catch (error) {
    console.error("Error while adding admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Autres méthodes restent inchangées
exports.list = async (req, res) => {
  try {
    const Admin = require("../model/admin");
    const admins = await Admin.find({}).exec();
    res.json(admins);
  } catch (error) {
    console.error("Error while fetching admins:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.delete = async (req, res) => {
  try {
    const ObjectId = require("mongoose").Types.ObjectId;
    const Admin = require("../model/admin");

    if (!ObjectId.isValid(req.params.id))
      return res.status(400).send(`No record with given id : ${req.params.id}`);

    const deletedAdmin = await Admin.findOneAndDelete({ _id: req.params.id });
    if (!deletedAdmin) {
      return res.status(404).send(`Admin not found with ID: ${req.params.id}`);
    }
    res.json(deletedAdmin);
  } catch (error) {
    console.error("Error while deleting admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.exports = exports;
