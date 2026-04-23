const IAuthStrategy = require('./IAuthStrategy');
const UserService = require('./user.services');

class EmailPasswordStrategy extends IAuthStrategy {
  async authenticate(req, res, next) {
    try {
      const { email, password } = req.body;

      const user = await UserService.checkuser(email);
      if (!user) {
        return res.status(401).json({ message: 'Email or password is incorrect' });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Email or password is incorrect' });
      }

      const tokenData = { _id: user._id, email: user.email, username: user.username };
      const token = await UserService.generateToken(tokenData, 'secretKey', '1h');
      res.status(200).json({ status: true, token });
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}

module.exports = EmailPasswordStrategy;