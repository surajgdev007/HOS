const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { SkillNode, UserSkill } = require('../models/Skill');
const { AppError } = require('../utils/errors');
const router = express.Router();

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const allNodes = await SkillNode.find().sort({ branch: 1, tier: 1 });
    const userSkills = await UserSkill.find({ userId: req.user._id });
    const unlockedIds = new Set(userSkills.map(s => s.skillId));
    
    const nodes = allNodes.map(node => ({
      ...node.toObject(),
      isUnlocked: unlockedIds.has(node.skillId),
      canUnlock: node.prerequisites.every(p => unlockedIds.has(p)),
      userLevel: userSkills.find(s => s.skillId === node.skillId)?.level || 0,
    }));
    
    res.json({ success: true, data: { nodes } });
  } catch (err) { next(err); }
});

router.post('/:skillId/unlock', async (req, res, next) => {
  try {
    const node = await SkillNode.findOne({ skillId: req.params.skillId });
    if (!node) throw new AppError('Skill not found.', 404);
    
    const userSkills = await UserSkill.find({ userId: req.user._id });
    const unlockedIds = new Set(userSkills.map(s => s.skillId));
    
    if (unlockedIds.has(node.skillId)) throw new AppError('Skill already unlocked.', 400);
    if (!node.prerequisites.every(p => unlockedIds.has(p))) throw new AppError('Prerequisites not met.', 400);
    
    const userSkill = await UserSkill.create({ userId: req.user._id, skillId: node.skillId });
    res.json({ success: true, message: 'SKILL UNLOCKED.', data: { skill: userSkill } });
  } catch (err) { next(err); }
});

module.exports = router;
