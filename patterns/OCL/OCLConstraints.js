/**
 * OCL Constraints - Object Constraint Language
 * Appliqué au: SupervisorController
 * Méthodes: logins (2 préconditions), addSupervisor (1 précondition)
 * PRÉCONDITIONS: Conditions qui doivent être vraies AVANT l'exécution
 * POSTCONDITIONS: Conditions qui doivent être vraies APRÈS l'exécution
 * INVARIANTS: Conditions toujours vraies
 * Référence: Object Constraint Language (OMG), Design by Contract
 */
/**
 * OCL Constraints pour SupervisorController.logins()
 * Pseudo-code OCL:
 * context SupervisorController::logins(req: HttpRequest)
 * -- PRÉCONDITIONS
 * pre: req.body.email <> null and req.body.email <> ''
 * pre: req.body.password <> null and req.body.password <> ''
 * pre: req.body.password.length() >= 8
 * pre: req.body.userType in ['Admin', 'Supervisor', 'Superadmin']
 *
 * -- POSTCONDITIONS
 * post: result.status = true implies result.token <> null
 * post: result.token <> null implies result.token.expiresIn = '1h'
 * post: result.status = false implies result.error <> null
 *
 * -- INVARIANTS
 * inv: Supervisor.email.isUnique()
 * inv: Supervisor.password.length() >= 8
 */
class SupervisorLoginOCLConstraints {
  static validatePreconditions(req) {
    const errors = [];

    // Précondition 1: email non-null et non-vide
    if (!req.body.email || req.body.email.trim() === "") {
      errors.push("Email must not be null or empty");
    }

    // Précondition 2: password non-null et non-vide
    if (!req.body.password || req.body.password.trim() === "") {
      errors.push("Password must not be null or empty");
    }

    // Précondition 3: password length >= 8
    if (req.body.password && req.body.password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    // Précondition 4: userType valide
    const validUserTypes = ["Admin", "Supervisor", "Superadmin"];
    if (!req.body.userType || !validUserTypes.includes(req.body.userType)) {
      errors.push("userType must be one of: " + validUserTypes.join(", "));
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  static validatePostconditions(result) {
    // Postcondition 1: Si status = true, token doit exister
    if (result.status === true && !result.token) {
      throw new Error(
        "Postcondition violation: token is null when status is true",
      );
    }

    // Postcondition 2: Si token existe, expiresIn doit être '1h'
    if (result.token && result.expiresIn !== "1h") {
      throw new Error("Postcondition violation: expiresIn must be '1h'");
    }

    // Postcondition 3: Si status = false, error doit exister
    if (result.status === false && !result.error) {
      throw new Error(
        "Postcondition violation: error message is required when status is false",
      );
    }

    return true;
  }
}

/**
 * OCL Constraints pour SupervisorController.addSupervisor()
 *
 * Pseudo-code OCL:
 *
 * context SupervisorController::addSupervisor(req: HttpRequest)
 *
 * -- PRÉCONDITIONS
 * pre: req.body.email <> null and req.body.email.matches(emailRegex)
 * pre: req.body.password <> null and req.body.password.length() >= 8
 * pre: not Supervisor.exists(email = req.body.email) -- email unique
 *
 * -- POSTCONDITIONS
 * post: Supervisor.findOne(email = req.body.email) <> null
 * post: result.status = 201
 *
 * -- INVARIANTS
 * inv: Supervisor.session = 'Supervisor'
 * inv: forall s in Supervisor | s.password <> null
 */
class SupervisorAddOCLConstraints {
  static validatePreconditions(req, existingEmails) {
    const errors = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Précondition 1: email non-null et valide
    if (!req.body.email || !emailRegex.test(req.body.email)) {
      errors.push("Email must be valid and not null");
    }

    // Précondition 2: password non-null et >= 8 caractères
    if (!req.body.password || req.body.password.length < 8) {
      errors.push("Password must be at least 8 characters");
    }

    // Précondition 3: email doit être unique
    if (existingEmails && existingEmails.includes(req.body.email)) {
      errors.push("Email already exists");
    }

    return {
      isValid: errors.length === 0,
      errors: errors,
    };
  }

  static validatePostconditions(createdSupervisor, req) {
    // Postcondition 1: Supervisor doit être créé avec le même email
    if (createdSupervisor.email !== req.body.email) {
      throw new Error(
        "Postcondition violation: created supervisor email mismatch",
      );
    }

    // Postcondition 2: session doit être 'Supervisor'
    if (createdSupervisor.session !== "Supervisor") {
      throw new Error("Postcondition violation: session must be 'Supervisor'");
    }

    return true;
  }

  static validateInvariants(supervisor) {
    // Invariant 1: session = 'Supervisor'
    if (supervisor.session !== "Supervisor") {
      throw new Error(
        "Invariant violation: supervisor.session must be 'Supervisor'",
      );
    }

    // Invariant 2: password non-null
    if (!supervisor.password) {
      throw new Error(
        "Invariant violation: supervisor.password must not be null",
      );
    }

    return true;
  }
}

module.exports = {
  SupervisorLoginOCLConstraints,
  SupervisorAddOCLConstraints,
};
