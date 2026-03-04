# Automated Validation Report

## Metadata
- Workspace: `.worktrees/migration-target`
- Branch: `migration/full-stack-separation`
- Baseline commit before validation: `df7b797bb8a21c5d398c6a2728c906eec2448fd8`
- Validation timestamp (UTC): `2026-03-04T12:59:59Z`

## Commands and Results

### 1) Lint
Command:
```bash
npm --prefix .worktrees/migration-target run lint
```
Result: ✅ PASS (exit code `0`)
Evidence:
- `docs/migration/automated-validation-lint.log`
- Key output: `tsc --noEmit` passed, `eslint .` passed

### 2) Test
Command:
```bash
npm --prefix .worktrees/migration-target run test
```
Result: ✅ PASS (exit code `0`)
Evidence:
- `docs/migration/automated-validation-test.log`
- Key output: `Test Files 15 passed (15)`, `Tests 147 passed (147)`

### 3) Build
Command:
```bash
npm --prefix .worktrees/migration-target run build
```
Result: ✅ PASS (exit code `0`)
Evidence:
- `docs/migration/automated-validation-build.log`
- Key output: API build completed (`build/app.js`), Web build completed (`✓ built in 4.68s`)

## Summary
- lint: PASS
- test: PASS
- build: PASS

All automated validation gates are satisfied for the migration worktree.
