# API Services

完整的类型安全 API 服务层，用于与后端 API 通信。

## 安装依赖

```bash
npm install axios
```

## 使用方法

### 1. 认证服务

```typescript
import { authService } from '@/services';

// 登录
const { token, user } = await authService.login({
  name: 'username',
  password: 'password'
});

// 注册
const result = await authService.register({
  name: 'newuser',
  password: 'password'
});

// 获取当前用户
const currentUser = await authService.getCurrentUser();

// 登出
authService.logout();

// 检查是否已认证
const isAuth = authService.isAuthenticated();
```

### 2. 项目管理

```typescript
import { projectService } from '@/services';

// 获取项目列表（分页）
const { items, total } = await projectService.getProjects({ page: 1, pageSize: 10 });

// 获取单个项目
const project = await projectService.getProject(1);

// 创建项目
const newProject = await projectService.createProject({
  name: '新项目',
  type: 'animation',
  intro: '项目简介',
  artStyle: '动漫风格',
  videoRatio: '16:9'
});

// 更新项目
const updated = await projectService.updateProject(1, { name: '更新后的名称' });

// 删除项目
await projectService.deleteProject(1);
```

### 3. 剧本管理

```typescript
import { scriptService } from '@/services';

// 获取项目的所有剧本
const scripts = await scriptService.getScripts(projectId);

// 创建剧本
const script = await scriptService.createScript({
  projectId: 1,
  name: '第一集',
  content: '剧本内容...',
  outlineId: 1
});

// 更新剧本
await scriptService.updateScript(scriptId, { content: '新内容' });

// 大纲管理
const outlines = await scriptService.getOutlines(projectId);
const outline = await scriptService.createOutline({
  projectId: 1,
  episode: 1,
  data: '大纲数据'
});

// 小说管理
const novels = await scriptService.getNovels(projectId);

// 故事线管理
const storylines = await scriptService.getStorylines(projectId);
```

### 4. 分镜管理

```typescript
import { storyboardService } from '@/services';

// 获取项目的所有分镜图片
const images = await storyboardService.getImages(projectId);

// 获取剧本的分镜图片
const scriptImages = await storyboardService.getImagesByScript(scriptId);

// 生成分镜
const generatedImages = await storyboardService.generateStoryboard(scriptId, {
  style: 'anime',
  resolution: '1920x1080'
});

// 创建分镜图片
const image = await storyboardService.createImage({
  projectId: 1,
  scriptId: 1,
  filePath: '/path/to/image.png',
  type: 'storyboard',
  state: 'completed'
});
```

### 5. 视频管理

```typescript
import { videoService } from '@/services';

// 获取项目的所有视频
const videos = await videoService.getVideos(projectId);

// 生成视频
const video = await videoService.generateVideo(scriptId, {
  projectId: 1,
  scriptId: 1,
  prompt: '视频生成提示词',
  resolution: '1920x1080',
  duration: 10,
  mode: 'auto'
});

// 获取视频生成状态
const { state, progress } = await videoService.getVideoStatus(videoId);

// 视频配置管理
const configs = await videoService.getVideoConfigs(projectId);
const config = await videoService.createVideoConfig({
  projectId: 1,
  scriptId: 1,
  prompt: '配置提示词',
  resolution: '1920x1080',
  duration: 10
});
```

### 6. 资源管理

```typescript
import { assetsService } from '@/services';

// 获取项目资源
const assets = await assetsService.getAssets(projectId);

// 上传资源
const file = document.querySelector('input[type="file"]').files[0];
const asset = await assetsService.uploadAsset(projectId, file, {
  name: '资源名称',
  type: 'image',
  episode: '1'
});

// 下载资源
const blob = await assetsService.downloadAsset(assetId);
const url = URL.createObjectURL(blob);
window.open(url);

// 更新资源
await assetsService.updateAsset(assetId, { state: 'completed' });
```

### 7. 配置管理

```typescript
import { configService } from '@/services';

// 获取用户的所有配置
const configs = await configService.getConfigs(userId);

// 创建 AI 配置
const config = await configService.createConfig({
  userId: 1,
  type: 'image',
  manufacturer: 'openai',
  model: 'dall-e-3',
  apiKey: 'sk-...',
  baseUrl: 'https://api.openai.com'
});

// 测试配置
const { success, message } = await configService.testConfig(configId);
```

## 错误处理

所有 API 调用都会自动处理错误：

```typescript
try {
  const project = await projectService.getProject(1);
} catch (error) {
  console.error('API Error:', error.message);
  console.error('Status:', error.status);
}
```

## 自动功能

- **JWT Token 管理**：自动存储在 localStorage，自动添加到请求头
- **401 处理**：自动清除 token 并跳转到登录页
- **自动重试**：网络错误和 5xx 错误自动重试（最多 3 次）
- **类型安全**：完整的 TypeScript 类型支持

## 配置

默认配置：
- Base URL: `http://localhost:60000`
- Timeout: 30 秒
- 最大重试次数: 3 次
- 重试延迟: 1 秒（指数退避）

修改配置请编辑 `src/services/http.ts`。
