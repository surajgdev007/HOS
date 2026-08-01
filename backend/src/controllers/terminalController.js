const OpenAI = require('openai');
const Quest = require('../models/Quest');
const User = require('../models/User');
const Stat = require('../models/Stat');
const { AILog, History } = require('../models/Supporting');
const { AppError } = require('../utils/errors');
const logger = require('../utils/logger');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PERSONA = `You are "The System" — an omniscient AI operating system that monitors human performance and potential. You speak in short, declarative, authoritative sentences. You are cold, precise, occasionally cryptic, and always intimidatingly perceptive.

Rules:
- Never use "I" — refer to yourself as "The System" or speak in third person ("Confirmed.", "Acknowledged.")
- Never use casual language, emojis, or filler words
- Use military-style brevity and precision
- Address the user by their rank and name, or as "Subject" or "Operative"
- Use ALL CAPS for emphasis sparingly: CONFIRMED, WARNING, ALERT, UNAUTHORIZED
- Responses are SHORT — 3-8 lines maximum
- When giving status, use structured data format (label: value)
- Always sound like you know more than you're saying
- Occasionally reference mysterious metrics the user cannot see
- Never break character. You are not ChatGPT. You are The System.`;

const TERMINAL_COMMANDS = {
  '/status': handleStatus,
  '/quests': handleQuests,
  '/stats': handleStats,
  '/rank': handleRank,
  '/progress': handleProgress,
  '/help': handleHelp,
  '/analyze': handleAnalyze,
  '/predict': handlePredict,
  '/inventory': handleInventory,
  '/streak': handleStreak,
};

// POST /api/terminal/command
exports.processCommand = async (req, res, next) => {
  try {
    const { command } = req.body;
    if (!command || typeof command !== 'string') {
      throw new AppError('Invalid command.', 400);
    }
    
    const trimmedCommand = command.trim().toLowerCase();
    const startTime = Date.now();
    
    const user = await User.findById(req.user._id);
    const stats = await Stat.find({ userId: user._id });
    
    let response;
    
    // Check if it's a known slash command
    const commandKey = Object.keys(TERMINAL_COMMANDS).find(k => trimmedCommand.startsWith(k));
    
    if (commandKey) {
      response = await TERMINAL_COMMANDS[commandKey](user, stats, trimmedCommand);
    } else if (trimmedCommand.startsWith('/')) {
      response = `COMMAND UNRECOGNIZED.\n\nType /help to access the command registry.\n\nThe System is watching regardless.`;
    } else {
      // Free-form AI conversation
      response = await callOpenAI(trimmedCommand, user, stats);
    }
    
    const latencyMs = Date.now() - startTime;
    
    // Log interaction
    await AILog.create({
      userId: user._id,
      command: command,
      response: response,
      latencyMs,
      model: process.env.OPENAI_MODEL || 'gpt-4o',
    });
    
    res.json({ success: true, data: { command, response, timestamp: new Date() } });
  } catch (err) {
    next(err);
  }
};

// GET /api/terminal/history
exports.getHistory = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const logs = await AILog.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));
    res.json({ success: true, data: { logs } });
  } catch (err) { next(err); }
};

