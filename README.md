# Relay Protocol Stats

![GitHub Repo Banner](https://ghrb.waren.build/banner?header=Relay+Protocol+Stats&subheader=Analyze+your+cross-chain+transaction+history.&bg=8B5CF6&color=FFFFFF&subheadercolor=E9D5FF&headerfont=Inter&subheaderfont=Inter&watermarkpos=bottom-right)

<!-- Created with GitHub Repo Banner by Waren Gonzaga: https://ghrb.waren.build -->

[![Bun](https://img.shields.io/badge/bun-runtime-f9f1e1?logo=bun&logoColor=000)](https://bun.sh)
[![Biome](https://img.shields.io/badge/biome-linter-60a5fa?logo=biome&logoColor=fff)](https://biomejs.dev)
[![Deploy](https://github.com/warengonzaga/relay-protocol-stats/actions/workflows/deploy.yml/badge.svg)](https://github.com/warengonzaga/relay-protocol-stats/actions/workflows/deploy.yml)

A web dashboard for analyzing your [Relay Protocol](https://relay.link) cross-chain transaction history. Paste a wallet address or ENS name — no wallet connection required.

## ✨ Features

- **Wallet Analytics** — transaction count, total volume (USD), success rate, failed & refunded counts
- **Top Chains** — favorite chain, top origin, top destination
- **Leaderboard** — Supabase-powered ranking synced every 6 hours via GitHub Actions
- **ENS Support** — `.eth` domain resolution powered by viem
- **Shareable URLs** — direct links to any wallet's stats
- **Pixel Avatars** — unique avatar per wallet with Blockscan integration

## 🛠️ Tech Stack

| Category | Tools |
|---|---|
| Frontend | React 19, TypeScript 5.9, Vite 7 |
| Styling | Tailwind CSS 3.4, shadcn/ui |
| Data | Supabase, Relay API, Axios, Viem |
| Tooling | Bun, Biome |
| CI/CD | GitHub Actions, GitHub Pages |

## 🚀 Getting Started

### Prerequisites

- [Bun](https://bun.sh) (v1.1+)

### Setup

```bash
bun install
cp .env.example .env  # configure your Supabase keys
```

### Development

```bash
bun dev       # http://localhost:5173
bun run build # production build
bun preview   # preview production build
```

### Linting

```bash
bun run lint      # check
bun run lint:fix  # auto-fix
bun run format    # format
```

## ⚙️ Environment Variables

See [`.env.example`](.env.example) for all variables.

| Variable | Context | Description |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase anonymous key (safe to expose) |
| `SUPABASE_URL` | Sync script | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Sync script | Supabase service role key (**keep secret**) |
| `RELAY_API_KEY` | Sync script | Optional — higher Relay API rate limits |

## 🗄️ Supabase Setup

1. Create a Supabase project
2. Run [`supabase/schema.sql`](supabase/schema.sql) to create tables and RLS policies
3. Run [`supabase/functions.sql`](supabase/functions.sql) to create the upsert function
4. Add the environment variables above to your `.env` and GitHub repository secrets

The leaderboard sync runs automatically via the [sync workflow](.github/workflows/sync-leaderboard.yml) every 6 hours. First run seeds the cursor — data collection starts from that point forward (no historical backfill).

## 📁 Project Structure

```
relay-protocol-stats/
├── src/
│   ├── components/     # UI components (WalletInput, StatsDisplay, Leaderboard, etc.)
│   ├── services/       # API clients (relayApi, leaderboardApi, ens)
│   ├── pages/          # Route pages (LeaderboardPage)
│   ├── lib/            # Utilities (supabase client, helpers)
│   ├── types/          # TypeScript type definitions
│   ├── App.tsx         # Main app with routing
│   └── index.css       # Global styles and animations
├── scripts/            # Sync scripts (sync-leaderboard.ts)
├── supabase/           # Database schema and functions
├── .github/workflows/  # CI/CD (deploy, sync)
├── biome.json          # Linter/formatter config
└── package.json
```

## 🐛 Issues

Found a bug? [Open an issue](https://github.com/warengonzaga/relay-protocol-stats/issues/new/choose). Contributions welcome — see [CONTRIBUTING.md](CONTRIBUTING.md).

## 🙏 Sponsor

Like this project? Leave a ⭐

Want to support my work? [Become a sponsor](https://github.com/sponsors/warengonzaga) 💖 or [buy me a coffee](https://buymeacoffee.com/warengonzaga) ☕

## 📋 Code of Conduct

Read the project's [code of conduct](CODE_OF_CONDUCT.md).

## 📃 License

This project is licensed under [MIT License](LICENSE).

## 📝 Author

This project is created by **[Waren Gonzaga](https://github.com/warengonzaga)**, with the help of awesome [contributors](https://github.com/warengonzaga/relay-protocol-stats/graphs/contributors).

[![contributors](https://contrib.rocks/image?repo=warengonzaga/relay-protocol-stats)](https://github.com/warengonzaga/relay-protocol-stats/graphs/contributors)

---

💻💖☕ by [Waren Gonzaga](https://warengonzaga.com) | [YHWH](https://www.youtube.com/watch?v=VOZbswniA-g) 🙏
