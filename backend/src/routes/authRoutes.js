const express = require('express');
const passport = require('passport');
const { body } = require('express-validator');
const { validate } = require('../middleware/validationMiddleware');
const { protect } = require('../middleware/authMiddleware');
const authController = require('../controllers/authController');

const router = express.Router();

// Email/Password Auth
router.post('/register', [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('username').isLength({ min: 3, max: 30 }).matches(/^[a-zA-Z0-9_]+$/).withMessage('Username: 3-30 chars, alphanumeric/underscore'),
  body('displayName').optional().isLength({ max: 50 }),
], validate, authController.register);

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], validate, authController.login);

router.post('/refresh', authController.refreshToken);
router.post('/logout', protect, authController.logout);
router.get('/me', protect, authController.getMe);

// Google OAuth
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
  prompt: 'select_account',
}));

router.get('/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_failed` }),
  authController.googleCallback
);

// GitHub OAuth
router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get('/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=github_failed` }),
  authController.githubCallback
);

module.exports = router;
