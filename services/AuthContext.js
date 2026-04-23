class AuthContext {
  constructor(strategy) {
    this.strategy = strategy;
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  async authenticate(req, res, next) {
    return await this.strategy.authenticate(req, res, next);
  }
}

module.exports = AuthContext;