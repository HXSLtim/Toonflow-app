# Electron 移除与 shadcn/ui + Tailwind CSS 重构设计文档

> ℹ️ 历史方案归档：本文记录迁移设计过程。当前落地方案已完成纯 Web 迁移，前端技术栈为 React + shadcn/ui + Tailwind CSS（非文中早期 Vue 方案）。

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**目标：** 将 Toonflow 从 Electron 桌面应用转换为纯 Web 应用，使用 shadcn-vue + Tailwind CSS 重构前端 UI，保持所有现有功能完全一致。

**架构：** 后端完全移除 Electron 依赖，保留纯 Express + WebSocket 服务；前端使用 shadcn-vue 基础组件 + 手写业务组件，完全移除旧 UI 库。

**技术栈：**
- 后端：Express 5 + SQLite + WebSocket + AI SDK
- 前端：Vue 3 + Vite + shadcn-vue + Tailwind CSS + TypeScript + Pinia + Vue Router

---

## 第一阶段：后端 Electron 移除

### 目标
完全移除 Electron 依赖，将后端转换为纯 Web 服务，用户通过浏览器访问。

### 改造范围

**删除文件：**
- `scripts/main.ts` - Electron 主进程入口
- `scripts/web/index.html` - Electron 内嵌的 HTML（不再需要）
- `electron-builder.yml` - 打包配置（如果存在）

**修改 package.json：**
- 移除依赖：`electron`, `electron-builder`, `electronmon`
- 移除脚本：`dev:gui`, `pack`, `dist`, `dist:win`, `dist:mac`, `dist:linux`
- 保留脚本：`dev`, `build`, `test`

**修改 src/app.ts：**
- 移除 Electron 相关的端口动态分配逻辑
- 固定使用端口 60000
- 确保服务启动后输出访问地址

### 验证标准
- 运行 `yarn dev` 后端成功启动在 60000 端口
- 无 Electron 相关依赖残留
- 服务可通过浏览器访问 `http://localhost:60000`

---

## 第二阶段：前端 Tailwind CSS + shadcn-vue 初始化

### 目标
在现有 Vue 3 项目中引入 Tailwind CSS 和 shadcn-vue，建立新的样式和组件基础。

### 安装依赖

```bash
cd C:\Users\a2778\Desktop\Code\Toonflow-web
yarn add -D tailwindcss postcss autoprefixer
yarn add -D @tailwindcss/typography @tailwindcss/forms
yarn add -D class-variance-authority clsx tailwind-merge
yarn add radix-vue
yarn add shadcn-vue
```

### 配置 Tailwind CSS

**创建 tailwind.config.js：**
```js
/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#9810fa",
          light: "#faf5ff",
          hover: "#7c0dd4",
          active: "#6a0bb5",
        },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
}
```

**创建 postcss.config.js：**
```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

**修改 src/assets/main.css：**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --primary: 270 100% 52%;
    --primary-foreground: 0 0% 100%;
  }
}
```

### 初始化 shadcn-vue

```bash
npx shadcn-vue@latest init
```

