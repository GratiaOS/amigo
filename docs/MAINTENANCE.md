# Maintenance Policy

This repo follows a simple, predictable maintenance flow.

## Default

- Fix in `main` first.
- Cherry-pick the fix into any supported `release/*` branches.
- Cut a patch release if the fix affects production users.

## Exception (urgent release-only fix)

- Fix directly on the affected `release/*` branch.
- Backport the same commit into `main` to prevent drift.

## Branches

- `main`: active development
- `release/*`: supported maintenance lines (only critical fixes)

