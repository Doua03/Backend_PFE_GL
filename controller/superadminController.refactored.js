/**
 * REFACTORED SuperAdminController
 *
 * Intègre:
 * Bridge Pattern sur method: loginsa
 */

const {
  SuperAdminAuthenticator,
  JWTAuthImplementation,
} = require("../patterns/bridge/AuthenticationBridge");
const config = require("../config/config");
const ObjectId = require("mongoose").Types.ObjectId;
const SuperAdminModel = require("../model/superadmin");

// Initialisation du Bridge Pattern
const authImplementation = new JWTAuthImplementation(config);
const authenticator = new SuperAdminAuthenticator(authImplementation);

/**
 * SUPERADMIN LOGIN
 *
 * BRIDGE PATTERN APPLIQUÉ:
 * - SuperAdminAuthenticator = Abstraction (logique métier)
 * - JWTAuthImplementation = Implémentation concrète
 * - Découple la logique métier de l'implémentation
 * - Permet de changer facilement d'implémentation (JWT → Session, etc.)
 *
 * AVANTAGE:
 * - Si besoin de passer à SessionAuthImplementation:
 *   authenticator.setImplementation(new SessionAuthImplementation(config))
 * - Le reste du code reste inchangé
 */
exports.loginsa = async (req, res) => {
  try {
    // Utilise l'abstraction du Bridge Pattern
    const credentials = {
      email: req.body.email,
      password: req.body.password,
      userType: req.body.userType,
    };

    const result = await authenticator.authenticate(credentials);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Autres méthodes restent inchangées
exports.listSuperadmins = (req, res) => {
  SuperAdminModel.find({}).exec(function (err, superadmins) {
    if (err) {
      console.error("Error while fetching superadmins:", err);
      return res.status(500).json({ error: "Internal server error" });
    } else {
      res.json(superadmins);
    }
  });
};

exports.getSuperadminById = (req, res) => {
  SuperAdminModel.find({ _id: req.body._id }).exec(function (err, superadmin) {
    if (err) {
      console.error("Error while fetching superadmin by ID:", err);
      return res.status(500).json({ error: "Internal server error" });
    } else {
      res.json(superadmin);
    }
  });
};

exports.deleteSuperadminById = (req, res) => {
  if (!ObjectId.isValid(req.params.id)) {
    return res.status(400).send(`Invalid ID: ${req.params.id}`);
  }

  SuperAdminModel.findByIdAndRemove(req.params.id, (err, deletedSuperadmin) => {
    if (err) {
      console.error("Error while deleting superadmin:", err);
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!deletedSuperadmin) {
      return res
        .status(404)
        .send(`Superadmin not found with ID: ${req.params.id}`);
    }

    res.json(deletedSuperadmin);
  });
};

module.exports.exports = exports;
