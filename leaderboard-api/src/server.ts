import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import leaderboardRoutes from './routes/leaderboard.js';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/leaderboard', leaderboardRoutes);

app.listen(PORT, () => {
  console.log(`[server] Leaderboard API listening on http://localhost:${PORT}`);
});
