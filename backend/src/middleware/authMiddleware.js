// const passport = require('passport');
// const { AppError } = require('../utils/errors');

// exports.protect = (req, res, next) => {
//   passport.authenticate('jwt', { session: false }, (err, user, info) => {
//     if (err) return next(err);
//     if (!user) {
//       return next(new AppError(info?.message || 'Authentication required. Identity unverified.', 401));
//     }
//     req.user = user;
//     next();
//   })(req, res, next);
// };




const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { AppError } = require("../utils/errors");

exports.protect = async (req, res, next) => {
  try {
    console.log("===== PROTECT =====");
    console.log("Authorization:", req.headers.authorization);

    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith("Bearer ")) {
      return next(new AppError("No Bearer token found", 401));
    }

    const token = auth.split(" ")[1];

    console.log("Token:", token);

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    console.log("Decoded:", decoded);

    const user = await User.findById(decoded.userId);

    console.log("User:", user ? user.email : "NOT FOUND");

    if (!user) {
      return next(new AppError("User not found", 401));
    }

    req.user = user;
    next();

  } catch (err) {
    console.error("JWT ERROR:", err);
    return next(new AppError(err.message, 401));
  }
};