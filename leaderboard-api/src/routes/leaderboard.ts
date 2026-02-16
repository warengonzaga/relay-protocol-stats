import { Router, type Request, type Response } from 'express';
import type { Router as RouterType } from 'express';
import { getDb } from '../db/client.js';
import { getLeaderboardPage, getLeaderboardTotal, getWalletRank } from '../db/queries.js';

const router: RouterType = Router();
const PAGE_SIZE = 50;
const MAX_PAGE = 2000; // 100,000 / 50

/**
 * GET /leaderboard?page=1
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, Math.min(MAX_PAGE, parseInt(String(req.query.page), 10) || 1));
    const offset = (page - 1) * PAGE_SIZE;
    const db = getDb();

    const [rows, total] = await Promise.all([
      getLeaderboardPage(db, PAGE_SIZE, offset),
      getLeaderboardTotal(db),
    ]);

    const totalPages = Math.ceil(total / PAGE_SIZE);

    res.json({
      data: rows.map((r) => ({
        rank: r.rank,
        wallet_address: r.wallet_address,
        total_volume_usd: parseFloat(r.total_volume_usd),
        total_tx: r.total_tx,
      })),
      page,
      totalPages,
      totalWallets: total,
      pageSize: PAGE_SIZE,
    });
  } catch (e) {
    console.error('GET /leaderboard', e);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

/**
 * GET /leaderboard/:wallet
 */
router.get('/:wallet', async (req: Request, res: Response) => {
  try {
    const wallet = req.params.wallet?.trim();
    if (!wallet) {
      res.status(400).json({ error: 'Wallet address required' });
      return;
    }

    const db = getDb();
    const row = await getWalletRank(db, wallet);

    if (!row) {
      res.json({ inTop100k: false, wallet_address: wallet.toLowerCase() });
      return;
    }

    res.json({
      inTop100k: true,
      rank: row.rank,
      wallet_address: row.wallet_address,
      total_volume_usd: parseFloat(row.total_volume_usd),
      total_tx: row.total_tx,
    });
  } catch (e) {
    console.error('GET /leaderboard/:wallet', e);
    res.status(500).json({ error: 'Failed to fetch wallet rank' });
  }
});

export default router;
