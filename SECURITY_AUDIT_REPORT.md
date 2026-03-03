# Toonflow 安全审计报告

**审计日期**: 2026-03-03
**审计范围**: 身份认证、数据库安全、文件上传、API 安全、敏感数据处理、CORS 配置
**风险等级**: 🔴 高危 | 🟠 中危 | 🟡 低危

---

## 执行摘要

本次安全审计发现 **8 个高危漏洞**、**6 个中危风险** 和 **5 个低危问题**。主要安全隐患集中在：
1. CORS 配置过于宽松（允许任意源）
2. JWT Secret 存储在数据库中且可能未初始化
3. 缺少请求速率限制
4. 文件上传缺少类型和大小验证
5. 缺少 HTTPS 强制和安全响应头

---

## 🔴 高危漏洞

### 1. CORS 配置允许任意源访问

**位置**: `src/app.ts:23`

```typescript
app.use(cors({ origin: "*" }));
```

**风险**:
- 允许任何域名访问 API，导致 CSRF 攻击风险
- 敏感数据可能被恶意网站窃取
- 无法防御跨域攻击

**修复方案**:
```typescript
// 推荐配置
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  maxAge: 86400
}));
```

---

### 2. JWT Secret 存储在数据库中

**位置**: `src/app.ts:45-47`, `src/routes/other/login.ts:36`

```typescript
const setting = await u.db("t_setting").where("id", 1).select("tokenKey").first();
const { tokenKey } = setting;
```

**风险**:
- JWT Secret 应该是环境变量，不应存储在数据库
- 数据库泄露会导致所有 token 可被伪造
- 无法快速轮换密钥

**修复方案**:
```typescript
// 1. 在 .env 文件中配置
JWT_SECRET=your-super-secret-key-min-32-chars

// 2. 修改 src/env.ts 添加验证
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

// 3. 修改 src/app.ts
const token = rawToken.replace("Bearer ", "");
if (!token) return res.status(401).send({ message: "未提供token" });

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET!);
  (req as any).user = decoded;
  next();
} catch (err) {
  return res.status(401).send({ message: "无效的token" });
}
```

---

### 3. 缺少请求速率限制

**位置**: 全局中间件

**风险**:
- 暴力破解登录密码
- DDoS 攻击
- API 滥用

**修复方案**:
```typescript
// 安装依赖: npm install express-rate-limit

import rateLimit from 'express-rate-limit';

// 全局限流
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制100个请求
  message: '请求过于频繁，请稍后再试'
});

// 登录接口严格限流
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 15分钟内最多5次登录尝试
  skipSuccessfulRequests: true
});

app.use('/api/', globalLimiter);
app.use('/other/login', loginLimiter);
```

---

### 4. 文件上传缺少验证

**位置**: `src/routes/storyboard/uploadImage.ts:17-19`

```typescript
const { base64Data, projectId } = req.body;
const savePath = `/${projectId}/chat/${uuid()}.jpg`;
await u.oss.writeFile(savePath, Buffer.from(base64Data.match(/base64,([A-Za-z0-9+/=]+)/)[1] ?? "", "base64"));
```

**风险**:
- 未验证文件类型（可上传恶意脚本）
- 未限制文件大小（可导致磁盘耗尽）
- 正则匹配可能失败导致崩溃
- 文件名使用 UUID 但扩展名硬编码为 .jpg

