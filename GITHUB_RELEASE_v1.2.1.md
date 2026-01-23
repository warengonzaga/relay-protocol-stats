## 🎉 Token Analytics & UI Improvements

### ✨ New Features

**📊 Token Statistics**
- Added comprehensive token analytics with three new cards:
  - **Favorite Token**: Most frequently used token overall
  - **Top Origin Token**: Most common source token
  - **Top Destination Token**: Most common destination token
- Token cards display icon, symbol, chain badge, and contract address
- Supports all major chains with native token fallbacks

**🎨 Visual Enhancements**
- ✨ Added flowing purple border animation on wallet input hover
- 📱 Expanded layout width by 33% (max-w-xl → max-w-3xl)
- 📖 Increased card title font size for better readability
- 🎯 Simplified font weights for cleaner UI

**🐦 Social**
- Added "Follow @warengonzaga" button in footer

### 🔧 Technical Improvements

- Integrated with Relay's `/currencies/v2` endpoint for token metadata
- Implemented native token metadata fallback for all major chains
- Enhanced token address normalization (eth, bnb → 0x000...000)
- Improved symbol extraction from transaction metadata
- Added comprehensive native token support (ETH, AVAX, BNB, MATIC, etc.)

### 🐛 Bug Fixes

- Fixed token symbols showing as "[object Object]"
- Resolved "eth...eth" address display issue
- Fixed missing token icons for chains not in currencies API
- Corrected native token address matching logic

### 📦 Supported Chains

Native token metadata now available for:
- Ethereum, Optimism, Arbitrum, Base
- BSC, Polygon, Avalanche, Fantom
- Zora, Linea, Scroll, Blast

---

**Full Changelog**: https://github.com/warengonzaga/relay-protocol-stats/compare/v1.2.0...v1.2.1
