# 性能优化审计报告

**审计日期:** 2026-03-02
**审计人员:** Performance Specialist

## 执行摘要

审计发现 Toonflow 项目存在多个性能瓶颈，主要集中在图片处理、AI 调用和数据库查询方面。最严重的问题是图片分割时的重复解码（P1）和缺少 AI 调用超时机制（P1），可能导致内存溢出和请求挂起。建议优先修复 P1 问题以提升系统稳定性和响应速度。

## 发现的问题

### P0 - 严重问题（性能崩溃、内存泄漏）

无

### P1 - 高优先级问题（明显的性能瓶颈）

#### 1. **图片分割时重复解码导致内存浪费**
- **文件位置:** src/agents/storyboard/imageSplitting.ts:80-88
- **性能影响:** 每次分割都重新解码整张图片，对于 N 格宫格图需要解码 N 次，内存占用和 CPU 时间呈线性增长
- **修复建议:**
  ```typescript
  // 在循环外预先解码一次
  const imageData = await sharp(image).raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < length; i++) {
    // 使用预解码的数据进行裁剪
    const cellBuffer = await sharp(imageData.data, {
      raw: {
        width: imageData.info.width,
        height: imageData.info.height,
        channels: imageData.info.channels
      }
    })
    .extract({ left, top, width: cellWidth, height: cellHeight })
    .png()
    .toBuffer();
  }
  ```

#### 2. **图片压缩循环中的重复操作**
- **文件位置:** src/agents/storyboard/generateImageTool.ts:40-63
- **性能影响:** 每次压缩都重新调用 sharp(buffer)，对于大图片可能需要多次迭代，每次都重新解析
- **修复建议:** 缓存 sharp 实例和 metadata，避免重复解析

#### 3. **AI 调用缺少超时机制**
- **文件位置:** src/agents/outlineScript/index.ts:633-641, src/agents/storyboard/index.ts:626-634
- **性能影响:** AI 流式调用设置 maxStep: 100 但没有时间超时，可能导致请求长时间挂起
- **修复建议:**
  ```typescript
  const { fullStream } = await Promise.race([
    u.ai.text.stream({ /* ... */ }, promptConfig),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI调用超时')), 300000) // 5分钟超时
    )
  ]);
  ```

#### 4. **数据库查询缺少索引优化**
- **文件位置:** src/agents/storyboard/generateImageTool.ts:274
- **性能影响:** `whereIn("name", resourceNames).andWhere({ projectId })` 查询可能缺少复合索引
- **修复建议:** 在 t_assets 表上创建 (projectId, name) 复合索引

#### 5. **并发图片生成缺少限流**
- **文件位置:** src/agents/storyboard/index.ts:419
- **性能影响:** `Promise.all(shotIds.map(...))` 无限制并发可能导致内存溢出和 API 限流
- **修复建议:** 使用 p-limit 或自定义并发控制，限制同时生成 2-3 个分镜

### P2 - 中优先级问题（可优化的地方）

#### 1. **图片合并时的内存占用**
- **文件位置:** src/agents/storyboard/generateImageTool.ts:67-103
- **性能影响:** 所有图片同时加载到内存中进行合并
- **修复建议:** 使用流式处理或分批合并

#### 2. **AI 过滤资产的额外调用**
- **文件位置:** src/agents/storyboard/generateImageTool.ts:194-244
- **性能影响:** 每次生成图片都调用 AI 过滤资产，增加延迟和成本
- **修复建议:** 实现资产过滤结果缓存（基于 prompts hash）

#### 3. **数据库查询未使用连接池优化**
- **文件位置:** 全局 u.db() 调用
- **性能影响:** 频繁的数据库查询可能受限于连接池配置
- **修复建议:** 检查 knex 连接池配置，建议 pool: { min: 2, max: 10 }

#### 4. **图片压缩算法选择**
- **文件位置:** src/agents/storyboard/generateImageTool.ts:45-49
- **性能影响:** 使用 JPEG 压缩但质量递减步长为 10，可能过于激进
- **修复建议:** 使用二分查找优化质量参数，减少压缩次数

#### 5. **EventEmitter 事件监听器泄漏风险**
- **文件位置:** src/agents/outlineScript/index.ts:76, src/agents/storyboard/index.ts:53
- **性能影响:** 长时间运行可能累积事件监听器
- **修复建议:** 在 Agent 销毁时调用 emitter.removeAllListeners()

### P3 - 低优先级问题（微优化）

#### 1. **JSON 序列化/反序列化频繁**
- **文件位置:** src/agents/outlineScript/index.ts:267, 309
- **性能影响:** 大纲数据频繁 JSON.parse/stringify
- **修复建议:** 考虑在内存中缓存解析后的对象

#### 2. **数组操作可优化**
- **文件位置:** src/agents/storyboard/generateImageTool.ts:277-281
- **性能影响:** 多次数组遍历和排序
- **修复建议:** 合并为单次遍历

#### 3. **日志输出性能**
- **文件位置:** src/agents/outlineScript/index.ts:103-106
- **性能影响:** 频繁的 console.log 在生产环境可能影响性能
- **修复建议:** 使用日志级别控制，生产环境禁用 debug 日志

#### 4. **UUID 生成方式**
- **文件位置:** src/agents/storyboard/index.ts:260, 306, 479
- **性能影响:** 频繁调用 u.uuid() 可能有性能开销
- **修复建议:** 如果使用 uuid v4，考虑批量生成或使用更快的实现

## 性能基准

基于代码分析的性能估算：

- **AI 调用延迟:** 5-30 秒/次（取决于模型和 token 数）
- **图片生成:** 10-60 秒/张（取决于分辨率和模型）
- **图片分割:** 当前 N×解码时间，优化后可减少 80-90%
- **图片压缩:** 2-10 秒/张（取决于原始大小）
- **数据库查询:** <100ms（假设有索引）
- **内存占用:** 图片处理峰值可能达到 500MB-2GB（取决于并发数）

## 优化建议

### 短期优化（1-2 周）
1. 修复图片分割重复解码问题（预计性能提升 80%）
2. 添加 AI 调用超时机制
3. 实现并发限流控制
4. 优化数据库索引

### 中期优化（1 个月）
1. 实现资产过滤结果缓存
2. 优化图片压缩算法
3. 添加性能监控和日志
4. 实现内存使用监控

### 长期优化（3 个月）
1. 考虑引入 Redis 缓存层
2. 实现图片处理队列系统
3. 优化 AI 调用批处理策略
4. 实现分布式任务调度

## 监控建议

建议添加以下性能指标监控：
- AI 调用响应时间和成功率
- 图片处理时间分布
- 内存使用峰值和平均值
- 数据库查询慢查询日志
- 并发任务数和队列长度
