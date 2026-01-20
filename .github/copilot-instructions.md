# GitHub Copilot - Clean Commit Instructions

This project uses the **Clean Commit** workflow for all commit messages. When suggesting commits, always follow these guidelines.

## Commit Message Format

```
<emoji> <type>: <description>
```

With optional scope:
```
<emoji> <type> (<scope>): <description>
```

## The Nine Commit Types

### 📦 new
Adding new features, files, or capabilities that didn't exist before.
```
📦 new: wallet statistics dashboard
📦 new (api): relay protocol integration
📦 new (ui): loading spinner component
```

### 🔧 update
Modifying existing code, refactoring, or improving functionality.
```
🔧 update: improve error handling
🔧 update (ui): enhance button styling
🔧 update (api): optimize pagination logic
```

### 🗑️ remove
Deleting code, files, features, or dependencies.
```
🗑️ remove: deprecated helper functions
🗑️ remove (deps): unused axios package
🗑️ remove (ui): legacy modal component
```

### 🔒 security
Security fixes, patches, and vulnerability resolutions.
```
🔒 security: patch XSS vulnerability
🔒 security (auth): fix token validation
🔒 security (api): sanitize user input
```

### ⚙️ setup
Project configuration, CI/CD, tooling, and build systems.
```
⚙️ setup: configure typescript compiler
⚙️ setup (ci): add github actions workflow
⚙️ setup (vite): optimize build config
```

### ☕ chore
Routine maintenance, dependency updates, and housekeeping.
```
☕ chore: update dependencies
☕ chore (deps): bump react to 18.3.1
☕ chore: organize import statements
```

### 🧪 test
Adding, updating, or fixing tests.
```
🧪 test: add wallet validation tests
🧪 test (api): improve coverage for relay service
🧪 test (ui): add component snapshot tests
```

### 📖 docs
Documentation changes and updates.
```
📖 docs: update README setup instructions
📖 docs (api): add JSDoc comments
📖 docs: create contributing guide
```

### 🚀 release
Version releases and release preparation.
```
🚀 release: version 1.0.0
🚀 release: prepare v1.1.0-rc.1
```

## Formatting Rules

1. **Lowercase**: Use lowercase for type and description (except proper nouns)
2. **Present tense**: Use present tense verbs ("add" not "added")
3. **Character limit**: Keep total subject line under 72 characters
4. **No period**: Don't end with a period
5. **Single space**: One space after the colon

## Decision Framework

When suggesting a commit type, follow this priority:

1. 🚀 release - Version releases
2. 🔒 security - Security fixes
3. 📖 docs - Documentation only
4. 🧪 test - Tests only
5. ⚙️ setup - Configuration/tooling
6. 🗑️ remove - Deletions
7. 📦 new - New features/functionality
8. 🔧 update - Modifications to existing code
9. ☕ chore - Maintenance tasks

## Examples from This Project

```bash
# Adding new features
📦 new: relay logo component
📦 new (ui): wallet address input with validation
📦 new (api): analyze wallet statistics function

# Updating existing code
🔧 update: improve loading state animation
🔧 update (ui): change primary color to purple theme
🔧 update (api): optimize pagination handling

# Configuration
⚙️ setup: add tailwind css v3.4
⚙️ setup: configure shadcn ui components
⚙️ setup (vite): add path aliases

# Documentation
📖 docs: add disclaimer in footer
📖 docs: update README with project overview

# Maintenance
☕ chore: organize component imports
☕ chore (deps): update react to latest version
```

## Best Practices for Copilot

When generating commit suggestions:

1. **Be specific**: Instead of "fix bug", use "fix wallet validation error"
2. **Use scopes**: Add scope when it improves clarity (`(ui)`, `(api)`, `(deps)`)
3. **Atomic commits**: Suggest commits for single logical changes
4. **Consistent style**: Always follow the exact format with emoji, type, and description
5. **No redundancy**: Don't repeat information that's obvious from the diff

## Reference

Full specification: https://github.com/wgtechlabs/clean-commit/blob/main/SPECIFICATION.md
