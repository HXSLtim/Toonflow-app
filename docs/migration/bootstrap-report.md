# Migration Bootstrap Report

## Metadata
- Timestamp (UTC): 2026-03-04T12:54:11Z
- Workspace: `.worktrees/migration-target`
- Branch: `migration/full-stack-separation`
- Baseline commit before bootstrap: `26374e1`
- Node.js: `v24.13.0`
- npm: `11.6.2`

## Command Outcomes

### 1) Sync migration branch
Command:
```bash
git -C .worktrees/migration-target fetch origin && git -C .worktrees/migration-target pull --ff-only
```
Result: ✅ PASS (`Already up to date.`)

### 2) Install root dependencies
Command:
```bash
npm install --prefix .worktrees/migration-target
```
Result: ✅ PASS (`up to date, audited 1 package in 344ms`, `found 0 vulnerabilities`)

### 3) Install API dependencies (strict resolver)
Command:
```bash
npm install --prefix .worktrees/migration-target/api
```
Result: ❌ FAIL (`ERESOLVE` peer resolution conflict)

Key error summary:
- While resolving: `@rmp135/sql-ts@2.2.0`
- Found: `better-sqlite3@12.6.2`
- Required peerOptional: `better-sqlite3@^11.2.1`

### 4) Install API dependencies (legacy fallback)
Command:
```bash
npm install --prefix .worktrees/migration-target/api --legacy-peer-deps
```
Result: ⚠️ PASS with fallback
- Install output: `up to date, audited 482 packages in 3s`
- Audit summary: `9 vulnerabilities (2 low, 7 high)`

### 5) Install web dependencies
Command:
```bash
npm install --prefix .worktrees/migration-target/web
```
Result: ✅ PASS
- Install output: `up to date, audited 566 packages in 2s`
- Audit summary: `found 0 vulnerabilities`

### 6) Run lint (workspace)
Command:
```bash
npm --prefix .worktrees/migration-target run lint
```
Result: ✅ PASS
- `lint:api` (`tsc --noEmit`) passed
- `lint:web` (`eslint .`) passed

## Cleanup Performed
To avoid package-manager noise in this task commit:
- Restored lockfile changes:
  - `git -C .worktrees/migration-target restore api/yarn.lock web/yarn.lock`
- Removed generated npm lockfiles:
  - `.worktrees/migration-target/package-lock.json`
  - `.worktrees/migration-target/api/package-lock.json`
  - `.worktrees/migration-target/web/package-lock.json`

## Post-cleanup Status Snapshot
Command:
```bash
git -C .worktrees/migration-target status --short --branch
```
Observed:
```text
## migration/full-stack-separation...origin/migration/full-stack-separation [ahead 8]
 M api/src/router.ts
 M api/src/types/database.d.ts
 M docs/migration/smoke-api-health.json
?? docs/migration/smoke-api-health.headers
?? docs/migration/smoke-api-health.status
?? docs/migration/smoke-login.headers
?? docs/migration/smoke-login.status
?? docs/migration/smoke-run-end-utc.txt
?? docs/migration/smoke-run-processes.txt
?? docs/migration/smoke-run-start-utc.txt
?? docs/migration/smoke-web-dev.log
?? docs/migration/smoke-web-home.headers
?? docs/migration/smoke-web-home.html
?? docs/migration/smoke-web-home.status
?? docs/migration/smoke-web-login.headers
?? docs/migration/smoke-web-login.status
```

## Conclusion
Bootstrap dependency setup is completed for task #15 with a documented strict-install failure and successful legacy fallback for API, and lint gate passing.
