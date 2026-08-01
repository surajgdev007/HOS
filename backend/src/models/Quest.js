const mongoose = require('mongoose');

const questSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  title: { type: String, required: true, trim: true },
  description: { type: String, trim: true },
  category: {
    type: String,
    enum: ['coding', 'fitness', 'mindset', 'communication', 'finance', 'learning', 'health', 'career', 'custom'],
    default: 'custom',
  },
  type: {
    type: String,
    enum: ['daily', 'weekly', 'boss', 'emergency', 'custom'],
    default: 'daily',
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'legendary'],
    default: 'medium',
  },
  
  // Rewards
  xpReward: { type: Number, default: 50 },
  coinReward: { type: Number, default: 0 },
  statRewards: [{
    stat: String,
    amount: Number,
  }],
  
  // Penalty for failure
  xpPenalty: { type: Number, default: 0 },
  
  // Status
  status: {
    type: String,
    enum: ['available', 'active', 'completed', 'failed', 'expired'],
    default: 'available',
  },
  
  // AI Generated
  isAIGenerated: { type: Boolean, default: false },
  aiReasoning: { type: String },
  
  // Timing
  expiresAt: { type: Date },
  acceptedAt: { type: Date },
  completedAt: { type: Date },
  failedAt: { type: Date },
  
  // Progress tracking
  objectives: [{
    text: String,
    completed: { type: Boolean, default: false },
  }],
  
  // For boss battles
  bossId: { type: mongoose.Schema.Types.ObjectId, ref: 'BossBattle' },
  
  // Icon / emoji
  icon: { type: String, default: '⚔️' },
  
}, { timestamps: true });

questSchema.index({ userId: 1, status: 1 });
questSchema.index({ userId: 1, type: 1 });
questSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Quest', questSchema);
