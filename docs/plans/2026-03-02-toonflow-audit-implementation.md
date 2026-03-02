# Toonflow 项目全面审计实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 对 Toonflow 项目进行全面审计，识别用户体验、功能完整性、代码质量方面的问题，并立即修复高优先级问题

**Architecture:** 使用 4 个专业分工的 Agent 并行审计不同领域（前端体验、后端架构、质量保障、性能优化），每个 Agent 独立生成报告，最后汇总成统一的审计报告和修复计划

**Tech Stack:** Claude Code Agent 系统、TeamCreate/TaskCreate 工具、Markdown 报告、Git 版本控制

---

## Task 1: 创建审计团队和任务列表

**Files:**
- Create: `~/.claude/teams/toonflow-audit/config.json` (自动创建)
- Create: `~/.claude/tasks/toonflow-audit/` (自动创建)

**Step 1: 创建审计团队**

使用 TeamCreate 工具创建团队：

```typescript
{
  team_name: "toonflow-audit",
  description: "Toonflow 项目全面审计团队",
  agent_type: "audit-coordinator"
}
```

**Step 2: 为 4 个专家创建审计任务**

使用 TaskCreate 为每个专家创建独立任务：

```typescript
// 任务 1: 前端体验审计
{
  subject: "前端体验审计",
  description: "检查 Electron 客户端、Web 界面、用户流程、交互体验、错误提示",
  activeForm: "审计前端体验中"
}

// 任务 2: 后端架构审计
{
  subject: "后端架构审计",
  description: "审查 API 设计、数据库结构、AI Agent 实现、中间件、认证机制",
  activeForm: "审计后端架构中"
}

// 任务 3: 质量保障审计
{
  subject: "质量保障审计",
  description: "测试核心功能、边界情况、错误处理、并发场景、数据一致性",
  activeForm: "审计质量保障中"
}

// 任务 4: 性能优化审计
{
  subject: "性能优化审计",
  description: "分析 AI 调用性能、资源使用、数据库查询、内存管理、并发处理",
  activeForm: "审计性能优化中"
}
```

**Step 3: 验证团队和任务创建成功**

运行: `TaskList` 工具查看任务列表
预期: 显示 4 个待分配的审计任务

---

## Task 2: 派遣前端体验专家

**Files:**
- Create: `docs/audit-reports/frontend-ux-report.md`

**Step 1: 使用 Agent 工具派遣前端体验专家**

```typescript
{
  subagent_type: "general-purpose",
  team_name: "toonflow-audit",
  name: "frontend-ux-specialist",
  description: "审计前端体验",
  prompt: `你是前端体验专家，负责审计 Toonflow 项目的用户体验。

**审计范围：**
1. Electron 客户端启动流程和配置 (scripts/main.ts)
2. Web 界面交互体验 (scripts/web/)
3. 用户操作流程完整性
4. 界面响应性和错误提示
5. 视觉一致性和可用性

**检查清单：**
- [ ] Electron 启动流程和首次使用体验
- [ ] 登录界面和认证流程
- [ ] 小说导入界面和文件上传
- [ ] 角色生成界面和结果展示
- [ ] 剧本生成界面和编辑功能
- [ ] 分镜制作界面和图片预览
- [ ] 视频合成界面和进度显示
- [ ] 设置界面和 AI 模型配置
- [ ] 错误提示和加载状态
- [ ] 响应式布局和跨平台兼容性

**工作步骤：**
1. 使用 TaskUpdate 认领任务 "前端体验审计"，设置 owner 为你的名字，status 为 in_progress
2. 阅读 scripts/main.ts 了解 Electron 启动流程
3. 检查 scripts/web/ 目录下的前端资源
4. 审查用户流程的完整性和错误处理
5. 识别用户体验问题，按 P0/P1/P2/P3 分类
6. 生成报告保存到 docs/audit-reports/frontend-ux-report.md
7. 使用 TaskUpdate 标记任务为 completed
8. 使用 SendMessage 向团队负责人报告完成情况

**报告格式：**
# 前端体验审计报告

## 执行摘要
[2-3 句话总结主要发现]

## 发现的问题

### P0 - 严重问题（阻塞用户使用）
1. [问题描述]
   - 影响范围: [哪些用户/场景受影响]
   - 复现步骤: [如何复现]
   - 修复建议: [具体的修复方案]

### P1 - 高优先级问题（严重影响体验）
...

### P2 - 中优先级问题（影响体验但有变通方案）
...

### P3 - 低优先级问题（优化建议）
...

## 优秀实践
[值得保持的好的设计]

## 改进建议
[长期优化方向]
`,
  run_in_background: false
}
```

