const BaseRepository = require('./base.repository');
const Admin = require('../model/admin');

class AdminRepository extends BaseRepository {
  constructor() {
    super(Admin);
  }

  // Méthode spécifique pour trouver par email (utile pour l'authentification)
  async findByEmail(email) {
    return await this.model.findOne({ email });
  }

  // Ici on pourrait ajouter calculateTotalLicensePrice si on veut le mutualiser
}

module.exports = new AdminRepository();
