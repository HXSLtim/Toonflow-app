# 日志系统使用指南

## 概述

Toonflow 使用结构化日志系统，支持日志分级、自动轮转、上下文追踪等功能。

## 日志级别

- **error**: 错误（需要立即处理）
- **warn**: 警告（需要关注）
- **info**: 信息（正常业务流程）
- **http**: HTTP 请求
- **debug**: 调试信息

## 使用方法

### 基础使用

```typescript
import logger from "@/logging/logger";

// 记录信息
logger.info("用户创建项目", { projectId: "123", projectName: "测试项目" });

// 记录警告
logger.warn("AI 调用超时", { model: "gpt-4", duration: 5000 });

// 记录错误
logger.error("数据库连接失败", error, { database: "sqlite" });

// 记录 HTTP 请求（通常由中间件自动处理）
logger.http("GET /api/project", { statusCode: 200, duration: 125 });

// 记录调试信息
logger.debug("缓存命中", { key: "user:123", ttl: 3600 });
```

### 设置上下文

```typescript
// 设置请求上下文（通常由中间件自动处理）
logger.setContext({
  requestId: "req-123",
  userId: "user-456",
  route: "/api/project/add",
  method: "POST",
});

// 记录日志（会自动包含上下文）
logger.info("创建项目成功");

// 清除上下文
logger.clearContext();
```

## 日志格式

所有日志以 JSON 格式存储：

```json
{
  "timestamp": "2026-03-03T10:00:00.000Z",
  "level": "info",
  "message": "用户创建项目",
  "requestId": "req-123",
  "userId": "user-456",
  "route": "/api/project/add",
  "method": "POST",
  "statusCode": 200,
  "duration": 125,
  "metadata": {
    "projectId": "proj-789",
    "projectName": "测试项目"
  }
}
```

## 日志文件

### 文件命名规则

- `YYYY-MM-DD-error.log`: 错误日志（包含 error 和 warn）
- `YYYY-MM-DD-warn.log`: 警告日志
- `YYYY-MM-DD-info.log`: 信息日志
- `YYYY-MM-DD-http.log`: HTTP 请求日志
- `YYYY-MM-DD-debug.log`: 调试日志

### 日志轮转

- **按大小轮转**: 单文件超过 100MB 时自动轮转
- **按日期轮转**: 每天生成新的日志文件
- **自动归档**: 轮转后的文件会添加时间戳后缀
- **自动清理**: 保留最近 30 天的日志，自动删除过期日志

### 日志位置

- **开发环境**: `项目根目录/logs/`
- **生产环境**: `项目根目录/logs/`
- **Electron 环境**: `userData/logs/`

## 环境变量配置

```bash
# 日志级别（error/warn/info/http/debug）
LOG_LEVEL=info

# 告警开关
ALERT_ENABLED=true

# 告警 Webhook URL
ALERT_WEBHOOK_URL=https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=xxx

# 告警邮箱
ALERT_EMAIL=admin@example.com
```

## 最佳实践

### 1. 选择合适的日志级别

```typescript
// ✅ 正确
logger.error("数据库连接失败", error); // 需要立即处理的错误
logger.warn("AI 调用超时，使用降级策略"); // 需要关注但不影响主流程
logger.info("用户登录成功"); // 正常业务流程
logger.debug("缓存查询", { key, value }); // 调试信息

// ❌ 错误
logger.error("用户登录成功"); // 不应该用 error 记录正常流程
logger.info("数据库连接失败"); // 错误应该用 error 级别
```

### 2. 提供有用的上下文

```typescript
// ✅ 正确
logger.error("AI 调用失败", error, {
  model: "gpt-4",
  provider: "openai",
  requestId: "req-123",
  retryCount: 3,
});

// ❌ 错误
logger.error("失败"); // 缺少上下文信息
```

### 3. 避免记录敏感信息

```typescript
// ✅ 正确
logger.info("用户登录", { userId: user.id, email: maskEmail(user.email) });

// ❌ 错误
logger.info("用户登录", { password: user.password, apiKey: user.apiKey });
```

### 4. 使用结构化数据

```typescript
// ✅ 正确
logger.info("项目创建成功", {
  projectId: project.id,
  projectName: project.name,
  userId: user.id,
});

// ❌ 错误
logger.info(`项目创建成功: ${project.id}, ${project.name}, ${user.id}`);
```

## 日志查询

### 查看实时日志

```bash
# 查看今天的错误日志
tail -f logs/$(date +%Y-%m-%d)-error.log

# 查看今天的 HTTP 请求日志
tail -f logs/$(date +%Y-%m-%d)-http.log
```

### 搜索日志

```bash
# 搜索特定 requestId 的日志
grep "req-123" logs/*.log

# 搜索特定用户的日志
grep "user-456" logs/*.log

# 搜索错误日志中的特定关键词
grep "数据库" logs/*-error.log
```

### 分析日志

```bash
# 统计今天的错误数量
grep -c '"level":"error"' logs/$(date +%Y-%m-%d)-error.log

# 统计 API 响应时间分布
jq -r '.duration' logs/$(date +%Y-%m-%d)-http.log | sort -n | uniq -c

# 统计最慢的 10 个请求
jq -r '"\(.duration) \(.route)"' logs/$(date +%Y-%m-%d)-http.log | sort -rn | head -10
```

## 故障排查

### 日志文件过大

如果日志文件增长过快：

1. 检查是否有大量错误日志
2. 调整日志级别（生产环境建议使用 `info`）
3. 减少 debug 日志的输出
4. 检查是否有日志循环

### 日志丢失

如果发现日志丢失：

1. 检查磁盘空间是否充足
2. 检查日志目录权限
3. 检查日志轮转配置
4. 查看应用错误日志

### 性能问题

如果日志影响性能：

1. 调高日志级别（减少日志量）
2. 使用异步日志写入
3. 避免在高频路径记录 debug 日志
4. 考虑使用日志采样
