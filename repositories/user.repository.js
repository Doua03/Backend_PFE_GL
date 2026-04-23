const BaseRepository = require('./base.repository');
const User = require('../model/user.model');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return await this.model.findOne({ email });
  }
}

module.exports = new UserRepository();
