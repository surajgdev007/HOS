const mongoose = require('mongoose');

const bossBattleSchema = new mongoose.Schema({
  weekId: { type: String, required: true, unique: true }, // e.g. "2024-W01"
  title: { type: String, required: true },
  description: { type: String },
  icon: { type: String, default: '👹' },
  difficulty: { type: String, enum: ['normal', 'hard', 'legendary'], default: 'hard' },
  
  objectives: [{
    text: String,
    metric: String, // 'dsaProblems', 'workoutDays', 'pagesRead', etc.
    target: Number,
    unit: String,
  }],
  
  rewards: {
    xp: { type: Number, default: 500 },
    coins: { type: Number, default: 100 },
    badge: { type: String },
    title: { type: String },
    item: { type: String },
  },
  
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  
  // Participants who defeated the boss
  defeatedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  participantCount: { type: Number, default: 0 },
  
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const userBossProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bossBattleId: { type: mongoose.Schema.Types.ObjectId, ref: 'BossBattle', required: true },
  progress: [{
    objectiveIndex: Number,
    current: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
  }],
  status: { type: String, enum: ['in_progress', 'completed', 'failed'], default: 'in_progress' },
  completedAt: { type: Date },
}, { timestamps: true });

const BossBattle = mongoose.model('BossBattle', bossBattleSchema);
const UserBossProgress = mongoose.model('UserBossProgress', userBossProgressSchema);

module.exports = { BossBattle, UserBossProgress };
