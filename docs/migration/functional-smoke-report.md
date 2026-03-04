# Functional Smoke Report

## Scope
- Workspace: `.worktrees/migration-target`
- Branch: `migration/full-stack-separation`
- Validation mode: API/Web availability + core login flow smoke
- Re-run window (UTC): `2026-03-04T13:43:45Z` to `2026-03-04T13:43:46Z`
- Runbook: `docs/migration/week1-web-smoke-runbook.md`

## Runbook Gate Check (Web 5173 Binding)

### Gate 1. 5173 binding verification
- Command:
```bash
rg "Local:.*(127\.0\.0\.1|localhost):5173/" docs/migration/smoke-web-dev.log
```
- Result: ⚠️ Blocked for this rerun window
- Observation: `docs/migration/smoke-web-dev.log` shows `Error: Port 5173 is already in use`, so a new runbook-started process could not bind 5173.
- Existing listener evidence: `netstat -ano` confirms `127.0.0.1:5173 LISTENING` (`PID 18284`, `node.exe`).

## API Smoke

### A1. Monitoring health endpoint
- Command:
```bash
curl -sS -D "docs/migration/smoke-api-health.headers" \
  -o "docs/migration/smoke-api-health.json" \
  -w "%{http_code}" "http://127.0.0.1:60000/monitoring/health" \
  > "docs/migration/smoke-api-health.status"
```
- HTTP Status: `200`
- Result: ✅ Pass
- Evidence: `docs/migration/smoke-api-health.status`, `docs/migration/smoke-api-health.json`, `docs/migration/smoke-api-health.headers`
- Key finding: `status=healthy` and all checks healthy.

### A2. Login endpoint
- Command:
```bash
curl -sS -D "docs/migration/smoke-login.headers" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  -o "docs/migration/smoke-login.json" \
  -w "%{http_code}" "http://127.0.0.1:60000/other/login" \
  > "docs/migration/smoke-login.status"
```
- HTTP Status: `200`
- Result: ✅ Pass
- Evidence: `docs/migration/smoke-login.status`, `docs/migration/smoke-login.json`, `docs/migration/smoke-login.headers`
- Key finding: valid bearer token returned for admin credentials.

## Web Reachability Smoke

### W1. Web root route
- Command:
```bash
curl -sS -D "docs/migration/smoke-web-home.headers" \
  -o "docs/migration/smoke-web-home.html" \
  -w "%{http_code}" "http://127.0.0.1:5173/" \
  > "docs/migration/smoke-web-home.status"
```
- HTTP Status: `200`
- Result: ✅ Pass
- Evidence: `docs/migration/smoke-web-home.status`, `docs/migration/smoke-web-home.html`, `docs/migration/smoke-web-home.headers`

### W2. Web login route
- Command:
```bash
curl -sS -D "docs/migration/smoke-web-login.headers" \
  -o "docs/migration/smoke-web-login.html" \
  -w "%{http_code}" "http://127.0.0.1:5173/login" \
  > "docs/migration/smoke-web-login.status"
```
- HTTP Status: `200`
- Result: ✅ Pass
- Evidence: `docs/migration/smoke-web-login.status`, `docs/migration/smoke-web-login.html`, `docs/migration/smoke-web-login.headers`

## Core Flow Smoke Matrix

| Scenario | Expected | Actual | Result | Evidence |
| --- | --- | --- | --- | --- |
| Runbook gate 1 (5173 bind) | log confirms local `:5173` from canonical startup | startup attempt blocked by occupied port (`EADDRINUSE`) | ⚠️ CONDITIONAL | `docs/migration/smoke-web-dev.log`; `netstat -ano` output (`PID 18284`) |
| API health check | 200 healthy/degraded | 200 healthy | ✅ PASS | `docs/migration/smoke-api-health.status`; `docs/migration/smoke-api-health.json` |
| User login | 200 + token | 200 + token | ✅ PASS | `docs/migration/smoke-login.status`; `docs/migration/smoke-login.json` |
| Web home availability | 200 HTML | 200 | ✅ PASS | `docs/migration/smoke-web-home.status`; `docs/migration/smoke-web-home.html` |
| Web login availability | 200 HTML | 200 | ✅ PASS | `docs/migration/smoke-web-login.status`; `docs/migration/smoke-web-login.html` |

## Smoke Conclusion
- API critical probes (`/monitoring/health`, `/other/login`) both pass with status `200`.
- Web route probes (`/`, `/login`) both pass with status `200` at `127.0.0.1:5173`.
- Runbook gate 1 could not be freshly satisfied in this rerun window because port 5173 was already occupied by an existing node process.

Overall smoke status: **PASS (conditional on pre-existing 5173 listener; requires clean rerun for strict gate-1 evidence)**.
