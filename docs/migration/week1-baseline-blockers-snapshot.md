# Week1 Baseline Blockers Snapshot

## Purpose
Create a formal, pre-fix baseline of immediate migration blockers discovered in the first readiness run, so Week1 fixes can be tracked against a stable reference.

## Snapshot Context
- Workspace: `.worktrees/migration-target`
- Branch: `migration/full-stack-separation`
- Baseline stage: pre-fix (before Week1 blocker remediation)
- Inputs:
  - `docs/migration/automated-validation-report.md`
  - `docs/migration/functional-smoke-report.md`
  - `docs/migration/migration-readiness.md`

## Immediate Blockers (Baseline)

| Blocker ID | Gate | Symptom | Baseline Result | Evidence | Planned Fix Track |
| --- | --- | --- | --- | --- | --- |
| W1-BLK-001 | Functional smoke (API health) | `GET /monitoring/health` returns `503`; payload shows `database.status=unhealthy` with message `db.raw is not a function` | Open / Blocking | `docs/migration/smoke-api-health.json`, `docs/migration/functional-smoke-report.md`, `docs/migration/migration-readiness.md` | Task `#21` (`Week1 fix health probe compatibility`) |
| W1-BLK-002 | Functional smoke (Web reachability) | Web smoke checks for `/` and `/login` on `localhost:5173` returned `404` in current run mode | Open / Blocking | `docs/migration/smoke-web-home.raw`, `docs/migration/functional-smoke-report.md`, `docs/migration/migration-readiness.md` | Task `#24` (`Week1 standardize web smoke runbook`) |

## Baseline Decision
- Automated validation gate: PASS (`lint`, `test`, `build` all pass).
- Functional smoke gate: FAIL (blockers above still open).
- Week1 readiness baseline: **NOT READY** until `W1-BLK-001` and `W1-BLK-002` are closed and smoke is re-verified.

## Exit Criteria for Baseline Blockers
1. `W1-BLK-001`: health endpoint returns expected non-error status for current DB client behavior.
2. `W1-BLK-002`: web smoke checks for `/` and `/login` return expected reachable responses under standardized run mode.
3. `docs/migration/migration-readiness.md` updated with post-fix verification evidence.
