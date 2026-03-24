# Contributing to lite-clipboard

Thank you for your interest in contributing! 🎉

## Development Setup

```bash
# Clone the repo
git clone https://github.com/matifandy8/lite-clipboard.git
cd lite-clipboard

# Install dependencies
pnpm install

# Build
pnpm build

# Run tests
pnpm test
```

## Commit Messages

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Please follow this format:

| Type | Description | Release Type |
|------|-------------|--------------|
| `feat:` | New feature | `minor` |
| `fix:` | Bug fix | `patch` |
| `perf:` | Performance improvement | `patch` |
| `refactor:` | Code refactoring | none |
| `docs:` | Documentation only | none |
| `chore:` | Maintenance tasks | none |

### Examples

```bash
# Bug fix
git commit -m "fix: resolve clipboard timeout not resetting"

# New feature
git commit -m "feat: add HTML copy support"

# Breaking change
git commit -m "feat!: change API to async-only
BREAKING CHANGE: remove sync copy function"
```

## Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Make your changes
4. Run tests: `pnpm test`
5. Push and open a PR

## Code Style

- Use Prettier (included)
- Keep it simple and tiny
- Zero dependencies in the core

## Size Limits

The library enforces strict size limits:
- Core utilities: < 300 bytes gzipped (actual: ~253 bytes)
- React hook: < 600 bytes gzipped (actual: ~432 bytes)

---

**Happy coding!** 🚀
