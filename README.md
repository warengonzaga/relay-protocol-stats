# Relay Protocol Stats

A dashboard for analyzing Relay cross-chain transaction history by wallet address or ENS name.

## Project status

**Discontinued.** Relay is changing its API. The current Requests API is being deprecated, and its replacement requires an active API key and only exposes requests belonging to the authenticated integrator. Continuing this public stats project would require hosting a server to protect and provide that key, which is not sustainable. Development has ended, and the source will be archived.

See Relay's [Requests API migration guide](https://docs.relay.link/references/api/api_guides/migrating-to-requests-v3) for the API changes and timeline.

## Features

- Wallet transaction, volume, and success-rate analytics
- Leaderboard and top-chain statistics
- ENS resolution and shareable wallet links

## Development

Requires [Bun](https://bun.sh).

```bash
bun install
bun dev
bun run build
```

## License

[MIT](LICENSE). Copyright © 2026 [Waren Gonzaga](https://github.com/warengonzaga).
