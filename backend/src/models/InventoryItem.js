const mongoose = require('mongoose');

const inventoryItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['weapon', 'armor', 'consumable', 'theme', 'avatar', 'badge', 'book', 'certificate', 'special'],
    default: 'special',
  },
  rarity: {
    type: String,
    enum: ['common', 'rare', 'epic', 'legendary'],
    default: 'common',
  },
  icon: { type: String, default: '📦' },
  isEquipped: { type: Boolean, default: false },
  acquiredFrom: { type: String }, // 'quest', 'shop', 'achievement', 'system'
  quantity: { type: Number, default: 1, min: 0 },
}, { timestamps: true });

inventoryItemSchema.index({ userId: 1 });
inventoryItemSchema.index({ userId: 1, itemId: 1 });

module.exports = mongoose.model('InventoryItem', inventoryItemSchema);
