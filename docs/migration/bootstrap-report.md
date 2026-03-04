# Migration Bootstrap Report

## Metadata
- Timestamp (UTC): 2026-03-04T12:46:33Z
- Workspace: `.worktrees/migration-target`
- Branch: `migration/full-stack-separation`
- Node.js: `v24.13.0`
- npm: `11.6.2`

## Command Outcomes

### 1) Sync migration branch
Command:
```bash
git -C .worktrees/migration-target fetch origin && git -C .worktrees/migration-target pull --ff-only
```
Result: ✅ Success (`Already up to date.`)

### 2) Install root dependencies
Command:
```bash
npm install --prefix .worktrees/migration-target
```
Result: ✅ Success (`up to date, audited 1 package in 344ms`, `found 0 vulnerabilities`)

### 3) Install API dependencies (strict resolver)
Command:
```bash
npm install --prefix .worktrees/migration-target/api
```
Result: ❌ Failed (`ERESOLVE` peer resolution conflict)

Failure summary:
- Package: `@rmp135/sql-ts@2.2.0`
- Found: `better-sqlite3@12.6.2`
- Expected peerOptional: `better-sqlite3@^11.2.1`

### 4) Install API dependencies (compat fallback)
Command:
```bash
npm install --prefix .worktrees/migration-target/api --legacy-peer-deps
```
Result: ⚠️ Completed with compatibility fallback
- Install output: `up to date, audited 482 packages in 3s`
- Audit summary: `9 vulnerabilities (2 low, 7 high)`

### 5) Install web dependencies
Command:
```bash
npm install --prefix .worktrees/migration-target/web
```
Result: ✅ Success
- Install output: `up to date, audited 566 packages in 2s`
- Audit summary: `found 0 vulnerabilities`

### 6) Run lint (workspace)
Command:
```bash
npm --prefix .worktrees/migration-target run lint
```
Result: ✅ Success
- `lint:api`: `tsc --noEmit` passed
- `lint:web`: `eslint .` passed

## Post-bootstrap Git Status
Command:
```bash
git -C .worktrees/migration-target status --short --branch
```
Observed:
```text
## migration/full-stack-separation...origin/migration/full-stack-separation [ahead 3]
 M api/yarn.lock
 M web/yarn.lock
?? api/package-lock.json
?? package-lock.json
?? web/package-lock.json
```

## Notes
- API dependency installation currently requires `--legacy-peer-deps` due to peer constraint mismatch between `@rmp135/sql-ts` and `better-sqlite3`.
- `npm install` introduced npm lockfiles while existing Yarn lockfiles were also updated.
