# Toonflow 前后端分离目录

本分支已迁移为目录分离结构：

```text
.
├─ api/         # Express + TypeScript 后端
├─ web/         # React + Vite 前端
├─ docker/      # 容器部署配置
├─ docs/
└─ package.json # 根工作区脚本入口
```

## 常用命令

- 启动后端：`npm run dev:api`
- 启动前端：`npm run dev:web`
- 全量 lint：`npm run lint`
- 全量 build：`npm run build`
- 后端测试：`npm run test`

## 兼容说明

- 后端原 `src/` 已迁移到 `api/src/`
- 前端原 `app/` 已迁移到 `web/`
- 后端构建与测试配置已跟随迁移到 `api/` 目录
