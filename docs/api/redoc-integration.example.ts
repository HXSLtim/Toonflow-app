// Redoc 集成示例
// 在 src/app.ts 中添加以下代码

import { serve, setup } from 'redoc-express';
import path from 'path';

// Redoc 配置
const redocOptions = {
  title: 'Toonflow API 文档',
  specUrl: '/api/openapi.yaml',
  redocOptions: {
    theme: {
      colors: {
        primary: {
          main: '#3b82f6'
        }
      },
      typography: {
        fontSize: '14px',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }
    },
    hideDownloadButton: false,
    disableSearch: false,
    hideHostname: false,
    expandResponses: '200,201',
    requiredPropsFirst: true,
    sortPropsAlphabetically: true,
    showExtensions: true,
    nativeScrollbars: false,
    pathInMiddlePanel: false,
    untrustedSpec: false,
    hideLoading: false,
    jsonSampleExpandLevel: 2
  }
};

// 注册 Redoc 路由
app.get('/docs', serve, setup(redocOptions));

console.log('API 文档已启用: http://localhost:60000/docs');
