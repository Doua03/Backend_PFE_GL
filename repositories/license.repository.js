const BaseRepository = require('./base.repository');
const License = require('../model/license');

class LicenseRepository extends BaseRepository {
  constructor() {
    super(License);
  }

  async findByUserType(userType) {
    return await this.model.find({ user: userType });
  }
}

module.exports = new LicenseRepository();
