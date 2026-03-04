# Automated Validation Report

## Metadata
- Workspace: `.worktrees/migration-target`
- Branch: `migration/full-stack-separation`
- Baseline commit before validation: `3e6f87689ec76ccfb5daf50970ddf795f3b99837`
- Validation timestamp (UTC): `2026-03-04T12:57:20Z`

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
- Key output: API build completed (`build/app.js`), Web build completed (`✓ built in 6.47s`)

## Summary
- lint: PASS
- test: PASS
- build: PASS

All automated validation gates are satisfied for the migration worktree.
