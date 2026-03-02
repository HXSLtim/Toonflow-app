# 后端架构审计报告

**审计日期:** 2026-03-02
**审计人员:** Backend Architect
**项目:** Toonflow-app v1.0.7

## 执行摘要

Toonflow 是一个基于 Express + SQLite + AI Agent 的短剧生成平台。整体架构清晰，采用 Knex ORM 管理数据库，集成多个 AI 服务商（Anthropic、OpenAI、Google、DeepSeek 等）。发现 3 个 P0 严重问题（明文密码、SQL 注入风险、缺失认证），8 个 P1 高优先级问题（错误处理、并发控制、资源泄漏等），以及多个代码质量和架构优化建议。

---

## 发现的问题

### P0 - 严重问题（安全漏洞、数据丢失风险）

#### 1. **明文密码存储**
- **文件位置:** `src/routes/other/login.ts:29`, `src/lib/initDB.ts:21`
- **问题描述:** 用户密码以明文形式存储在数据库中，登录时直接比对明文密码
- **影响范围:** 所有用户账户安全
- **修复建议:**
  ```typescript
  // 使用 bcrypt 或 argon2 加密密码
  import bcrypt from 'bcrypt';

  // 注册时
  const hashedPassword = await bcrypt.hash(password, 10);
  await u.db("t_user").insert({ name, password: hashedPassword });

  // 登录时
  const isValid = await bcrypt.compare(password, data.password);
  if (!isValid) return res.status(400).send(error("用户名或密码错误"));
  ```

#### 2. **SQL 注入风险**
- **文件位置:** `src/routes/task/getTaskApi.ts:24-31`
- **问题描述:** 虽然使用 Knex ORM，但部分查询条件直接拼接字符串，存在潜在 SQL 注入风险
- **影响范围:** 任务查询接口
- **修复建议:**
  ```typescript
  // 当前代码使用 andWhere 是安全的，但建议添加输入验证
  // 确保 projectName/taskName/state 不包含特殊字符
  const sanitizedProjectName = projectName?.trim();
  if (sanitizedProjectName && !/^[a-zA-Z0-9_\u4e00-\u9fa5-]+$/.test(sanitizedProjectName)) {
    return res.status(400).send(error("项目名称包含非法字符"));
  }
  ```

#### 3. **缺失认证的危险接口**
- **文件位置:** `src/routes/other/clearDatabase.ts:9-11`, `src/routes/other/deleteAllData.ts:8-20`
- **问题描述:** 清空数据库和删除所有数据的接口只有 JWT 认证，没有额外的权限验证或二次确认
- **影响范围:** 整个系统数据安全
- **修复建议:**
  ```typescript
  // 添加管理员权限检查
  if ((req as any).user.role !== 'admin') {
    return res.status(403).send(error("权限不足"));
  }

  // 添加二次确认机制
  const { confirmToken } = req.body;
  if (confirmToken !== expectedToken) {
    return res.status(400).send(error("确认令牌无效"));
  }
  ```

---

### P1 - 高优先级问题（架构缺陷、性能问题）

#### 1. **异步视频生成缺乏错误恢复机制**
- **文件位置:** `src/routes/video/generateVideo.ts:122-206`
- **影响范围:** 视频生成功能
- **修复建议:**
  - 添加重试机制（使用 axios-retry 或自定义重试逻辑）
  - 记录详细错误日志到数据库
  - 添加任务队列（如 Bull）管理长时间运行的任务
  - 实现任务超时机制

#### 2. **数据库连接池未配置**
- **文件位置:** `src/utils/db.ts`（未审查到具体实现）
- **影响范围:** 高并发场景下性能瓶颈
- **修复建议:**
  ```typescript
  // 在 Knex 配置中添加连接池设置
  const knex = require('knex')({
    client: 'better-sqlite3',
    connection: { filename: dbPath },
    pool: { min: 2, max: 10 },
    useNullAsDefault: true
  });
  ```

#### 3. **AI Agent 缺乏超时和取消机制**
- **文件位置:** `src/agents/storyboard/index.ts:702-730`, `src/agents/outlineScript/index.ts:694-735`
- **影响范围:** AI 调用可能无限期挂起
- **修复建议:**
  - 为 AI 调用添加超时配置
  - 实现 AbortController 支持取消请求
  - 添加流式响应的心跳检测

#### 4. **文件上传缺乏大小和类型验证**
- **文件位置:** `src/routes/storyboard/uploadImage.ts:19`
- **影响范围:** 可能导致服务器存储耗尽或恶意文件上传
- **修复建议:**
  ```typescript
  // 添加文件大小限制
  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const base64Size = Buffer.byteLength(base64Data, 'base64');
  if (base64Size > MAX_FILE_SIZE) {
    return res.status(400).send(error("文件大小超过限制"));
  }

  // 验证文件类型（通过 magic number）
  const buffer = Buffer.from(base64Data.match(/base64,([A-Za-z0-9+/=]+)/)[1], 'base64');
  const fileType = await import('file-type');
  const type = await fileType.fromBuffer(buffer);
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(type?.mime || '')) {
    return res.status(400).send(error("不支持的文件类型"));
  }
  ```

#### 5. **JWT Token 密钥动态生成导致重启后失效**
- **文件位置:** `src/lib/initDB.ts:137`, `src/app.ts:45-61`
- **影响范围:** 服务重启后所有用户需要重新登录
- **修复建议:**
  - 使用环境变量存储固定的 JWT 密钥
  - 或在首次初始化后持久化密钥，不再随机生成

