# Toonflow 架构设计文档

## 概述

Toonflow 是一个基于 Node.js + Express + SQLite 的 AI 短剧创作平台，采用前后端分离架构。

## 技术栈

### 后端技术栈

- **运行时**: Node.js 24.x
- **Web 框架**: Express 5.x
- **数据库**: SQLite3 (better-sqlite3)
- **ORM**: Knex.js
- **AI SDK**: Vercel AI SDK
- **类型系统**: TypeScript 5.x
- **图片处理**: Sharp
- **HTTP 客户端**: Axios
- **认证**: JWT (jsonwebtoken)
- **密码加密**: bcrypt
- **数据验证**: Zod

### 前端技术栈

前端代码已迁移到当前仓库 `web/` 目录，与后端 `api/` 并存

- **框架**: React 18
- **构建工具**: Vite
- **UI 组件**: shadcn/ui
- **状态管理**: Zustand
- **路由**: React Router
- **HTTP 客户端**: Axios
- **样式**: Tailwind CSS

## 系统架构

### 整体架构

```
┌─────────────────────────────────────────────────────────┐
│                      前端 (React)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ 项目管理 │  │ 剧本生成 │  │ 分镜制作 │  │ 视频合成│ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          │ HTTP/WebSocket
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   后端 API (Express)                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ 路由层   │  │ 中间件   │  │ 业务逻辑 │  │ AI Agent│ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   数据层 (SQLite)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ 项目表   │  │ 剧本表   │  │ 素材表   │  │ 配置表  │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   外部服务                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │ LLM API  │  │ 图片生成 │  │ 视频生成 │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

### 目录结构

```
Toonflow-app/
├── api/                      # 后端（Express + TypeScript）
│   ├── src/                  # 后端源码
│   ├── scripts/              # 后端构建脚本
│   ├── env/                  # 后端环境文件
│   ├── package.json
│   └── tsconfig.json
├── web/                      # 前端（React + Vite）
│   ├── src/                  # 前端源码
│   ├── package.json
│   └── vite.config.ts
├── docker/                   # Docker 与部署脚本
├── docs/                     # 文档
└── package.json              # 根工作区脚本
```

## 核心模块

### 1. 应用入口 (app.ts)

```typescript
// 初始化 Express 应用
const app = express();

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(morgan('combined'));

// 静态文件服务
app.use('/uploads', express.static('uploads'));
// 前端静态资源由 web 构建产物提供（Nginx 或 Vite）

// 注册路由
await registerRoutes(app);

// 启动服务
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### 2. 路由系统 (router.ts)

自动扫描并注册所有路由模块：

```typescript
// 自动生成的路由注册
export default async (app: Express) => {
  app.use("/assets/addAssets", route1);
  app.use("/assets/delAssets", route2);
  // ... 更多路由
}
```

路由模块结构：

```typescript
// routes/project/addProject.ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/middleware';

const router = Router();

router.post('/', authMiddleware, async (req, res) => {
  try {
    // 业务逻辑
    const result = await createProject(req.body);
    res.json(success(result));
  } catch (error) {
    res.json(fail(error.message));
  }
});

export default router;
```

### 3. 数据库层

#### 数据库初始化 (lib/fixDB.ts)

```typescript
import Database from 'better-sqlite3';
import knex from 'knex';

// 创建数据库连接
const db = new Database('data/toonflow.db');

// 创建表结构
db.exec(`
  CREATE TABLE IF NOT EXISTS t_project (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    intro TEXT,
    type TEXT,
    artStyle TEXT,
    videoRatio TEXT,
    userId INTEGER,
    createTime INTEGER
  )
`);

// 使用 Knex 进行查询
const knexDb = knex({
  client: 'better-sqlite3',
  connection: { filename: 'data/toonflow.db' }
});
```

#### 数据模型

所有数据表类型定义在 `api/src/types/database.d.ts`：

```typescript
export interface t_project {
  id?: number;
  name?: string;
  intro?: string;
  type?: string;
  artStyle?: string;
  videoRatio?: string;
  userId?: number;
  createTime?: number;
}

export interface DB {
  "t_project": t_project;
  "t_novel": t_novel;
  // ... 更多表
}
```

