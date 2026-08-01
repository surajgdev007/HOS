const mongoose = require('mongoose');

const statSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: {
    type: String,
    required: true,
    enum: ['Strength', 'Discipline', 'Intelligence', 'Communication', 'Coding', 'Health', 'Finance', 'Confidence', 'Luck'],
  },
  level: { type: Number, default: 1, min: 1 },
  currentXP: { type: Number, default: 0, min: 0 },
  totalXP: { type: Number, default: 0, min: 0 },
  history: [{
    xp: Number,
    reason: String,
    date: { type: Date, default: Date.now },
  }],
}, { timestamps: true });

statSchema.methods.xpForNextLevel = function() {
  return this.level * this.level * 50; // Stat levels are easier
};

statSchema.methods.addXP = async function(amount, reason = '') {
  this.currentXP += amount;
  this.totalXP += amount;
  this.history.push({ xp: amount, reason });
  
  // Keep history last 50 entries
  if (this.history.length > 50) {
    this.history = this.history.slice(-50);
  }
  
  let leveled = false;
  while (this.currentXP >= this.xpForNextLevel()) {
    this.currentXP -= this.xpForNextLevel();
    this.level += 1;
    leveled = true;
  }
  
  await this.save();
  return { leveled, newLevel: this.level };
};

statSchema.index({ userId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Stat', statSchema);