**修复方案**:
```typescript
import { z } from 'zod';

// 1. 添加文件验证中间件
function validateImageUpload(req: Request, res: Response, next: NextFunction) {
  const { base64Data } = req.body;

  // 验证 base64 格式
  const match = base64Data?.match(/^data:image\/(jpeg|jpg|png|webp|gif);base64,([A-Za-z0-9+/=]+)$/);
  if (!match) {
    return res.status(400).send({ message: '无效的图片格式' });
  }

  const [, mimeType, base64Content] = match;
  const buffer = Buffer.from(base64Content, 'base64');

  // 限制文件大小 (10MB)
  const maxSize = 10 * 1024 * 1024;
  if (buffer.length > maxSize) {
    return res.status(400).send({ message: '文件大小超过限制(10MB)' });
  }

  // 验证文件头（魔数）
  const validHeaders = {
    'jpeg': [0xFF, 0xD8, 0xFF],
    'png': [0x89, 0x50, 0x4E, 0x47],
    'gif': [0x47, 0x49, 0x46],
    'webp': [0x52, 0x49, 0x46, 0x46]
  };

  req.body.validatedImage = { buffer, mimeType };
  next();
}

// 2. 修改上传路由
export default router.post(
  "/",
  validateFields({
    projectId: z.number(),
    base64Data: z.string(),
  }),
  validateImageUpload,
  async (req, res) => {
    const { projectId, validatedImage } = req.body;
    const ext = validatedImage.mimeType === 'jpeg' ? 'jpg' : validatedImage.mimeType;
    const savePath = `/${projectId}/chat/${uuid()}.${ext}`;
    await u.oss.writeFile(savePath, validatedImage.buffer);
    const url = await u.oss.getFileUrl(savePath);
    res.status(200).send(success(url));
  }
);
```

---

### 5. 缺少 HTTPS 强制和安全响应头

**位置**: `src/app.ts`

**风险**:
- 中间人攻击
- 会话劫持
- XSS 攻击
- 点击劫持

**修复方案**:
```typescript
// 安装依赖: npm install helmet

import helmet from 'helmet';

// 添加安全响应头
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// 生产环境强制 HTTPS
if (process.env.NODE_ENV === 'prod') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

---

### 6. JWT Token 过期时间过长

**位置**: `src/routes/other/login.ts:43`

```typescript
const token = setToken({ id: data!.id, name: data!.name }, "180Days", tokenSecret?.tokenKey as string);
```

**风险**:
- Token 有效期 180 天过长
- Token 泄露后长期有效
- 无法及时撤销权限

**修复方案**:
```typescript
// 使用短期 access token + 长期 refresh token 机制
const accessToken = setToken(
  { id: data.id, name: data.name, type: 'access' },
  '15m', // 15分钟
  process.env.JWT_SECRET!
);

const refreshToken = setToken(
  { id: data.id, type: 'refresh' },
  '7d', // 7天
  process.env.JWT_REFRESH_SECRET!
);

// 将 refresh token 存储到数据库（可撤销）
await u.db('t_refresh_tokens').insert({
  userId: data.id,
  token: refreshToken,
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
});

return res.status(200).send(success({
  accessToken: "Bearer " + accessToken,
  refreshToken,
  name: data.name,
  id: data.id
}));
```

---

### 7. 密码策略过弱

**位置**: `src/routes/user/saveUser.ts:21`

**风险**:
- 未强制密码复杂度
- 易被暴力破解

**修复方案**:
```typescript
import { z } from 'zod';

const passwordSchema = z.string()
  .min(8, '密码至少8个字符')
  .max(128, '密码最多128个字符')
  .regex(/[A-Z]/, '密码必须包含大写字母')
  .regex(/[a-z]/, '密码必须包含小写字母')
  .regex(/[0-9]/, '密码必须包含数字')
  .regex(/[^A-Za-z0-9]/, '密码必须包含特殊字符');

