# 错误处理规范

## 概述

Toonflow 使用统一的错误处理机制，确保错误信息的一致性和可追踪性。

## 错误分类

### 客户端错误 (4xx)

- **400 BAD_REQUEST**: 请求参数错误
- **401 UNAUTHORIZED**: 未授权（token 无效或过期）
- **403 FORBIDDEN**: 禁止访问（权限不足）
- **404 NOT_FOUND**: 资源不存在
- **422 VALIDATION_ERROR**: 参数验证失败

### 服务端错误 (5xx)

- **500 INTERNAL_ERROR**: 服务器内部错误
- **501 DATABASE_ERROR**: 数据库错误
- **502 AI_SERVICE_ERROR**: AI 服务错误
- **503 EXTERNAL_API_ERROR**: 外部 API 错误

## 使用方法

### 抛出错误

```typescript
import { AppError, ErrorCode } from "@/types/monitoring";

// 参数验证错误
if (!projectName) {
  throw new AppError(ErrorCode.VALIDATION_ERROR, "项目名称不能为空", ["字段 projectName 是必填项"]);
}

// 资源不存在
const project = await db("t_project").where("id", projectId).first();
if (!project) {
  throw new AppError(ErrorCode.NOT_FOUND, "项目不存在");
}

// 权限不足
if (project.userId !== currentUserId) {
  throw new AppError(ErrorCode.FORBIDDEN, "无权访问此项目");
}

// 数据库错误
try {
  await db("t_project").insert(data);
} catch (error) {
  throw new AppError(ErrorCode.DATABASE_ERROR, "创建项目失败", [error.message]);
}

// AI 服务错误
try {
  const result = await generateText({ model, prompt });
} catch (error) {
  throw new AppError(ErrorCode.AI_SERVICE_ERROR, "AI 生成失败", [error.message]);
}
```

### 错误响应格式

所有错误响应遵循统一格式：

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "参数验证失败",
    "details": ["字段 projectName 不能为空"],
    "requestId": "req-123",
    "timestamp": "2026-03-03T10:00:00.000Z"
  }
}
```

### 在路由中使用

```typescript
import { Request, Response, NextFunction } from "express";
import { AppError, ErrorCode } from "@/types/monitoring";

export default async function addProject(req: Request, res: Response, next: NextFunction) {
  try {
    const { projectName, description } = req.body;

    // 参数验证
    if (!projectName) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, "项目名称不能为空");
    }

    // 业务逻辑
    const project = await db("t_project").insert({
      name: projectName,
      description,
      userId: (req as any).user.id,
    });

    res.json({
      success: true,
      data: project,
    });
  } catch (error) {
    // 传递给错误处理中间件
    next(error);
  }
}
```

## 错误处理中间件

错误处理中间件会自动：

1. 记录错误日志
2. 构建统一的错误响应
3. 设置正确的 HTTP 状态码
4. 在开发环境返回堆栈信息

```typescript
// 在 app.ts 中注册
import { errorHandler, notFoundHandler } from "@/middleware/errorHandler";

// 404 处理（放在所有路由之后）
app.use(notFoundHandler);

// 错误处理（放在最后）
app.use(errorHandler);
```

## 最佳实践

### 1. 使用合适的错误码

```typescript
// ✅ 正确
throw new AppError(ErrorCode.VALIDATION_ERROR, "参数验证失败");
throw new AppError(ErrorCode.NOT_FOUND, "项目不存在");
throw new AppError(ErrorCode.DATABASE_ERROR, "数据库操作失败");

// ❌ 错误
throw new Error("参数验证失败"); // 不会被正确处理
throw new AppError(ErrorCode.INTERNAL_ERROR, "项目不存在"); // 错误码不匹配
```

### 2. 提供详细的错误信息

```typescript
// ✅ 正确
throw new AppError(ErrorCode.VALIDATION_ERROR, "参数验证失败", [
  "字段 projectName 不能为空",
  "字段 description 长度不能超过 500 字符",
]);

