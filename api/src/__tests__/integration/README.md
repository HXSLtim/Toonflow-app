# API Integration Test README

## Purpose
为 `api` 提供接口级回归保护，确保健康探针、鉴权与核心业务接口在迁移演进中保持稳定。

## Scope
- 健康检查：`GET /monitoring/health`
- 鉴权链路：`POST /other/login`
- 核心业务接口：至少一组读写路径（按模块逐步扩展）

## Suggested Layout
- `api/src/__tests__/integration/health.integration.test.ts`
- `api/src/__tests__/integration/auth.integration.test.ts`
- `api/src/__tests__/integration/<domain>.integration.test.ts`

## Naming Convention
- 文件：`*.integration.test.ts`
- 用例标题：`[INTEGRATION][API] <scenario>`

## Execution
建议在 `api/package.json` 增加脚本（由实现任务补齐）：

```bash
npm --prefix api run test:integration
```

## Minimum Assertions
1. health 接口返回 `200` 且包含 `status/checks` 字段。
2. login 成功返回 token，错误凭证返回可预期错误码与消息。
3. 至少一组核心业务接口满足状态码与响应结构契约。

## Test Data Policy
- 使用可重复 seed 数据。
- 每次测试后回收或重置状态，避免跨用例污染。
- 禁止依赖不可控外部状态作为断言前提。

## Failure Policy
- 任一 integration 失败视为发布阻断。
- 必须提供失败请求/响应样本与日志。

## Evidence Output
- 建议将关键状态码与响应快照归档至 `docs/migration/`。
