# Toonflow API 参考文档

## 概述

Toonflow API 是基于 RESTful 风格的 HTTP API，所有接口返回 JSON 格式数据。

**基础信息**
- 基础 URL: `http://localhost:60000` (开发环境) 或 `http://your-domain:60000` (生产环境)
- 协议: HTTP/HTTPS
- 数据格式: JSON
- 字符编码: UTF-8

## 认证

### 登录获取 Token

```http
POST /other/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123",
  "captcha": "验证码"
}
```

**响应示例**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "name": "admin"
    }
  }
}
```

### 使用 Token

在后续请求的 Header 中携带 Token：

```http
Authorization: Bearer <your-token>
```

## 响应格式

所有 API 响应遵循统一格式：

```typescript
{
  "code": number,      // 状态码：200 成功，其他为错误码
  "message": string,   // 响应消息
  "data": any         // 响应数据
}
```

## API 端点

### 1. 项目管理 (Project)

#### 1.1 创建项目

```http
POST /project/addProject
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "我的短剧项目",
  "intro": "项目简介",
  "type": "短剧",
  "artStyle": "写实风格",
  "videoRatio": "16:9"
}
```

#### 1.2 获取项目列表

```http
GET /project/getProject?page=1&pageSize=10
Authorization: Bearer <token>
```

#### 1.3 获取单个项目

```http
GET /project/getSingleProject?id=1
Authorization: Bearer <token>
```

#### 1.4 更新项目

```http
POST /project/updateProject
Content-Type: application/json
Authorization: Bearer <token>

{
  "id": 1,
  "name": "更新后的项目名",
  "intro": "更新后的简介"
}
```

#### 1.5 删除项目

```http
POST /project/delProject
Content-Type: application/json
Authorization: Bearer <token>

{
  "id": 1
}
```

#### 1.6 获取项目统计

```http
GET /project/getProjectCount
Authorization: Bearer <token>
```

### 2. 小说管理 (Novel)

#### 2.1 添加小说章节

```http
POST /novel/addNovel
Content-Type: application/json
Authorization: Bearer <token>

{
  "projectId": 1,
  "chapter": "第一章",
  "chapterData": "章节内容...",
  "chapterIndex": 1,
  "reel": "卷一"
}
```

#### 2.2 获取小说列表

```http
GET /novel/getNovel?projectId=1
Authorization: Bearer <token>
```

#### 2.3 更新小说章节

```http
POST /novel/updateNovel
Content-Type: application/json
Authorization: Bearer <token>

{
  "id": 1,
  "chapter": "第一章（修订版）",
  "chapterData": "更新后的内容..."
}
```

#### 2.4 删除小说章节

```http
POST /novel/delNovel
Content-Type: application/json
Authorization: Bearer <token>

{
  "id": 1
}
```

### 3. 大纲管理 (Outline)

#### 3.1 添加大纲

```http
POST /outline/addOutline
Content-Type: application/json
Authorization: Bearer <token>

{
  "projectId": 1,
  "episode": 1,
  "data": "大纲内容..."
}
```

#### 3.2 AI 生成大纲

```http
POST /outline/agentsOutline
Content-Type: application/json
Authorization: Bearer <token>

{
  "projectId": 1,
  "novelIds": [1, 2, 3]
}
```

#### 3.3 获取大纲列表

```http
GET /outline/getOutline?projectId=1
Authorization: Bearer <token>
```

#### 3.4 获取故事线

```http
GET /outline/getStoryline?projectId=1
Authorization: Bearer <token>
```

#### 3.5 更新大纲

```http
POST /outline/updateOutline
Content-Type: application/json
Authorization: Bearer <token>

{
  "id": 1,
  "data": "更新后的大纲..."
}
```

#### 3.6 删除大纲

```http
POST /outline/delOutline
Content-Type: application/json
Authorization: Bearer <token>

{
  "id": 1
}
```

### 4. 剧本管理 (Script)

#### 4.1 生成剧本

```http
POST /script/generateScriptApi
Content-Type: application/json
Authorization: Bearer <token>

{
  "projectId": 1,
  "outlineId": 1,
  "scriptName": "第一集剧本"
}
```

#### 4.2 保存剧本

```http
POST /script/generateScriptSave
Content-Type: application/json
Authorization: Bearer <token>

