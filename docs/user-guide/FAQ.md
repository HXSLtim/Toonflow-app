# Toonflow 常见问题解答 (FAQ)

本文档收集了用户在使用 Toonflow 过程中最常遇到的问题及解决方案。

## 目录

- [安装与部署](#安装与部署)
- [登录与账户](#登录与账户)
- [AI 模型配置](#ai-模型配置)
- [内容生成](#内容生成)
- [图片与视频](#图片与视频)
- [性能与优化](#性能与优化)
- [错误处理](#错误处理)
- [数据管理](#数据管理)

## 安装与部署

### Q: 支持哪些操作系统？

**A**: Toonflow 支持以下平台：
- Windows 10/11（推荐）
- macOS 10.15+
- Linux (Ubuntu 20.04+, CentOS 7+)
- Docker 容器部署（跨平台）

### Q: 最低系统要求是什么？

**A**:
- CPU: 双核 2.0GHz 及以上
- 内存: 4GB RAM（推荐 8GB+）
- 硬盘: 10GB 可用空间
- 网络: 稳定的互联网连接

### Q: Docker 部署时端口被占用怎么办？

**A**: 修改 `docker-compose.yml` 中的端口映射：
```yaml
ports:
  - "8080:80"  # 将 8080 改为其他未占用端口
  - "60000:60000"
```

### Q: 云端部署时 Node.js 版本不对？

**A**: 使用 nvm 安装正确版本：
```bash
nvm install 24
nvm use 24
node -v  # 确认版本
```

### Q: 安装依赖时出现错误？

**A**: 常见解决方案：
```bash
# 清除缓存
yarn cache clean

# 删除 node_modules 重新安装
rm -rf node_modules
yarn install

# 使用国内镜像
yarn config set registry https://registry.npmmirror.com
```

## 登录与账户

### Q: 忘记密码怎么办？

**A**: 当前版本需要手动重置：
1. 停止服务
2. 删除数据库文件 `data/toonflow.db`
3. 重启服务（会重新初始化）
4. 使用默认账号 `admin/admin123` 登录

**注意**：此操作会清空所有数据，请提前备份！

### Q: 如何修改密码？

**A**:
1. 登录后点击右上角头像
2. 选择「个人设置」
3. 在「修改密码」中输入新密码
4. 点击「保存」

### Q: Token 过期怎么办？

**A**: Token 有效期为 24 小时，过期后：
1. 重新登录获取新 Token
2. 或在设置中启用「自动续期」功能

### Q: 可以创建多个用户吗？

**A**: 当前版本仅支持单用户，多用户功能在开发计划中。

## AI 模型配置

### Q: 如何获取 OpenAI API Key？

**A**:
1. 访问 https://platform.openai.com
2. 注册并登录账号
3. 进入 API Keys 页面
4. 点击「Create new secret key」
5. 复制并保存 API Key

### Q: API Key 配置后无法使用？

**A**: 检查以下几点：
- API Key 是否正确（无多余空格）
- 账户余额是否充足
- Base URL 是否正确
- 网络是否能访问 API 服务
- 使用「测试连接」功能验证

### Q: 支持使用国内 API 服务吗？

**A**: 支持！可以配置：
- 通义千问（阿里云）
- 文心一言（百度）
- 智谱 AI
- DeepSeek
- 讯飞星火
- 月之暗面 Kimi
- 任何兼容 OpenAI 格式的服务

### Q: 如何使用自部署的模型？

**A**:
1. 在「AI 模型配置」中选择「自定义」
2. 填写你的 API 地址
3. 选择「OpenAI 兼容」格式
4. 测试连接

示例配置：
```
Base URL: http://localhost:8000/v1
API Key: 任意字符串（如果不需要认证）
Model: your-model-name
```

### Q: 不同任务应该用什么模型？

**A**: 推荐配置：

| 任务 | 推荐模型 | 原因 |
|------|---------|------|
| 大纲生成 | GPT-3.5 / DeepSeek | 成本低，速度快 |
| 剧本生成 | GPT-4 / Claude 3.5 | 质量高，逻辑强 |
| 分镜生成 | GPT-4 | 理解视觉构图 |
| 图片生成 | DALL-E 3 / SD | 根据风格选择 |
| 视频生成 | Sora / 豆包 | 根据预算选择 |

### Q: API 调用失败怎么办？

**A**: 常见错误及解决方案：

**401 Unauthorized**：
- 检查 API Key 是否正确
- 确认账户是否激活

**429 Too Many Requests**：
- 降低并发请求数
- 等待一段时间后重试
- 升级 API 套餐

**500 Internal Server Error**：
- 检查提示词是否包含敏感内容
- 简化提示词
- 更换模型重试

**超时错误**：
- 增加超时时间设置
- 检查网络连接
- 使用更快的模型

## 内容生成

### Q: 生成的大纲不符合预期？

**A**: 优化建议：
1. 确保小说文本质量高，结构清晰
2. 在提示词中明确要求（如集数、时长）
3. 使用更强大的模型（如 GPT-4）
4. 生成后手动调整

### Q: 剧本生成太慢？

**A**: 加速方法：
1. 使用更快的模型（如 GPT-3.5）
2. 减少单次生成的内容量
3. 检查网络连接
4. 使用国内 API 服务

### Q: 如何保持角色一致性？

**A**:
1. 在「素材管理」中创建角色卡片
2. 详细描述角色外观特征
3. 上传角色参考图
4. 在提示词中引用角色描述
5. 使用相同的艺术风格

示例角色描述：
```
李明：25岁男性，身高180cm，短黑发，深邃的眼睛，
穿着休闲西装，气质儒雅，微笑时有浅浅的酒窝
```

### Q: 生成的对话不自然？

**A**: 改进方法：
1. 在提示词中强调对话自然性
2. 提供角色性格设定
3. 使用更好的语言模型
4. 手动润色对话

### Q: 如何控制生成内容的长度？

**A**:
1. 在提示词中明确指定字数或时长
2. 调整模型的 max_tokens 参数
3. 分段生成后合并
4. 生成后手动裁剪

## 图片与视频

### Q: 图片生成失败？

**A**: 常见原因及解决：

**提示词包含敏感内容**：
- 修改提示词，避免敏感词汇
- 使用更委婉的描述

**分辨率不支持**：
- 检查模型支持的分辨率
- 调整为标准尺寸

**API 配额不足**：
- 检查账户余额
- 升级套餐或更换服务

**网络超时**：
- 增加超时时间
- 重试生成

### Q: 生成的图片质量不高？

**A**: 提升质量的方法：
1. 使用「润色提示词」功能
2. 添加质量标签：
   ```
   highly detailed, 8k resolution, professional photography,
   masterpiece, best quality, ultra-detailed
   ```
3. 使用更好的图片模型
4. 生成后使用「超分」功能
5. 调整生成参数（CFG Scale、Steps）

### Q: 如何批量生成图片？

**A**:
1. 在分镜列表中选择多个镜头
2. 点击「批量生成」
3. 选择图片模型和参数
4. 提交任务
5. 在任务管理中查看进度

### Q: 视频生成时间太长？

**A**:
- 视频生成通常需要 5-30 分钟
- 使用更快的视频服务
- 降低分辨率和时长
- 避免高峰时段

### Q: 视频生成失败？

**A**: 检查：
1. 图片分辨率是否符合要求
2. 提示词是否合规
3. API 配额是否充足
4. 查看错误日志获取详细信息

### Q: 如何提升视频质量？

**A**:
1. 使用高质量的分镜图片
2. 先对图片进行超分
3. 优化视频提示词
4. 选择更高的分辨率
5. 使用更好的视频模型

### Q: 视频没有声音？

**A**:
- 部分视频模型不支持音频生成
- 在配置中启用「音频」选项
- 使用后期编辑添加音频

## 性能与优化

### Q: 系统运行缓慢？

**A**: 优化建议：
1. 关闭不必要的后台程序
2. 增加系统内存
3. 使用 SSD 硬盘
4. 清理临时文件
5. 重启服务

### Q: 数据库文件太大？

**A**: 清理方法：
```bash
# 备份数据库
cp data/toonflow.db data/toonflow.db.backup

# 清理无用数据
# 在设置中使用「数据库清理」功能

# 或手动清理
sqlite3 data/toonflow.db "VACUUM;"
```

### Q: 上传文件夹占用空间大？

**A**:
1. 定期清理未使用的素材
2. 压缩图片和视频
3. 使用外部存储（OSS、S3）
4. 设置自动清理策略

### Q: 如何提高并发处理能力？

**A**:
1. 增加服务器配置
2. 使用 PM2 集群模式
3. 配置负载均衡
4. 使用消息队列

### Q: API 调用成本太高？

**A**: 降低成本的方法：
1. 使用更便宜的模型
2. 批量处理降低单价
3. 复用生成的内容
4. 优化提示词减少 Token 消耗
5. 使用缓存机制

## 错误处理

### Q: 出现 "Database is locked" 错误？

**A**:
```bash
# 停止所有服务
pm2 stop all

# 等待几秒
sleep 5

# 重启服务
pm2 start all
```

### Q: 出现 "ENOSPC: no space left on device" 错误？

**A**:
1. 清理磁盘空间
2. 删除不需要的文件
3. 扩展磁盘容量
4. 使用外部存储

### Q: 出现 "Port already in use" 错误？

**A**:
```bash
# 查找占用端口的进程
lsof -i :60000

# 杀死进程
kill -9 <PID>

# 或更改端口
# 修改 pm2.json 中的 PORT 环境变量
```

### Q: 出现 "Cannot find module" 错误？

**A**:
```bash
# 重新安装依赖
rm -rf node_modules
yarn install

# 重新构建
yarn build
```

### Q: 日志文件在哪里？

**A**:
- 应用日志：`logs/app.log`
- 错误日志：`logs/error.log`
- PM2 日志：`~/.pm2/logs/`
- Docker 日志：`docker logs toonflow`

## 数据管理

### Q: 如何备份数据？

**A**:
```bash
# 备份数据库
cp data/toonflow.db backups/toonflow-$(date +%Y%m%d).db

# 备份上传文件
tar -czf backups/uploads-$(date +%Y%m%d).tar.gz uploads/

# 完整备份
tar -czf backups/toonflow-full-$(date +%Y%m%d).tar.gz data/ uploads/
```

### Q: 如何恢复数据？

**A**:
```bash
# 停止服务
pm2 stop all

# 恢复数据库
cp backups/toonflow-20260303.db data/toonflow.db

# 恢复上传文件
tar -xzf backups/uploads-20260303.tar.gz

# 重启服务
pm2 start all
```

### Q: 如何迁移到新服务器？

**A**:
1. 在新服务器上安装 Toonflow
2. 停止旧服务器的服务
3. 打包数据：
   ```bash
   tar -czf toonflow-data.tar.gz data/ uploads/
   ```
4. 传输到新服务器
5. 解压并启动服务

### Q: 如何导出项目？

**A**:
1. 在项目列表中选择项目
2. 点击「导出项目」
3. 选择导出内容：
   - 仅项目数据
   - 包含素材文件
   - 完整打包
4. 下载导出文件

### Q: 如何清空所有数据？

**A**:
⚠️ **警告**：此操作不可恢复！

方式一：使用界面
1. 进入「设置」
2. 选择「数据管理」
3. 点击「清空所有数据」
4. 确认操作

方式二：手动清理
```bash
# 停止服务
pm2 stop all

# 删除数据库
rm data/toonflow.db

# 删除上传文件
rm -rf uploads/*

# 重启服务（会重新初始化）
pm2 start all
```

## 高级问题

### Q: 如何自定义前端界面？

**A**:
1. 克隆前端仓库：
   ```bash
   git clone https://github.com/HBAI-Ltd/Toonflow-web.git
   ```
2. 修改代码
3. 构建：
   ```bash
   yarn build
   ```
4. 复制 `dist/` 到后端的 `scripts/web/`

### Q: 如何开发自定义插件？

**A**:
插件系统正在开发中，敬请期待！

### Q: 支持 API 调用吗？

**A**:
支持！查看 [API 文档](../api/API-REFERENCE.md)

### Q: 如何贡献代码？

**A**:
1. Fork 项目
2. 创建功能分支
3. 提交代码
4. 发起 Pull Request 到 `develop` 分支

详见 [贡献指南](../developer/CONTRIBUTING.md)

### Q: 如何报告 Bug？

**A**:
1. 访问 [GitHub Issues](https://github.com/HBAI-Ltd/Toonflow-app/issues)
2. 点击「New Issue」
3. 选择「Bug Report」模板
4. 填写详细信息：
   - 问题描述
   - 复现步骤
   - 预期行为
   - 实际行为
   - 系统环境
   - 错误日志
5. 提交 Issue

## 获取帮助

如果以上内容没有解决你的问题：

1. 查看完整文档：`docs/` 目录
2. 搜索已有 Issues：[GitHub Issues](https://github.com/HBAI-Ltd/Toonflow-app/issues)
3. 加入微信交流群（见 README）
4. 发送邮件：ltlctools@outlook.com

---

文档持续更新中，欢迎提出问题和建议！
