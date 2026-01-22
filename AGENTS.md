# Clean Commit Workflow Guide

This repository uses the **Clean Commit** workflow for standardized commit messages. For full specifications, see: https://github.com/wgtechlabs/clean-commit

## Commit Message Format

All commits must follow this structure:
```
<emoji> <type>: <description>
```

With optional scope:
```
<emoji> <type> (<scope>): <description>
```

## Nine Commit Types

Use these types for all commits:

- **📦 new**: Adding new features, files, or capabilities
  - Example: `📦 new: user authentication system`
  - Example: `📦 new (api): wallet statistics endpoint`

- **🔧 update**: Changing existing code, refactoring, improvements
  - Example: `🔧 update: improve error handling`
  - Example: `🔧 update (ui): enhance loading state animation`

- **🗑️ remove**: Removing code, files, features, or dependencies
  - Example: `🗑️ remove: deprecated API methods`
  - Example: `🗑️ remove (deps): unused lodash package`

- **🔒 security**: Security fixes, patches, vulnerability resolutions
  - Example: `🔒 security: patch XSS vulnerability`
  - Example: `🔒 security (auth): fix token validation`

- **⚙️ setup**: Project configs, CI/CD, tooling, build systems
  - Example: `⚙️ setup: configure vite build`
  - Example: `⚙️ setup (ci): add github actions workflow`

- **☕ chore**: Maintenance tasks, dependency updates, housekeeping
  - Example: `☕ chore: update dependencies`
  - Example: `☕ chore (deps): bump react to 18.3.1`

- **🧪 test**: Adding, updating, or fixing tests
  - Example: `🧪 test: add wallet validation tests`
  - Example: `🧪 test (api): improve coverage for relay service`

- **📖 docs**: Documentation changes and updates
  - Example: `📖 docs: update README with setup instructions`
  - Example: `📖 docs (api): add JSDoc comments`

- **🚀 release**: Version releases and release preparation
  - Example: `🚀 release: version 1.0.0`
  - Example: `🚀 release: prepare v1.1.0-rc.1`

## Formatting Rules

1. **Lowercase**: Use lowercase for type and description (except proper nouns)
   - ✅ `📦 new: dashboard component`
   - ❌ `📦 New: Dashboard Component`

2. **Present tense**: Use present tense verbs
   - ✅ `🔧 update: improve performance`
   - ❌ `🔧 update: improved performance`

3. **Character limit**: Keep total subject line under 72 characters
   - ✅ `📦 new (ui): wallet input component with validation`
   - ❌ `📦 new (ui): wallet input component with extensive validation and error handling capabilities`

4. **No period**: Don't end with a period
   - ✅ `📖 docs: add contributing guide`
   - ❌ `📖 docs: add contributing guide.`

5. **Single space**: One space after the colon
   - ✅ `🔧 update: fix bug`
   - ❌ `🔧 update:fix bug`

## Decision Framework

When unsure which type to use, follow this order:

1. **🚀 release** - Is this a version release?
2. **🔒 security** - Does this fix a security issue?
3. **📖 docs** - Is this only documentation?
4. **🧪 test** - Is this only tests?
5. **⚙️ setup** - Is this configuration/tooling?
6. **🗑️ remove** - Are you deleting something?
7. **📦 new** - Are you adding new functionality?
8. **🔧 update** - Are you modifying existing code?
9. **☕ chore** - Is this routine maintenance?

## Best Practices

- **One commit, one change**: Each commit should address a single logical change
- **Atomic commits**: Make commits that can be reverted independently
- **Use scopes consistently**: If you start using scopes, use them throughout
- **Write for humans**: Your commit messages will be read by future you and teammates
- **Be specific**: "fix bug" is less helpful than "fix wallet validation error"

## Package Manager

This project uses **pnpm** as the package manager. Always use pnpm commands:

- **Install dependencies**: `pnpm install`
- **Run dev server**: `pnpm run dev`
- **Build project**: `pnpm run build`
- **Add packages**: `pnpm add <package>`
- **Remove packages**: `pnpm remove <package>`

Do NOT use npm or yarn commands. The project includes both `pnpm-lock.yaml` and `package-lock.json`, but pnpm is the standard for this project.

## AI Agent Instructions

When generating commits for this project:

1. Always use the Clean Commit format
2. Choose the most appropriate emoji and type from the nine options
3. Keep descriptions clear, concise, and under 72 characters
4. Use present tense and lowercase
5. Add scope when it improves clarity (e.g., `(ui)`, `(api)`, `(deps)`)
6. If multiple changes are made, create separate commits for each logical change

When working with this project:

1. Always use pnpm for package management (install, add, remove, run)
2. Never use npm or yarn commands
3. Respect the pnpm-lock.yaml file for dependency resolution

For more details, see the full specification: https://github.com/wgtechlabs/clean-commit/blob/main/SPECIFICATION.md