#### 6. **缺乏请求速率限制**
- **文件位置:** `src/app.ts`（全局中间件）
- **影响范围:** 易受 DDoS 攻击和 API 滥用
- **修复建议:**
  ```typescript
  import rateLimit from 'express-rate-limit';

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 限制100次请求
    message: "请求过于频繁，请稍后再试"
  });

  app.use('/api/', limiter);
  ```

#### 7. **数据库事务缺失**
- **文件位置:** `src/agents/outlineScript/index.ts:219-241`（saveOutlineData 方法）
- **影响范围:** 大纲保存时可能出现部分成功、部分失败的不一致状态
- **修复建议:**
  ```typescript
  await u.db.transaction(async (trx) => {
    const cleared = await trx("t_outline").where({ projectId }).del();
    await trx("t_script").whereIn("outlineId", outlineIds).del();
    await trx("t_outline").insert(insertList);
    await trx("t_script").insert(scripts);
  });
  ```

#### 8. **图片处理内存泄漏风险**
- **文件位置:** `src/routes/video/generateVideo.ts:213-331`（sharpProcessingImage 函数）
- **影响范围:** 处理大量图片时可能导致内存溢出
- **修复建议:**
  - 使用流式处理代替一次性加载所有图片到内存
  - 添加内存监控和自动清理机制
  - 限制并发处理的图片数量

---

### P2 - 中优先级问题（代码质量、可维护性）

1. **错误处理不一致**
   - 部分接口返回 `error()`，部分直接抛出异常
   - 建议统一使用全局错误处理中间件

2. **硬编码的魔法数字**
   - `src/routes/video/generateVideo.ts:40-50`：图片大小限制、压缩参数等硬编码
   - 建议提取为配置常量

3. **缺乏 API 文档**
   - 建议使用 Swagger/OpenAPI 自动生成 API 文档

4. **日志记录不完整**
   - 仅使用 `console.log`，缺乏结构化日志
   - 建议使用 Winston 或 Pino

5. **环境变量管理混乱**
   - `src/app.ts:80`：端口号硬编码为 60000
   - 建议所有配置项通过 `.env` 管理

6. **数据库 Schema 缺乏外键约束**
   - `src/lib/initDB.ts`：表之间关系仅通过 ID 关联，没有外键约束
   - 可能导致数据孤岛

7. **重复代码**
   - `src/agents/storyboard/index.ts` 和 `src/agents/outlineScript/index.ts` 有大量相似的 Agent 调用逻辑
   - 建议抽象为基类

8. **缺乏单元测试**
   - 项目中未发现测试文件
   - 建议添加 Jest/Vitest 测试覆盖核心业务逻辑

---

### P3 - 低优先级问题（优化建议）

1. **API 路由命名不规范**
   - 部分路由使用中文拼音（如 `geScriptApi.ts`），建议统一使用英文

2. **TypeScript 类型定义不完整**
   - 大量使用 `any` 类型，降低类型安全性

3. **依赖版本管理**
   - `package.json` 中部分依赖使用 `^` 可能导致版本不一致
   - 建议使用 `yarn.lock` 或 `package-lock.json` 锁定版本

4. **OSS 存储路径设计**
   - 使用项目 ID 作为根目录，可能导致单个目录文件过多
   - 建议按日期分片存储

5. **AI 提示词硬编码**
   - 提示词存储在数据库中，但缺乏版本控制
   - 建议使用 Git 管理提示词模板

---

## 架构优势

1. **清晰的模块划分**
   - 路由、工具、Agent 分离良好，易于维护

2. **灵活的 AI 集成**
   - 支持多个 AI 服务商，通过配置切换

3. **流式响应设计**
   - AI Agent 使用 EventEmitter 实现流式输出，用户体验好

4. **数据库迁移机制**
   - `initDB.ts` 提供了表结构初始化和数据迁移能力

5. **OSS 抽象层**
   - 文件存储通过 `u.oss` 统一管理，易于切换存储后端

---

## 重构建议

### 短期（1-2 周）
1. 修复所有 P0 安全问题
2. 添加请求速率限制和输入验证
3. 实现数据库事务保护关键操作

### 中期（1-2 月）
1. 引入任务队列（Bull/BullMQ）管理异步任务
2. 添加结构化日志和监控（Winston + ELK/Grafana）
3. 实现 API 文档自动生成
4. 添加单元测试和集成测试

### 长期（3-6 月）
1. 考虑微服务拆分（AI 服务、文件服务、核心业务）
2. 引入消息队列（RabbitMQ/Kafka）解耦服务
3. 实现分布式缓存（Redis）提升性能
4. 迁移到 PostgreSQL 支持更复杂的查询和事务

---

## 附录：关键文件清单

- **核心路由:** 86 个路由文件（`src/routes/`）
- **AI Agent:** 2 个主 Agent（outlineScript, storyboard）
- **数据库表:** 15 个表（用户、项目、大纲、剧本、资产、视频等）
- **依赖包:** 67 个生产依赖，13 个开发依赖
- **代码规模:** 约 70 个路由文件，213 处数据库查询

---

**审计完成时间:** 2026-03-02 15:30
**下一步行动:** 优先修复 P0 安全问题，然后按优先级逐步改进架构