**Step 2: 等待前端体验专家完成审计**

预期: 专家会自动完成审计并生成报告

---

## Task 3: 派遣后端架构师

**Files:**
- Create: `docs/audit-reports/backend-architecture-report.md`

**Step 1: 使用 Agent 工具派遣后端架构师**

```typescript
{
  subagent_type: "general-purpose",
  team_name: "toonflow-audit",
  name: "backend-architect",
  description: "审计后端架构",
  prompt: `你是后端架构师，负责审计 Toonflow 项目的后端架构和代码质量。

**审计范围：**
1. Express API 设计和路由结构 (src/routes/)
2. SQLite 数据库设计和数据一致性 (src/lib/initDB.ts)
3. AI Agent 实现 (src/agents/)
4. 中间件、认证、文件处理 (src/middleware/, src/app.ts)

**检查清单：**
- [ ] API 路由设计和 RESTful 规范
- [ ] 数据库 schema 设计和关系
- [ ] JWT 认证和权限控制
- [ ] 文件上传和 OSS 存储
- [ ] AI Agent 实现和工具调用
- [ ] 分镜生成逻辑和图片分割
- [ ] 视频生成任务管理
- [ ] 错误处理和日志记录
- [ ] 环境变量和配置管理
- [ ] 代码结构和模块划分

**工作步骤：**
1. 使用 TaskUpdate 认领任务 "后端架构审计"，设置 owner 为你的名字，status 为 in_progress
2. 使用 Glob 和 Read 工具审查 src/routes/ 下的所有路由
3. 阅读 src/lib/initDB.ts 了解数据库结构
4. 审查 src/agents/ 下的 AI Agent 实现
5. 检查 src/app.ts 中的中间件和认证逻辑
6. 识别架构问题和代码质量问题，按 P0/P1/P2/P3 分类
7. 生成报告保存到 docs/audit-reports/backend-architecture-report.md
8. 使用 TaskUpdate 标记任务为 completed
9. 使用 SendMessage 向团队负责人报告完成情况

**报告格式：**
# 后端架构审计报告

## 执行摘要
[2-3 句话总结主要发现]

## 发现的问题

### P0 - 严重问题（安全漏洞、数据丢失风险）
1. [问题描述]
   - 文件位置: [src/path/file.ts:123-145]
   - 影响范围: [哪些功能受影响]
   - 修复建议: [具体的代码修复方案]

### P1 - 高优先级问题（架构缺陷、性能问题）
...

### P2 - 中优先级问题（代码质量、可维护性）
...

### P3 - 低优先级问题（优化建议）
...

## 架构优势
[值得保持的好的设计]

## 重构建议
[长期架构改进方向]
`,
  run_in_background: false
}
```

**Step 2: 等待后端架构师完成审计**

预期: 专家会自动完成审计并生成报告

---

## Task 4: 派遣质量保障工程师

**Files:**
- Create: `docs/audit-reports/qa-testing-report.md`

**Step 1: 使用 Agent 工具派遣质量保障工程师**

```typescript
{
  subagent_type: "general-purpose",
  team_name: "toonflow-audit",
  name: "qa-engineer",
  description: "审计质量保障",
  prompt: `你是质量保障工程师，负责测试 Toonflow 项目的功能完整性和错误处理。

**审计范围：**
1. 核心功能流程测试
2. 边界情况和异常处理
3. API 接口输入验证
4. 并发场景和数据竞争

**检查清单：**
- [ ] 小说解析和角色提取准确性
- [ ] 剧本生成的完整性和格式
- [ ] 分镜生成的逻辑正确性
- [ ] 图片生成和分割的准确性
- [ ] 视频生成任务的状态流转
- [ ] 并发请求的数据一致性
- [ ] 错误恢复机制（AI 失败、网络中断）
- [ ] 边界情况处理（空数据、超大文件）
- [ ] API 输入验证和错误响应
- [ ] 数据库事务和回滚

**工作步骤：**
1. 使用 TaskUpdate 认领任务 "质量保障审计"，设置 owner 为你的名字，status 为 in_progress
2. 审查核心功能的实现代码，识别潜在的边界情况
3. 检查错误处理逻辑是否完整
4. 分析并发场景下的数据一致性问题
5. 识别功能缺陷和测试覆盖不足的地方，按 P0/P1/P2/P3 分类
6. 生成报告保存到 docs/audit-reports/qa-testing-report.md
7. 使用 TaskUpdate 标记任务为 completed
8. 使用 SendMessage 向团队负责人报告完成情况

**报告格式：**
# 质量保障审计报告

## 执行摘要
[2-3 句话总结主要发现]