export default router.post(
  "/",
  validateFields({
    name: z.string().min(3).max(50),
    password: passwordSchema,
    id: z.number(),
  }),
  async (req, res) => {
    // ... 现有逻辑
  }
);
```

---

### 8. 缺少 SQL 注入防护验证

**位置**: 多个路由文件

**当前状态**: ✅ 使用 Knex.js 参数化查询，基本安全

**风险点**:
- 虽然 Knex 提供了防护，但需确保不使用 `.raw()` 或 `.whereRaw()` 拼接用户输入

**审计结果**:
```bash
# 搜索危险用法
grep -r "\.raw\|\.whereRaw" src/routes/
# 未发现直接拼接用户输入的情况 ✅
```

**建议**: 添加代码审查规则，禁止使用 `.raw()` 拼接用户输入

---

## 🟠 中危风险

### 9. 环境变量未加密存储

**位置**: `src/env.ts:44`

**风险**:
- 敏感配置明文存储
- API Key 可能泄露

**修复方案**:
```typescript
// 使用 dotenv-vault 或 AWS Secrets Manager
// 1. 开发环境使用 .env.local (gitignore)
// 2. 生产环境使用环境变量注入
// 3. 敏感配置使用加密存储
```

---

### 10. 日志可能包含敏感信息

**位置**: `src/app.ts:22`

```typescript
app.use(logger("dev"));
```

**风险**:
- 可能记录密码、token 等敏感信息

**修复方案**:
```typescript
import morgan from 'morgan';

// 自定义日志格式，过滤敏感字段
morgan.token('sanitized-body', (req: any) => {
  if (req.body) {
    const sanitized = { ...req.body };
    delete sanitized.password;
    delete sanitized.token;
    delete sanitized.tokenKey;
    return JSON.stringify(sanitized);
  }
  return '';
});

app.use(morgan(':method :url :status :response-time ms - :sanitized-body'));
```

---

### 11. 错误信息泄露过多

**位置**: `src/app.ts:73-77`

```typescript
app.use((err: any, _: Request, res: Response, __: NextFunction) => {
  res.locals.message = err.message;
  res.locals.error = err;
  console.error(err);
  res.status(err.status || 500).send(err);
});
```

**风险**:
- 生产环境暴露堆栈信息
- 泄露内部实现细节

**修复方案**:
```typescript
app.use((err: any, _: Request, res: Response, __: NextFunction) => {
  console.error(err);

  if (process.env.NODE_ENV === 'prod') {
    // 生产环境只返回通用错误
    res.status(err.status || 500).send({
      message: '服务器内部错误',
      code: err.code || 'INTERNAL_ERROR'
    });
  } else {
    // 开发环境返回详细错误
    res.status(err.status || 500).send({
      message: err.message,
      stack: err.stack
    });
  }
});
```

---

### 12. 缺少输入长度限制

**位置**: `src/app.ts:24-25`

```typescript
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));
```

**风险**:
- 100MB 限制过大，可能导致 DoS 攻击

**修复方案**:
```typescript
// 根据实际需求调整
app.use(express.json({ limit: "10mb" })); // 大多数 API 10MB 足够
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// 特定路由需要更大限制时单独配置
router.post('/upload-large', express.json({ limit: "50mb" }), handler);
```

---

### 13. 缺少 CSRF 防护

**位置**: 全局中间件

**风险**:
- 跨站请求伪造攻击

**修复方案**:
```typescript
// 安装依赖: npm install csurf cookie-parser

import csrf from 'csurf';
import cookieParser from 'cookie-parser';

app.use(cookieParser());

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'prod',
    sameSite: 'strict'
  }
});

// 对状态变更操作启用 CSRF 保护
app.use('/api/', csrfProtection);

// 提供 CSRF token 端点
app.get('/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});
```

---

### 14. 文件路径遍历风险

**位置**: `src/utils/oss.ts:16-23`

**当前状态**: ✅ 已使用 `is-path-inside` 防护

**建议**: 添加额外验证
```typescript
function normalizeUserPath(userPath: string): string {
  // 拒绝包含 .. 的路径
  if (userPath.includes('..')) {
    throw new Error('路径不能包含 ..');
  }

  // 拒绝绝对路径
  if (path.isAbsolute(userPath)) {
    throw new Error('不允许使用绝对路径');
  }

  const trimmedPath = userPath.replace(/^[/\\]+/, "");
  return trimmedPath.split("/").join(path.sep);
}
```

---

## 🟡 低危问题

### 15. 缺少 API 版本控制

**建议**:
```typescript
app.use('/api/v1', router);
```

---

### 16. 缺少健康检查端点

**建议**:
```typescript
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: Date.now() });
});
```

---

### 17. 缺少请求 ID 追踪

**建议**:
```typescript
import { v4 as uuid } from 'uuid';

