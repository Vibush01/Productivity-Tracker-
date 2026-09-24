import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';
import { initializeSocket } from './config/socket.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import habitRoutes from './routes/habitRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import motivationRoutes from './routes/motivationRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import routineRoutes from './routes/routineRoutes.js';
import timerRoutes from './routes/timerRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import programRoutes from './routes/programRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import journalRoutes from './routes/journalRoutes.js';
import achievementRoutes from './routes/achievementRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();
const httpServer = createServer(app);

// Initialize Socket.io
initializeSocket(httpServer);

// Middleware
// In development, allow all origins (Expo uses dynamic ports).
// In production, restrict to known client URLs.
const corsOrigins = env.NODE_ENV === 'development'
  ? true
  : [env.CLIENT_URL, env.MOBILE_URL].filter(Boolean) as string[];

app.use(cors({
  origin: corsOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per window
  message: { success: false, error: 'Too many requests, please try again later' },
});
app.use('/api/', limiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/motivation', motivationRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/routines', routineRoutes);
app.use('/api/timer', timerRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/programs', programRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Productivity Tracker API is running 🚀', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = parseInt(env.PORT, 10);

const startServer = async () => {
  await connectDB();
  httpServer.listen(PORT, () => {
    console.log(`\n🚀 Server running in ${env.NODE_ENV} mode on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`🔌 Socket.io: http://localhost:${PORT}\n`);
  });
};

startServer();
