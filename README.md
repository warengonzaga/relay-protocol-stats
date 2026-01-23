# Relay Protocol Dashboard

A modern web-based dashboard for analyzing Relay Protocol cross-chain transaction history. Supports both wallet addresses and ENS domains (.eth) for easy lookup of your transaction statistics.

## Features

### Analytics & Statistics
- **Transaction Count**: View total number of successful cross-chain transactions
- **Total Volume**: See the total USD value of tokens transferred
- **Success Rate Analytics**: Track transaction success rate with failure and refund metrics (displayed separately)
- **Top Chains Analytics**: See your most used chains:
  - Favorite Chain (overall most used)
  - Top Origin Chain (most common source chain)
  - Top Destination Chain (most common target chain)

### User Experience
- **ENS Support**: Use .eth domains - automatic resolution to wallet addresses powered by viem
- **Modern UI**: Beautiful gradients, smooth animations, and responsive design
- **Enhanced Loading**:
  - Animated progress bar with shimmer effect
  - Rotating creative loading messages
  - Display wallet address during analysis
  - Compact loading card that replaces input form
- **Wallet Privacy**: Address truncation by default with toggle to show/hide full address
- **Pixel Avatar**: Unique pixel-based avatar for each wallet
- **Blockscan Integration**: Clickable wallet address linking to Blockscan with UTM tracking
- **Shareable URLs**: Share wallet analysis with direct URL links
- **Fast & Simple**: Just paste your wallet address or ENS name - no wallet connection required
- **Automatic Pagination**: Fetches all transaction history automatically

## Tech Stack

- **React 19** with TypeScript
- **Vite** for fast development and builds
- **Tailwind CSS** for modern, responsive styling
- **Axios** for API calls
- **Viem** for ENS resolution
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
2. Enter your wallet address (Ethereum/Solana) or ENS domain (e.g., vitalik.eth)
3. Click "Analyze" or press Enter
4. Watch the animated progress as your transactions are analyzed
5. View your transaction statistics:
   - Total successful transactions
   - Total volume in USD
   - Failed and refunded transaction counts
   - Favorite chain (most used overall)
   - Top origin chain (most common source)
   - Top destination chain (most common target)
   - Unique pixel avatar for your wallet
6. Share your results using the Share button to copy a direct link

## How It Works

The dashboard provides a seamless analysis experience:

1. **Input Processing**:
   - Detects if input is an ENS domain (.eth)
   - Resolves ENS to wallet address using viem and public Ethereum RPC
   - Validates wallet address format

2. **Data Fetching**:
   - Fetches all transaction requests for the wallet address via Relay Protocol API
   - Automatically handles pagination (50 results per request)
   - Fetches chain metadata for displaying chain icons and names
   - Shows real-time progress with animated loading states

3. **Statistics Calculation**:
   - **Transaction Count**: Number of successful cross-chain transactions
   - **Total Volume**: Sum of USD values from `metadata.currencyIn.amountUsd` field
   - **Failed & Refunded**: Separate counts for failed and refunded transactions
   - **Top Chains**: Analyzes origin and destination chains to determine most frequently used chains

4. **Visual Presentation**:
   - Generates unique pixel avatar for the wallet
   - Displays statistics with modern gradients and animations
   - Provides share functionality for easy result sharing

### API Integration

- **Requests Endpoint**: `GET https://api.relay.link/requests/v2`
  - Pagination: Automatically handles pagination (50 results per request)
  - Filtering: Filters by wallet address and categorizes by transaction status
- **Chains Endpoint**: `GET https://api.relay.link/chains`
  - Fetches chain metadata including names and icons
  - Used to display chain information in the UI
- **ENS Resolution**: Uses viem with public Ethereum RPC to resolve .eth domains

## Project Structure

```
relay-protocol-stats/
├── src/
│   ├── components/
│   │   ├── WalletInput.tsx       # Input field with ENS support
│   │   ├── StatsDisplay.tsx      # Statistics display with pixel avatar
│   │   ├── LoadingSpinner.tsx    # Animated loading with progress bar
│   │   └── Footer.tsx            # Compact footer with links
│   ├── services/
│   │   └── relayApi.ts           # API integration with pagination
│   ├── types/
│   │   └── relay.ts              # TypeScript type definitions
│   ├── App.tsx                   # Main application component
│   ├── main.tsx                  # Entry point
│   └── index.css                 # Global styles with animations
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js
```

## Changelog

### Version 1.1.0
- Added ENS domain support (.eth resolution)
- Implemented modern UI with gradients and smooth animations
- Enhanced loading experience with animated progress bar and shimmer effects
- Added rotating creative loading messages
- Display wallet address during analysis
- Separate failed and refunded transaction counts
- Added pixel-based avatar generation for wallets
- Improved mobile responsiveness across all components
- Compact and optimized footer design

### Version 1.0.0
- Initial release with core analytics features
- Transaction count and volume statistics
- Top chains analytics
- Wallet privacy controls
- Blockscan integration
- Shareable URLs

## Future Enhancements

Potential features to add:

- Most used tokens (based on currency field)
- Transaction history timeline
- Percentage-based success/failure rate visualization
- Average transaction size
- Export data to CSV
- Interactive charts and visualizations
- Multi-wallet comparison

## License

MIT
