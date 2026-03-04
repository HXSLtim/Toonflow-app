# Week1 Web Smoke Runbook (Standardized)

## Scope
- Workspace: `.worktrees/migration-target`
- Branch: `migration/full-stack-separation`
- Blocker target: `W1-BLK-002`
- Goal: remove false `404` validation noise for web smoke checks.

## Problem Summary
Previous smoke runs produced `404` for `/` and `/login` because startup flags were passed to `npm` instead of being forwarded to `vite`, which allowed the dev server to move to a fallback port while probes still targeted `5173`.

## Canonical Startup (Required)
Run from repository root in one terminal:

```bash
WEB_LOG=".worktrees/migration-target/docs/migration/smoke-web-dev.log"
: > "$WEB_LOG"
npm --prefix ".worktrees/migration-target/web" run dev -- --host 127.0.0.1 --port 5173 --strictPort > "$WEB_LOG" 2>&1
```

Rules:
- Keep this process running during probes.
- `--strictPort` is mandatory to prevent silent port fallback.
- Do **not** use `npm run dev:web --host ...` (missing argument-forward separator).

## Startup Verification (Gate 1)
Before any endpoint probe, verify the startup log confirms `5173`:

```bash
rg "Local:.*(127\\.0\\.0\\.1|localhost):5173/" .worktrees/migration-target/docs/migration/smoke-web-dev.log
```

Expected: at least one match.

If no match:
- Stop smoke validation.
- Fix startup/port conflict.
- Restart with the canonical startup command.

## Endpoint Verification (Gate 2)
Run in another terminal from repository root:

```bash
curl -sS -D ".worktrees/migration-target/docs/migration/smoke-web-home.headers" \
  -o ".worktrees/migration-target/docs/migration/smoke-web-home.html" \
  -w "%{http_code}" "http://127.0.0.1:5173/" \
  > ".worktrees/migration-target/docs/migration/smoke-web-home.status"

curl -sS -D ".worktrees/migration-target/docs/migration/smoke-web-login.headers" \
  -o ".worktrees/migration-target/docs/migration/smoke-web-login.html" \
  -w "%{http_code}" "http://127.0.0.1:5173/login" \
  > ".worktrees/migration-target/docs/migration/smoke-web-login.status"
```

Quick checks:

```bash
rg "^200$" .worktrees/migration-target/docs/migration/smoke-web-home.status
rg "^200$" .worktrees/migration-target/docs/migration/smoke-web-login.status
```

## Pass/Fail Criteria
- PASS:
  - Gate 1 confirms Vite on `5173`, and
  - `/` returns `200`, and
  - `/login` returns `200`.
- FAIL:
  - Gate 1 fails, or
  - either endpoint is non-`200`.

## False-404 Guardrail
A `404` result is **invalid evidence** unless Gate 1 already proves the server is on `5173` for the same run.

## Evidence Artifacts
- `.worktrees/migration-target/docs/migration/smoke-web-dev.log`
- `.worktrees/migration-target/docs/migration/smoke-web-home.headers`
- `.worktrees/migration-target/docs/migration/smoke-web-home.html`
- `.worktrees/migration-target/docs/migration/smoke-web-home.status`
- `.worktrees/migration-target/docs/migration/smoke-web-login.headers`
- `.worktrees/migration-target/docs/migration/smoke-web-login.html`
- `.worktrees/migration-target/docs/migration/smoke-web-login.status`