// ❌ 错误
throw new AppError(ErrorCode.VALIDATION_ERROR, "错误"); // 信息不明确
```

### 3. 区分操作性错误和编程错误

```typescript
// 操作性错误（可预期，应该抛出 AppError）
if (!user) {
  throw new AppError(ErrorCode.NOT_FOUND, "用户不存在");
}

// 编程错误（不可预期，让其自然抛出）
const result = someFunction(); // 如果这里有 bug，会抛出原生 Error
```

### 4. 在异步函数中正确处理错误

```typescript
// ✅ 正确
export default async function handler(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await someAsyncOperation();
    res.json({ success: true, data: result });
  } catch (error) {
    next(error); // 传递给错误处理中间件
  }
}

// ❌ 错误
export default async function handler(req: Request, res: Response) {
  const result = await someAsyncOperation(); // 未捕获错误
  res.json({ success: true, data: result });
}
```

### 5. 避免暴露敏感信息

```typescript
// ✅ 正确
throw new AppError(ErrorCode.DATABASE_ERROR, "数据库操作失败");

// ❌ 错误
throw new AppError(ErrorCode.DATABASE_ERROR, `SQL 错误: ${error.message}`); // 可能暴露数据库结构
```

## 错误日志

所有错误会自动记录到日志系统：

```json
{
  "timestamp": "2026-03-03T10:00:00.000Z",
  "level": "error",
  "message": "参数验证失败",
  "requestId": "req-123",
  "userId": "user-456",
  "route": "/api/project/add",
  "method": "POST",
  "metadata": {
    "details": ["字段 projectName 不能为空"]
  },
  "stack": "Error: 参数验证失败\n    at ..."
}
```

## 常见错误场景

### 参数验证

```typescript
import { z } from "zod";
import { AppError, ErrorCode } from "@/types/monitoring";

const schema = z.object({
  projectName: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

const result = schema.safeParse(req.body);
if (!result.success) {
  const errors = result.error.issues.map((issue) => `字段 ${issue.path.join(".")} ${issue.message}`);
  throw new AppError(ErrorCode.VALIDATION_ERROR, "参数验证失败", errors);
}
```

### 数据库操作

```typescript
try {
  const project = await db("t_project").where("id", projectId).first();
  if (!project) {
    throw new AppError(ErrorCode.NOT_FOUND, "项目不存在");
  }
  return project;
} catch (error) {
  if (error instanceof AppError) throw error;
  throw new AppError(ErrorCode.DATABASE_ERROR, "数据库查询失败", [error.message]);
}
```

### AI 调用

```typescript
try {
  const result = await generateText({
    model: openai("gpt-4"),
    prompt: "生成剧本",
  });
  return result.text;
} catch (error) {
  throw new AppError(ErrorCode.AI_SERVICE_ERROR, "AI 生成失败", [error.message]);
}
```

### 外部 API 调用

```typescript
try {
  const response = await axios.post("https://api.example.com/generate", data);
  return response.data;
} catch (error) {
  if (error.response) {
    throw new AppError(ErrorCode.EXTERNAL_API_ERROR, "外部 API 调用失败", [
      `状态码: ${error.response.status}`,
      `错误信息: ${error.response.data.message}`,
    ]);
  }
  throw new AppError(ErrorCode.EXTERNAL_API_ERROR, "外部 API 调用失败", [error.message]);
}
```

## 测试错误处理

```typescript
import request from "supertest";
import app from "@/app";

describe("错误处理", () => {
  it("应该返回 404 错误", async () => {
    const response = await request(app).get("/api/not-exist");

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("NOT_FOUND");
  });

  it("应该返回参数验证错误", async () => {
    const response = await request(app).post("/api/project/add").send({});

    expect(response.status).toBe(422);
    expect(response.body.success).toBe(false);
    expect(response.body.error.code).toBe("VALIDATION_ERROR");
  });
});
```
