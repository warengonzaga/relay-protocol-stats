# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed

- update lucide-react, @vitejs/plugin-react, and vite lockfile entries

## [1.4.1] - 2026-04-12

### Changed

- bump dependencies and enhance leaderboard fallback handling (#44)

## [1.4.0] - 2026-03-04

### Added

- add leaderboard sync script
- add Relay leaderboard with Supabase backend (#24)

### Changed

- suppress noArrayIndexKey for skeleton row placeholders
- remove autoprefixer dependency
- update release action to v1.6.0 and enable version file sync
- upgrade tailwindcss v3 → v4 and lucide-react
- Bump actions/upload-pages-artifact from 3 to 4 (#15)
- Bump actions/configure-pages from 4 to 5 (#16)
- Bump actions/checkout from 4 to 6 (#17)
- Bump @types/node from 24.10.9 to 25.3.3 (#21)
- Bump tailwindcss from 3.4.19 to 4.2.1 (#23)
- Bump lucide-react (#25)

### Fixed

- set search_path in upsert_wallet_batch function
- handle null continuation on max pages per run
- wrap handleAnalyze in useCallback

## [1.3.1] - 2026-03-04

### Changed

- bump the npm_and_yarn group across 1 directory with 2 updates (#13)
- ignore .contributerc.json config file
- add Dependabot for npm, Actions, and Docker
- bump the npm_and_yarn group across 1 directory with 2 updates (#11)

## [1.3.0] - 2026-02-23

### Added

- adds a volume sparkline with time-range toggle. (#5)
- add contributing guide
- add Contributor Covenant Code of Conduct
- add volume-by-chain breakdown to wallet stats (#3)
- add follow button for GitHub profile in footer
- add fetchRecentRequests function for random wallet selection
- add app version declaration in vite-env.d.ts
- add FAQ component for user guidance
- add Snyk security best practices instructions
- add Plausible Analytics tracking

### Changed

- refine CurrencyAmount and RequestMetadata interfaces
- add eslint directive for component export
- improve error handling for ENS name resolution
- switch to using dynamic app version from global variable
- define app version from package.json in Vite config
- use dynamic version from package.json
- adjust button and text colors for better visibility
- refactor code structure for improved readability
- adjust logo and text sizes for better readability

