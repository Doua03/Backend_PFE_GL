/**
 * OCL Constraints for Ticket Model
 * Defines pre-conditions (before creation) and post-conditions (after creation/update)
 */

// PRE-CONDITIONS: Validations before creating/updating a ticket
const preConditions = {
  /**
   * OCL: ticketDateConsistency
   * Invariant: La date de départ doit être après la date d'arrivée
   */
  validateDatesConsistency: (ticketData) => {
    const arrivalDate = new Date(ticketData.arrivalDate);
    const departureDate = new Date(ticketData.departureDate);

    if (departureDate <= arrivalDate) {
      return {
        isValid: false,
        error: "La date de départ doit être après la date d'arrivée",
        constraint: "ticketDateConsistency",
      };
    }
    return { isValid: true };
  },

  /**
   * OCL: ticketMoneyPositive
   * Invariant: Le montant payé doit être positif
   */
  validateMoneyPositive: (ticketData) => {
    if (ticketData.money <= 0) {
      return {
        isValid: false,
        error: "Le montant payé doit être positif",
        constraint: "ticketMoneyPositive",
      };
    }
    return { isValid: true };
  },

  /**
   * Execute all pre-conditions and return errors if any
   */
  validateAll: (ticketData) => {
    const validators = [
      preConditions.validateDatesConsistency,
      preConditions.validateMoneyPositive,
    ];

    for (const validator of validators) {
      const result = validator(ticketData);
      if (!result.isValid) {
        return result;
      }
    }
    return { isValid: true };
  },
};

module.exports = {
  preConditions,
};
