# Relay Protocol Dashboard

A web-based dashboard for analyzing Relay Protocol cross-chain transaction history. Paste your wallet address to get insights into your transaction count and total volume.

## Features

- **Transaction Count**: View total number of successful cross-chain transactions
- **Total Volume**: See the total USD value of tokens transferred
- **Success Rate Analytics**: Track transaction success rate with failure metrics
- **Top Chains Analytics**: See your most used chains:
  - Favorite Chain (overall most used)
  - Top Origin Chain (most common source chain)
  - Top Destination Chain (most common target chain)
- **Wallet Privacy**: Address truncation by default with toggle to show/hide full address
- **Blockscan Integration**: Clickable wallet address linking to Blockscan with UTM tracking
- **Shareable URLs**: Share wallet analysis with direct URL links
- **Fast & Simple**: Just paste your wallet address - no wallet connection required
- **Automatic Pagination**: Fetches all transaction history automatically

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for styling
- **Axios** for API calls
- **Relay API** for transaction data

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm package manager

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

### Build

```bash
# Build for production
pnpm build
```

### Preview Production Build

```bash
# Preview production build locally
pnpm preview
```

## Usage

1. Open the dashboard in your browser
2. Paste your Ethereum or Solana wallet address
3. Click "Analyze"
4. View your transaction statistics:
   - Total successful transactions
   - Total volume in USD
   - Favorite chain (most used overall)
   - Top origin chain (most common source)
   - Top destination chain (most common target)
5. Share your results using the Share button to copy a direct link

## How It Works

The dashboard uses the Relay Protocol API to:

1. Fetch all transaction requests for the given wallet address
2. Fetch chain metadata for displaying chain icons and names
3. Filter only successful transactions
4. Calculate statistics:
   - **Transaction Count**: Number of successful cross-chain transactions
   - **Total Volume**: Sum of USD values from `metadata.currencyIn.amountUsd` field
   - **Top Chains**: Analyzes origin and destination chains to determine most frequently used chains

### API Integration

- **Requests Endpoint**: `GET https://api.relay.link/requests/v2`
  - Pagination: Automatically handles pagination (50 results per request)
  - Filtering: Filters by wallet address and only counts successful transactions
- **Chains Endpoint**: `GET https://api.relay.link/chains`
  - Fetches chain metadata including names and icons
  - Used to display chain information in the UI

## Project Structure

```
relay-stats/
├── src/
│   ├── components/
│   │   ├── WalletInput.tsx       # Input field and analyze button
│   │   ├── StatsDisplay.tsx      # Display statistics
│   │   └── LoadingSpinner.tsx    # Loading indicator
│   ├── services/
│   │   └── relayApi.ts           # API integration with pagination
│   ├── types/
│   │   └── relay.ts              # TypeScript type definitions
│   ├── App.tsx                   # Main application component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles with Tailwind
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## Future Enhancements

Potential features to add:

- Most used tokens (based on currency field)
- Transaction history timeline
- Success/failure rate breakdown
- Average transaction size
- Export data to CSV
- Charts and visualizations

## License

MIT
