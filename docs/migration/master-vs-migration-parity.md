# Master vs Migration Parity Matrix

- Baseline branch: `master`
- Migration branch: `origin/migration/full-stack-separation`
- Assessment scope: API routes, frontend pages, workspace scripts, package structure
- Status values: `✅ Aligned` / `⚠️ Partial` / `❌ Missing`

## Parity Matrix

| Baseline ID | Master Evidence | Migration Evidence | Status | Verification |
| --- | --- | --- | --- | --- |
| API-001 | `src/routes/**` (96 files) | `api/src/routes/**` (96 files) | ✅ Aligned | `git ls-tree -r --name-only HEAD src/routes` + `git ls-tree -r --name-only origin/migration/full-stack-separation api/src/routes` + `comm` (missing=0, extra=0) |
| API-002 | 96 route modules with master blob hashes | 96 route modules with migration blob hashes | ⚠️ Partial | blob-hash compare via `git ls-tree -r` + `join`; changed files = 11 |
| WEB-001 | `app/src/pages/**` (11 files) | `web/src/pages/**` (11 files) | ✅ Aligned | `git ls-tree -r --name-only HEAD app/src/pages` + `git ls-tree -r --name-only origin/migration/full-stack-separation web/src/pages` + `comm` (missing=0, extra=0) |
| WEB-002 | 11 pages with master blob hashes | 11 pages with migration blob hashes | ⚠️ Partial | blob-hash compare via `git ls-tree -r` + `join`; changed files = 11/11 |
| SCR-001 | root scripts (`dev`, `lint`, `test`, `build`) in `package.json` | workspace scripts (`dev:api`, `dev:web`, `lint*`, `test*`, `build*`) in root `package.json` | ✅ Aligned | `git show HEAD:package.json` vs `git show origin/migration/full-stack-separation:package.json` |
| PKG-001 | monolith manifests: root + `app/package.json` | split manifests: root + `api/package.json` + `web/package.json` | ✅ Aligned | `git diff --name-status HEAD..origin/migration/full-stack-separation -- package.json app/package.json api/package.json web/package.json` |

## Changed Modules Evidence (`⚠️ Partial`)

### API modules with content differences (11)

- `batch/createBatchTask.ts`
- `costume/generateCostume.ts`
- `costume/getCostumes.ts`
- `format/convertFormat.ts`
- `other/login.ts`
- `other/testVideo.ts`
- `setting/addModel.ts`
- `setting/configurationModel.ts`
- `setting/delModel.ts`
- `setting/updateModel.ts`
- `video/deleteVideoConfig.ts`

### Frontend pages with content differences (11/11)

- `ComponentsShowcase.tsx`
- `Dashboard.tsx`
- `Home.tsx`
- `Login.tsx`
- `NotFound.tsx`
- `ProjectDetail.tsx`
- `Projects.tsx`
- `Scripts.tsx`
- `Settings.tsx`
- `Storyboards.tsx`
- `Videos.tsx`

## Verification Commands and Results

```bash
# API path parity (master vs migration)
git ls-tree -r --name-only HEAD "src/routes" | perl -pe 's#^src/routes/##' | sort > /tmp/master_routes.txt
git ls-tree -r --name-only origin/migration/full-stack-separation "api/src/routes" | perl -pe 's#^api/src/routes/##' | sort > /tmp/migration_routes.txt
comm -23 /tmp/master_routes.txt /tmp/migration_routes.txt | wc -l   # 0
comm -13 /tmp/master_routes.txt /tmp/migration_routes.txt | wc -l   # 0

# Web page path parity (master vs migration)
git ls-tree -r --name-only HEAD "app/src/pages" | perl -pe 's#^app/src/pages/##' | sort > /tmp/master_pages.txt
git ls-tree -r --name-only origin/migration/full-stack-separation "web/src/pages" | perl -pe 's#^web/src/pages/##' | sort > /tmp/migration_pages.txt
comm -23 /tmp/master_pages.txt /tmp/migration_pages.txt | wc -l     # 0
comm -13 /tmp/master_pages.txt /tmp/migration_pages.txt | wc -l     # 0

# Content parity by blob hash (API + Web)
# API changed modules: 11
# Web changed pages: 11
```

## Conclusion

- Path-level feature coverage parity is complete across API routes and frontend pages.
- No `❌ Missing` items were found in parity checks.
- Content-level parity remains `⚠️ Partial` where migration refactors changed implementation details.
