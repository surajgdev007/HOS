const mongoose = require('mongoose');

const aiLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  command: { type: String, required: true },
  response: { type: String, required: true },
  tokensUsed: { type: Number },
  model: { type: String },
  latencyMs: { type: Number },
}, { timestamps: true });

aiLogSchema.index({ userId: 1, createdAt: -1 });

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  event: {
    type: String,
    enum: ['quest_complete', 'quest_fail', 'level_up', 'rank_up', 'achievement_unlock', 'boss_defeat', 'xp_gain', 'item_acquire'],
    required: true,
  },
  xpGained: { type: Number, default: 0 },
  coinsGained: { type: Number, default: 0 },
  details: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

historySchema.index({ userId: 1, createdAt: -1 });

const shopItemSchema = new mongoose.Schema({
  itemId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  type: {
    type: String,
    enum: ['theme', 'avatar', 'voice', 'particle', 'icon', 'badge', 'title', 'item'],
    required: true,
  },
  price: { type: Number, required: true, min: 0 },
  currency: { type: String, enum: ['coins', 'premium'], default: 'coins' },
  icon: { type: String },
  preview: { type: String },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
  isAvailable: { type: Boolean, default: true },
  tags: [String],
}, { timestamps: true });

const AILog = mongoose.model('AILog', aiLogSchema);
const History = mongoose.model('History', historySchema);
const ShopItem = mongoose.model('ShopItem', shopItemSchema);

module.exports = { AILog, History, ShopItem };
