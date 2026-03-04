# Week3 Quality Hardening Strategy

## Objective
建立可重复、可追踪的自动化质量防线，在迁移分支中对前端关键路径与 API 关键接口提供回归保护，并将结果纳入发布门禁。

## Scope
- Frontend smoke: `web` 应用关键可用路径。
- API integration: `api` 核心业务接口、健康检查、鉴权链路。
- CI gate: 每次 PR 必须通过 smoke + integration 才可进入后续发布环节。

## Quality Gates (Week3)
1. **Gate-Q1 Frontend Smoke**
   - 覆盖 `/`、`/login`、核心导航跳转与关键页面首屏渲染。
   - 判定：HTTP/路由可达 + 关键 UI 标识存在。
2. **Gate-Q2 API Integration**
   - 覆盖 `/monitoring/health`、`/other/login` 及一组核心读写接口。
   - 判定：状态码、响应结构、关键业务断言全部满足。
3. **Gate-Q3 End-to-end Readiness Signal**
   - 汇总 Q1/Q2 结果并输出 readiness 结论。
   - 判定：所有硬门禁 PASS，才可标记“READY”。

## Test Strategy
### 1) Frontend Smoke Strategy
- 工具建议：Vitest + Testing Library（组件/路由级）与最小化 HTTP 探针（环境级）。
- 用例分层：
  - **Route reachability**：`/`、`/login` 返回可用页面。
  - **Auth shell render**：登录页表单控件存在。
  - **Core shell render**：首页关键导航与骨架组件存在。
- 失败分级：
  - P0：`/` 或 `/login` 不可达。
  - P1：关键 UI 标识缺失或主要交互断裂。

### 2) API Integration Strategy
- 工具建议：Vitest + Supertest + 测试专用数据准备/清理脚本。
- 用例分层：
  - **Health contract**：健康探针返回 200 且包含预期字段。
  - **Auth contract**：登录成功返回 token，失败路径返回可预期错误。
  - **Business contract**：关键 CRUD 接口的状态码、结构、最小业务语义。
- 数据策略：
  - 测试前置 seed，测试后清理。
  - 尽量隔离测试数据，避免污染共享环境。

## CI/CD Integration Plan
1. 在 PR 流水线加入并固定顺序：`lint -> unit -> smoke -> integration -> build`。
2. smoke/integration 失败即阻断合并。
3. 产出标准化 artifact：日志、状态码快照、关键响应样本。
4. 在 `docs/migration/migration-readiness.md` 中引用最近一次门禁结果。

## Evidence & Reporting
- Smoke evidence:
  - `docs/migration/smoke-web-home.status`
  - `docs/migration/smoke-web-login.status`
- Integration evidence:
  - `docs/migration/smoke-api-health.status`
  - `docs/migration/smoke-login.status`
- 汇总报告：
  - `docs/migration/automated-validation-report.md`
  - `docs/migration/functional-smoke-report.md`
  - `docs/migration/migration-readiness.md`

## Week3 Execution Checklist
- [ ] 定义并补齐 frontend smoke 用例目录与命名约定。
- [ ] 定义并补齐 API integration 用例目录与命名约定。
- [ ] 将 smoke/integration 命令接入 package scripts。
- [ ] 在 CI 中启用 hard gate 并验证阻断行为。
- [ ] 完成一次全链路演练并归档证据。

## Definition of Done
- 前端 smoke 与 API integration 均具备可执行文档与目录规范。
- CI 对 smoke/integration 失败具备阻断能力。
- readiness 报告可引用最近一次门禁结果并支撑发布决策。
