const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { BossBattle, UserBossProgress } = require('../models/BossBattle');
const { AppError } = require('../utils/errors');
const router = express.Router();

router.use(protect);

router.get('/current', async (req, res, next) => {
  try {
    const now = new Date();
    const boss = await BossBattle.findOne({ startDate: { $lte: now }, endDate: { $gte: now }, isActive: true });
    if (!boss) return res.json({ success: true, data: { boss: null } });
    
    const progress = await UserBossProgress.findOne({ userId: req.user._id, bossBattleId: boss._id });
    res.json({ success: true, data: { boss, progress } });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const bosses = await BossBattle.find().sort({ startDate: -1 }).limit(10);
    res.json({ success: true, data: { bosses } });
  } catch (err) { next(err); }
});

router.post('/:id/progress', async (req, res, next) => {
  try {
    const { objectiveIndex, value } = req.body;
    const boss = await BossBattle.findById(req.params.id);
    if (!boss) throw new AppError('Boss not found.', 404);
    
    let progress = await UserBossProgress.findOne({ userId: req.user._id, bossBattleId: boss._id });
    if (!progress) {
      progress = await UserBossProgress.create({
        userId: req.user._id,
        bossBattleId: boss._id,
        progress: boss.objectives.map((_, i) => ({ objectiveIndex: i, current: 0, completed: false })),
      });
    }
    
    const obj = progress.progress[objectiveIndex];
    if (obj) {
      obj.current = Math.min(value, boss.objectives[objectiveIndex].target);
      obj.completed = obj.current >= boss.objectives[objectiveIndex].target;
    }
    
    const allDone = progress.progress.every(p => p.completed);
    if (allDone && progress.status !== 'completed') {
      progress.status = 'completed';
      progress.completedAt = new Date();
      if (!boss.defeatedBy.includes(req.user._id)) {
        boss.defeatedBy.push(req.user._id);
        await boss.save();
      }
    }
    
    await progress.save();
    res.json({ success: true, data: { progress }, message: allDone ? 'BOSS DEFEATED.' : 'PROGRESS RECORDED.' });
  } catch (err) { next(err); }
});

module.exports = router;
