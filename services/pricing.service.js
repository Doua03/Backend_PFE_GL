/**
 * ============================================================
 *  PATRON DE CONCEPTION GOF : DECORATOR
 *  Composant de Base : PricingComponent
 * ============================================================
 */

class PricingComponent {
  getPrice() {
    throw new Error("Method 'getPrice()' must be implemented.");
  }
}

class BasePricing extends PricingComponent {
  constructor(arrivalDate, departureDate, hourlyRate = 2) {
    super();
    this.arrivalDate = new Date(arrivalDate);
    this.departureDate = new Date(departureDate);
    this.hourlyRate = hourlyRate;
  }

  getPrice() {
    // Calcul de la durée en heures
    const diffInMs = Math.abs(this.departureDate - this.arrivalDate);
    const hours = Math.ceil(diffInMs / (1000 * 60 * 60));
    
    // Prix de base
    return hours * this.hourlyRate;
  }
}

module.exports = { BasePricing };
