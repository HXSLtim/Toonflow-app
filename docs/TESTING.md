# Toonflow 测试体系文档

## 测试框架配置

本项目使用 **Vitest** 作为测试框架，配置文件位于 `vitest.config.ts`。

### 测试覆盖率目标

- 代码行覆盖率：≥ 80%
- 函数覆盖率：≥ 80%
- 分支覆盖率：≥ 80%
- 语句覆盖率：≥ 80%

## 测试目录结构

```
src/__tests__/
├── helpers/          # 测试辅助工具
│   └── setup.ts      # 全局测试配置
├── unit/             # 单元测试
│   ├── agents/       # AI Agent 测试
│   ├── middleware/   # 中间件测试
│   └── utils/        # 工具函数测试
├── integration/      # 集成测试
│   └── api/          # API 集成测试
└── e2e/              # 端到端测试
    └── routes.test.ts
```

## 运行测试

### 基本命令

```bash
# 运行所有测试
yarn test

# 监听模式（开发时使用）
yarn test:watch

# 生成覆盖率报告
yarn test:coverage

# 使用 UI 界面
yarn test:ui
```

## 已实现的测试模块

### 1. 工具函数测试 (Utils)

#### error.ts - 错误处理
- ✅ 标准 Error 对象处理
- ✅ 带 cause 的 Error 处理
- ✅ AxiosError 特殊处理
- ✅ 非 Error 对象处理
- ✅ null/undefined 处理
- ✅ 自定义属性提取

#### number2Chinese.ts - 数字转中文
- ✅ 个位数转换
- ✅ 十位数转换
- ✅ 百位数转换
- ✅ 千位数转换
- ✅ 万位数转换
- ✅ 零的正确处理

#### imageTools.ts - 图片处理
- ✅ 图片压缩到指定大小
- ✅ 不同大小格式支持
- ✅ 多图横向拼接
- ✅ 空列表错误处理
- ✅ 输出大小限制

#### getConfig.ts - 配置获取
- ✅ 文本模型配置获取
- ✅ 图像模型配置获取
- ✅ 配置不存在错误处理
- ✅ 按厂商筛选配置

### 2. 中间件测试 (Middleware)

#### middleware.ts - 参数验证
- ✅ 有效 body 数据验证
- ✅ 无效数据拒绝
- ✅ query 参数验证
- ✅ params 参数验证
- ✅ 缺失必填字段处理
- ✅ 复杂验证规则

### 3. AI Agent 测试

#### Storyboard Agent
- ✅ 实例初始化
- ✅ 事件系统
- ✅ 片段管理（增删改查）
- ✅ 分镜管理（增删改查）
- ✅ 数据访问器

### 4. API 集成测试

- ✅ 认证测试（token 验证）
- ✅ 404 处理
- ⏳ 项目路由测试（待完善）
- ⏳ 用户路由测试（待完善）

## 测试策略

### 单元测试
- 测试独立的函数和类
- 使用 mock 隔离外部依赖
- 覆盖边界情况和异常处理

### 集成测试
- 测试多个模块协作
- 测试数据库交互
- 测试 API 端点

### E2E 测试
- 测试完整的用户流程
- 测试真实的 HTTP 请求
- 测试错误处理和边界情况

## Mock 策略

### 数据库 Mock
```typescript
vi.mock('@/utils', () => ({
  default: {
    db: vi.fn(),
  },
}));
```

### AI 服务 Mock
```typescript
vi.mock('@/utils', () => ({
  default: {
    ai: {
      text: { stream: vi.fn() },
    },
  },
}));
```

## 待完善的测试

### 高优先级
1. ⏳ Routes 完整测试（所有 API 端点）
2. ⏳ AI 工具函数测试（text/image/video）
3. ⏳ 数据库操作测试
4. ⏳ OSS 文件操作测试

### 中优先级
1. ⏳ 认证中间件测试
2. ⏳ 错误处理中间件测试
3. ⏳ WebSocket 测试
4. ⏳ 文件上传测试

### 低优先级
1. ⏳ 性能测试
2. ⏳ 压力测试
3. ⏳ 安全测试

## 测试最佳实践

1. **测试命名**：使用描述性的测试名称，清楚说明测试内容
2. **AAA 模式**：Arrange（准备）、Act（执行）、Assert（断言）
3. **独立性**：每个测试应该独立运行，不依赖其他测试
4. **清理**：使用 `beforeEach`/`afterEach` 清理测试状态
5. **Mock 最小化**：只 mock 必要的外部依赖
6. **边界测试**：测试边界条件和异常情况

## 持续集成

测试将在以下情况自动运行：
- Git push 到远程仓库
- Pull Request 创建或更新
- 定时任务（每日构建）

## 覆盖率报告

运行 `yarn test:coverage` 后，覆盖率报告将生成在：
- 终端输出：文本格式
- `coverage/index.html`：HTML 可视化报告
- `coverage/lcov.info`：LCOV 格式（用于 CI）

## 问题排查

### 测试超时
- 增加 `testTimeout` 配置
- 检查异步操作是否正确处理

### Mock 不生效
- 确保 mock 在导入模块之前
- 检查 mock 路径是否正确

### 数据库测试失败
- 确保测试数据库已初始化
- 检查测试数据是否正确清理
