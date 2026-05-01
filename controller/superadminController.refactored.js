/**
 * REFACTORED SuperAdminController — Bridge Pattern
 *
 * CE QUI CHANGE PAR RAPPORT À L'ORIGINAL:
 * ✗ Avant : jwt, bcrypt, SuperAdminModel tous importés ICI pour loginsa()
 * ✓ Après : le controller ne sait PAS comment l'auth fonctionne
 *
 * OÙ LE BRIDGE EST VISIBLE:
 * L'implémentation (JWT ou Session) est choisie dynamiquement
 * selon req.headers["x-auth-method"].
 * Le controller appelle TOUJOURS la même méthode authenticate()
 * → zéro if/else sur la stratégie d'auth dans le controller.
 *
 * POUR AJOUTER UNE 3ÈME MÉTHODE D'AUTH (ex: OAuth):
 * 1. Créer OAuthAuthImplementation dans AuthenticationBridge.js
 * 2. Ajouter un case dans resolveImplementation() ci-dessous
 * 3. Le reste du controller: inchangé.
 */

const {
  SuperAdminAuthenticator,
  JWTAuthImplementation,
  SessionAuthImplementation,
  AuthError,
} = require("../patterns/bridge/AuthenticationBridge");

const config          = require("../config/config");
const ObjectId        = require("mongoose").Types.ObjectId;
const SuperAdminModel = require("../model/superadmin");

// ─────────────────────────────────────────────────────────────────────────────
// Instanciation du Bridge
// L'implémentation par défaut est JWT.
// Elle sera remplacée dynamiquement dans loginsa() selon le header HTTP.
// ─────────────────────────────────────────────────────────────────────────────

const authenticator = new SuperAdminAuthenticator(
  new JWTAuthImplementation(config)
);

/**
 * Sélectionne l'implémentation selon le header "x-auth-method".
 * Peut être basé sur n'importe quel critère: config, tenant, feature flag…
 *
 * C'est ICI que le Bridge montre sa valeur:
 * le controller décide QUOI utiliser, mais ne sait pas COMMENT ça marche.
 */
function resolveImplementation(req) {
  const method = (req.headers["x-auth-method"] || "jwt").toLowerCase();

  switch (method) {
    case "session":
      return new SessionAuthImplementation();
    case "jwt":
    default:
      return new JWTAuthImplementation(config);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// SUPERADMIN LOGIN — Bridge Pattern en action
// ─────────────────────────────────────────────────────────────────────────────

exports.loginsa = async (req, res) => {
  try {
    // 1. Choisir l'implémentation selon le contexte de la requête
    authenticator.setImplementation(resolveImplementation(req));

    // 2. Appeler l'abstraction — même code peu importe JWT ou Session
    const { httpStatus, body } = await authenticator.authenticate({
      email:    req.body.email,
      password: req.body.password,
      userType: req.body.userType,
    });

    res.status(httpStatus).json(body);

  } catch (error) {
    // AuthError est typée avec un statusCode → pas de if/else HTTP ici non plus
    if (error instanceof AuthError) {
      return res.status(error.statusCode).json({ error: error.message });
    }
    console.error("Unexpected error during login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Autres méthodes — async/await cohérent avec loginsa
// ─────────────────────────────────────────────────────────────────────────────

exports.listSuperadmins = async (req, res) => {
  try {
    const superadmins = await SuperAdminModel.find({});
    res.json(superadmins);
  } catch (error) {
    console.error("Error while fetching superadmins:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getSuperadminById = async (req, res) => {
  try {
    const superadmin = await SuperAdminModel.findById(req.body._id);
    if (!superadmin) {
      return res.status(404).json({ error: "Superadmin not found" });
    }
    res.json(superadmin);
  } catch (error) {
    console.error("Error while fetching superadmin by ID:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteSuperadminById = async (req, res) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).send(`Invalid ID: ${req.params.id}`);
    }

    const deletedSuperadmin = await SuperAdminModel.findByIdAndDelete(req.params.id);

    if (!deletedSuperadmin) {
      return res.status(404).send(`Superadmin not found with ID: ${req.params.id}`);
    }

    res.json(deletedSuperadmin);
  } catch (error) {
    console.error("Error while deleting superadmin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
