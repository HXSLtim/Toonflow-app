# Functional Smoke Report

## Scope
- Workspace: `.worktrees/migration-target`
- Branch: `migration/full-stack-separation`
- Validation mode: API/Web availability + core login flow smoke
- Timestamp: 2026-03-04

## API Smoke

### A1. Monitoring health endpoint
- Command: `curl -sS -o docs/migration/smoke-api-health.json -w "%{http_code}" http://127.0.0.1:60000/monitoring/health`
- HTTP Status: `503`
- Result: ⚠️ Degraded/Unhealthy
- Evidence: `docs/migration/smoke-api-health.json`
- Key finding: `database.status=unhealthy`, message `db.raw is not a function`

### A2. Login endpoint
- Command: `curl -sS -H "Content-Type: application/json" -d '{"username":"admin","password":"admin123"}' -o docs/migration/smoke-login.json -w "%{http_code}" http://127.0.0.1:60000/other/login`
- HTTP Status: `200`
- Result: ✅ Pass
- Evidence: `docs/migration/smoke-login.json`
- Key finding: valid token returned for default admin credentials.

## Web Reachability Smoke

### W1. Web root route
- Command: `curl -sS -i http://localhost:5173/ > docs/migration/smoke-web-home.raw`
- HTTP Status: `404`
- Result: ❌ Fail (entry route not reachable via this runtime path)
- Evidence: `docs/migration/smoke-web-home.raw`

### W2. Web login route
- Command: `curl -sS -o docs/migration/smoke-web-login.html -w "%{http_code}" http://localhost:5173/login`
- HTTP Status: `404`
- Result: ❌ Fail
- Evidence: `docs/migration/smoke-web-login.html`

## Core Flow Smoke Matrix

| Scenario | Expected | Actual | Result | Evidence |
| --- | --- | --- | --- | --- |
| API health check | 200 healthy/degraded | 503 unhealthy | ❌ FAIL | `docs/migration/smoke-api-health.json` |
| User login | 200 + token | 200 + token | ✅ PASS | `docs/migration/smoke-login.json` |
| Web home availability | 200 HTML | 404 | ❌ FAIL | `docs/migration/smoke-web-home.raw` |
| Web login availability | 200 HTML | 404 | ❌ FAIL | `docs/migration/smoke-web-login.html` |

## Smoke Conclusion
- API core auth path is working (`/other/login` pass).
- Monitoring health endpoint reports unhealthy database probe.
- Web routes are not reachable under current runtime invocation (404), needs follow-up on web service routing/start mode.

Overall smoke status: **NOT PASS**.
