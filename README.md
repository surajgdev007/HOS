# THE SYSTEM — AI-Powered Life Operating System

> *An intelligent, dark, futuristic RPG life tracker powered by AI. Track quests, level up your stats, defeat bosses, and become extraordinary.*

---

## 🏗️ Project Structure

```
the-system/
├── frontend/          # React + TypeScript + Vite + TailwindCSS
└── backend/           # Node.js + Express + MongoDB + OpenAI
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB Atlas account
- OpenAI API key
- Google OAuth app (optional)
- GitHub OAuth app (optional)

---

## 🔧 Backend Setup

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/the-system

# JWT (generate with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_ACCESS_SECRET=<your_secret>
JWT_REFRESH_SECRET=<your_other_secret>

# OpenAI
OPENAI_API_KEY=sk-your-key-here

# Google OAuth (see setup below)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...

# GitHub OAuth (see setup below)
GITHUB_CLIENT_ID=...
GITHUB_CLIENT_SECRET=...

SESSION_SECRET=<random_string>
```

### 3. Seed the database
```bash
node src/utils/seed.js
```

### 4. Start the server
```bash
npm run dev
```

Server runs at: `http://localhost:5000`

---

## 🎨 Frontend Setup

### 1. Install dependencies
```bash
cd frontend
npm install
```

### 2. Start dev server
```bash
npm run dev
```

App runs at: `http://localhost:5173`

---

## 🔐 OAuth Setup Guide

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services → Credentials**
4. Click **Create Credentials → OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Add Authorized redirect URI:
   ```
   http://localhost:5000/api/auth/google/callback
   ```
7. Copy **Client ID** and **Client Secret** to your `.env`

### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - **Application name**: The System
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:5000/api/auth/github/callback`
4. Click **Register Application**
5. Copy **Client ID** and generate **Client Secret**
6. Add both to your `.env`

---

## 📊 API Reference

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Email/password registration |
| POST | `/api/auth/login` | Email/password login |
| POST | `/api/auth/refresh` | Refresh access token |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/auth/google` | Google OAuth |
| GET | `/api/auth/github` | GitHub OAuth |

### Users
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/dashboard` | Full dashboard data |
| GET | `/api/users/profile` | User profile |
| PATCH | `/api/users/profile` | Update profile |
| GET | `/api/users/export` | Export data as JSON |

### Quests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/quests` | Get quests (filter by type/status) |
| POST | `/api/quests` | Create quest |
| PATCH | `/api/quests/:id/accept` | Accept quest |
| PATCH | `/api/quests/:id/complete` | Complete quest |
| PATCH | `/api/quests/:id/fail` | Fail quest |

### AI Terminal
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/terminal/command` | Process command |
| GET | `/api/terminal/history` | Command history |
| POST | `/api/terminal/generate-quests` | AI quest generation |

---

## 🎮 Terminal Commands

| Command | Description |
|---------|-------------|
| `/status` | Identity & current stats |
| `/quests` | Active mission log |
| `/stats` | Full attribute analysis |
| `/rank` | Rank clearance |
| `/progress` | Performance report |
| `/analyze` | AI behavioral analysis |
| `/predict` | 30/90-day trajectory forecast |
| `/inventory` | Item registry |
| `/streak` | Consistency record |
| `/help` | Command registry |

Free-text input is also supported — The System responds as an omniscient AI.

---

## ⚔️ XP & Rank System

### Level Formula
```
XP Required = Level² × 100
```

### Rank Thresholds
| Rank | Min Level |
|------|-----------|
| E | 1 |
| E+ | 5 |
| D | 10 |
| D+ | 15 |
| C | 20 |
| C+ | 30 |
| B | 40 |
| B+ | 50 |
| A | 60 |
| A+ | 70 |
| S | 80 |
| SS | 90 |
| SSS | 95 |
| Legend | 99 |
| Immortal | 100 |

---

## 🏆 Achievement List

| Achievement | Condition | XP |
|-------------|-----------|-----|
| First Blood | Complete first quest | 50 |
| Week Warrior | 7-day streak | 200 |
| Iron Discipline | 30-day streak | 1000 |
| Code Warrior | 100 coding quests | 500 |
| Centurion | 100 total quests | 500 |
| Boss Slayer | Defeat first boss | 300 |
| Ascendant | Reach Level 50 | 2000 |
| S-Rank Awakened | Reach S Rank | 5000 |
| Immortal | Reach Level 100 | 10000 |

---

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- TailwindCSS (custom dark design system)
- Framer Motion (all animations)
- Zustand (global state)
- React Query (server state + caching)
- React Router v6
- Lucide Icons
- React Hot Toast

### Backend
- Node.js + Express
- MongoDB + Mongoose
- JWT (access + refresh tokens)
- Passport.js (JWT + Google + GitHub OAuth)
- OpenAI GPT-4o (AI terminal & quest generation)
- Express Validator
- Rate Limiting (express-rate-limit)
- Winston (logging)
- Helmet + CORS + Mongo Sanitize (security)

---

## 📁 Collections

| Collection | Purpose |
|------------|---------|
| `users` | Profiles, XP, rank, coins, streaks |
| `quests` | Daily/weekly/boss quests |
| `stats` | Character attributes (9 stats) |
| `userachievements` | User achievement progress |
| `achievements` | Global achievement definitions |
| `inventoryitems` | User items |
| `skillnodes` | Skill tree definitions |
| `userskills` | Unlocked skills |
| `bossbattles` | Weekly challenges |
| `shopitems` | Store inventory |
| `ailogs` | Terminal interactions |
| `histories` | Event history |

---

## 🚀 Production Deployment

### Build frontend
```bash
cd frontend
npm run build
```

### Environment changes for production
```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
GOOGLE_CALLBACK_URL=https://api.yourdomain.com/api/auth/google/callback
GITHUB_CALLBACK_URL=https://api.yourdomain.com/api/auth/github/callback
```

---

*The System is watching. Become extraordinary.*
