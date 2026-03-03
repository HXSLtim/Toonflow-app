# Toonflow 新功能 API 文档

## 1. 多格式文本支持

### 1.1 文本格式识别
**接口**: `POST /format/detectFormat`

自动识别文本格式类型（小说、剧本、漫画脚本、游戏对话）

**请求参数**:
```json
{
  "text": "要识别的文本内容"
}
```

**响应示例**:
```json
{
  "format": "screenplay",
  "confidence": 0.95,
  "features": ["包含场景标注", "人物对白格式", "动作描述"],
  "suggestion": "建议使用剧本解析模式"
}
```

### 1.2 文本格式解析
**接口**: `POST /format/parseFormat`

解析不同格式的文本为结构化数据

**请求参数**:
```json
{
  "text": "文本内容",
  "format": "novel|screenplay|comic|game|auto",
  "projectId": 1
}
```

**响应示例**:
```json
{
  "novelId": 123,
  "format": "screenplay",
  "data": {
    "title": "第一幕",
    "characters": [
      {"name": "张三", "description": "主角"}
    ],
    "scenes": [
      {"name": "咖啡厅", "description": "温馨的下午"}
    ],
    "dialogues": [
      {"character": "张三", "text": "你好", "scene": "咖啡厅"}
    ],
    "actions": [
      {"description": "张三走进咖啡厅", "scene": "咖啡厅"}
    ]
  }
}
```

### 1.3 格式转换
**接口**: `POST /format/convertFormat`

将文本从一种格式转换为另一种格式

**请求参数**:
```json
{
  "novelId": 123,
  "targetFormat": "novel|screenplay|comic|game"
}
```

**响应示例**:
```json
{
  "novelId": 124,
  "format": "screenplay",
  "content": "转换后的文本内容"
}
```

---

## 2. 批量处理功能

### 2.1 创建批量任务
**接口**: `POST /batch/createBatchTask`

创建批量处理任务（剧本、分镜、图片、视频生成）

**请求参数**:
```json
{
  "projectId": 1,
  "taskType": "script|storyboard|image|video",
  "items": [1, 2, 3],
  "priority": 5,
  "config": {
    "customOption": "value"
  }
}
```

**响应示例**:
```json
{
  "batchTaskId": 456,
  "message": "批量任务已创建，正在后台处理"
}
```

### 2.2 查询批量任务状态
**接口**: `GET /batch/getBatchTaskStatus?batchTaskId=456`

查询批量任务的执行进度

**响应示例**:
```json
{
  "taskId": 456,
  "name": "批量script生成",
  "state": "processing",
  "startTime": "2026-03-03T10:00:00Z",
  "endTime": null,
  "progress": 60,
  "totalCount": 10,
  "completedCount": 6,
  "failedCount": 1,
  "taskType": "script"
}
```

### 2.3 取消批量任务
**接口**: `POST /batch/cancelBatchTask`

取消正在执行的批量任务

**请求参数**:
```json
{
  "batchTaskId": 456
}
```

**响应示例**:
```json
{
  "message": "任务已取消"
}
```

---

## 3. 角色服化道管理

### 3.1 添加服化道
**接口**: `POST /costume/addCostume`

为角色添加服装、化妆或道具

**请求参数**:
```json
{
  "projectId": 1,
  "characterId": 10,
  "type": "costume|makeup|prop",
  "name": "正式西装",
  "description": "黑色三件套西装，适合商务场合",
  "imageBase64": "data:image/jpeg;base64,...",
  "episodes": [1, 2, 5],
  "tags": ["正式", "商务"]
}
```

**响应示例**:
```json
{
  "costumeId": 789,
  "imagePath": "http://example.com/uploads/costume.jpg"
}
```

### 3.2 获取服化道列表
**接口**: `GET /costume/getCostumes`

查询角色的服化道列表

**请求参数**:
```
?projectId=1&characterId=10&type=costume&episode=1
```

**响应示例**:
```json
[
  {
    "id": 789,
    "name": "正式西装",
    "description": "黑色三件套西装",
    "type": "服装",
    "imagePath": "http://example.com/uploads/costume.jpg",
    "characterId": 10,
    "episodes": [1, 2, 5],
    "tags": ["正式", "商务"]
  }
]
```

### 3.3 自动生成着装方案
**接口**: `POST /costume/generateCostume`