## 发现的问题

### P0 - 严重问题（功能不可用、数据损坏）
1. [问题描述]
   - 测试场景: [如何复现]
   - 预期行为: [应该怎样]
   - 实际行为: [实际怎样]
   - 修复建议: [具体的修复方案]

### P1 - 高优先级问题（功能缺陷、错误处理不当）
...

### P2 - 中优先级问题（边界情况未处理）
...

### P3 - 低优先级问题（测试覆盖不足）
...

## 测试覆盖分析
[哪些功能有测试，哪些缺失]

## 改进建议
[如何提升测试质量]
`,
  run_in_background: false
}
```

**Step 2: 等待质量保障工程师完成审计**

预期: 专家会自动完成审计并生成报告

---

## Task 5: 派遣性能优化专家

**Files:**
- Create: `docs/audit-reports/performance-optimization-report.md`

**Step 1: 使用 Agent 工具派遣性能优化专家**

```typescript
{
  subagent_type: "general-purpose",
  team_name: "toonflow-audit",
  name: "performance-specialist",
  description: "审计性能优化",
  prompt: `你是性能优化专家，负责分析 Toonflow 项目的性能瓶颈和资源使用。

**审计范围：**
1. AI 调用性能分析
2. 图片/视频生成资源使用
3. 数据库查询效率
4. 并发处理和内存管理

**检查清单：**
- [ ] AI SDK 调用的性能和超时
- [ ] 图片生成的内存占用
- [ ] 图片分割的效率
- [ ] 数据库查询的性能
- [ ] 文件上传的流式处理
- [ ] Electron 进程的内存管理
- [ ] 长时间运行的稳定性
- [ ] 并发处理的资源竞争
- [ ] 缓存策略和优化
- [ ] 日志记录的性能影响

**工作步骤：**
1. 使用 TaskUpdate 认领任务 "性能优化审计"，设置 owner 为你的名字，status 为 in_progress
2. 审查 AI 调用代码（src/agents/, src/routes/）识别性能瓶颈
3. 检查图片处理代码（src/agents/storyboard/imageSplitting.ts）的内存使用
4. 分析数据库查询（src/lib/initDB.ts, src/routes/）是否有 N+1 问题
5. 识别性能问题和优化机会，按 P0/P1/P2/P3 分类
6. 生成报告保存到 docs/audit-reports/performance-optimization-report.md
7. 使用 TaskUpdate 标记任务为 completed
8. 使用 SendMessage 向团队负责人报告完成情况

**报告格式：**
# 性能优化审计报告

## 执行摘要
[2-3 句话总结主要发现]

## 发现的问题

### P0 - 严重问题（性能崩溃、内存泄漏）
1. [问题描述]
   - 文件位置: [src/path/file.ts:123-145]
   - 性能影响: [响应时间、内存占用等]
   - 修复建议: [具体的优化方案]

### P1 - 高优先级问题（明显的性能瓶颈）
...

### P2 - 中优先级问题（可优化的地方）
...

### P3 - 低优先级问题（微优化）
...

## 性能基准
[当前的性能指标]

## 优化建议
[长期性能改进方向]
`,
  run_in_background: false
}
```

**Step 2: 等待性能优化专家完成审计**

预期: 专家会自动完成审计并生成报告

---

## Task 6: 汇总审计报告

**Files:**
- Read: `docs/audit-reports/frontend-ux-report.md`
- Read: `docs/audit-reports/backend-architecture-report.md`
- Read: `docs/audit-reports/qa-testing-report.md`
- Read: `docs/audit-reports/performance-optimization-report.md`
- Create: `docs/audit-report-2026-03-02.md`

**Step 1: 读取所有专家报告**

使用 Read 工具读取 4 个专家的报告

**Step 2: 汇总问题并分类**

将所有问题按优先级重新分类：
- P0: 严重问题（阻塞用户、安全漏洞、数据丢失）
- P1: 高优先级（严重影响体验、功能缺陷、性能瓶颈）
- P2: 中优先级（影响体验但有变通、代码质量）
- P3: 低优先级（优化建议、微优化）

**Step 3: 识别跨领域的系统性问题**

分析是否有多个专家都发现的共同问题，这些通常是系统性问题

**Step 4: 生成统一的审计报告**

