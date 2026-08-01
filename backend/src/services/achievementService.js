const { Achievement, UserAchievement } = require('../models/Achievement');
const Quest = require('../models/Quest');
const User = require('../models/User');
const { History } = require('../models/Supporting');
const logger = require('../utils/logger');
const { default: mongoose } = require('mongoose');

const ACHIEVEMENT_DEFINITIONS = [
  { achievementId: 'first_blood', title: 'First Blood', description: 'Complete your first quest.', icon: '🗡️', rarity: 'common', xpReward: 50, condition: { type: 'questCount', value: 1 } },
  { achievementId: 'code_warrior', title: 'Code Warrior', description: 'Complete 100 coding quests.', icon: '💻', rarity: 'epic', xpReward: 500, isHidden: true, condition: { type: 'questCount', value: 100 } },
  { achievementId: 'iron_discipline', title: 'Iron Discipline', description: 'Maintain a 30-day streak.', icon: '🔥', rarity: 'epic', xpReward: 1000, condition: { type: 'streakDays', value: 30 } },
  { achievementId: 'ascendant', title: 'Ascendant', description: 'Reach Level 50.', icon: '⚡', rarity: 'legendary', xpReward: 2000, condition: { type: 'level', value: 50 } },
  { achievementId: 's_rank', title: 'S-Rank Awakened', description: 'Reach S Rank.', icon: '👑', rarity: 'legendary', xpReward: 5000, isHidden: true, condition: { type: 'rank', value: mongoose.Schema.Types.Mixed, stat: String} },
  { achievementId: 'immortal', title: 'Immortal', description: 'Reach Level 100.', icon: '♾️', rarity: 'legendary', xpReward: 10000, isHidden: true, condition: { type: 'level', value: 100 } },
  { achievementId: 'week_warrior', title: 'Week Warrior', description: 'Maintain a 7-day streak.', icon: '📅', rarity: 'rare', xpReward: 200, condition: { type: 'streakDays', value: 7 } },
  { achievementId: 'centurion', title: 'Centurion', description: 'Complete 100 quests total.', icon: '🏛️', rarity: 'epic', xpReward: 500, condition: { type: 'questCount', value: 100 } },
  { achievementId: 'boss_slayer', title: 'Boss Slayer', description: 'Defeat your first boss.', icon: '⚔️', rarity: 'rare', xpReward: 300, condition: { type: 'bossCount', value: 1 } },
  { achievementId: 'mindmaster', title: 'Mind Master', description: 'Reach Intelligence Level 20.', icon: '🧠', rarity: 'epic', xpReward: 500, isHidden: true, condition: { type: 'statLevel', value: 20, stat: 'Intelligence' } },
];

exports.initializeAchievements = async () => {
  for (const def of ACHIEVEMENT_DEFINITIONS) {
    await Achievement.findOneAndUpdate(
      { achievementId: def.achievementId },
      def,
      { upsert: true, new: true }
    );
  }
  logger.info('Achievement definitions initialized.');
};

exports.checkAchievements = async (user) => {
  try {
    const allAchievements = await Achievement.find();
    const userAchievements = await UserAchievement.find({ userId: user._id });
    const unlockedIds = new Set(userAchievements.map(a => a.achievementId));
    const newlyUnlocked = [];
    
    const questCount = await Quest.countDocuments({ userId: user._id, status: 'completed' });
    
    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.achievementId)) continue;
      
      let unlock = false;
      const { condition } = achievement;
      
      if (condition.type === 'questCount' && questCount >= condition.value) unlock = true;
      if (condition.type === 'streakDays' && user.currentStreak >= condition.value) unlock = true;
      if (condition.type === 'level' && user.level >= condition.value) unlock = true;
      if (condition.type === 'rank' && rankValue(user.rank) >= rankValue(condition.value)) unlock = true;
      if (condition.type === 'bossCount' && user.bossesDefeated >= condition.value) unlock = true;
      
      if (unlock) {
        await UserAchievement.create({ userId: user._id, achievementId: achievement.achievementId });
        if (achievement.xpReward) await user.addXP(achievement.xpReward);
        await History.create({ userId: user._id, event: 'achievement_unlock', xpGained: achievement.xpReward, details: { achievementId: achievement.achievementId, title: achievement.title } });
        newlyUnlocked.push(achievement);
      }
    }
    
    return newlyUnlocked;
  } catch (err) {
    logger.error('Achievement check error:', err);
    return [];
  }
};

const RANKS_ORDER = ['E', 'E+', 'D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', 'S', 'SS', 'SSS', 'Legend', 'Immortal'];
const rankValue = (rank) => RANKS_ORDER.indexOf(rank);