### 4. AI Agent 系统

#### AI SDK 集成

使用 Vercel AI SDK 统一管理多个 AI 服务：

```typescript
import { createOpenAI } from '@ai-sdk/openai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { generateText, streamText } from 'ai';

// 创建 AI 客户端
const openai = createOpenAI({
  apiKey: config.apiKey,
  baseURL: config.baseUrl
});

// 生成文本
const { text } = await generateText({
  model: openai('gpt-4'),
  prompt: '生成剧本...',
  temperature: 0.7
});

// 流式生成
const { textStream } = await streamText({
  model: openai('gpt-4'),
  prompt: '生成剧本...'
});

for await (const chunk of textStream) {
  process.stdout.write(chunk);
}
```

#### Agent 模块

分镜生成 Agent 示例：

```typescript
// agents/storyboard/index.ts
export async function generateStoryboard(script: string) {
  const prompt = `
    根据以下剧本生成分镜：
    ${script}

    要求：
    1. 每个场景拆分为多个镜头
    2. 描述镜头类型、角度、运镜
    3. 生成图片提示词
  `;

  const { text } = await generateText({
    model: getModel('storyboard'),
    prompt,
    temperature: 0.7
  });

  return parseStoryboard(text);
}
```

### 5. 中间件系统

#### JWT 认证中间件

```typescript
// middleware/middleware.ts
import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    return res.json(fail('未授权', 401));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.json(fail('Token 无效', 401));
  }
};
```

#### 日志中间件

```typescript
import morgan from 'morgan';
import fs from 'fs';

// 创建日志流
const accessLogStream = fs.createWriteStream(
  'logs/access.log',
  { flags: 'a' }
);

// 使用 morgan
app.use(morgan('combined', { stream: accessLogStream }));
```

### 6. 响应格式化

```typescript
// lib/responseFormat.ts
export const success = (data: any, message = '成功') => ({
  code: 200,
  message,
  data
});

export const fail = (message: string, code = 400) => ({
  code,
  message,
  data: null
});
```

### 7. 文件上传

```typescript
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.post('/upload', upload.single('file'), (req, res) => {
  res.json(success({
    filePath: `/uploads/${req.file.filename}`
  }));
});
```

## 数据流

### 完整创作流程

```
1. 用户上传小说
   ↓
   POST /novel/addNovel
   ↓
   保存到 t_novel 表

2. AI 生成大纲
   ↓
   POST /outline/agentsOutline
   ↓
   调用 LLM API
   ↓
   解析并保存到 t_outline 表

3. AI 生成剧本
   ↓
   POST /script/generateScriptApi
   ↓
   调用 LLM API
   ↓
   保存到 t_script 表

4. AI 生成分镜
   ↓
   POST /storyboard/generateStoryboardApi
   ↓
   调用 LLM API
   ↓
   保存到 t_assets 表

5. 生成分镜图片
   ↓
   POST /storyboard/generateShotImage
   ↓
   调用图片生成 API
   ↓
   保存图片到 uploads/
   ↓
   更新 t_assets 和 t_image 表

6. 生成视频
   ↓
   POST /video/generateVideo
   ↓
   调用视频生成 API
   ↓
   保存视频到 uploads/
   ↓
   更新 t_video 表
```

## 性能优化

### 1. 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_project_userId ON t_project(userId);
CREATE INDEX idx_novel_projectId ON t_novel(projectId);
CREATE INDEX idx_script_projectId ON t_script(projectId);

-- 定期清理
VACUUM;
```

### 2. 缓存策略

```typescript
// 简单内存缓存
const cache = new Map();

export const getCached = (key: string, ttl = 3600) => {
  const item = cache.get(key);
  if (item && Date.now() < item.expiry) {
    return item.value;
  }
  return null;
};

export const setCache = (key: string, value: any, ttl = 3600) => {
  cache.set(key, {
    value,
    expiry: Date.now() + ttl * 1000
  });
};
```

### 3. 并发控制

```typescript
import pLimit from 'p-limit';

// 限制并发数
const limit = pLimit(5);

const tasks = images.map(img =>
  limit(() => generateImage(img))
);

