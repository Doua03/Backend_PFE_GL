/**
 * Builder Pattern (Monteur) - Parking Query Builder
 *
 * Objectif: Construire des requêtes de recherche de parking de manière légère
 * avec des paramètres optionnels sans surcharger le constructeur
 *
 * Référence: Gang of Four - Builder Pattern
 * Appliqué au: ParkingController (methods: search, filter)
 */

/**
 * Builder - Construit des requêtes de parking étape par étape
 */
class ParkingQueryBuilder {
  constructor() {
    this.query = {};
  }

  // Ajouter un filtre par localisation
  byLocation(latitude, longitude, radius = 5000) {
    this.query.location = { latitude, longitude, radius };
    return this;
  }

  // Ajouter un filtre par prix
  byPrice(minPrice, maxPrice) {
    this.query.price = { $gte: minPrice, $lte: maxPrice };
    return this;
  }

  // Ajouter un filtre par disponibilité
  byAvailability(isAvailable = true) {
    this.query.available = isAvailable;
    return this;
  }

  // Ajouter un filtre par type de parking
  byType(type) {
    this.query.type = type; // "garage", "outdoor", "covered"
    return this;
  }

  // Ajouter un filtre par rating minimum
  byRating(minRating) {
    this.query.rating = { $gte: minRating };
    return this;
  }

  // Construire et retourner la requête finale
  build() {
    return { ...this.query };
  }

  // Réinitialiser le builder
  reset() {
    this.query = {};
    return this;
  }
}

/**
 * Builder pour les données de paiement
 */
class PaymentBuilder {
  constructor() {
    this.payment = {};
  }

  setAmount(amount) {
    this.payment.amount = amount;
    return this;
  }

  setMethod(method) {
    this.payment.method = method; // "card", "wallet", "cash"
    return this;
  }

  setDescription(description) {
    this.payment.description = description;
    return this;
  }

  setStatus(status) {
    this.payment.status = status || "pending";
    return this;
  }

  build() {
    if (!this.payment.amount || !this.payment.method) {
      throw new Error(
        "Amount and method sont obligatoires pour la construction",
      );
    }
    return {
      ...this.payment,
      createdAt: new Date(),
    };
  }

  reset() {
    this.payment = {};
    return this;
  }
}

module.exports = { ParkingQueryBuilder, PaymentBuilder };
