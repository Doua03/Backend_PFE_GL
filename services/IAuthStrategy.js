class IAuthStrategy {
  async authenticate(req, res, next) {
    throw new Error('authenticate() must be implemented');
  }
}

module.exports = IAuthStrategy;