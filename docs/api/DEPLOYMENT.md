# Toonflow API 文档部署指南

## 快速开始

### 1. 安装依赖

```bash
cd docs/api
npm install
```

### 2. 验证 OpenAPI 规范

```bash
npm run validate
```

### 3. 生成静态文档

```bash
# 生成 HTML 文档
npm run generate-html

# 打开生成的文档
open index.html
```

### 4. 本地预览

```bash
# 启动开发服务器（支持热重载）
npm run serve

# 访问 http://localhost:8080
```

## 集成到项目

### 方式一：Swagger UI（推荐）

1. 安装依赖：
```bash
yarn add swagger-ui-express yamljs
```

2. 在 `src/app.ts` 中添加：
```typescript
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const swaggerDocument = YAML.load('./docs/api/openapi.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
```

3. 访问 `http://localhost:60000/api-docs`

### 方式二：Redoc

1. 安装依赖：
```bash
yarn add redoc-express
```

2. 在 `src/app.ts` 中添加：
```typescript
import { serve, setup } from 'redoc-express';

app.get('/docs', serve, setup({
  title: 'Toonflow API 文档',
  specUrl: '/api/openapi.yaml'
}));
```

3. 访问 `http://localhost:60000/docs`

### 方式三：静态 HTML

直接使用生成的 HTML 文件：

```bash
# 复制到 public 目录
cp docs/api/index.html scripts/web/api-docs.html

# 访问 http://localhost:60000/api-docs.html
```

## 部署到生产环境

### GitHub Pages

```bash
# 生成文档
npm run generate-html

# 提交到 GitHub
git add docs/api/index.html
git commit -m "docs: update API documentation"
git push

# 在 GitHub 仓库设置中启用 Pages
# 选择 docs 目录
```

访问：`https://your-username.github.io/Toonflow-app/api/`

### Vercel

1. 创建 `vercel.json`：
```json
{
  "rewrites": [
    { "source": "/api-docs", "destination": "/docs/api/index.html" }
  ]
}
```

2. 部署：
```bash
vercel deploy
```

### Netlify

1. 创建 `netlify.toml`：
```toml
[[redirects]]
  from = "/api-docs"
  to = "/docs/api/index.html"
  status = 200
```

2. 部署：
```bash
netlify deploy
```

### Docker

在 `Dockerfile` 中添加：

```dockerfile
# 安装文档依赖
WORKDIR /app/docs/api
RUN npm install

# 生成文档
RUN npm run generate-html

# 复制到静态文件目录
RUN cp index.html /app/scripts/web/api-docs.html
```

## 自动化

### GitHub Actions

创建 `.github/workflows/docs.yml`：

```yaml
name: Generate API Docs

on:
  push:
    paths:
      - 'docs/api/openapi.yaml'
      - 'src/routes/**'

jobs:
  generate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '24'

      - name: Install dependencies
        run: |
          cd docs/api
          npm install

      - name: Validate OpenAPI
        run: |
          cd docs/api
          npm run validate

      - name: Generate HTML
        run: |
          cd docs/api
          npm run generate-html

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./docs/api
```

### Pre-commit Hook

创建 `.husky/pre-commit`：

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

# 验证 OpenAPI 规范
cd docs/api
npm run validate

if [ $? -ne 0 ]; then
  echo "OpenAPI 规范验证失败"
  exit 1
fi
```

## 版本管理

### API 版本控制

1. 创建版本目录：
```
docs/api/
├── v1/
│   └── openapi.yaml
├── v2/
│   └── openapi.yaml
└── latest -> v2
```

2. 在代码中支持多版本：
```typescript
app.use('/api-docs/v1', swaggerUi.serve, swaggerUi.setup(v1Spec));
app.use('/api-docs/v2', swaggerUi.serve, swaggerUi.setup(v2Spec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(latestSpec));
```

### 变更日志

在 `docs/api/CHANGELOG.md` 中记录：

```markdown
# API 变更日志

## [1.1.0] - 2026-03-03

### Added
- 新增批量处理接口
- 新增角色服化道管理接口

### Changed
- 优化项目列表接口性能

### Deprecated
- `/old/endpoint` 将在 v2.0 中移除

### Removed
- 移除已废弃的 `/legacy/api`

### Fixed
- 修复视频生成接口的参数验证问题
```

## 最佳实践

### 1. 保持文档同步

- 代码变更时同步更新 OpenAPI 规范
- 使用 CI/CD 自动验证
- 定期审查文档准确性

### 2. 提供完整示例

- 每个接口提供请求示例
- 包含常见错误响应
- 添加使用场景说明

### 3. 安全性

- 标注需要认证的接口
- 说明权限要求
- 提供安全最佳实践

### 4. 性能

- 使用 CDN 加速静态资源
- 启用 gzip 压缩
- 缓存生成的文档

## 故障排查

### 验证失败

```bash
# 查看详细错误
swagger-cli validate docs/api/openapi.yaml --debug

# 使用在线验证器
# https://editor.swagger.io/
```

### 生成失败

```bash
# 清除缓存
rm -rf node_modules
npm install

# 重新生成
npm run generate-html
```

### 部署问题

```bash
# 检查文件路径
ls -la docs/api/

# 检查权限
chmod 644 docs/api/*.html

# 测试本地服务
npm run serve
```

## 相关资源

- [OpenAPI 规范](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Redoc](https://redocly.com/redoc/)
- [Swagger Editor](https://editor.swagger.io/)

---

**文档版本**: 1.0.7
**最后更新**: 2026-03-03
