# Toonflow API 文档服务

本目录包含 Toonflow 的 API 文档和文档服务配置。

## 文档格式

- **API-REFERENCE.md** - Markdown 格式的 API 参考文档
- **openapi.yaml** - OpenAPI 3.0 规范文件（YAML 格式）
- **openapi.json** - OpenAPI 3.0 规范文件（JSON 格式）

## 查看 API 文档

### 方式一：在线查看（推荐）

使用 Swagger UI 在线查看交互式 API 文档：

```bash
# 安装 swagger-ui-express
npm install swagger-ui-express yamljs

# 或使用 yarn
yarn add swagger-ui-express yamljs
```

在 `src/app.ts` 中添加：

```typescript
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

const swaggerDocument = YAML.load('./docs/api/openapi.yaml');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Toonflow API 文档'
}));
```

启动服务后访问：`http://localhost:60000/api-docs`

### 方式二：使用 Redoc

Redoc 提供更美观的文档界面：

```bash
npm install redoc-express
```

```typescript
import { redoc } from 'redoc-express';

app.use('/api-docs', redoc({
  title: 'Toonflow API 文档',
  specUrl: '/api/openapi.yaml'
}));
```

### 方式三：使用在线工具

1. **Swagger Editor**
   - 访问 https://editor.swagger.io/
   - 导入 `openapi.yaml` 文件
   - 在线编辑和预览

2. **Redocly**
   - 访问 https://redocly.com/
   - 上传 OpenAPI 文件
   - 生成美观的文档站点

3. **Stoplight**
   - 访问 https://stoplight.io/
   - 导入 OpenAPI 文件
   - 提供协作和 Mock 功能

### 方式四：本地静态文档

使用 Redoc CLI 生成静态 HTML：

```bash
# 安装 redoc-cli
npm install -g redoc-cli

# 生成 HTML 文档
redoc-cli bundle docs/api/openapi.yaml -o docs/api/index.html

# 打开生成的文档
open docs/api/index.html
```

## API 测试

### 使用 Postman

1. 打开 Postman
2. 点击 Import
3. 选择 `openapi.yaml` 或 `openapi.json`
4. Postman 会自动创建所有接口的请求

### 使用 curl

```bash
# 登录获取 Token
curl -X POST http://localhost:60000/other/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123","captcha":"1234"}'

# 使用 Token 访问接口
curl -X GET http://localhost:60000/project/getProject \
  -H "Authorization: Bearer <your-token>"
```

### 使用 HTTPie

```bash
# 安装 HTTPie
pip install httpie

# 登录
http POST http://localhost:60000/other/login \
  username=admin password=admin123 captcha=1234

# 访问接口
http GET http://localhost:60000/project/getProject \
  "Authorization: Bearer <your-token>"
```

## 文档维护

### 更新 OpenAPI 规范

1. 编辑 `openapi.yaml` 文件
2. 验证规范：
   ```bash
   # 使用 swagger-cli 验证
   npm install -g @apidevtools/swagger-cli
   swagger-cli validate docs/api/openapi.yaml
   ```
3. 重新生成文档

### 自动生成 OpenAPI 规范

可以使用工具从代码自动生成 OpenAPI 规范：

```bash
# 使用 swagger-jsdoc
npm install swagger-jsdoc

# 在代码中添加 JSDoc 注释
/**
 * @swagger
 * /project/addProject:
 *   post:
 *     summary: 创建项目
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 */
```

### 版本管理

API 版本通过以下方式管理：

1. **URL 版本**（推荐）
   ```
   /v1/project/addProject
   /v2/project/addProject
   ```

2. **Header 版本**
   ```
   Accept: application/vnd.toonflow.v1+json
   ```

3. **查询参数版本**
   ```
   /project/addProject?version=1
   ```

## 文档部署

### 部署到 GitHub Pages

```bash
# 生成静态文档
redoc-cli bundle docs/api/openapi.yaml -o docs/api/index.html

# 提交到 GitHub
git add docs/api/index.html
git commit -m "docs: update API documentation"
git push

# 在 GitHub 仓库设置中启用 GitHub Pages
# 选择 docs 目录作为源
```

访问：`https://your-username.github.io/Toonflow-app/api/`

### 部署到 Vercel

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

### 部署到 Netlify

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

## 最佳实践

### 1. 保持文档同步

- 代码变更时同步更新 OpenAPI 规范
- 使用 CI/CD 自动验证文档
- 定期审查文档准确性

### 2. 提供示例

- 为每个接口提供请求示例
- 包含常见的错误响应
- 添加使用场景说明

### 3. 版本控制

- 使用语义化版本号
- 记录 Breaking Changes
- 提供迁移指南

### 4. 安全性

- 标注需要认证的接口
- 说明权限要求
- 提供安全最佳实践

## 相关资源

- [OpenAPI 规范](https://swagger.io/specification/)
- [Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Redoc](https://redocly.com/redoc/)
- [Postman](https://www.postman.com/)

## 问题反馈

如发现文档错误或有改进建议，请：
1. 提交 Issue
2. 发送 PR
3. 联系维护者

---

**文档版本**: 1.0.7
**最后更新**: 2026-03-03
