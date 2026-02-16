import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import leaderboardRoutes from './routes/leaderboard.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

const allowedOrigins: string[] = (process.env.CORS_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/leaderboard', leaderboardRoutes);

app.listen(PORT, () => {
  console.log(`[server] Leaderboard API listening on http://localhost:${PORT}`);
});
