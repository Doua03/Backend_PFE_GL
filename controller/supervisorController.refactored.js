/**
 * REFACTORED SupervisorController
 *
 * Intègre:
 * 1. Observer Pattern sur methods: logins, addSupervisor
 * 2. Liskov Substitution Principle
 * 3. OCL Constraints (préconditions)
 */

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Supervisor = require("../model/supervisor");
const config = require("../config/config");
const ObjectId = require("mongoose").Types.ObjectId;

// Import du pattern Observer
const {
  SupervisorEventEmitter,
  SupervisorLogger,
  SupervisorAuditor,
  SupervisorNotificationService,
} = require("../patterns/observer/SupervisorObserver");

// Import de LSP
const {
  SupervisorRepository,
  UserCreationService,
} = require("../patterns/SOLID/LiskovSubstitutionPrinciple");

// Import des contraintes OCL
const {
  SupervisorLoginOCLConstraints,
  SupervisorAddOCLConstraints,
} = require("../patterns/OCL/OCLConstraints");

// Initialisation du Event Emitter (Subject dans le pattern Observer)
const eventEmitter = new SupervisorEventEmitter();

// Enregistre les observateurs
const logger = new SupervisorLogger();
const auditor = new SupervisorAuditor();
const notificationService = new SupervisorNotificationService();

eventEmitter.subscribe(logger);
eventEmitter.subscribe(auditor);
eventEmitter.subscribe(notificationService);

// Initialisation de LSP
const supervisorRepository = new SupervisorRepository(Supervisor);
const userCreationService = new UserCreationService(supervisorRepository);

/**
 * SUPERVISOR LOGIN
 *
 * OBSERVER PATTERN APPLIQUÉ:
 * - Événement 'supervisor_login' notifie tous les observateurs
 * - Logger: enregistre l'événement
 * - Auditor: enregistre dans l'audit
 * - NotificationService: envoie des notifications
 *
 * OCL CONSTRAINTS APPLIQUÉES (Préconditions):
 * - pre: email non-null et non-vide
 * - pre: password non-null et >= 8 caractères
 * - pre: userType valide
 *
 * AVANTAGE:
 * - Ajouter une nouvelle action (ex: SMS alert) = ajouter un observateur
 * - Pas besoin de modifier cette méthode
 */
exports.logins = async (req, res) => {
  try {
    // ========== OCL PRECONDITIONS VALIDATION ==========
    const preconditionCheck =
      SupervisorLoginOCLConstraints.validatePreconditions(req);
    if (!preconditionCheck.isValid) {
      return res.status(422).json({ errors: preconditionCheck.errors });
    }

    const { email, password, userType } = req.body;

    // Trouve le superviseur
    const supervisor = await Supervisor.findOne({ email });

    if (!supervisor || supervisor.session !== userType) {
      return res
        .status(401)
        .json({ error: "Incorrect email, password, or user type" });
    }

    // Compare le mot de passe
    const isPasswordMatch = await bcrypt.compare(password, supervisor.password);

    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ error: "Incorrect email, password, or user type" });
    }

    // Génère le token
    const secretKey = config.secretKey;
    const expiresIn = "1h";
    const token = jwt.sign(
      { _id: supervisor._id, email: supervisor.email },
      secretKey,
      { expiresIn },
    );

    // ========== OCL POSTCONDITIONS VALIDATION ==========
    const result = { status: true, token, expiresIn };
    SupervisorLoginOCLConstraints.validatePostconditions(result);

    // ========== OBSERVER PATTERN: Notify all observers ==========
    eventEmitter.notifyObservers("supervisor_login", {
      supervisorId: supervisor._id,
      email: supervisor.email,
      timestamp: new Date(),
      userType: userType,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

/**
 * ADD SUPERVISOR
 *
 * LISKOV SUBSTITUTION PRINCIPLE APPLIQUÉ:
 * - UserCreationService utilise SupervisorRepository
 * - SupervisorRepository respecte le contrat UserRepository
 * - Peut être remplacé par AdminRepository sans casser le code
 * - Tous deux implémentent create() de la même manière
 *
 * OBSERVER PATTERN APPLIQUÉ:
 * - Événement 'supervisor_added' notifie tous les observateurs
 * - Logger: enregistre la création
 * - Auditor: log l'audit
 * - NotificationService: envoie email de bienvenue
 *
 * OCL CONSTRAINTS APPLIQUÉES (Préconditions):
 * - pre: email valide (format email)
 * - pre: password >= 8 caractères
 * - pre: email doit être unique
 *
 * AVANTAGE LSP:
 * - Cette même méthode peut créer Admin en remplaçant le repository
 * - La logique métier ne change pas
 */
exports.addSupervisor = async (req, res) => {
  try {
    const { email, password } = req.body;

    // ========== OCL PRECONDITIONS VALIDATION ==========
    // Récupère les emails existants pour vérifier l'unicité
    const existingSupervisors = await Supervisor.find({ email });
    const existingEmails = existingSupervisors.map((s) => s.email);

    const preconditionCheck = SupervisorAddOCLConstraints.validatePreconditions(
      req,
      existingEmails,
    );
    if (!preconditionCheck.isValid) {
      return res.status(422).json({ errors: preconditionCheck.errors });
    }

    // ========== LISKOV SUBSTITUTION PRINCIPLE ==========
    // userCreationService fonctionne avec n'importe quel UserRepository
    const newSupervisor = await userCreationService.createUser(email, password);

    // ========== OCL POSTCONDITIONS VALIDATION ==========
    SupervisorAddOCLConstraints.validatePostconditions(newSupervisor, req);
    SupervisorAddOCLConstraints.validateInvariants(newSupervisor);

    // ========== OBSERVER PATTERN: Notify all observers ==========
    eventEmitter.notifyObservers("supervisor_added", {
      supervisorId: newSupervisor._id,
      email: newSupervisor.email,
      timestamp: new Date(),
      createdBy: req.user ? req.user._id : "system",
    });

    res.status(201).send(newSupervisor);
  } catch (error) {
    console.error("Error while adding supervisor:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Autres méthodes restent inchangées
exports.listSupervisors = async (req, res) => {
  try {
    const supervisors = await Supervisor.find({});
    res.json(supervisors);
  } catch (err) {
    console.error("Error while fetching supervisors:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getSupervisorById = async (req, res) => {
  const supervisorId = req.params.id;

  try {
    const supervisor = await Supervisor.findById(supervisorId).exec();

    if (!supervisor) {
      return res.status(404).json({ error: "Supervisor not found" });
    }

    res.status(200).json(supervisor);
  } catch (error) {
    console.error("Error while getting supervisor by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteSupervisorById = async (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send(`Invalid ID: ${req.params.id}`);
  }

  try {
    const deleted = await Supervisor.findByIdAndRemove(req.params.id);
    if (!deleted) {
      return res
        .status(404)
        .send(`Supervisor not found with ID: ${req.params.id}`);
    }
    res.json(deleted);
  } catch (error) {
    console.error("Error while deleting supervisor:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports.exports = exports;