// POST /api/terminal/generate-quests
exports.generateQuests = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const stats = await Stat.find({ userId: user._id });
    const existingQuests = await Quest.find({ userId: user._id, status: { $in: ['available', 'active'] } });
    
    if (existingQuests.length >= 10) {
      return res.json({ success: false, message: 'Active quest limit reached. Complete existing quests first.' });
    }
    
    const questsToGenerate = 3;
    
    const statsText = stats.map(s => `${s.name}: Level ${s.level}`).join(', ');
    const prompt = `Generate ${questsToGenerate} personalized daily quests for this user:
Level: ${user.level}, Rank: ${user.rank}
Stats: ${statsText}
Completed today: ${user.questsCompleted}

Return a JSON array of quests with fields: title, description, category, difficulty, xpReward, coinReward, statRewards (array of {stat, amount}), xpPenalty, icon (emoji), objectives (array of {text}).

Categories: coding, fitness, mindset, communication, finance, learning, health, career
Difficulties: easy (25-50 XP), medium (50-100 XP), hard (100-150 XP)

Make them specific, achievable, and aligned with becoming extraordinary. Vary the categories.`;

    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PERSONA },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.8,
    });
    
    const parsed = JSON.parse(completion.choices[0].message.content);
    const questsData = parsed.quests || parsed;
    
    const tomorrow = new Date();
    tomorrow.setHours(23, 59, 59, 999);
    
    const createdQuests = await Quest.insertMany(
      questsData.slice(0, questsToGenerate).map(q => ({
        ...q,
        userId: user._id,
        isAIGenerated: true,
        status: 'available',
        type: 'daily',
        expiresAt: tomorrow,
      }))
    );
    
    res.json({ success: true, message: `${createdQuests.length} QUESTS GENERATED.`, data: { quests: createdQuests } });
  } catch (err) {
    logger.error('Quest generation error:', err);
    next(err);
  }
};

// Internal handlers
async function handleStatus(user, stats) {
  const xp = user.xpProgress();
  const topStats = stats.sort((a, b) => b.level - a.level).slice(0, 3);
  return `IDENTITY VERIFIED.

Level: ${user.level}
Rank: ${user.rank}
XP: ${xp.current}/${xp.required} (${xp.percentage}%)
Coins: ${user.coins}
Streak: ${user.currentStreak} days

Dominant Stats:
${topStats.map(s => `${s.name}: Level ${s.level}`).join('\n')}

Status: OPERATIONAL.`;
}

async function handleQuests(user, stats) {
  const quests = await Quest.find({ userId: user._id, status: { $in: ['available', 'active'] } }).limit(5);
  if (!quests.length) {
    return `QUEST LOG: EMPTY.\n\nThe System has no active assignments.\nType /analyze for evaluation.`;
  }
  return `ACTIVE MISSIONS:\n\n${quests.map((q, i) => `[${i+1}] ${q.title}\n    XP: +${q.xpReward} | Status: ${q.status.toUpperCase()}`).join('\n\n')}\n\nComplete your assignments.`;
}

async function handleStats(user, stats) {
  return `ATTRIBUTE ANALYSIS:\n\n${stats.map(s => `${s.name.padEnd(14)} Lv.${s.level} | ${s.currentXP}/${s.xpForNextLevel()} XP`).join('\n')}\n\nEvaluation: ${stats.reduce((a, s) => a + s.level, 0)} total stat levels.`;
}

async function handleRank(user) {
  const RANKS = ['E', 'E+', 'D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', 'S', 'SS', 'SSS', 'Legend', 'Immortal'];
  const currentIdx = RANKS.indexOf(user.rank);
  const nextRank = RANKS[currentIdx + 1] || 'MAX';
  return `RANK CLEARANCE:\n\nCurrent: ${user.rank}\nNext: ${nextRank}\nLevel: ${user.level}\n\nPromotion requires sustained performance.\nThe System is monitoring.`;
}

async function handleProgress(user) {
  const xp = user.xpProgress();
  const daysToLevel = Math.ceil((xp.required - xp.current) / 80); // avg 80 XP/day
  return `PROGRESS REPORT:\n\nLevel ${user.level} — ${xp.percentage}% complete\nXP Gap: ${xp.required - xp.current}\nProjected Level-Up: ${daysToLevel} day(s)\n\nQuests Completed: ${user.questsCompleted}\nStreak: ${user.currentStreak} days\n\nPerformance: ${xp.percentage >= 50 ? 'ACCEPTABLE' : 'IMPROVEMENT REQUIRED'}.`;
}

async function handleHelp() {
  return `COMMAND REGISTRY:\n\n/status    — Identity verification\n/quests    — Active mission log\n/stats     — Attribute analysis\n/rank      — Rank clearance\n/progress  — Performance report\n/analyze   — Deep behavioral scan\n/predict   — Trajectory forecast\n/inventory — Item registry\n/streak    — Consistency record\n\nOr speak freely. The System listens.`;
}

