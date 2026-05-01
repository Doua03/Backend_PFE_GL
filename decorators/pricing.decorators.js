/**
 * ============================================================
 *  PATRON DE CONCEPTION GOF : DECORATOR
 *  Décorateurs : PricingDecorators
 * ============================================================
 */

// ── DÉCORATEUR DE BASE ──────────────────────────────────────
// Il contient une référence vers le composant à décorer
class PricingDecorator {
  constructor(pricingComponent) {
    this.pricingComponent = pricingComponent;
  }

  getPrice() {
    return this.pricingComponent.getPrice();
  }
}

// ── DÉCORATEUR CONCRET 1 : Service de Lavage ───────────────
// Ajoute un prix fixe au prix calculé précédemment
class WashServiceDecorator extends PricingDecorator {
  constructor(pricingComponent) {
    super(pricingComponent);
    this.washPrice = 15; // Prix fixe pour le lavage
  }

  getPrice() {
    console.log(`[Decorator] Ajout du service lavage (+${this.washPrice} DT)`);
    return super.getPrice() + this.washPrice;
  }
}

// ── DÉCORATEUR CONCRET 2 : Remise de Bienvenue ─────────────
// Applique une réduction sur le total
class WelcomeDiscountDecorator extends PricingDecorator {
  constructor(pricingComponent) {
    super(pricingComponent);
    this.discountRate = 0.05; // 5% de remise
  }

  getPrice() {
    const currentPrice = super.getPrice();
    const discount = currentPrice * this.discountRate;
    console.log(`[Decorator] Application remise de bienvenue (-${discount.toFixed(2)} DT)`);
    return currentPrice - discount;
  }
}

module.exports = { 
  WashServiceDecorator, 
  WelcomeDiscountDecorator 
};
