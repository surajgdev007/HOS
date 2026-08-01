const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  // Definition (global)
  achievementId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String },
  icon: { type: String, default: '🏆' },
  rarity: { type: String, enum: ['common', 'rare', 'epic', 'legendary'], default: 'common' },
  isHidden: { type: Boolean, default: false },
  xpReward: { type: Number, default: 0 },
  category: { type: String },
  
  // Unlock condition
  condition: {
    type: { type: String }, // 'questCount', 'streakDays', 'level', 'statLevel', etc.
    value: mongoose.Schema.Types.Mixed,
    stat: String,
  },
}, { timestamps: true });

const userAchievementSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  achievementId: { type: String, required: true },
  unlockedAt: { type: Date, default: Date.now },
  progress: { type: Number, default: 0 },
  maxProgress: { type: Number, default: 1 },
}, { timestamps: true });

userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

const Achievement = mongoose.model('Achievement', achievementSchema);
const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);

module.exports = { Achievement, UserAchievement };
