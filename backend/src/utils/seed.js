require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/database");
const User = require("../models/User");
const { Achievement } = require("../models/Achievement");
const { SkillNode } = require("../models/Skill");
const { ShopItem } = require("../models/Supporting");
const { BossBattle } = require("../models/BossBattle");
const achievementService = require("../services/achievementService");

async function seed() {
  await connectDB();
  console.log("Connected to MongoDB. Seeding...");

  // Initialize achievements
  await achievementService.initializeAchievements();

  // Seed skill nodes
  await SkillNode.deleteMany({});
  const skillNodes = [
    // CODING branch
    {
      skillId: "coding_basics",
      name: "Programming Fundamentals",
      branch: "Coding",
      tier: 1,
      prerequisites: [],
      description: "Master the basics of code",
      icon: "📝",
      position: { x: 0, y: 0 },
    },
    {
      skillId: "coding_algo",
      name: "Algorithms",
      branch: "Coding",
      tier: 2,
      prerequisites: ["coding_basics"],
      description: "Data structures & algorithms",
      icon: "🔢",
      position: { x: 0, y: 1 },
    },
    {
      skillId: "coding_web",
      name: "Web Development",
      branch: "Coding",
      tier: 2,
      prerequisites: ["coding_basics"],
      description: "Frontend & backend mastery",
      icon: "🌐",
      position: { x: 1, y: 1 },
    },
    {
      skillId: "coding_ai",
      name: "AI Programming",
      branch: "Coding",
      tier: 3,
      prerequisites: ["coding_algo"],
      description: "Machine learning & AI",
      icon: "🤖",
      position: { x: 0, y: 2 },
    },
    {
      skillId: "coding_sys",
      name: "Systems Design",
      branch: "Coding",
      tier: 3,
      prerequisites: ["coding_web", "coding_algo"],
      description: "Scalable system architecture",
      icon: "🏗️",
      position: { x: 1, y: 2 },
    },
    // COMMUNICATION
    {
      skillId: "comm_basics",
      name: "Active Listening",
      branch: "Communication",
      tier: 1,
      prerequisites: [],
      description: "Foundation of all communication",
      icon: "👂",
    },
    {
      skillId: "comm_speak",
      name: "Public Speaking",
      branch: "Communication",
      tier: 2,
      prerequisites: ["comm_basics"],
      description: "Command any room",
      icon: "🎤",
    },
    {
      skillId: "comm_write",
      name: "Persuasive Writing",
      branch: "Communication",
      tier: 2,
      prerequisites: ["comm_basics"],
      description: "Write to influence",
      icon: "✍️",
    },
    {
      skillId: "comm_lead",
      name: "Leadership Communication",
      branch: "Communication",
      tier: 3,
      prerequisites: ["comm_speak", "comm_write"],
      description: "Inspire and direct others",
      icon: "🌟",
    },
    // LEADERSHIP
    {
      skillId: "lead_self",
      name: "Self Mastery",
      branch: "Leadership",
      tier: 1,
      prerequisites: [],
      description: "Lead yourself first",
      icon: "🧭",
    },
    {
      skillId: "lead_team",
      name: "Team Building",
      branch: "Leadership",
      tier: 2,
      prerequisites: ["lead_self"],
      description: "Build and manage teams",
      icon: "👥",
    },
    {
      skillId: "lead_vision",
      name: "Vision Casting",
      branch: "Leadership",
      tier: 3,
      prerequisites: ["lead_team"],
      description: "Define and drive missions",
      icon: "🔭",
    },
    // FITNESS
    {
      skillId: "fit_basics",
      name: "Movement Foundation",
      branch: "Fitness",
      tier: 1,
      prerequisites: [],
      description: "Build the physical base",
      icon: "🏃",
    },
    {
      skillId: "fit_strength",
      name: "Strength Training",
      branch: "Fitness",
      tier: 2,
      prerequisites: ["fit_basics"],
      description: "Build raw power",
      icon: "💪",
    },
    {
      skillId: "fit_endurance",
      name: "Endurance Protocol",
      branch: "Fitness",
      tier: 2,
      prerequisites: ["fit_basics"],
      description: "Unlimited stamina",
      icon: "🏋️",
    },
    // MONEY
    {
      skillId: "money_budget",
      name: "Budgeting",
      branch: "Money",
      tier: 1,
      prerequisites: [],
      description: "Control your cash flow",
      icon: "💳",
    },
    {
      skillId: "money_invest",
      name: "Investing",
      branch: "Money",
      tier: 2,
      prerequisites: ["money_budget"],
      description: "Make money work for you",
      icon: "📈",
    },
    {
      skillId: "money_income",
      name: "Multiple Income Streams",
      branch: "Money",
      tier: 3,
      prerequisites: ["money_invest"],
      description: "Never rely on one source",
      icon: "💰",
    },
    // MINDSET
    {
      skillId: "mind_discipline",
      name: "Discipline",
      branch: "Mindset",
      tier: 1,
      prerequisites: [],
      description: "Do what must be done",
      icon: "⚔️",
    },
    {
      skillId: "mind_focus",
      name: "Deep Focus",
      branch: "Mindset",
      tier: 2,
      prerequisites: ["mind_discipline"],
      description: "Flow state mastery",
      icon: "🎯",
    },
    {
      skillId: "mind_resilience",
      name: "Resilience",
      branch: "Mindset",
      tier: 2,
      prerequisites: ["mind_discipline"],
      description: "Bounce back from anything",
      icon: "🛡️",
    },
    // BUSINESS
    {
      skillId: "biz_basics",
      name: "Business Fundamentals",
      branch: "Business",
      tier: 1,
      prerequisites: [],
      description: "How business works",
      icon: "📋",
    },
    {
      skillId: "biz_market",
      name: "Marketing & Sales",
      branch: "Business",
      tier: 2,
      prerequisites: ["biz_basics"],
      description: "Get customers, close deals",
      icon: "📢",
    },
    {
      skillId: "biz_scale",
      name: "Scaling Operations",
      branch: "Business",
      tier: 3,
      prerequisites: ["biz_market"],
      description: "Build systems that scale",
      icon: "🚀",
    },
    // AI
    {
      skillId: "ai_prompt",
      name: "Prompt Engineering",
      branch: "AI",
      tier: 1,
      prerequisites: [],
      description: "Communicate with AI systems",
      icon: "💬",
    },
    {
      skillId: "ai_tools",
      name: "AI Tools Mastery",
      branch: "AI",
      tier: 2,
      prerequisites: ["ai_prompt"],
      description: "Leverage all AI platforms",
      icon: "🛠️",
    },
    {
      skillId: "ai_agent",
      name: "AI Agent Building",
      branch: "AI",
      tier: 3,
      prerequisites: ["ai_tools"],
      description: "Build autonomous AI systems",
      icon: "🤖",
    },
  ];
  await SkillNode.insertMany(skillNodes);

  // Seed shop items
  await ShopItem.deleteMany({});
  await ShopItem.insertMany([
    {
      itemId: "theme_red",
      name: "Red Matrix Theme",
      type: "theme",
      price: 500,
      icon: "🔴",
      rarity: "rare",
      description: "Danger red terminal aesthetic",
    },
    {
      itemId: "theme_gold",
      name: "Golden Empire Theme",
      type: "theme",
      price: 1000,
      icon: "🟡",
      rarity: "epic",
      description: "Legendary gold UI theme",
    },
    {
      itemId: "theme_purple",
      name: "Purple Void Theme",
      type: "theme",
      price: 750,
      icon: "🟣",
      rarity: "epic",
      description: "Dark purple mystic theme",
    },
    {
      itemId: "badge_warrior",
      name: "Code Warrior Badge",
      type: "badge",
      price: 200,
      icon: "⚔️",
      rarity: "common",
      description: "Show your commitment to coding",
    },
    {
      itemId: "badge_dragon",
      name: "Dragon Badge",
      type: "badge",
      price: 1500,
      icon: "🐉",
      rarity: "legendary",
      description: "Legendary dragon emblem",
    },
    {
      itemId: "title_awakened",
      name: "The Awakened",
      type: "title",
      price: 300,
      icon: "✨",
      rarity: "rare",
      description: "Show your awakening",
    },
    {
      itemId: "title_shadow",
      name: "Shadow Monarch",
      type: "title",
      price: 2000,
      icon: "👑",
      rarity: "legendary",
      description: "Rule from the shadows",
    },
    {
      itemId: "item_sword",
      name: "Sword of Discipline",
      type: "item",
      price: 400,
      icon: "⚔️",
      rarity: "rare",
      description: "Discipline incarnate",
    },
    {
      itemId: "item_tome",
      name: "Ancient Tome",
      type: "item",
      price: 350,
      icon: "📚",
      rarity: "rare",
      description: "Knowledge is power",
    },
    {
      itemId: "item_coffee",
      name: "System Coffee ☕",
      type: "item",
      price: 50,
      icon: "☕",
      rarity: "common",
      description: "Fuel for the journey",
    },
  ]);

  // Seed current boss battle
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  weekStart.setHours(0, 0, 0, 0);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 7);

  const weekId = `${now.getFullYear()}-W${Math.ceil(now.getDate() / 7)}`;
  await BossBattle.findOneAndUpdate(
    { weekId },
    {
      weekId,
      title: "IRON TRIAL: WEEK OF MASTERY",
      description:
        "The System has issued a weekly trial. Only the disciplined will survive.",
      icon: "👹",
      difficulty: "hard",
      objectives: [
        {
          text: "Complete 10 coding quests",
          metric: "coding",
          target: 10,
          unit: "quests",
        },
        { text: "Exercise 5 days", metric: "workout", target: 5, unit: "days" },
        {
          text: "Read for 30 minutes daily (5 days)",
          metric: "reading",
          target: 5,
          unit: "days",
        },
      ],
      rewards: { xp: 1000, coins: 200, badge: "🏆", title: "Trial Survivor" },
      startDate: weekStart,
      endDate: weekEnd,
      isActive: true,
    },
    { upsert: true },
  );

  // Seed default admin user
  await User.deleteOne({ email: "admin@system.ai" });

  const admin = await User.create({
    email: "admin@system.ai",
    password: "Admin@123",
    username: "admin",
    displayName: "System Admin",

    isEmailVerified: true,

    level: 1,
    currentXP: 0,
    totalXP: 0,
    rank: "E",
    coins: 500,
    energy: 100,

    currentStreak: 0,
    longestStreak: 0,

    theme: "default",
    soundEnabled: true,
    notificationsEnabled: true,

    titles: ["The Awakened"],
    activeTitle: "The Awakened",

    questsCompleted: 0,
    questsFailed: 0,
    bossesDefeated: 0,

    isActive: true,
  });

  await admin.initializeCharacter();

  console.log("✅ Admin user created");
  console.log("Email:", admin.email);
  console.log("Password: Admin@123");

  console.log("✅ Database seeded successfully.");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
