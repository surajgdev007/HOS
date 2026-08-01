const jwt = require('jsonwebtoken');
const passport = require('passport');
const User = require('../models/User');
const { History } = require('../models/Supporting');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');

const generateTokens = (userId) => {
  const accessToken = jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET,
    { expiresIn: process.env.JWT_ACCESS_EXPIRY || '15m' }
  );
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRY || '7d' }
  );
  return { accessToken, refreshToken };
};

const sendAuthResponse = async (res, user, statusCode = 200) => {
  const { accessToken, refreshToken } = generateTokens(user._id);
  
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });
  
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  
  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.refreshToken;
  
  return res.status(statusCode).json({
    success: true,
    message: statusCode === 201 ? 'IDENTITY REGISTERED. SYSTEM INITIALIZED.' : 'IDENTITY CONFIRMED. ACCESS GRANTED.',
    data: {
      user: userObj,
      accessToken,
    },
  });
};

// POST /api/auth/register
exports.register = async (req, res, next) => {
  try {
    const { email, password, username, displayName } = req.body;
    
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      const field = existingUser.email === email ? 'Email' : 'Username';
      throw new AppError(`${field} already exists in the System.`, 409);
    }
    
    const user = await User.create({ email, password, username, displayName: displayName || username });
    await user.initializeCharacter();
    
    // Log history
    await History.create({ userId: user._id, event: 'level_up', details: { message: 'Account initialized' } });
    
    await sendAuthResponse(res, user, 201);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/login
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      throw new AppError('Invalid credentials. The System does not recognize you.', 401);
    }
    
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new AppError('Invalid credentials. The System does not recognize you.', 401);
    }
    
    if (!user.isActive) {
      throw new AppError('Account suspended. Contact support.', 403);
    }
    
    // Update streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (!user.lastActiveDate || user.lastActiveDate < yesterday) {
      if (user.lastActiveDate && user.lastActiveDate >= yesterday) {
        user.currentStreak += 1;
      } else {
        user.currentStreak = 1;
      }
      if (user.currentStreak > user.longestStreak) {
        user.longestStreak = user.currentStreak;
      }
    }
    user.lastActiveDate = new Date();
    
    await sendAuthResponse(res, user);
  } catch (err) {
    next(err);
  }
};

// POST /api/auth/refresh
exports.refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;
    if (!token) throw new AppError('No refresh token provided.', 401);
    
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.userId).select('+refreshToken');
    
    if (!user || user.refreshToken !== token) {
      throw new AppError('Invalid refresh token.', 401);
    }
    
    await sendAuthResponse(res, user);
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return next(new AppError('Invalid or expired refresh token.', 401));
    }
    next(err);
  }
};

// POST /api/auth/logout
exports.logout = async (req, res, next) => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    }
    res.clearCookie('refreshToken');
    res.json({ success: true, message: 'SYSTEM OFFLINE. IDENTITY CLEARED.' });
  } catch (err) {
    next(err);
  }
};

// GET /api/auth/me
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: { user } });
  } catch (err) {
    next(err);
  }
};

// OAuth callbacks - Google
exports.googleCallback = (req, res) => {
  const { accessToken } = generateTokens(req.user._id);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}&provider=google`);
};

// OAuth callbacks - GitHub
exports.githubCallback = (req, res) => {
  const { accessToken } = generateTokens(req.user._id);
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}&provider=github`);
};
