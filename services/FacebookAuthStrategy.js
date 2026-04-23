const IAuthStrategy = require('./IAuthStrategy');
const passport = require('passport');
const { Strategy: FacebookStrategy } = require('passport-facebook');
const UserModel = require('../model/user.model');
const UserService = require('./user.services');

class FacebookAuthStrategy extends IAuthStrategy {
  constructor() {
    super();
    passport.use(
      new FacebookStrategy(
        {
          clientID:      process.env.FACEBOOK_APP_ID,
          clientSecret:  process.env.FACEBOOK_APP_SECRET,
          callbackURL:   '/auth/facebook/callback',
          profileFields: ['id', 'emails', 'name'],
        },
        async (accessToken, refreshToken, profile, done) => {
          try {
            let user = await UserModel.findOne({ facebookId: profile.id });

            if (!user) {
              const email = profile.emails?.[0]?.value || `${profile.id}@facebook.com`;
              user = await UserModel.create({
                username: `${profile.name.givenName} ${profile.name.familyName}`,
                email,
                facebookId: profile.id,
                password: Math.random().toString(36),
              });
            }

            const tokenData = { _id: user._id, email: user.email, username: user.username };
            const token = await UserService.generateToken(tokenData, 'secretKey', '1h');
            done(null, { user, token });
          } catch (err) {
            done(err);
          }
        }
      )
    );

    passport.serializeUser((data, done) => done(null, data));
    passport.deserializeUser((data, done) => done(null, data));
  }

  // Step 1 : redirection vers Facebook
  authenticate(req, res, next) {
    passport.authenticate('facebook', { scope: ['email'] })(req, res, next);
  }

  // Step 2 : traitement du callback Facebook
  handleCallback(req, res, next) {
    passport.authenticate('facebook', (err, data) => {
      if (err || !data) {
        return res.status(401).json({ message: 'Facebook authentication failed' });
      }
      res.status(200).json({ status: true, token: data.token });
    })(req, res, next);
  }
}

module.exports = FacebookAuthStrategy;