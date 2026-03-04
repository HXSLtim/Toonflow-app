# Web Smoke Runbook (Week1 Standard)

## Scope
- Workspace: `.worktrees/migration-target`
- Branch: `migration/full-stack-separation`
- Target: remove false `404` noise in web smoke checks.

## Canonical Runtime
Use fixed endpoint `127.0.0.1:5174` for Week1 smoke verification.

### 1) Start web dev server
Run from repository root:

```bash
npm --prefix .worktrees/migration-target/web run dev -- --host 127.0.0.1 --port 5174 --strictPort
```

### 2) Verify startup endpoint
Run from repository root:

```bash
curl -sS -o /tmp/web-root-ok.html -w "%{http_code}" http://127.0.0.1:5174/
curl -sS -o /tmp/web-login-ok.html -w "%{http_code}" http://127.0.0.1:5174/login
```

Expected:
- Root status: `200`
- Login status: `200`

## Pass / Fail Criteria
- PASS: both root and login probes return `200`.
- FAIL: any probe returns non-`200`.

## Evidence Paths
- `/tmp/web-root-ok.html`
- `/tmp/web-login-ok.html`
- Result summary should be recorded in:
  - `docs/migration/functional-smoke-report.md`
  - `docs/migration/migration-readiness.md`
