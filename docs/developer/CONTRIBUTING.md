# Toonflow 贡献指南

感谢你对 Toonflow 项目的关注！我们欢迎所有形式的贡献。

## 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)
- [问题反馈](#问题反馈)

## 行为准则

参与本项目即表示你同意遵守以下准则：

- 尊重所有贡献者
- 使用友好和包容的语言
- 接受建设性的批评
- 关注对社区最有利的事情
- 对其他社区成员表示同理心

## 如何贡献

你可以通过以下方式为项目做出贡献：

### 1. 报告 Bug

发现 Bug？请通过 [GitHub Issues](https://github.com/HBAI-Ltd/Toonflow-app/issues) 报告。

**提交 Bug 报告时请包含**：
- 清晰的标题和描述
- 复现步骤
- 预期行为和实际行为
- 截图或错误日志
- 系统环境信息

### 2. 提出新功能

有好的想法？欢迎提出！

**提交功能请求时请包含**：
- 功能描述
- 使用场景
- 预期效果
- 可能的实现方案

### 3. 改进文档

文档永远可以更好！你可以：
- 修正错别字
- 改进表述
- 添加示例
- 翻译文档

### 4. 贡献代码

最直接的贡献方式！请遵循下面的开发流程。

## 开发流程

### 1. Fork 项目

点击 GitHub 页面右上角的 "Fork" 按钮。

### 2. 克隆仓库

```bash
# 克隆你的 Fork
git clone https://github.com/YOUR_USERNAME/Toonflow-app.git
cd Toonflow-app

# 添加上游仓库
git remote add upstream https://github.com/HBAI-Ltd/Toonflow-app.git
```

### 3. 创建分支

⚠️ **重要**：请基于 `develop` 分支创建你的功能分支，不要基于 `master`！

```bash
# 切换到 develop 分支
git checkout develop

# 拉取最新代码
git pull upstream develop

# 创建功能分支
git checkout -b feature/your-feature-name
```

**分支命名规范**：
- `feature/xxx` - 新功能
- `fix/xxx` - Bug 修复
- `docs/xxx` - 文档更新
- `refactor/xxx` - 代码重构
- `test/xxx` - 测试相关
- `chore/xxx` - 构建/工具相关

### 4. 安装依赖

```bash
# 安装工作区依赖
npm install
```

### 5. 开发

```bash
# 启动后端 API
npm run dev:api

# 启动前端开发服务
npm run dev:web
```

### 6. 测试

```bash
# 运行类型检查
npm run lint

# 构建测试
npm run build

# 运行构建产物
npm run test
```

### 7. 提交代码

```bash
# 添加修改的文件
git add .

# 提交（遵循提交规范）
git commit -m "feat: add new feature"

# 推送到你的 Fork
git push origin feature/your-feature-name
```

### 8. 创建 Pull Request

1. 访问你的 Fork 页面
2. 点击 "Pull Request" 按钮
3. **确保目标分支是 `develop`，不是 `master`**
4. 填写 PR 描述
5. 提交 PR

## 代码规范

### TypeScript 规范

```typescript
// ✅ 好的示例
interface User {
  id: number;
  name: string;
  email: string;
}

export const getUser = async (id: number): Promise<User> => {
  const user = await db.prepare('SELECT * FROM t_user WHERE id = ?').get(id);
  return user as User;
};

// ❌ 不好的示例
export const getUser = async (id) => {
  const user = await db.prepare('SELECT * FROM t_user WHERE id = ?').get(id);
  return user;
};
```

### 命名规范

**变量和函数**：使用 camelCase
```typescript
const userName = 'John';
const getUserById = (id: number) => { };
```

**类和接口**：使用 PascalCase
```typescript
class UserService { }
interface UserData { }
```

**常量**：使用 UPPER_SNAKE_CASE
```typescript
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
```

**文件名**：使用 camelCase
```typescript
// ✅ 好的
getUserById.ts
projectService.ts

// ❌ 不好的
get-user-by-id.ts
ProjectService.ts
```

### 代码风格

**使用 async/await 而不是 Promise 链**：
```typescript
// ✅ 好的
const result = await fetchData();
const processed = await processData(result);

// ❌ 不好的
fetchData()
  .then(result => processData(result))
  .then(processed => { });
```

**使用解构赋值**：
```typescript
// ✅ 好的
const { name, email } = user;

// ❌ 不好的
const name = user.name;
const email = user.email;
```

**使用模板字符串**：
```typescript
// ✅ 好的
const message = `Hello, ${name}!`;

// ❌ 不好的
const message = 'Hello, ' + name + '!';
```

**避免使用 any**：
```typescript
// ✅ 好的
const processData = (data: UserData): ProcessedData => { };

// ❌ 不好的
const processData = (data: any): any => { };
```

### 错误处理

```typescript
// ✅ 好的
router.post('/add', async (req, res) => {
  try {
    const result = await createProject(req.body);
    res.json(success(result));
  } catch (error) {
    logger.error('Failed to create project', { error });
    res.json(fail(error.message));
  }
});

// ❌ 不好的
router.post('/add', async (req, res) => {
  const result = await createProject(req.body);
  res.json(success(result));
});
```

### 注释规范

**函数注释**：
```typescript
/**
 * 创建新项目
 * @param data 项目数据
 * @returns 创建的项目信息
 */
export const createProject = async (data: ProjectData): Promise<Project> => {
  // 实现
};
```

**复杂逻辑注释**：
```typescript
// 计算视频总时长
// 1. 获取所有视频片段
// 2. 累加每个片段的时长
// 3. 转换为标准格式
const totalDuration = calculateTotalDuration(videos);
```

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type 类型

- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构（既不是新功能也不是修复）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 示例

```bash
# 新功能
git commit -m "feat(project): add project export functionality"

# Bug 修复
git commit -m "fix(auth): resolve token expiration issue"

# 文档更新
git commit -m "docs(readme): update installation instructions"

# 重构
git commit -m "refactor(api): simplify error handling logic"

# 性能优化
git commit -m "perf(db): add index to improve query performance"
```

### 详细提交

```bash
git commit -m "feat(video): add batch video generation

- Add batch processing queue
- Implement progress tracking
- Add error retry mechanism

Closes #123"
```

## Pull Request 流程

### PR 标题

遵循提交规范：
```
feat(module): add new feature
fix(module): resolve bug
docs: update documentation
```

### PR 描述模板

```markdown
## 描述
简要描述这个 PR 的目的和内容。

## 变更类型
- [ ] Bug 修复
- [ ] 新功能
- [ ] 文档更新
- [ ] 代码重构
- [ ] 性能优化
- [ ] 其他

## 相关 Issue
Closes #123

## 测试
描述你如何测试这些变更。

## 截图（如适用）
添加截图帮助说明变更。

## 检查清单
- [ ] 代码遵循项目规范
- [ ] 已添加必要的注释
- [ ] 已更新相关文档
- [ ] 已通过所有测试
- [ ] 已测试在不同环境下的表现
```

### PR 审查

提交 PR 后：
1. 等待 CI 检查通过
2. 等待维护者审查
3. 根据反馈修改代码
4. 审查通过后会被合并

### 合并要求

- ✅ 所有 CI 检查通过
- ✅ 至少一位维护者批准
- ✅ 代码符合规范
- ✅ 没有冲突
- ✅ 目标分支是 `develop`

## 问题反馈

### Bug 报告模板

```markdown
## Bug 描述
清晰简洁地描述 Bug。

## 复现步骤
1. 进入 '...'
2. 点击 '...'
3. 滚动到 '...'
4. 看到错误

## 预期行为
描述你期望发生什么。

## 实际行为
描述实际发生了什么。

## 截图
如果适用，添加截图帮助说明问题。

## 环境信息
- OS: [e.g. Windows 11]
- Node.js 版本: [e.g. 24.0.0]
- Toonflow 版本: [e.g. 1.0.7]
- 浏览器: [e.g. Chrome 120]

## 错误日志
```
粘贴相关的错误日志
```

## 其他信息
添加任何其他相关信息。
```

### 功能请求模板

```markdown
## 功能描述
清晰简洁地描述你想要的功能。

## 问题背景
描述这个功能要解决什么问题。

## 建议的解决方案
描述你希望如何实现这个功能。

## 替代方案
描述你考虑过的其他解决方案。

## 其他信息
添加任何其他相关信息或截图。
```

## 开发技巧

### 调试

```bash
# 启动调试模式
npm --prefix api run dev

# 使用 Chrome DevTools
# 打开 chrome://inspect
```

### 查看日志

```bash
# 实时查看日志
tail -f logs/app.log

# 查看错误日志
tail -f logs/error.log
```

### 数据库操作

```bash
# 打开数据库
sqlite3 data/toonflow.db

# 查看表结构
.schema t_project

# 查询数据
SELECT * FROM t_project;

# 退出
.quit
```

### 清理数据

```bash
# 清理构建产物
rm -rf build/

# 清理依赖
rm -rf node_modules/

# 清理数据库（谨慎！）
rm data/toonflow.db
```

## 发布流程

仅供维护者参考：

### 1. 更新版本号

```bash
# 修改 package.json 中的 version
# 遵循语义化版本规范：major.minor.patch
```

### 2. 更新 CHANGELOG

```markdown
## [1.0.8] - 2026-03-03

### Added
- 新功能列表

### Changed
- 变更列表

### Fixed
- 修复列表
```

### 3. 创建 Tag

```bash
git tag -a v1.0.8 -m "Release v1.0.8"
git push origin v1.0.8
```

### 4. 发布 Release

在 GitHub 上创建 Release，上传构建产物。

## 社区

### 交流渠道

- GitHub Issues: 问题讨论
- GitHub Discussions: 功能讨论
- 微信群: 日常交流（见 README）
- 邮件: ltlctools@outlook.com

### 获取帮助

遇到问题？
1. 查看文档
2. 搜索已有 Issues
3. 提出新 Issue
4. 加入微信群讨论

## 致谢

感谢所有为 Toonflow 做出贡献的开发者！

你的贡献将被记录在：
- CONTRIBUTORS.md
- GitHub Contributors 页面
- Release Notes

---

再次感谢你的贡献！让我们一起让 Toonflow 变得更好！
