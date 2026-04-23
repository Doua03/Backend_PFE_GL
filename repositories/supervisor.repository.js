const BaseRepository = require('./base.repository');
const Supervisor = require('../model/supervisor');

class SupervisorRepository extends BaseRepository {
  constructor() {
    super(Supervisor);
  }

  async findByEmail(email) {
    return await this.model.findOne({ email });
  }
}

module.exports = new SupervisorRepository();
