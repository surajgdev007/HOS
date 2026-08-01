// ============================
// CORE TYPES
// ============================

export type Rank = 'E' | 'E+' | 'D' | 'D+' | 'C' | 'C+' | 'B' | 'B+' | 'A' | 'A+' | 'S' | 'SS' | 'SSS' | 'Legend' | 'Immortal'

export type StatName = 'Strength' | 'Discipline' | 'Intelligence' | 'Communication' | 'Coding' | 'Health' | 'Finance' | 'Confidence' | 'Luck'

export type QuestType = 'daily' | 'weekly' | 'boss' | 'emergency' | 'custom'
export type QuestStatus = 'available' | 'active' | 'completed' | 'failed' | 'expired'
export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'legendary'
export type QuestCategory = 'coding' | 'fitness' | 'mindset' | 'communication' | 'finance' | 'learning' | 'health' | 'career' | 'custom'
export type ItemRarity = 'common' | 'rare' | 'epic' | 'legendary'

// ============================
// USER
// ============================

export interface XPProgress {
  current: number
  required: number
  percentage: number
}

export interface User {
  _id: string
  email: string
  username: string
  displayName: string
  avatar?: string
  bio?: string
  level: number
  currentXP: number
  totalXP: number
  rank: Rank
  coins: number
  energy: number
  currentStreak: number
  longestStreak: number
  questsCompleted: number
  questsFailed: number
  bossesDefeated: number
  titles: string[]
  activeTitle: string
  theme: string
  soundEnabled: boolean
  notificationsEnabled: boolean
  isEmailVerified: boolean
  createdAt: string
  updatedAt: string
  xpProgress?: XPProgress
}

// ============================
// STATS
// ============================

export interface Stat {
  _id: string
  userId: string
  name: StatName
  level: number
  currentXP: number
  totalXP: number
  history: Array<{ xp: number; reason: string; date: string }>
  createdAt: string
}

// ============================
// QUESTS
// ============================

export interface StatReward {
  stat: StatName
  amount: number
}

export interface QuestObjective {
  text: string
  completed: boolean
}

export interface Quest {
  _id: string
  userId: string
  title: string
  description?: string
  category: QuestCategory
  type: QuestType
  difficulty: QuestDifficulty
  xpReward: number
  coinReward: number
  statRewards: StatReward[]
  xpPenalty: number
  status: QuestStatus
  isAIGenerated: boolean
  icon: string
  objectives: QuestObjective[]
  expiresAt?: string
  acceptedAt?: string
  completedAt?: string
  failedAt?: string
  createdAt: string
}

// ============================
// ACHIEVEMENTS
// ============================

export interface Achievement {
  _id: string
  achievementId: string
  title: string
  description: string
  icon: string
  rarity: ItemRarity
  isHidden: boolean
  xpReward: number
  isUnlocked: boolean
  isRevealed: boolean
  unlockedAt?: string
}

// ============================
// INVENTORY
// ============================

export interface InventoryItem {
  _id: string
  userId: string
  itemId: string
  name: string
  description?: string
  type: string
  rarity: ItemRarity
  icon: string
  isEquipped: boolean
  acquiredFrom?: string
  quantity: number
  createdAt: string
}

// ============================
// SKILLS
// ============================

export type SkillBranch = 'Coding' | 'Communication' | 'Leadership' | 'Fitness' | 'Money' | 'Mindset' | 'Business' | 'AI'

export interface SkillNode {
  _id: string
  skillId: string
  name: string
  description: string
  branch: SkillBranch
  tier: number
  prerequisites: string[]
  xpRequired: number
  icon?: string
  isUnlocked: boolean
  canUnlock: boolean
  userLevel: number
  position?: { x: number; y: number }
}

// ============================
// BOSS BATTLES
// ============================

export interface BossObjective {
  text: string
  metric: string
  target: number
  unit: string
}

export interface BossBattle {
  _id: string
  weekId: string
  title: string
  description: string
  icon: string
  difficulty: string
  objectives: BossObjective[]
  rewards: {
    xp: number
    coins: number
    badge?: string
    title?: string
  }
  startDate: string
  endDate: string
  defeatedBy: string[]
  participantCount: number
}

// ============================
// RANKINGS
// ============================

export interface RankingEntry {
  _id: string
  username: string
  displayName: string
  avatar?: string
  level: number
  rank: Rank
  totalXP: number
  currentStreak: number
  questsCompleted: number
  position: number
}

// ============================
// TERMINAL
// ============================

export interface TerminalEntry {
  id: string
  type: 'command' | 'response' | 'system' | 'error'
  content: string
  timestamp: Date
}

// ============================
// SHOP
// ============================

export interface ShopItem {
  _id: string
  itemId: string
  name: string
  description: string
  type: string
  price: number
  currency: 'coins' | 'premium'
  icon?: string
  rarity: ItemRarity
  isPurchased: boolean
  canAfford: boolean
}

// ============================
// DASHBOARD
// ============================

export interface DashboardData {
  user: User & { xpProgress: XPProgress }
  stats: Stat[]
  activeQuests: Quest[]
  activityMap: Record<string, number>
  recentHistory: Array<{
    event: string
    xpGained: number
    coinsGained: number
    details: Record<string, unknown>
    createdAt: string
  }>
}

// ============================
// API RESPONSE
// ============================

export interface ApiResponse<T = unknown> {
  success: boolean
  message?: string
  data?: T
  errors?: Array<{ field: string; message: string }>
}

export interface AuthResponse {
  user: User
  accessToken: string
}
