const Quest = require('../models/Quest');
const User = require('../models/User');
const Stat = require('../models/Stat');
const { History } = require('../models/Supporting');
const { AppError } = require('../utils/errors');
const achievementService = require('../services/achievementService');

// GET /api/quests
exports.getQuests = async (req, res, next) => {
  try {
    const { type, status } = req.query;
    const filter = { userId: req.user._id };
    if (type) filter.type = type;
    if (status) filter.status = status;
    else filter.status = { $in: ['available', 'active'] };
    
    const quests = await Quest.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: { quests } });
  } catch (err) { next(err); }
};

// GET /api/quests/history
exports.getQuestHistory = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const quests = await Quest.find({
      userId: req.user._id,
      status: { $in: ['completed', 'failed', 'expired'] },
    })
    .sort({ updatedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
    
    res.json({ success: true, data: { quests } });
  } catch (err) { next(err); }
};

// POST /api/quests
exports.createQuest = async (req, res, next) => {
  try {
    const { title, description, category, type, difficulty, xpReward, coinReward, statRewards, xpPenalty, icon, objectives, expiresAt } = req.body;
    
    const quest = await Quest.create({
      userId: req.user._id,
      title, description, category, type, difficulty,
      xpReward: xpReward || 50,
      coinReward: coinReward || 0,
      statRewards: statRewards || [],
      xpPenalty: xpPenalty || 0,
      icon: icon || '⚔️',
      objectives: objectives || [],
      expiresAt,
      status: 'available',
    });
    
    res.status(201).json({ success: true, message: 'QUEST REGISTERED.', data: { quest } });
  } catch (err) { next(err); }
};

// PATCH /api/quests/:id/accept
exports.acceptQuest = async (req, res, next) => {
  try {
    const quest = await Quest.findOne({ _id: req.params.id, userId: req.user._id });
    if (!quest) throw new AppError('Quest not found.', 404);
    if (quest.status !== 'available') throw new AppError('Quest not available.', 400);
    
    quest.status = 'active';
    quest.acceptedAt = new Date();
    await quest.save();
    
    res.json({ success: true, message: 'MISSION ACCEPTED.', data: { quest } });
  } catch (err) { next(err); }
};

// PATCH /api/quests/:id/complete
exports.completeQuest = async (req, res, next) => {
  try {
    const quest = await Quest.findOne({ _id: req.params.id, userId: req.user._id });
    if (!quest) throw new AppError('Quest not found.', 404);
    if (!['available', 'active'].includes(quest.status)) throw new AppError('Quest cannot be completed.', 400);
    
    quest.status = 'completed';
    quest.completedAt = new Date();
    await quest.save();
    
    const user = await User.findById(req.user._id);
    
    // Award XP
    const levelResult = await user.addXP(quest.xpReward);
    user.coins += quest.coinReward || 0;
    user.questsCompleted += 1;
    await user.save();
    
    // Award stat XP
    const statResults = [];
    for (const reward of quest.statRewards) {
      const stat = await Stat.findOne({ userId: user._id, name: reward.stat });
      if (stat) {
        const statResult = await stat.addXP(reward.amount, `Quest: ${quest.title}`);
        statResults.push({ stat: reward.stat, ...statResult });
      }
    }
    
    // Log history
    await History.create({
      userId: user._id,
      event: 'quest_complete',
      xpGained: quest.xpReward,
      coinsGained: quest.coinReward || 0,
      details: { questId: quest._id, questTitle: quest.title },
    });
    
    // Check achievements
    await achievementService.checkAchievements(user);
    
    res.json({
      success: true,
      message: 'QUEST COMPLETE. REWARDS DISTRIBUTED.',
      data: {
        quest,
        rewards: { xp: quest.xpReward, coins: quest.coinReward },
        levelResult,
        statResults,
        user: { level: user.level, currentXP: user.currentXP, rank: user.rank, coins: user.coins },
      },
    });
  } catch (err) { next(err); }
};

// PATCH /api/quests/:id/fail
exports.failQuest = async (req, res, next) => {
  try {
    const quest = await Quest.findOne({ _id: req.params.id, userId: req.user._id });
    if (!quest) throw new AppError('Quest not found.', 404);
    if (!['available', 'active'].includes(quest.status)) throw new AppError('Quest already resolved.', 400);
    
    quest.status = 'failed';
    quest.failedAt = new Date();
    await quest.save();
    
    const user = await User.findById(req.user._id);
    user.questsFailed += 1;
    
    // Apply penalty
    if (quest.xpPenalty > 0) {
      user.currentXP = Math.max(0, user.currentXP - quest.xpPenalty);
      user.totalXP = Math.max(0, user.totalXP - quest.xpPenalty);
    }
    await user.save();
    
    await History.create({
      userId: user._id,
      event: 'quest_fail',
      xpGained: -quest.xpPenalty,
      details: { questId: quest._id, questTitle: quest.title },
    });
    
    res.json({
      success: true,
      message: 'QUEST FAILED. PENALTY APPLIED.',
      data: {
        quest,
        penalty: { xp: quest.xpPenalty },
        user: { currentXP: user.currentXP, totalXP: user.totalXP },
      },
    });
  } catch (err) { next(err); }
};

// DELETE /api/quests/:id
exports.deleteQuest = async (req, res, next) => {
  try {
    const quest = await Quest.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!quest) throw new AppError('Quest not found.', 404);
    res.json({ success: true, message: 'QUEST DELETED.' });
  } catch (err) { next(err); }
};
