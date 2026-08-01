const passport = require('passport');
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const { Strategy: GoogleStrategy } = require('passport-google-oauth20');
const { Strategy: GitHubStrategy } = require('passport-github2');
const User = require('../models/User');
const logger = require('../utils/logger');

// JWT Strategy
passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_ACCESS_SECRET,
}, async (payload, done) => {
  try {
    const user = await User.findById(payload.userId).select('-password');
    if (!user) return done(null, false);
    return done(null, user);
  } catch (err) {
    return done(err, false);
  }
}));

// Google OAuth Strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL,
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = await User.findOne({ email: profile.emails[0].value });
      if (user) {
        user.googleId = profile.id;
        if (!user.avatar) user.avatar = profile.photos[0]?.value;
        await user.save();
      } else {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          username: profile.displayName.replace(/\s+/g, '_').toLowerCase() + '_' + Date.now().toString().slice(-4),
          displayName: profile.displayName,
          avatar: profile.photos[0]?.value,
          isEmailVerified: true,
        });
        await user.initializeCharacter();
      }
    }
    return done(null, user);
  } catch (err) {
    logger.error('Google OAuth error:', err);
    return done(err, false);
  }
}));

// GitHub OAuth Strategy
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL,
  scope: ['user:email'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ githubId: profile.id });
    if (!user) {
      const email = profile.emails && profile.emails[0]?.value;
      if (email) user = await User.findOne({ email });
      if (user) {
        user.githubId = profile.id;
        if (!user.avatar) user.avatar = profile.photos[0]?.value;
        await user.save();
      } else {
        user = await User.create({
          githubId: profile.id,
          email: email || `${profile.username}@github.com`,
          username: profile.username + '_' + Date.now().toString().slice(-4),
          displayName: profile.displayName || profile.username,
          avatar: profile.photos[0]?.value,
          isEmailVerified: !!email,
        });
        await user.initializeCharacter();
      }
    }
    return done(null, user);
  } catch (err) {
    logger.error('GitHub OAuth error:', err);
    return done(err, false);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id).select('-password');
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});
