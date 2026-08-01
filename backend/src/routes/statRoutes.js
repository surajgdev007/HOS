const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Stat = require('../models/Stat');
const { AppError } = require('../utils/errors');
const router = express.Router();

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const stats = await Stat.find({ userId: req.user._id });
    res.json({ success: true, data: { stats } });
  } catch (err) { next(err); }
});

router.get('/:name', async (req, res, next) => {
  try {
    const stat = await Stat.findOne({ userId: req.user._id, name: req.params.name });
    if (!stat) throw new AppError('Stat not found.', 404);
    res.json({ success: true, data: { stat } });
  } catch (err) { next(err); }
});

router.post('/:name/add-xp', async (req, res, next) => {
  try {
    const { amount, reason } = req.body;
    const stat = await Stat.findOne({ userId: req.user._id, name: req.params.name });
    if (!stat) throw new AppError('Stat not found.', 404);
    const result = await stat.addXP(amount, reason);
    res.json({ success: true, data: { stat, result } });
  } catch (err) { next(err); }
});

module.exports = router;