await Promise.all(tasks);
```

### 4. 流式响应

```typescript
router.post('/stream', async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  const { textStream } = await streamText({
    model: getModel(),
    prompt: req.body.prompt
  });

  for await (const chunk of textStream) {
    res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
  }

  res.end();
});
```

## 安全性

### 1. 输入验证

```typescript
import { z } from 'zod';

const projectSchema = z.object({
  name: z.string().min(1).max(100),
  intro: z.string().max(500),
  type: z.enum(['短剧', '漫剧', 'MV']),
  artStyle: z.string(),
  videoRatio: z.enum(['16:9', '9:16', '1:1', '4:3'])
});

router.post('/add', async (req, res) => {
  try {
    const data = projectSchema.parse(req.body);
    // 处理数据
  } catch (error) {
    res.json(fail('参数验证失败'));
  }
});
```

### 2. SQL 注入防护

使用参数化查询：

```typescript
// ❌ 不安全
db.prepare(`SELECT * FROM t_user WHERE name = '${name}'`).get();

// ✅ 安全
db.prepare('SELECT * FROM t_user WHERE name = ?').get(name);
```

### 3. XSS 防护

```typescript
import sanitizeHtml from 'sanitize-html';

const clean = sanitizeHtml(userInput, {
  allowedTags: ['b', 'i', 'em', 'strong'],
  allowedAttributes: {}
});
```

### 4. CSRF 防护

```typescript
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });
app.use(csrfProtection);
```

### 5. 速率限制

```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100 // 最多 100 次请求
});

app.use('/api/', limiter);
```

## 部署架构

### 单机部署

```
┌─────────────────────────────────┐
│         Nginx (80/443)          │
│  ┌──────────────────────────┐   │
│  │   静态文件 (前端)         │   │
│  └──────────────────────────┘   │
│              ↓                   │
│  ┌──────────────────────────┐   │
│  │   反向代理 → :60000      │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│    Node.js (PM2 Cluster)        │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│  │ W1 │ │ W2 │ │ W3 │ │ W4 │   │
│  └────┘ └────┘ └────┘ └────┘   │
└─────────────────────────────────┘
              ↓
┌─────────────────────────────────┐
│         SQLite Database         │
└─────────────────────────────────┘
```

### Docker 部署

```yaml
version: '3.8'
services:
  toonflow:
    build: .
    ports:
      - "60000:60000"
    volumes:
      - ./data:/app/data
      - ./uploads:/app/uploads
      - ./logs:/var/log
    environment:
      - NODE_ENV=production
      - PORT=60000
```

### 集群部署（未来）

```
┌─────────────────────────────────┐
│       Load Balancer (Nginx)     │
└─────────────────────────────────┘
         ↓         ↓         ↓
┌────────┐   ┌────────┐   ┌────────┐
│ Node 1 │   │ Node 2 │   │ Node 3 │
└────────┘   └────────┘   └────────┘
         ↓         ↓         ↓
┌─────────────────────────────────┐
│      PostgreSQL / MySQL         │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│      Redis (缓存/队列)          │
└─────────────────────────────────┘
```

## 扩展性

### 插件系统（计划中）

```typescript
interface Plugin {
  name: string;
  version: string;
  init: (app: Express) => void;
  routes?: Router;
  hooks?: {
    beforeGenerate?: (data: any) => any;
    afterGenerate?: (result: any) => any;
  };
}

// 注册插件
registerPlugin(myPlugin);
```

### 事件系统（计划中）

```typescript
import EventEmitter from 'events';

const events = new EventEmitter();

// 发布事件
events.emit('project:created', project);

// 订阅事件
events.on('project:created', (project) => {
  console.log('New project:', project.name);
});
```

## 监控与日志

### 日志系统

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

logger.info('Server started');
logger.error('Error occurred', { error });
```

### 性能监控

```typescript
// 请求耗时统计
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

## 未来规划

1. **微服务架构**：拆分为独立的服务
2. **消息队列**：使用 RabbitMQ/Redis 处理异步任务
3. **分布式存储**：支持 OSS/S3
4. **实时协作**：WebSocket 多人协作
5. **插件市场**：社区插件生态

---

本文档持续更新中，欢迎贡献！
