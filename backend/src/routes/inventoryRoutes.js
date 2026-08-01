const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const InventoryItem = require('../models/InventoryItem');
const router = express.Router();

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const items = await InventoryItem.find({ userId: req.user._id }).sort({ rarity: -1, createdAt: -1 });
    res.json({ success: true, data: { items } });
  } catch (err) { next(err); }
});

router.patch('/:id/equip', async (req, res, next) => {
  try {
    const item = await InventoryItem.findOne({ _id: req.params.id, userId: req.user._id });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    item.isEquipped = !item.isEquipped;
    await item.save();
    res.json({ success: true, data: { item }, message: item.isEquipped ? 'ITEM EQUIPPED.' : 'ITEM UNEQUIPPED.' });
  } catch (err) { next(err); }
});

module.exports = router;
