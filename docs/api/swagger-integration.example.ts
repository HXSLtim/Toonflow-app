// Swagger UI 集成示例
// 在 src/app.ts 中添加以下代码

import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

// 加载 OpenAPI 规范
const swaggerDocument = YAML.load(path.join(__dirname, '../docs/api/openapi.yaml'));

// Swagger UI 配置
const swaggerOptions = {
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 20px 0 }
    .swagger-ui .scheme-container { background: #fafafa; padding: 20px }
  `,
  customSiteTitle: 'Toonflow API 文档',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    syntaxHighlight: {
      activate: true,
      theme: 'monokai'
    }
  }
};

// 注册 Swagger UI 路由
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerDocument, swaggerOptions));

// 提供 OpenAPI JSON 端点
app.get('/api/openapi.json', (req, res) => {
  res.json(swaggerDocument);
});

// 提供 OpenAPI YAML 端点
app.get('/api/openapi.yaml', (req, res) => {
  res.type('text/yaml');
  res.send(YAML.stringify(swaggerDocument, 10));
});

console.log('API 文档已启用: http://localhost:60000/api-docs');
