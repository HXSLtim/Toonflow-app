# Toonflow CI/CD 实施方案

## 概述

本文档描述 Toonflow 项目的完整 CI/CD 流程和 Docker 部署优化方案。

## 一、CI/CD 流程架构

### 1.1 工作流概览

```
代码提交 → CI 检查 → 构建测试 → Docker 构建 → 安全扫描 → 发布部署
```

### 1.2 GitHub Actions 工作流

#### CI 工作流 (`.github/workflows/ci.yml`)
- **触发条件**: Push 到 master/develop 分支，或 PR
- **执行步骤**:
  1. **Lint**: TypeScript 类型检查
  2. **Build**: 应用构建并上传构建产物
  3. **Docker Build**: Docker 镜像构建测试
  4. **Security Scan**: 依赖审计和密钥扫描

#### 代码质量检查 (`.github/workflows/code-quality.yml`)
- **触发条件**: Push 到 master/develop 分支，或 PR
- **检查项**:
  - TypeScript 类型检查
  - TODO/FIXME 注释检查
  - 大文件检查
  - 依赖审计
  - 重复依赖检查

#### Docker 发布 (`.github/workflows/docker-publish.yml`)
- **触发条件**: 推送 tag (v*)，或手动触发
- **执行步骤**:
  1. 构建 Docker 镜像
  2. 推送到 GitHub Container Registry
  3. 生成 SBOM (软件物料清单)
  4. 上传安全扫描报告

#### Release 工作流 (`.github/workflows/release.yml`)
- **触发条件**: 推送 tag (v*)
- **执行步骤**:
  1. 多平台构建 (Windows/macOS/Linux)
  2. 创建 GitHub Release
  3. 上传构建产物

## 二、Docker 部署优化

### 2.1 多阶段构建优化

#### 优化点：
1. **构建阶段分离**:
   - Builder 阶段：编译和构建
   - Production 阶段：仅包含运行时依赖

2. **镜像体积优化**:
   - 使用 Alpine Linux (体积小)
   - 清理开发依赖
   - 仅复制必要文件

3. **缓存优化**:
   - 利用 Docker 层缓存
   - GitHub Actions 缓存支持

4. **安全加固**:
   - 非 root 用户运行
   - 安全头配置
   - 最小权限原则

### 2.2 Docker Compose 配置

#### 生产环境 (`docker-compose.prod.yml`)
- **资源限制**: CPU 和内存限制
- **健康检查**: 自动健康监测
- **日志管理**: 日志轮转配置
- **持久化**: 数据卷挂载
- **网络隔离**: 独立网络

### 2.3 性能优化

1. **Nginx 配置**:
   - Gzip 压缩
   - 静态资源缓存
   - API 反向代理

2. **Node.js 优化**:
   - PM2 进程管理
   - 内存限制 (500MB)
   - 自动重启

3. **Supervisor 管理**:
   - 多进程管理
   - 自动重启
   - 日志输出到 stdout/stderr

## 三、部署流程

### 3.1 本地开发测试

```bash
# 使用本地源码构建
docker-compose -f docker/docker-compose.local.yml up -d --build
```

### 3.2 生产环境部署

```bash
# 使用优化版本构建
docker-compose -f docker/docker-compose.prod.yml up -d --build

# 或指定版本
TAG=v1.0.7 docker-compose -f docker/docker-compose.prod.yml up -d --build
```

### 3.3 从 GitHub Container Registry 拉取

```bash
# 登录 GitHub Container Registry
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 拉取镜像
docker pull ghcr.io/hbai-ltd/toonflow-app:latest

# 运行容器
docker run -d \
  -p 80:80 \
  -p 60000:60000 \
  -v ./logs:/var/log \
  -v ./data:/app/data \
  --name toonflow \
  ghcr.io/hbai-ltd/toonflow-app:latest
```

## 四、监控与健康检查

### 4.1 健康检查配置

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:80/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### 4.2 日志管理

- **日志驱动**: json-file
- **日志轮转**: 最大 10MB，保留 3 个文件
- **日志输出**: stdout/stderr (便于容器日志收集)

### 4.3 资源监控

```bash
# 查看容器资源使用
docker stats toonflow-prod

# 查看容器日志
docker logs -f toonflow-prod

# 查看健康状态
docker inspect --format='{{.State.Health.Status}}' toonflow-prod
```

## 五、安全措施

### 5.1 镜像安全

1. **最小化基础镜像**: 使用 Alpine Linux
2. **非 root 用户**: 创建专用用户运行应用
3. **安全选项**: `no-new-privileges:true`
4. **依赖审计**: 自动化依赖漏洞扫描

### 5.2 运行时安全

1. **网络隔离**: 独立 Docker 网络
2. **资源限制**: CPU 和内存限制
3. **安全头**: X-Frame-Options, X-Content-Type-Options 等
4. **密钥管理**: 环境变量注入，不打包到镜像

### 5.3 CI/CD 安全

1. **密钥扫描**: TruffleHog 扫描
2. **依赖审计**: npm audit
3. **SBOM 生成**: 软件物料清单
4. **权限最小化**: GitHub Actions 权限控制

## 六、性能指标

### 6.1 构建性能

- **构建时间**: ~5-8 分钟 (含依赖安装)
- **镜像大小**: ~300-400MB (优化后)
- **缓存命中**: 90%+ (利用 GitHub Actions 缓存)

### 6.2 运行性能

- **启动时间**: ~10-15 秒
- **内存占用**: ~200-300MB (稳定运行)
- **CPU 使用**: ~5-10% (空闲时)

## 七、故障排查

### 7.1 常见问题

1. **构建失败**:
   ```bash
   # 检查构建日志
   docker-compose -f docker/docker-compose.prod.yml logs --tail=100
   ```

2. **健康检查失败**:
   ```bash
   # 进入容器检查
   docker exec -it toonflow-prod sh
   wget -O- http://localhost:80/
   ```

3. **内存不足**:
   ```bash
   # 调整内存限制
   docker update --memory 2G toonflow-prod
   ```

### 7.2 调试模式

```bash
# 使用调试模式运行
docker run -it --rm \
  -p 80:80 \
  -p 60000:60000 \
  toonflow:latest sh
```

## 八、后续优化建议

### 8.1 短期优化 (1-2 周)

1. 添加单元测试和集成测试
2. 配置 SonarQube 代码质量分析
3. 实现自动化回滚机制
4. 添加性能测试

### 8.2 中期优化 (1-2 月)

1. 实现蓝绿部署或金丝雀发布
2. 配置 Prometheus + Grafana 监控
3. 实现分布式日志收集 (ELK)
4. 添加 E2E 测试

### 8.3 长期优化 (3-6 月)

1. Kubernetes 部署支持
2. 多区域部署
3. CDN 加速
4. 自动扩缩容

## 九、维护清单

### 9.1 日常维护

- [ ] 每日检查 CI/CD 运行状态
- [ ] 每周审查依赖更新
- [ ] 每月审查安全漏洞报告

### 9.2 定期维护

- [ ] 每季度更新基础镜像
- [ ] 每季度审查资源使用情况
- [ ] 每半年审查 CI/CD 流程优化

## 十、联系方式

- **项目仓库**: https://github.com/HBAI-Ltd/Toonflow-app
- **问题反馈**: https://github.com/HBAI-Ltd/Toonflow-app/issues
- **邮箱**: ltlctools@outlook.com

---

**文档版本**: 1.0
**最后更新**: 2026-03-03
**维护者**: DevOps Team