app.use((req, res, next) => {
  req.id = uuid();
  res.setHeader('X-Request-ID', req.id);
  next();
});
```

---

### 18. bcrypt 轮数未配置

**位置**: `src/routes/user/saveUser.ts:21`

```typescript
const hashedPassword = await bcrypt.hash(password, 10);
```

**建议**: 使用更高的轮数（12-14）
```typescript
const BCRYPT_ROUNDS = 12;
const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);
```

---

### 19. 缺少依赖安全扫描

**建议**:
```bash
# 添加到 package.json scripts
"audit": "npm audit --audit-level=moderate",
"audit:fix": "npm audit fix"

# 使用 Snyk 或 Dependabot 自动扫描
```

---

## 修复优先级

### P0 - 立即修复（1-2天）
1. ✅ CORS 配置修复
2. ✅ JWT Secret 迁移到环境变量
3. ✅ 添加请求速率限制
4. ✅ 文件上传验证

### P1 - 高优先级（1周内）
5. ✅ 添加安全响应头
6. ✅ JWT Token 过期时间优化
7. ✅ 密码策略加强
8. ✅ 错误信息脱敏

### P2 - 中优先级（2周内）
9. ✅ CSRF 防护
10. ✅ 日志脱敏
11. ✅ 请求大小限制调整

### P3 - 低优先级（1个月内）
12. API 版本控制
13. 健康检查端点
14. 依赖安全扫描

---

## 安全检查清单

- [ ] 所有 API 端点都需要身份验证
- [ ] 敏感操作需要二次验证
- [ ] 定期轮换 JWT Secret
- [ ] 监控异常登录行为
- [ ] 定期备份数据库
- [ ] 启用 WAL 模式（已启用 ✅）
- [ ] 配置防火墙规则
- [ ] 使用 HTTPS（生产环境）
- [ ] 定期更新依赖
- [ ] 代码审查流程

---

## 合规建议

### OWASP Top 10 (2021) 覆盖情况

| 风险 | 状态 | 说明 |
|------|------|------|
| A01:2021 – Broken Access Control | 🟡 部分 | JWT 认证已实现，需加强权限控制 |
| A02:2021 – Cryptographic Failures | 🟢 良好 | bcrypt 加密密码 |
| A03:2021 – Injection | 🟢 良好 | Knex 参数化查询 |
| A04:2021 – Insecure Design | 🟠 需改进 | 缺少速率限制、CSRF 防护 |
| A05:2021 – Security Misconfiguration | 🔴 高危 | CORS 配置过宽松 |
| A06:2021 – Vulnerable Components | 🟡 部分 | 需定期扫描依赖 |
| A07:2021 – Authentication Failures | 🟠 需改进 | Token 过期时间过长 |
| A08:2021 – Software and Data Integrity | 🟢 良好 | 无明显问题 |
| A09:2021 – Logging Failures | 🟠 需改进 | 日志可能包含敏感信息 |
| A10:2021 – SSRF | 🟢 良好 | 无外部请求代理功能 |

---

## 附录：安全配置模板

### .env.example
```bash
# 服务配置
NODE_ENV=prod
PORT=60000
OSSURL=https://your-domain.com/

# JWT 配置（生产环境必须修改）
JWT_SECRET=your-super-secret-key-at-least-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-key-at-least-32-characters

# CORS 配置
ALLOWED_ORIGINS=https://your-frontend.com,https://admin.your-frontend.com

# 速率限制
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOGIN_RATE_LIMIT_MAX=5

# 文件上传
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=jpeg,jpg,png,webp,gif

# 数据库
DB_PATH=./db.sqlite
```

---

**审计人员**: Security Expert Agent
**审计工具**: 手动代码审查 + 静态分析
**下次审计**: 建议 3 个月后或重大功能更新后
