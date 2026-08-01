const mongoose = require('mongoose');

const skillNodeSchema = new mongoose.Schema({
  skillId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String },
  branch: {
    type: String,
    enum: ['Coding', 'Communication', 'Leadership', 'Fitness', 'Money', 'Mindset', 'Business', 'AI'],
    required: true,
  },
  tier: { type: Number, default: 1, min: 1, max: 5 },
  prerequisites: [{ type: String }], // skillIds
  xpRequired: { type: Number, default: 0 },
  icon: { type: String },
  unlockReward: { type: String },
  position: { x: Number, y: Number }, // For skill tree rendering
}, { timestamps: true });

const userSkillSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillId: { type: String, required: true },
  level: { type: Number, default: 1 },
  unlockedAt: { type: Date, default: Date.now },
  xpInvested: { type: Number, default: 0 },
}, { timestamps: true });

userSkillSchema.index({ userId: 1, skillId: 1 }, { unique: true });

const SkillNode = mongoose.model('SkillNode', skillNodeSchema);
const UserSkill = mongoose.model('UserSkill', userSkillSchema);

module.exports = { SkillNode, UserSkill };
