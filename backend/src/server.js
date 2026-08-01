require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const session = require('express-session');

const connectDB = require('./config/database');
const logger = require('./utils/logger');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

// Routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const questRoutes = require('./routes/questRoutes');
const statRoutes = require('./routes/statRoutes');
const achievementRoutes = require('./routes/achievementRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const skillRoutes = require('./routes/skillRoutes');
const shopRoutes = require('./routes/shopRoutes');
const rankingRoutes = require('./routes/rankingRoutes');
const terminalRoutes = require('./routes/terminalRoutes');
const bossRoutes = require('./routes/bossRoutes');

require('./config/passport');

const app = express();


// Connect to MongoDB
connectDB();

// Security
app.use(helmet());
app.use(mongoSanitize());

// CORS
const allowedOrigins = [
  "http://localhost:5173",
  "https://humanoperatingsys.netlify.app",
];

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
}));

// Rate Limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX) || 100,
  message: { success: false, message: 'Too many requests. The System is watching.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// AI Terminal has stricter rate limit
const terminalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { success: false, message: 'Terminal overload. Cooling down.' },
});
app.use('/api/terminal/', terminalLimiter);

// Middleware
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(morgan('combined', { stream: { write: msg => logger.info(msg.trim()) } }));

// Session for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'system-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 },
}));

app.use(passport.initialize());
app.use(passport.session());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'SYSTEM ONLINE', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/quests', questRoutes);
app.use('/api/stats', statRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/rankings', rankingRoutes);
app.use('/api/terminal', terminalRoutes);
app.use('/api/bosses', bossRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`THE SYSTEM IS ONLINE — Port ${PORT}`);
});

module.exports = app;
