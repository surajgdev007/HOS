const passport = require('passport');
const { AppError } = require('../utils/errors');

exports.protect = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) return next(err);
    if (!user) {
      return next(new AppError(info?.message || 'Authentication required. Identity unverified.', 401));
    }
    req.user = user;
    next();
  })(req, res, next);
};
