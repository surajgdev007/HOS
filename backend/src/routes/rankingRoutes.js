const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');
const router = express.Router();

router.get('/', protect, async (req, res, next) => {
  try {
    const { limit = 50, page = 1 } = req.query;
    const users = await User.find({ isActive: true })
      .select('username displayName avatar level rank totalXP currentStreak questsCompleted')
      .sort({ totalXP: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments({ isActive: true });
    const currentUser = users.findIndex(u => u._id.toString() === req.user._id.toString()) + 1;
    
    const ranked = users.map((u, idx) => ({
      ...u.toObject(),
      position: (page - 1) * limit + idx + 1,
    }));
    
    res.json({ success: true, data: { rankings: ranked, total, currentUserPosition: currentUser } });
  } catch (err) { next(err); }
});

module.exports = router;