{
  "projectId": 1,
  "outlineId": 1,
  "content": "剧本内容...",
  "name": "第一集"
}
```

#### 4.3 获取剧本

```http
GET /script/geScriptApi?projectId=1&outlineId=1
Authorization: Bearer <token>
```

### 5. 分镜管理 (Storyboard)

#### 5.1 生成分镜

```http
POST /storyboard/generateStoryboardApi
Content-Type: application/json
Authorization: Bearer <token>

{
  "scriptId": 1,
  "projectId": 1
}
```

#### 5.2 获取分镜列表

```http
GET /storyboard/getStoryboard?scriptId=1
Authorization: Bearer <token>
```

#### 5.3 生成分镜图片

```http
POST /storyboard/generateShotImage
Content-Type: application/json
Authorization: Bearer <token>

{
  "assetsId": 1,
  "projectId": 1
}
```

#### 5.4 批量超分图片

```http
POST /storyboard/batchSuperScoreImage
Content-Type: application/json
Authorization: Bearer <token>

{
  "assetsIds": [1, 2, 3],
  "projectId": 1
}
```

#### 5.5 生成视频提示词

```http
POST /storyboard/generateVideoPrompt
Content-Type: application/json
Authorization: Bearer <token>

{
  "assetsId": 1,
  "projectId": 1
}
```

#### 5.6 保存分镜

```http
POST /storyboard/saveStoryboard
Content-Type: application/json
Authorization: Bearer <token>

{
  "id": 1,
  "prompt": "更新后的提示词",
  "videoPrompt": "视频提示词"
}
```

#### 5.7 上传分镜图片

```http
POST /storyboard/uploadImage
Content-Type: multipart/form-data
Authorization: Bearer <token>

{
  "file": <binary>,
  "assetsId": 1
}
```

#### 5.8 删除分镜

```http
POST /storyboard/delStoryboard
Content-Type: application/json
Authorization: Bearer <token>

{
  "id": 1
}
```

#### 5.9 分镜对话

```http
POST /storyboard/chatStoryboard
Content-Type: application/json
Authorization: Bearer <token>

{
  "assetsId": 1,
  "message": "请优化这个分镜的构图"
}
```

### 6. 视频管理 (Video)

#### 6.1 生成视频

```http
POST /video/generateVideo
Content-Type: application/json
Authorization: Bearer <token>

{
  "configId": 1,
  "projectId": 1
}
```

#### 6.2 获取视频列表

```http
GET /video/getVideo?scriptId=1
Authorization: Bearer <token>
```

#### 6.3 添加视频配置

```http
POST /video/addVideoConfig
Content-Type: application/json
Authorization: Bearer <token>

{
  "projectId": 1,
  "scriptId": 1,
  "manufacturer": "sora",
  "mode": "text2video",
  "prompt": "视频提示词",
  "duration": 5,
  "resolution": "1920x1080"
}
```

#### 6.4 获取视频配置列表

```http
GET /video/getVideoConfigs?scriptId=1
Authorization: Bearer <token>
```

#### 6.5 更新视频配置

```http
POST /video/upDateVideoConfig
Content-Type: application/json
Authorization: Bearer <token>

{
  "id": 1,
  "prompt": "更新后的提示词",
  "duration": 10
}
```

#### 6.6 删除视频配置

```http
POST /video/deleteVideoConfig
Content-Type: application/json
Authorization: Bearer <token>

{
  "id": 1
}
```

#### 6.7 获取视频厂商列表

```http
GET /video/getManufacturer
Authorization: Bearer <token>
```

#### 6.8 获取视频模型列表

```http
GET /video/getVideoModel?manufacturer=sora
Authorization: Bearer <token>
```

### 7. 素材管理 (Assets)

#### 7.1 添加素材

```http
POST /assets/addAssets
Content-Type: application/json
Authorization: Bearer <token>

{
  "projectId": 1,
  "name": "素材名称",
  "type": "image",
  "filePath": "/uploads/xxx.jpg"
}
```

#### 7.2 获取素材列表

```http
GET /assets/getAssets?projectId=1&type=image
Authorization: Bearer <token>
```

#### 7.3 生成素材

```http
POST /assets/generateAssets
Content-Type: application/json
Authorization: Bearer <token>

{
  "projectId": 1,
  "prompt": "生成提示词"
}
```

#### 7.4 更新素材

```http
POST /assets/updateAssets
Content-Type: application/json
Authorization: Bearer <token>