```markdown
# Toonflow 项目审计报告

**日期:** 2026-03-02
**审计团队:** 前端体验专家、后端架构师、质量保障工程师、性能优化专家
**审计范围:** 用户体验、功能完整性、代码质量、性能优化

---

## 执行摘要

[3-5 段总结主要发现和建议]

---

## 问题清单

### P0 - 严重问题（共 X 个）

#### 1. [问题标题]
- **类型:** [前端/后端/质量/性能]
- **发现者:** [专家名称]
- **描述:** [详细描述]
- **影响范围:** [哪些功能/用户受影响]
- **修复建议:** [具体方案]
- **预计工时:** [X 小时]

### P1 - 高优先级问题（共 X 个）
...

### P2 - 中优先级问题（共 X 个）
...

### P3 - 低优先级问题（共 X 个）
...

---

## 系统性问题

[跨领域的共同问题]

---

## 优化路线图

### 立即修复（今天）
- [ ] P0 问题 1
- [ ] P0 问题 2
- [ ] P1 问题 1

### 短期修复（本周）
- [ ] P1 问题 2-5
- [ ] P2 问题 1-3

### 中期优化（本月）
- [ ] P2 问题 4-10
- [ ] 架构重构

### 长期改进（季度）
- [ ] P3 问题
- [ ] 技术债务清理

---

## 附录

- [前端体验审计报告](./audit-reports/frontend-ux-report.md)
- [后端架构审计报告](./audit-reports/backend-architecture-report.md)
- [质量保障审计报告](./audit-reports/qa-testing-report.md)
- [性能优化审计报告](./audit-reports/performance-optimization-report.md)
```

**Step 5: 保存审计报告**

使用 Write 工具保存到 `docs/audit-report-2026-03-02.md`

**Step 6: 提交审计报告**

```bash
git add docs/audit-report-2026-03-02.md docs/audit-reports/
git commit -m "Add comprehensive audit report for Toonflow project

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 7: 生成修复计划

**Files:**
- Read: `docs/audit-report-2026-03-02.md`
- Create: `docs/plans/2026-03-02-toonflow-fixes-plan.md`

**Step 1: 读取审计报告**

使用 Read 工具读取汇总的审计报告

**Step 2: 为 P0 和 P1 问题生成修复计划**

为每个高优先级问题创建详细的修复步骤：

```markdown
# Toonflow 高优先级问题修复计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 修复 Toonflow 项目审计中发现的 P0 和 P1 问题

**Architecture:** 按优先级和依赖关系顺序修复问题，每个修复包含测试验证

**Tech Stack:** TypeScript, Express, SQLite, AI SDK, Electron

---

## Task 1: 修复 [P0 问题 1 标题]

**Files:**
- Modify: `src/path/file.ts:123-145`
- Test: [如何验证修复]

**Step 1: 理解问题**

[问题的详细描述和根本原因]

**Step 2: 实现修复**

```typescript
// 修复前的代码
[原代码]

// 修复后的代码
[新代码]
```

**Step 3: 验证修复**

运行: [测试命令或手动测试步骤]
预期: [修复后的预期行为]

**Step 4: 提交修复**

```bash
git add src/path/file.ts
git commit -m "fix: [问题描述]

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 2: 修复 [P0 问题 2 标题]
...

## Task 3: 修复 [P1 问题 1 标题]
...
```

**Step 3: 保存修复计划**

使用 Write 工具保存到 `docs/plans/2026-03-02-toonflow-fixes-plan.md`

**Step 4: 提交修复计划**

```bash
git add docs/plans/2026-03-02-toonflow-fixes-plan.md
git commit -m "Add fix plan for high-priority issues

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Task 8: 执行修复计划

**Step 1: 调用 executing-plans 技能**

使用 `superpowers:executing-plans` 技能执行修复计划

**Step 2: 逐个修复 P0 和 P1 问题**

按照修复计划中的顺序，逐个修复问题并验证

**Step 3: 生成修复验证报告**

记录每个问题的修复状态和验证结果

---

## Task 9: 清理团队资源

**Step 1: 关闭所有专家 Agent**

使用 SendMessage 工具向每个专家发送 shutdown_request

**Step 2: 删除团队**

使用 TeamDelete 工具删除审计团队

**Step 3: 验证清理完成**

确认团队目录和任务目录已清理

---

## 执行顺序

1. Task 1: 创建审计团队和任务列表
2. Task 2-5: 并行派遣 4 个专家（可同时执行）
3. Task 6: 汇总审计报告（等待 Task 2-5 完成）
4. Task 7: 生成修复计划（等待 Task 6 完成）
5. Task 8: 执行修复计划（等待 Task 7 完成）
6. Task 9: 清理团队资源（等待 Task 8 完成）

---

## 预计时间

- Task 1: 5 分钟
- Task 2-5: 3-4 小时（并行）
- Task 6: 1 小时
- Task 7: 1 小时
- Task 8: 2-3 小时
- Task 9: 5 分钟

**总计:** 7-9 小时
