const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const RANKS = ['E', 'E+', 'D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', 'S', 'SS', 'SSS', 'Legend', 'Immortal'];

const userSchema = new mongoose.Schema({
  // Auth
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, select: false, minlength: 8 },
  googleId: { type: String, sparse: true },
  githubId: { type: String, sparse: true },
  isEmailVerified: { type: Boolean, default: false },
  refreshToken: { type: String, select: false },

  // Profile
  username: { type: String, required: true, unique: true, trim: true, minlength: 3, maxlength: 30 },
  displayName: { type: String, trim: true, maxlength: 50 },
  avatar: { type: String },
  bio: { type: String, maxlength: 200 },
  timezone: { type: String, default: 'UTC' },

  // RPG Core
  level: { type: Number, default: 1, min: 1 },
  currentXP: { type: Number, default: 0, min: 0 },
  totalXP: { type: Number, default: 0, min: 0 },
  rank: { type: String, enum: RANKS, default: 'E' },
  coins: { type: Number, default: 0, min: 0 },
  energy: { type: Number, default: 100, min: 0, max: 100 },
  
  // Streak
  currentStreak: { type: Number, default: 0, min: 0 },
  longestStreak: { type: Number, default: 0, min: 0 },
  lastActiveDate: { type: Date },

  // Settings
  theme: { type: String, default: 'default' },
  soundEnabled: { type: Boolean, default: true },
  notificationsEnabled: { type: Boolean, default: true },
  
  // Titles
  titles: [{ type: String }],
  activeTitle: { type: String, default: '' },
  
  // Inventory items refs
  purchasedItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ShopItem' }],

  // Stats summary
  questsCompleted: { type: Number, default: 0 },
  questsFailed: { type: Number, default: 0 },
  bossesDefeated: { type: Number, default: 0 },
  
  // System flags
  isActive: { type: Boolean, default: true },
  lastSystemMessage: { type: String },
  systemMessageDate: { type: Date },
  
}, { timestamps: true });

// XP required for next level: level² × 100
userSchema.methods.xpForNextLevel = function() {
  return this.level * this.level * 100;
};

userSchema.methods.xpProgress = function() {
  return {
    current: this.currentXP,
    required: this.xpForNextLevel(),
    percentage: Math.min(100, Math.floor((this.currentXP / this.xpForNextLevel()) * 100)),
  };
};

userSchema.methods.calculateRank = function() {
  const rankThresholds = [
    { rank: 'E',  minLevel: 1 },
    { rank: 'E+', minLevel: 5 },
    { rank: 'D',  minLevel: 10 },
    { rank: 'D+', minLevel: 15 },
    { rank: 'C',  minLevel: 20 },
    { rank: 'C+', minLevel: 30 },
    { rank: 'B',  minLevel: 40 },
    { rank: 'B+', minLevel: 50 },
    { rank: 'A',  minLevel: 60 },
    { rank: 'A+', minLevel: 70 },
    { rank: 'S',  minLevel: 80 },
    { rank: 'SS', minLevel: 90 },
    { rank: 'SSS',minLevel: 95 },
    { rank: 'Legend', minLevel: 99 },
    { rank: 'Immortal', minLevel: 100 },
  ];
  for (let i = rankThresholds.length - 1; i >= 0; i--) {
    if (this.level >= rankThresholds[i].minLevel) {
      return rankThresholds[i].rank;
    }
  }
  return 'E';
};

userSchema.methods.addXP = async function(amount) {
  this.currentXP += amount;
  this.totalXP += amount;
  let leveled = false;
  
  while (this.currentXP >= this.xpForNextLevel()) {
    this.currentXP -= this.xpForNextLevel();
    this.level += 1;
    leveled = true;
  }
  
  const newRank = this.calculateRank();
  const rankChanged = newRank !== this.rank;
  if (rankChanged) this.rank = newRank;
  
  await this.save();
  return { leveled, rankChanged, newRank, newLevel: this.level };
};

userSchema.methods.initializeCharacter = async function() {
  const Stat = require('./Stat');
  const statNames = ['Strength', 'Discipline', 'Intelligence', 'Communication', 'Coding', 'Health', 'Finance', 'Confidence', 'Luck'];
  
  const stats = statNames.map(name => ({
    userId: this._id,
    name,
    level: 1,
    currentXP: 0,
    totalXP: 0,
  }));
  
  await Stat.insertMany(stats);
  
  // Give starting inventory
  const InventoryItem = require('./InventoryItem');
  await InventoryItem.create({
    userId: this._id,
    itemId: 'starter_coffee',
    name: 'System Coffee',
    description: 'Fuels the awakening.',
    type: 'consumable',
    rarity: 'common',
    icon: '☕',
  });
};

// Hash password before save
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.index({ totalXP: -1 });
userSchema.index({ level: -1 });

module.exports = mongoose.model('User', userSchema);
