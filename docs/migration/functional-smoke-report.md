# Functional Smoke Report

## Scope
- Workspace: `.worktrees/migration-target`
- Branch: `migration/full-stack-separation`
- Validation mode: API/Web availability + core login flow smoke
- Timestamp: 2026-03-04

## API Smoke

### A1. Monitoring health endpoint
- Initial command: `curl -sS -o docs/migration/smoke-api-health.json -w "%{http_code}" http://127.0.0.1:60000/monitoring/health`
- Initial HTTP Status: `503`
- Initial result: ⚠️ Degraded/Unhealthy
- Initial evidence: `docs/migration/smoke-api-health.json`
- Initial key finding: `database.status=unhealthy`, message `db.raw is not a function`
- Recheck command (after #21 fix): `curl -sS -D docs/migration/week1-health-probe-afterfix.headers -o docs/migration/week1-health-probe-afterfix.json -w "%{http_code}" http://127.0.0.1:60000/monitoring/health`
- Recheck HTTP Status: `200`
- Recheck result: ✅ Pass
- Recheck evidence: `docs/migration/week1-health-probe-afterfix.json` / `docs/migration/week1-health-probe-afterfix.headers`

### A2. Login endpoint
- Command: `curl -sS -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' -o docs/migration/smoke-login.json -w "%{http_code}" http://127.0.0.1:60000/other/login`
- HTTP Status: `200`
- Result: ✅ Pass
- Evidence: `docs/migration/smoke-login.json`
- Key finding: valid token returned for default admin credentials.

## Web Reachability Smoke

Runbook reference: `docs/migration/web-smoke-runbook.md`

### W1. Web root route
- Command: `curl -sS -o /tmp/web-root-ok.html -w "%{http_code}" http://127.0.0.1:5174/`
- HTTP Status: `200`
- Result: ✅ Pass
- Evidence: `/tmp/web-root-ok.html`

### W2. Web login route
- Command: `curl -sS -o /tmp/web-login-ok.html -w "%{http_code}" http://127.0.0.1:5174/login`
- HTTP Status: `200`
- Result: ✅ Pass
- Evidence: `/tmp/web-login-ok.html`

## Core Flow Smoke Matrix

| Scenario | Expected | Actual | Result | Evidence |
| --- | --- | --- | --- | --- |
| API health check | 200 healthy/degraded | initial: 503 unhealthy; recheck: 200 healthy | ⚠️ RECOVERED | `docs/migration/smoke-api-health.json`; `docs/migration/week1-health-probe-afterfix.json` |
| User login | 200 + token | 200 + token | ✅ PASS | `docs/migration/smoke-login.json` |
| Web home availability | 200 HTML | 200 | ✅ PASS | `/tmp/web-root-ok.html` |
| Web login availability | 200 HTML | 200 | ✅ PASS | `/tmp/web-login-ok.html` |

## Smoke Conclusion
- API core auth path is working (`/other/login` pass).
- Monitoring health endpoint was recovered after #21 fix (`503 -> 200`).
- Web smoke is standardized by `docs/migration/web-smoke-runbook.md` and verified PASS on `127.0.0.1:5174`.

Overall smoke status: **PASS**.