{
  "id": 1,
  "name": "新名称",
  "prompt": "新提示词"
}
```

#### 7.5 删除素材

```http
POST /assets/delAssets
Content-Type: application/json
Authorization: Bearer <token>

{
  "id": 1
}
```

#### 7.6 润色提示词

```http
POST /assets/polishPrompt
Content-Type: application/json
Authorization: Bearer <token>

{
  "prompt": "原始提示词"
}
```

### 8. 提示词管理 (Prompt)

#### 8.1 获取提示词模板

```http
GET /prompt/getPrompts?type=script
Authorization: Bearer <token>
```

#### 8.2 更新提示词模板

```http
POST /prompt/updatePrompt
Content-Type: application/json
Authorization: Bearer <token>

{
  "code": "script_generation",
  "customValue": "自定义提示词模板..."
}
```

### 9. 系统设置 (Setting)

#### 9.1 获取系统设置

```http
GET /setting/getSetting
Authorization: Bearer <token>
```

#### 9.2 添加 AI 模型

```http
POST /setting/addModel
Content-Type: application/json
Authorization: Bearer <token>

{
  "manufacturer": "openai",
  "model": "gpt-4",
  "apiKey": "sk-xxx",
  "baseUrl": "https://api.openai.com/v1",
  "type": "text"
}
```

#### 9.3 获取 AI 模型列表

```http
GET /setting/getAiModelList?type=text
Authorization: Bearer <token>
```

#### 9.4 获取 AI 模型映射

```http
GET /setting/getAiModelMap
Authorization: Bearer <token>
```

#### 9.5 配置模型

```http
POST /setting/configurationModel
Content-Type: application/json
Authorization: Bearer <token>

{
  "key": "script_generation",
  "configId": 1
}
```

#### 9.6 更新模型

```http
POST /setting/updateModel
Content-Type: application/json
Authorization: Bearer <token>

{
  "id": 1,
  "apiKey": "new-api-key",
  "baseUrl": "https://new-api.com"
}
```

#### 9.7 删除模型

```http
POST /setting/delModel
Content-Type: application/json
Authorization: Bearer <token>

{
  "id": 1
}
```

#### 9.8 获取视频模型列表

```http
GET /setting/getVideoModelList
Authorization: Bearer <token>
```

#### 9.9 获取视频模型详情

```http
GET /setting/getVideoModelDetail?manufacturer=sora&model=sora-1.0
Authorization: Bearer <token>
```

#### 9.10 获取日志

```http
GET /setting/getLog?page=1&pageSize=50
Authorization: Bearer <token>
```

### 10. 任务管理 (Task)

#### 10.1 获取任务列表

```http
GET /task/getTaskApi?projectId=1
Authorization: Bearer <token>
```

#### 10.2 获取任务详情

```http
GET /task/taskDetails?id=1
Authorization: Bearer <token>
```

### 11. 用户管理 (User)

#### 11.1 获取用户信息

```http
GET /user/getUser
Authorization: Bearer <token>
```

#### 11.2 保存用户信息

```http
POST /user/saveUser
Content-Type: application/json
Authorization: Bearer <token>

{
  "name": "新用户名",
  "password": "新密码"
}
```

### 12. 其他接口 (Other)

#### 12.1 获取验证码

```http
GET /other/getCaptcha
```

**响应示例**
```json
{
  "code": 200,
  "data": {
    "captcha": "data:image/svg+xml;base64,..."
  }
}
```

#### 12.2 测试 AI 模型

```http
POST /other/testAI
Content-Type: application/json
Authorization: Bearer <token>

{
  "configId": 1,
  "prompt": "测试提示词"
}
```

#### 12.3 测试图片生成

```http
POST /other/testImage
Content-Type: application/json
Authorization: Bearer <token>

{
  "manufacturer": "openai",
  "model": "dall-e-3",
  "prompt": "测试图片生成"
}
```

#### 12.4 测试视频生成

```http
POST /other/testVideo
Content-Type: application/json
Authorization: Bearer <token>

