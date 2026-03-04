# Week1 Blockers Baseline

## Scope
Pre-fix baseline for immediate blockers that keep migration readiness at `NOT READY` in Week1.

## Blockers Table

| blocker-id | symptom | evidence-path | acceptance-target | owner |
| --- | --- | --- | --- | --- |
| W1-BLK-001 | `GET /monitoring/health` returns `503` and reports `db.raw is not a function` in health payload | `docs/migration/migration-readiness.md`, `docs/migration/functional-smoke-report.md`, `docs/migration/smoke-api-health.json` | Health check no longer fails on DB probe path; rerun smoke and update readiness to remove this blocker | `backend-engineer` |
| W1-BLK-002 | Web smoke checks return `404` for `/` and `/login` under current run mode | `docs/migration/migration-readiness.md`, `docs/migration/functional-smoke-report.md`, `docs/migration/smoke-web-home.raw` | Standardized web smoke run mode yields reachable `/` and `/login`; readiness updated with passing evidence | `frontend-engineer` |

## Baseline Notes
- This baseline is captured before applying Week1 fixes.
- Closure requires updated smoke evidence and readiness report refresh.
