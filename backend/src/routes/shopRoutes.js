const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { ShopItem } = require('../models/Supporting');
const InventoryItem = require('../models/InventoryItem');
const User = require('../models/User');
const { AppError } = require('../utils/errors');
const router = express.Router();

router.use(protect);

router.get('/', async (req, res, next) => {
  try {
    const { type } = req.query;
    const filter = { isAvailable: true };
    if (type) filter.type = type;
    const items = await ShopItem.find(filter).sort({ price: 1 });
    const user = await User.findById(req.user._id).select('coins purchasedItems');
    const purchasedIds = new Set(user.purchasedItems.map(id => id.toString()));
    
    const itemsWithStatus = items.map(item => ({
      ...item.toObject(),
      isPurchased: purchasedIds.has(item._id.toString()),
      canAfford: user.coins >= item.price,
    }));
    
    res.json({ success: true, data: { items: itemsWithStatus, userCoins: user.coins } });
  } catch (err) { next(err); }
});

router.post('/:itemId/purchase', async (req, res, next) => {
  try {
    const item = await ShopItem.findOne({ itemId: req.params.itemId, isAvailable: true });
    if (!item) throw new AppError('Item not found.', 404);
    
    const user = await User.findById(req.user._id);
    if (user.purchasedItems.includes(item._id)) throw new AppError('Item already owned.', 400);
    if (user.coins < item.price) throw new AppError('Insufficient coins.', 400);
    
    user.coins -= item.price;
    user.purchasedItems.push(item._id);
    await user.save();
    
    await InventoryItem.create({
      userId: user._id,
      itemId: item.itemId,
      name: item.name,
      description: item.description,
      type: item.type === 'theme' ? 'theme' : 'special',
      rarity: item.rarity,
      icon: item.icon,
      acquiredFrom: 'shop',
    });
    
    res.json({ success: true, message: 'ITEM ACQUIRED.', data: { item, remainingCoins: user.coins } });
  } catch (err) { next(err); }
});

module.exports = router;
