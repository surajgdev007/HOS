const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { Achievement, UserAchievement } = require('../models/Achievement');
const router = express.Router();

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const all = await Achievement.find();
    const unlocked = await UserAchievement.find({ userId: req.user._id });
    const unlockedIds = new Set(unlocked.map(u => u.achievementId));
    
    const achievements = all.map(a => ({
      ...a.toObject(),
      isUnlocked: unlockedIds.has(a.achievementId),
      unlockedAt: unlocked.find(u => u.achievementId === a.achievementId)?.unlockedAt,
      isRevealed: !a.isHidden || unlockedIds.has(a.achievementId),
    }));
    
    res.json({ success: true, data: { achievements, unlockedCount: unlocked.length, totalCount: all.length } });
  } catch (err) { next(err); }
});

module.exports = router;
