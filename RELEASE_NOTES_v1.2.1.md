# 🚀 Release v1.2.1 - Token Analytics & UI Improvements

## 🎉 What's New

### 📊 Token Statistics Feature
We've added comprehensive token analytics to help you understand your token usage patterns across chains:

- **Favorite Token**: See your most frequently used token overall (combining both origin and destination)
- **Top Origin Token**: Identify the token you most commonly bridge from
- **Top Destination Token**: Discover the token you most commonly bridge to

Each token card displays:
- Token icon with chain badge overlay in the bottom-right corner
- Token symbol (e.g., ETH, USDC, AVAX)
- Truncated token address for reference

### 🎨 UI/UX Enhancements

#### Improved Readability
- Increased card title font size from `12px` to `14px` for better readability
- Wider page layout: expanded from `max-w-xl` to `max-w-3xl` (33% wider)
- Simplified font weights: changed token and chain names from medium to normal
- Success rate now displays as whole numbers (no decimals)

#### Visual Polish
- ✨ Added flowing purple border animation on wallet input card hover
- 🎯 Improved visual hierarchy with better spacing and sizing
- 📱 Enhanced mobile responsiveness for token cards

### 🔧 Technical Improvements

#### Native Token Support
- Implemented comprehensive native token metadata mapping for all major chains
- Added fallback icons for native tokens (ETH, BNB, MATIC, AVAX, FTM, etc.)
- Fixed missing token icons on chains not covered by the currencies API
- Supports chains: Ethereum, Optimism, BSC, Polygon, Fantom, Base, Arbitrum, Avalanche, Zora, Linea, Scroll, Blast

#### Token Detection & Processing
- Enhanced token address normalization (converts "eth", "bnb" to zero address)
- Improved symbol extraction from transaction metadata
- Better handling of native vs ERC-20 tokens
- Integrated with Relay's `/currencies/v2` endpoint for token metadata

### 🐦 Social Integration
- Added "Follow @warengonzaga" button in footer
- Updated footer with X (Twitter) profile link

## 📸 Screenshots

### Token Analytics
Each wallet analysis now shows three token cards with:
- Token icon prominently displayed
- Chain icon badge in bottom-right corner
- Token symbol
- Truncated contract address

### Flowing Border Effect
The wallet input card now features a beautiful purple light effect that flows around the border on hover, creating a more engaging user experience.

## 🛠️ Bug Fixes
- Fixed token symbols showing as "[object Object]"
- Resolved "eth...eth" address display issue
- Fixed missing token icons for chains not in currencies API
- Corrected native token address matching

## 📦 What's Included

**New Features:**
- Token statistics (favorite, origin, destination tokens)
- Flowing purple border animation on wallet input
- Native token metadata fallback system
- X (Twitter) follow button in footer

**UI Improvements:**
- 33% wider layout for better content display
- Larger, more readable text
- Cleaner visual hierarchy
- Improved mobile responsiveness

**Technical Enhancements:**
- Integration with `/currencies/v2` endpoint
- Comprehensive native token support
- Better error handling for missing token data
- Enhanced symbol extraction logic

## 🔄 Upgrade Notes

This release is fully backward compatible. No breaking changes.

**API Integration:**
- Now uses POST request to `/currencies/v2` for token metadata
- Fetches currency data in parallel with transaction and chain data
- Includes fallback for chains not covered by the API

## 🙏 Acknowledgments

Thanks to all users who provided feedback and tested the token analytics feature!

## 📝 Full Changelog

### Version 1.2.1
- 📦 new (footer): add follow button for X (Twitter) profile

### Version 1.2.0
- ✨ feat(ui): add flowing purple border effect on wallet input hover
- 🔧 update (ui): improve readability and add token statistics
  - Increase card title font size for better readability
  - Add token statistics display (favorite, origin, destination)
  - Implement native token metadata fallback
  - Fix missing token icons
  - Improve accessibility with larger text
  - Expand page width by 33%

---

**Installation:**
```bash
# Clone the repository
git clone https://github.com/warengonzaga/relay-protocol-stats.git
cd relay-protocol-stats

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

**Try it now:** [Demo Link] (if deployed)

For questions or issues, please open an issue on GitHub!