根据剧本场景自动为角色生成着装方案

**请求参数**:
```json
{
  "projectId": 1,
  "characterId": 10,
  "scriptId": 20,
  "scene": "商务谈判",
  "mood": "严肃、专业"
}
```

**响应示例**:
```json
{
  "design": {
    "costume": {
      "useExisting": true,
      "existingId": 789
    },
    "makeup": {
      "name": "职业妆容",
      "description": "淡妆，强调专业感"
    },
    "props": [
      {
        "name": "公文包",
        "description": "黑色皮质公文包"
      }
    ],
    "reasoning": "商务场合需要正式着装"
  },
  "costumeImagePath": null
}
```

### 3.4 检查服化道一致性
**接口**: `POST /costume/checkConsistency`

检查剧本中的服化道描述与库中是否一致

**请求参数**:
```json
{
  "projectId": 1,
  "scriptId": 20,
  "characterId": 10
}
```

**响应示例**:
```json
{
  "consistent": false,
  "issues": [
    {
      "type": "服装",
      "description": "剧本中提到红色礼服，但库中没有",
      "suggestion": "建议添加红色礼服到服化道库"
    }
  ],
  "missing": [
    {
      "type": "道具",
      "description": "剧本中提到的手机"
    }
  ],
  "existingCostumes": [
    {
      "name": "正式西装",
      "type": "服装",
      "description": "黑色三件套西装"
    }
  ]
}
```

### 3.5 更新服化道
**接口**: `POST /costume/updateCostume`

更新服化道信息

**请求参数**:
```json
{
  "costumeId": 789,
  "name": "更新后的名称",
  "description": "更新后的描述",
  "episodes": [1, 2, 3, 5],
  "tags": ["正式", "商务", "重要场合"]
}
```

### 3.6 删除服化道
**接口**: `POST /costume/deleteCostume`

删除服化道记录

**请求参数**:
```json
{
  "costumeId": 789
}
```

---

## 使用场景示例

### 场景1: 导入剧本并自动解析
```javascript
// 1. 识别格式
const detectResult = await fetch('/format/detectFormat', {
  method: 'POST',
  body: JSON.stringify({ text: scriptText })
});

// 2. 解析文本
const parseResult = await fetch('/format/parseFormat', {
  method: 'POST',
  body: JSON.stringify({
    text: scriptText,
    format: detectResult.format,
    projectId: 1
  })
});
```

### 场景2: 批量生成多章节剧本
```javascript
// 创建批量任务
const batchTask = await fetch('/batch/createBatchTask', {
  method: 'POST',
  body: JSON.stringify({
    projectId: 1,
    taskType: 'script',
    items: [1, 2, 3, 4, 5], // 章节ID
    priority: 8
  })
});

// 轮询任务状态
const checkStatus = setInterval(async () => {
  const status = await fetch(`/batch/getBatchTaskStatus?batchTaskId=${batchTask.batchTaskId}`);
  if (status.state === 'completed') {
    clearInterval(checkStatus);
    console.log('批量任务完成');
  }
}, 5000);
```

### 场景3: 角色服化道管理流程
```javascript
// 1. 为角色添加服装
const costume = await fetch('/costume/addCostume', {
  method: 'POST',
  body: JSON.stringify({
    projectId: 1,
    characterId: 10,
    type: 'costume',
    name: '正式西装',
    description: '黑色三件套',
    tags: ['正式']
  })
});

// 2. 检查剧本一致性
const consistency = await fetch('/costume/checkConsistency', {
  method: 'POST',
  body: JSON.stringify({
    projectId: 1,
    scriptId: 20,
    characterId: 10
  })
});

// 3. 如果不一致，自动生成新的着装方案
if (!consistency.consistent) {
  const generated = await fetch('/costume/generateCostume', {
    method: 'POST',
    body: JSON.stringify({
      projectId: 1,
      characterId: 10,
      scriptId: 20,
      scene: '商务会议'
    })
  });
}
```

---

## 注意事项

1. 所有接口都需要在请求头中包含认证信息
2. 批量任务会在后台异步执行，建议使用轮询或WebSocket获取实时进度
3. 服化道图片生成依赖AI模型配置，请确保已正确配置图片生成模型
4. 格式转换和解析依赖AI文本模型，转换质量取决于模型能力
5. 建议在生产环境中对批量任务设置合理的并发限制