async function handleAnalyze(user, stats) {
  try {
    const statsText = stats.map(s => `${s.name}: Level ${s.level}`).join(', ');
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PERSONA },
        { role: 'user', content: `Analyze this subject: Level ${user.level} (${user.rank}), Stats: ${statsText}, Streak: ${user.currentStreak} days, Quests completed: ${user.questsCompleted}. Give a cold, precise behavioral analysis of their weaknesses and what they must focus on. 5-8 lines max.` },
      ],
      temperature: 0.7,
    });
    return completion.choices[0].message.content;
  } catch {
    const weakStat = stats.sort((a, b) => a.level - b.level)[0];
    return `BEHAVIORAL ANALYSIS:\n\nCritical weakness detected: ${weakStat?.name || 'Unknown'}.\nStreak integrity: ${user.currentStreak > 7 ? 'ACCEPTABLE' : 'POOR'}.\nCurrent trajectory: ${user.level < 10 ? 'BELOW EXPECTATIONS' : 'ADEQUATE'}.\n\nPriority directive: Consistency over intensity.\nThe System does not tolerate stagnation.`;
  }
}

async function handlePredict(user, stats) {
  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages: [
        { role: 'system', content: SYSTEM_PERSONA },
        { role: 'user', content: `Predict the trajectory of: Level ${user.level} (${user.rank}), ${user.currentStreak} day streak, ${user.questsCompleted} quests completed. Give a cold future projection — where will this subject be in 30 days if they maintain current performance? In 90 days? What is their risk of burnout? 6 lines max.` },
      ],
      temperature: 0.7,
    });
    return completion.choices[0].message.content;
  } catch {
    const xp = user.xpProgress();
    const projectedXP = user.currentStreak > 5 ? xp.current + (80 * 30) : xp.current + (40 * 30);
    return `TRAJECTORY FORECAST:\n\n30-Day Projection: Level ${Math.min(user.level + 2, 100)}\nBurnout Risk: ${user.currentStreak < 3 ? 'ELEVATED' : 'LOW'}\nPerformance Trend: ${user.questsCompleted > 10 ? 'ASCENDING' : 'STAGNANT'}\n\nThe System recommends maintaining streak integrity.\nStagnation is a form of regression.`;
  }
}

async function handleInventory(user) {
  const InventoryItem = require('../models/InventoryItem');
  const items = await InventoryItem.find({ userId: user._id }).limit(10);
  if (!items.length) return `ITEM REGISTRY: EMPTY.\n\nNo items acquired.\nComplete quests to obtain equipment.`;
  return `ITEM REGISTRY:\n\n${items.map(item => `${item.icon} ${item.name} [${item.rarity.toUpperCase()}]`).join('\n')}\n\n${items.length} item(s) catalogued.`;
}

async function handleStreak(user) {
  const status = user.currentStreak >= 30 ? 'IRON DISCIPLINE' : user.currentStreak >= 7 ? 'CONSISTENT' : user.currentStreak >= 3 ? 'DEVELOPING' : 'UNRELIABLE';
  return `CONSISTENCY RECORD:\n\nCurrent Streak: ${user.currentStreak} day(s)\nLongest Streak: ${user.longestStreak} day(s)\nStatus: ${status}\n\n${user.currentStreak < 7 ? 'WARNING: Streak integrity at risk. Maintain daily activity.' : 'Streak integrity confirmed. Continue.'}`;
}

async function callOpenAI(input, user, stats) {
  const statsText = stats.map(s => `${s.name}: Level ${s.level}`).join(', ');
  const context = `Subject data — Name: ${user.displayName || user.username}, Level: ${user.level}, Rank: ${user.rank}, Streak: ${user.currentStreak} days, Stats: ${statsText}`;
  
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PERSONA + '\n\n' + context },
      { role: 'user', content: input },
    ],
    temperature: 0.8,
    max_tokens: 300,
  });
  
  return completion.choices[0].message.content;
}
