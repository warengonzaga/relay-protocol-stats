# Relay Protocol Dashboard

A web-based dashboard for analyzing Relay Protocol cross-chain transaction history. Paste your wallet address to get insights into your transaction count and total volume.

## Features

- **Transaction Count**: View total number of successful cross-chain transactions
- **Total Volume**: See the total USD value of tokens transferred
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
2. Paste your Ethereum wallet address (0x...)
3. Click "Analyze"
4. View your transaction statistics:
   - Total successful transactions
   - Total volume in USD

## How It Works

The dashboard uses the Relay Protocol API to:

1. Fetch all transaction requests for the given wallet address
2. Filter only successful transactions
3. Calculate statistics:
   - **Transaction Count**: Number of successful cross-chain transactions
   - **Total Volume**: Sum of USD values from `metadata.currencyIn.amountUsd` field

### API Integration

- **Endpoint**: `GET https://api.relay.link/requests/v2`
- **Pagination**: Automatically handles pagination (50 results per request)
- **Filtering**: Filters by wallet address and only counts successful transactions

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

- Most used chains (based on origin/destination chain IDs)
- Most used tokens (based on currency field)
- Transaction history timeline
- Success/failure rate breakdown
- Average transaction size
- Export data to CSV
- Charts and visualizations

## License

MIT
