# Toonflow 开发环境搭建指南

本文档详细介绍如何搭建 Toonflow 的开发环境。

## 目录

- [系统要求](#系统要求)
- [安装 Node.js](#安装-nodejs)
- [克隆项目](#克隆项目)
- [安装依赖](#安装依赖)
- [配置环境](#配置环境)
- [启动开发服务器](#启动开发服务器)
- [开发工具推荐](#开发工具推荐)
- [常见问题](#常见问题)

## 系统要求

### 硬件要求

- CPU: 双核 2.0GHz 及以上
- 内存: 8GB RAM（推荐 16GB）
- 硬盘: 20GB 可用空间（SSD 推荐）

### 软件要求

- 操作系统:
  - Windows 10/11
  - macOS 10.15+
  - Linux (Ubuntu 20.04+, CentOS 7+)
- Node.js: 24.x（推荐，最低 23.11.1）
- Git: 2.x
- 包管理器: Yarn 1.x 或 npm 8.x

## 安装 Node.js

### Windows

**方式一：使用官方安装包**

1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 LTS 版本（推荐）或 Current 版本
3. 运行安装程序
4. 验证安装：
   ```bash
   node -v
   npm -v
   ```

**方式二：使用 nvm-windows**

1. 下载 [nvm-windows](https://github.com/coreybutler/nvm-windows/releases)
2. 安装 nvm
3. 安装 Node.js：
   ```bash
   nvm install 24
   nvm use 24
   node -v
   ```

### macOS

**方式一：使用 Homebrew**

```bash
# 安装 Homebrew（如果未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# 安装 Node.js
brew install node@24

# 验证安装
node -v
npm -v
```

**方式二：使用 nvm**

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重新加载配置
source ~/.zshrc  # 或 source ~/.bash_profile

# 安装 Node.js
nvm install 24
nvm use 24
node -v
```

### Linux

**使用 nvm（推荐）**

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重新加载配置
source ~/.bashrc

# 安装 Node.js
nvm install 24
nvm use 24
node -v
```

**使用包管理器**

Ubuntu/Debian:
```bash
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt-get install -y nodejs
```

CentOS/RHEL:
```bash
curl -fsSL https://rpm.nodesource.com/setup_24.x | sudo bash -
sudo yum install -y nodejs
```

## 克隆项目

### 从 GitHub 克隆

```bash
# HTTPS
git clone https://github.com/HBAI-Ltd/Toonflow-app.git

# SSH（需要配置 SSH Key）
git clone git@github.com:HBAI-Ltd/Toonflow-app.git

# 进入项目目录
cd Toonflow-app
```

### 从 Gitee 克隆（国内推荐）

```bash
# HTTPS
git clone https://gitee.com/HBAI-Ltd/Toonflow-app.git

# SSH
git clone git@gitee.com:HBAI-Ltd/Toonflow-app.git

# 进入项目目录
cd Toonflow-app
```

## 安装依赖

### 安装项目依赖（推荐 npm）

```bash
npm install
```

**国内用户加速**：

```bash
# 使用 npm 镜像
npm config set registry https://registry.npmmirror.com

# 然后安装依赖
npm install
```

## 配置环境

### 环境变量

创建 `api/.env` 文件（可选）：

```bash
# 复制示例文件
cp api/.env.example api/.env

# 编辑配置
nano api/.env
```

`.env` 文件内容：

```env
# 服务端口
PORT=60000

# 运行环境
NODE_ENV=development

# 文件访问地址
OSSURL=http://localhost:60000/

# JWT 密钥（可选，会自动生成）
JWT_SECRET=your-secret-key

# 数据库路径（可选）
DB_PATH=./data/toonflow.db
```

### 数据库初始化

首次启动时会自动创建数据库，无需手动操作。

数据库文件位置：`data/toonflow.db`

## 启动开发服务器

### 方式一：仅启动后端服务

```bash
npm run dev:api
```

后端服务将在 `http://localhost:60000` 启动。

### 方式二：同时启动前后端（推荐联调）

```bash
npm run dev:api
npm run dev:web
```

会同时启动：
- 后端 API 服务（端口 60000）
- 前端开发服务（默认端口 5173）

### 验证服务

访问 `http://localhost:5173` 应该能看到前端页面。

API 测试：
```bash
curl http://localhost:60000/index
```

## 开发工具推荐

### 代码编辑器

**Visual Studio Code（推荐）**

安装推荐扩展：
- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- SQLite Viewer
- GitLens
- Thunder Client（API 测试）

**WebStorm**

JetBrains 的专业 IDE，内置所有功能。

### 数据库工具

**DB Browser for SQLite**

免费的 SQLite 数据库管理工具。

下载：https://sqlitebrowser.org/

**DBeaver**

通用数据库管理工具，支持 SQLite。

下载：https://dbeaver.io/

### API 测试工具

**Postman**

功能强大的 API 测试工具。

下载：https://www.postman.com/

**Thunder Client**

VS Code 扩展，轻量级 API 测试工具。

**curl**

命令行工具，适合快速测试：

```bash
# GET 请求
curl http://localhost:60000/api/projects

# POST 请求
curl -X POST http://localhost:60000/api/projects \
  -H "Content-Type: application/json" \
  -d '{"name":"测试项目"}'
```

### Git 工具

**命令行（推荐）**

```bash
# 查看状态
git status

# 查看差异
git diff

# 提交代码
git add .
git commit -m "feat: add new feature"
git push
```

**GitHub Desktop**

图形化 Git 客户端。

下载：https://desktop.github.com/

**SourceTree**

功能强大的 Git GUI 工具。

下载：https://www.sourcetreeapp.com/

## 开发工作流

### 1. 创建功能分支

```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature
```

### 2. 开发

```bash
# 启动开发服务器
npm run dev:api

# 如需联调前端，另开一个终端执行
npm run dev:web

# 修改代码...

# 实时查看日志
tail -f logs/app.log
```

### 3. 测试

```bash
# 类型检查
npm run lint

# 构建测试
npm run build

# 运行构建产物
npm run test
```

### 4. 提交代码

```bash
git add .
git commit -m "feat: add new feature"
git push origin feature/your-feature
```

### 5. 创建 Pull Request

在 GitHub 上创建 PR，目标分支选择 `develop`。

## 调试技巧

### Node.js 调试

**使用 VS Code**

1. 创建 `.vscode/launch.json`：

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Toonflow",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev:api"],
      "skipFiles": ["<node_internals>/**"],
      "console": "integratedTerminal"
    }
  ]
}
```

2. 按 F5 启动调试
3. 在代码中设置断点

**使用 Chrome DevTools**

```bash
# 启动调试模式
npm --prefix api run dev

# 打开 Chrome
# 访问 chrome://inspect
# 点击 "inspect" 连接到 Node.js 进程
```

### 日志调试

```typescript
// 使用 console.log
console.log('Debug info:', data);

// 使用 logger
import { logger } from './logger';
logger.info('Info message');
logger.error('Error message', { error });
```

### 数据库调试

```bash
# 打开数据库
sqlite3 data/toonflow.db

# 查看所有表
.tables

# 查看表结构
.schema t_project

# 查询数据
SELECT * FROM t_project;

# 查看查询计划
EXPLAIN QUERY PLAN SELECT * FROM t_project WHERE id = 1;
```

## 常见问题

### Q: 安装依赖时出错？

**A**: 尝试以下方法：

```bash
# 清除缓存
npm cache clean --force
rm -rf node_modules
rm package-lock.json

# 重新安装
npm install

# 如果还是失败，尝试使用 npm
npm install
```

### Q: 端口被占用？

**A**: 修改端口：

```bash
# 方式一：修改 .env 文件
PORT=60001

# 方式二：启动时指定
PORT=60001 npm run dev:api
```

或杀死占用端口的进程：

```bash
# Windows
netstat -ano | findstr :60000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :60000
kill -9 <PID>
```

### Q: 数据库锁定错误？

**A**:

```bash
# 停止所有服务
# 等待几秒
# 重新启动
```

### Q: TypeScript 类型错误？

**A**:

```bash
# 重新生成类型定义
npm run build

# 或手动运行类型检查
npm run lint
```

### Q: 热重载不工作？

**A**:

```bash
# 重启开发服务器
# 检查 nodemon 配置
# 确保文件在监听范围内
```

### Q: 如何重置数据库？

**A**:

```bash
# 停止服务
# 删除数据库文件
rm data/toonflow.db

# 重启服务（会自动重新创建）
npm run dev:api
```

## 性能优化

### 开发环境优化

```bash
# 使用 SSD 硬盘
# 增加内存
# 关闭不必要的后台程序
# 使用更快的包管理器（pnpm）
```

### 构建优化

```bash
# 使用增量构建
npm run build:api

# 构建前端
npm run build:web
```

## 下一步

环境搭建完成后，你可以：

1. 阅读 [架构设计文档](./ARCHITECTURE.md)
2. 查看 [贡献指南](./CONTRIBUTING.md)
3. 浏览 [API 文档](../api/API-REFERENCE.md)
4. 开始开发你的第一个功能！

---

遇到问题？欢迎提 Issue 或加入微信群讨论！