配置选项：
- TypeScript: Yes
- Style: Default
- Base color: Violet (匹配 #9810fa)
- CSS variables: Yes
- Tailwind config: tailwind.config.js
- Components directory: src/components/ui
- Utils directory: src/lib/utils

### 验证标准
- Tailwind CSS 样式生效
- shadcn-vue 组件可正常导入使用
- 开发服务器正常运行

---

## 第三阶段：组件迁移策略

### 迁移优先级

**P0 - 基础组件（shadcn-vue）：**
1. Button - 按钮
2. Input - 输入框
3. Select - 下拉选择
4. Dialog - 对话框
5. Card - 卡片
6. Table - 表格
7. Form - 表单
8. Tabs - 标签页
9. Dropdown - 下拉菜单
10. Toast - 提示消息

**P1 - 布局组件（手写）：**
1. Layout - 主布局（侧边栏 + 内容区）
2. Sidebar - 侧边导航
3. Header - 顶部导航
4. PageContainer - 页面容器

**P2 - 业务组件（手写）：**
1. StoryboardEditor - 分镜编辑器（核心）
2. DraggableCanvas - 可拖拽画布
3. ImageSelector - 图片选择器
4. VideoConfigForm - 视频配置表单
5. ChatMessage - 聊天消息
6. ProjectCard - 项目卡片

### 迁移流程

**每个组件的迁移步骤：**
1. 安装 shadcn-vue 组件（如果是基础组件）
2. 创建新组件文件（保持原路径）
3. 使用 Tailwind CSS 重写样式
4. 保持 props、emits、逻辑完全一致
5. 更新父组件引用
6. 测试功能完整性
7. 删除旧组件代码

**示例 - Button 迁移：**

```bash
# 安装 shadcn-vue button
npx shadcn-vue@latest add button
```

```vue
<!-- 旧代码 (Ant Design Vue) -->
<a-button type="primary" @click="handleClick">
  {{ text }}
</a-button>

<!-- 新代码 (shadcn-vue) -->
<Button variant="default" @click="handleClick">
  {{ text }}
</Button>
```

### 验证标准
- 每个迁移的组件功能与原组件完全一致
- 样式符合新设计系统
- 无旧 UI 库依赖残留

---

## 第四阶段：页面级重构

### 重构顺序

**阶段 4.1 - 认证页面：**
- `/login` - 登录页
- 使用 shadcn-vue Form + Input + Button

**阶段 4.2 - 项目管理：**
- `/project` - 项目列表
- `/project/:id` - 项目详情
- 使用 shadcn-vue Card + Table + Dialog

**阶段 4.3 - 核心功能页：**
- 原文管理 - `/project/:id/novel`
- 大纲管理 - `/project/:id/outline`
- 分镜管理 - `/project/:id/script`
- 素材管理 - `/project/:id/assets`
- 视频管理 - `/project/:id/video`

**阶段 4.4 - 设置页面：**
- `/setting` - 系统设置
- AI 配置、主题配置、其他配置

### 每个页面的重构步骤

1. 读取原页面代码，理解功能和交互
2. 使用新组件重写模板
3. 保持所有功能逻辑不变
4. 使用 Tailwind CSS 重写样式
5. 测试所有交互和 API 调用
6. 提交代码

### 验证标准
- 所有页面功能与原页面完全一致
- 所有 API 调用正常
- 所有交互流程正常
- 响应式布局正常

---

## 第五阶段：清理与优化

### 清理旧依赖

**从 package.json 移除：**
- `ant-design-vue`
- `element-plus`
- `tdesign-vue-next`
- `vue-devui`
- `@devui-design/icons`
- `unplugin-auto-import`（如果只用于旧 UI 库）
- `unplugin-vue-components`（如果只用于旧 UI 库）

**清理配置文件：**
- 移除 `vite.config.ts` 中的旧 UI 库 resolver
- 清理 `src/types/auto-imports.d.ts`
- 清理 `src/types/components.d.ts`

### 样式优化

**统一设计系统：**
- 定义 Tailwind 主题色（基于 #9810fa）
- 定义间距、圆角、阴影等设计 token
- 统一字体、字号、行高

**性能优化：**
- 移除未使用的 CSS
- 优化 Tailwind 构建配置
- 启用 PurgeCSS

### 验证标准
- 无旧 UI 库依赖残留
- 构建产物体积减小
- 页面加载速度提升
- 样式一致性良好

---

## 第六阶段：测试与部署

### 功能测试清单

**核心工作流：**
- [ ] 用户登录/登出
- [ ] 创建项目
- [ ] 导入小说
- [ ] 生成大纲
- [ ] 生成分镜
- [ ] 编辑分镜（拖拽、裁剪、替换图片）
- [ ] 生成视频
- [ ] 下载视频

**配置功能：**
- [ ] AI 模型配置
- [ ] 视频模型配置
- [ ] 主题切换
- [ ] 提示词编辑

**边界情况：**
- [ ] 网络错误处理
- [ ] 超时处理
- [ ] 大文件上传
- [ ] 并发请求

### 部署准备

**后端部署：**
```bash
cd C:\Users\a2778\Desktop\Code\Toonflow-app
yarn build
node build/app.js
```

**前端部署：**
```bash
cd C:\Users\a2778\Desktop\Code\Toonflow-web
yarn build
# 将 dist 目录部署到静态服务器或 CDN
```

**Docker 部署（可选）：**
- 更新 `docker/docker-compose.yml`
- 移除 Electron 相关配置
- 添加前端静态文件服务

### 验证标准
- 所有功能测试通过
- 生产构建成功
- 部署后可正常访问和使用

---

## 风险与缓解

**风险 1：组件迁移工作量大**
- 缓解：优先迁移高频使用的基础组件，复用 shadcn-vue
- 缓解：使用脚本批量替换简单组件

**风险 2：样式不一致**
- 缓解：建立设计系统文档，统一 Tailwind 配置
- 缓解：每个组件迁移后立即视觉验收

**风险 3：功能遗漏**
- 缓解：建立详细的功能测试清单
- 缓解：每个页面迁移后完整测试工作流

**风险 4：性能下降**
- 缓解：使用 Vite 的代码分割和懒加载
- 缓解：优化 Tailwind 构建配置

---

## 时间估算

- 第一阶段（后端 Electron 移除）：0.5 天
- 第二阶段（Tailwind + shadcn-vue 初始化）：0.5 天
- 第三阶段（组件迁移）：3-4 天
- 第四阶段（页面重构）：4-5 天
- 第五阶段（清理优化）：1 天
- 第六阶段（测试部署）：1-2 天

**总计：10-13 天**

---

## 成功标准

1. ✅ 后端无 Electron 依赖，可独立运行
2. ✅ 前端无旧 UI 库依赖
3. ✅ 所有现有功能完全保留
4. ✅ 样式统一，符合新设计系统
5. ✅ 构建产物体积减小 30%+
6. ✅ 页面加载速度提升 20%+
7. ✅ 所有功能测试通过
8. ✅ 可通过浏览器正常访问和使用
