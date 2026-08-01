const User = require('../models/User');
const Stat = require('../models/Stat');
const Quest = require('../models/Quest');
const { History } = require('../models/Supporting');
const { AppError } = require('../utils/errors');

// GET /api/users/dashboard
exports.getDashboard = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const stats = await Stat.find({ userId: user._id });
    const activeQuests = await Quest.find({
      userId: user._id,
      status: { $in: ['available', 'active'] },
    }).limit(5);
    
    const recentHistory = await History.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .limit(30);
    
    // Build activity heatmap (last 52 weeks)
    const activityMap = {};
    recentHistory.forEach(h => {
      const dateKey = h.createdAt.toISOString().split('T')[0];
      activityMap[dateKey] = (activityMap[dateKey] || 0) + (h.xpGained || 10);
    });
    
    const xpProgress = user.xpProgress();
    
    res.json({
      success: true,
      data: {
        user: {
          _id: user._id,
          username: user.username,
          displayName: user.displayName,
          avatar: user.avatar,
          level: user.level,
          rank: user.rank,
          coins: user.coins,
          energy: user.energy,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          questsCompleted: user.questsCompleted,
          xpProgress,
        },
        stats,
        activeQuests,
        activityMap,
        recentHistory: recentHistory.slice(0, 10),
      },
    });
  } catch (err) { next(err); }
};

// GET /api/users/profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({ success: true, data: { user } });
  } catch (err) { next(err); }
};

// PATCH /api/users/profile
exports.updateProfile = async (req, res, next) => {
  try {
    const allowed = ['displayName', 'bio', 'avatar', 'timezone', 'theme', 'soundEnabled', 'notificationsEnabled', 'activeTitle'];
    const updates = {};
    allowed.forEach(field => { if (req.body[field] !== undefined) updates[field] = req.body[field]; });
    
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'PROFILE UPDATED.', data: { user } });
  } catch (err) { next(err); }
};

// PATCH /api/users/change-password
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id).select('+password');
    
    if (!user.password) throw new AppError('OAuth account — no password set.', 400);
    
    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) throw new AppError('Current password incorrect.', 401);
    
    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: 'PASSWORD UPDATED.' });
  } catch (err) { next(err); }
};

// GET /api/users/history
exports.getHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, event } = req.query;
    const filter = { userId: req.user._id };
    if (event) filter.event = event;
    
    const total = await History.countDocuments(filter);
    const history = await History.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    res.json({ success: true, data: { history, total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (err) { next(err); }
};

// GET /api/users/export
exports.exportData = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const stats = await Stat.find({ userId: user._id });
    const quests = await Quest.find({ userId: user._id }).limit(100);
    const history = await History.find({ userId: user._id }).sort({ createdAt: -1 }).limit(200);
    
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: {
        username: user.username,
        level: user.level,
        rank: user.rank,
        totalXP: user.totalXP,
        coins: user.coins,
        questsCompleted: user.questsCompleted,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
      },
      stats: stats.map(s => ({ name: s.name, level: s.level, totalXP: s.totalXP })),
      questHistory: quests.slice(0, 50).map(q => ({
        title: q.title,
        status: q.status,
        xpReward: q.xpReward,
        completedAt: q.completedAt,
      })),
      activityHistory: history.slice(0, 100).map(h => ({
        event: h.event,
        xpGained: h.xpGained,
        date: h.createdAt,
      })),
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename="system-export-${user.username}.json"`);
    res.json(exportData);
  } catch (err) { next(err); }
};
