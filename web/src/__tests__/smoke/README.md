# Frontend Smoke Test README

## Purpose
为 `web` 提供最小但高价值的 smoke 回归防线，优先覆盖“可访问、可渲染、可导航”三类关键风险。

## Scope
- 路由可达：`/`、`/login`
- 关键视图渲染：登录页与首页的核心标识
- 基础导航流程：登录后（或模拟态）核心页面切换

## Suggested Layout
- `web/src/__tests__/smoke/routes.smoke.test.ts`
- `web/src/__tests__/smoke/auth.smoke.test.ts`
- `web/src/__tests__/smoke/navigation.smoke.test.ts`

## Naming Convention
- 文件：`*.smoke.test.ts(x)`
- 用例标题：`[SMOKE][WEB] <scenario>`

## Execution
建议在 `web/package.json` 增加脚本（由实现任务补齐）：

```bash
npm --prefix web run test:smoke
```

## Minimum Assertions
1. `/` 可达并渲染应用根容器。
2. `/login` 可达并渲染用户名/密码输入框。
3. 关键导航入口存在（例如 Dashboard/Projects）。

## Failure Policy
- 任一 smoke 失败视为回归风险，阻断 PR 合并。
- 失败时必须附带：
  - 测试日志
  - 关键 DOM 快照或错误栈

## Evidence Output
- 建议输出到：`docs/migration/` 下对应 smoke artifact（由流水线归档）。