{
  "manufacturer": "sora",
  "model": "sora-1.0",
  "prompt": "测试视频生成"
}
```

#### 12.5 清空数据库

```http
POST /other/clearDatabase
Authorization: Bearer <token>
```

#### 12.6 删除所有数据

```http
POST /other/deleteAllData
Authorization: Bearer <token>
```

## 错误码

| 错误码 | 说明 |
|--------|------|
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，Token 无效或过期 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 数据模型

### Project (项目)

```typescript
{
  id: number;
  name: string;           // 项目名称
  intro: string;          // 项目简介
  type: string;           // 项目类型
  artStyle: string;       // 艺术风格
  videoRatio: string;     // 视频比例
  userId: number;         // 用户ID
  createTime: number;     // 创建时间
}
```

### Novel (小说)

```typescript
{
  id: number;
  projectId: number;      // 项目ID
  chapter: string;        // 章节名
  chapterData: string;    // 章节内容
  chapterIndex: number;   // 章节索引
  reel: string;           // 卷名
  createTime: number;     // 创建时间
}
```

### Outline (大纲)

```typescript
{
  id: number;
  projectId: number;      // 项目ID
  episode: number;        // 集数
  data: string;           // 大纲内容
}
```

### Script (剧本)

```typescript
{
  id: number;
  projectId: number;      // 项目ID
  outlineId: number;      // 大纲ID
  name: string;           // 剧本名称
  content: string;        // 剧本内容
}
```

### Assets (素材)

```typescript
{
  id: number;
  projectId: number;      // 项目ID
  scriptId: number;       // 剧本ID
  name: string;           // 素材名称
  type: string;           // 素材类型
  filePath: string;       // 文件路径
  prompt: string;         // 生成提示词
  videoPrompt: string;    // 视频提示词
  state: string;          // 状态
  episode: string;        // 集数
  shotIndex: number;      // 镜头索引
  duration: string;       // 时长
  intro: string;          // 简介
  remark: string;         // 备注
}
```

### Video (视频)

```typescript
{
  id: number;
  scriptId: number;       // 剧本ID
  configId: number;       // 配置ID
  aiConfigId: number;     // AI配置ID
  model: string;          // 模型名称
  prompt: string;         // 提示词
  filePath: string;       // 文件路径
  firstFrame: string;     // 首帧图片
  storyboardImgs: string; // 分镜图片
  resolution: string;     // 分辨率
  state: number;          // 状态
  time: number;           // 生成时间
  errorReason: string;    // 错误原因
}
```

## 使用示例

### 完整工作流示例

```javascript
// 1. 登录获取 Token
const loginRes = await fetch('http://localhost:60000/other/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123',
    captcha: '1234'
  })
});
const { data: { token } } = await loginRes.json();

// 2. 创建项目
const projectRes = await fetch('http://localhost:60000/project/addProject', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: '我的短剧',
    intro: '一个精彩的故事',
    type: '短剧',
    artStyle: '写实',
    videoRatio: '16:9'
  })
});
const { data: project } = await projectRes.json();

// 3. 添加小说章节
const novelRes = await fetch('http://localhost:60000/novel/addNovel', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    projectId: project.id,
    chapter: '第一章',
    chapterData: '故事内容...',
    chapterIndex: 1
  })
});

// 4. 生成大纲
const outlineRes = await fetch('http://localhost:60000/outline/agentsOutline', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    projectId: project.id,
    novelIds: [1]
  })
});

// 5. 生成剧本
const scriptRes = await fetch('http://localhost:60000/script/generateScriptApi', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    projectId: project.id,
    outlineId: 1,
    scriptName: '第一集'
  })
});

// 6. 生成分镜
const storyboardRes = await fetch('http://localhost:60000/storyboard/generateStoryboardApi', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    scriptId: 1,
    projectId: project.id
  })
});

// 7. 生成视频
const videoRes = await fetch('http://localhost:60000/video/generateVideo', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    configId: 1,
    projectId: project.id
  })
});
```

## 注意事项

1. 所有需要认证的接口必须在 Header 中携带有效的 Token
2. Token 有效期为 24 小时，过期后需要重新登录
3. 文件上传接口使用 `multipart/form-data` 格式
4. AI 生成类接口可能需要较长时间，建议使用异步方式处理
5. 批量操作接口有数量限制，建议单次不超过 100 条
6. 删除操作不可恢复，请谨慎使用

## 更新日志

### v1.0.7 (2026-03-03)
- 移除 Electron 依赖，转为纯 Web 服务
- 优化 API 响应速度
- 修复已知问题

### v1.0.6
- 新增批量超分图片接口
- 优化视频生成流程
- 修复分镜生成问题

## 技术支持

如有问题，请联系：
- 邮箱: ltlctools@outlook.com
- GitHub: https://github.com/HBAI-Ltd/Toonflow-app/issues
