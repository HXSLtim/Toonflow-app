# Toonflow Docker 部署指南

## 快速开始

### 1. 本地开发部署

```bash
# 使用本地源码构建
docker-compose -f docker/docker-compose.local.yml up -d --build

# 或使用部署脚本
chmod +x docker/deploy.sh
./docker/deploy.sh local
```

### 2. 生产环境部署

```bash
# 使用优化版本构建
docker-compose -f docker/docker-compose.prod.yml up -d --build

# 或指定版本
TAG=v1.0.7 docker-compose -f docker/docker-compose.prod.yml up -d --build

# 或使用部署脚本
./docker/deploy.sh prod v1.0.7
```

### 3. 从 GitHub Container Registry 拉取

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

## 配置说明

### 环境变量

复制 `.env.example` 为 `.env` 并修改配置：

```bash
cp .env.example .env
```

主要配置项：
- `NODE_ENV`: 运行环境 (prod/dev)
- `HTTP_PORT`: HTTP 端口 (默认 80)
- `API_PORT`: API 端口 (默认 60000)
- `TAG`: Docker 镜像标签
- `TZ`: 时区设置

### 资源限制

在 `docker-compose.prod.yml` 中配置：

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '0.5'
      memory: 512M
```

## 常用命令

### 容器管理

```bash
# 启动服务
docker-compose -f docker/docker-compose.prod.yml up -d

# 停止服务
docker-compose -f docker/docker-compose.prod.yml down

# 重启服务
docker-compose -f docker/docker-compose.prod.yml restart

# 查看状态
docker-compose -f docker/docker-compose.prod.yml ps

# 查看日志
docker-compose -f docker/docker-compose.prod.yml logs -f

# 进入容器
docker exec -it toonflow-prod sh
```

### 镜像管理

```bash
# 构建镜像
docker build -f docker/Dockerfile.optimized -t toonflow:latest .

# 查看镜像
docker images | grep toonflow

# 删除镜像
docker rmi toonflow:latest

# 清理未使用的镜像
docker image prune -f
```

### 监控和调试

```bash
# 查看资源使用
docker stats toonflow-prod

# 查看健康状态
docker inspect --format='{{.State.Health.Status}}' toonflow-prod

# 查看容器详情
docker inspect toonflow-prod

# 导出日志
docker logs toonflow-prod > toonflow.log 2>&1
```

## 故障排查

### 1. 容器无法启动

```bash
# 查看详细日志
docker-compose -f docker/docker-compose.prod.yml logs --tail=100

# 检查配置
docker-compose -f docker/docker-compose.prod.yml config

# 检查端口占用
netstat -tuln | grep -E '80|60000'
```

### 2. 健康检查失败

```bash
# 进入容器检查
docker exec -it toonflow-prod sh

# 测试健康检查端点
wget -O- http://localhost:80/

# 查看 nginx 状态
ps aux | grep nginx

# 查看应用状态
pm2 list
```

### 3. 内存不足

```bash
# 查看内存使用
docker stats toonflow-prod

# 调整内存限制
docker update --memory 2G toonflow-prod

# 重启容器
docker restart toonflow-prod
```

### 4. 网络问题

```bash
# 检查网络
docker network ls
docker network inspect toonflow-network

# 重建网络
docker-compose -f docker/docker-compose.prod.yml down
docker network prune -f
docker-compose -f docker/docker-compose.prod.yml up -d
```

## 性能优化

### 1. 构建优化

- 使用多阶段构建减小镜像体积
- 利用 Docker 层缓存加速构建
- 使用 `.dockerignore` 排除不必要的文件

### 2. 运行优化

- 配置资源限制防止资源耗尽
- 使用健康检查自动重启异常容器
- 配置日志轮转防止磁盘占满

### 3. 网络优化

- 使用 Nginx 反向代理
- 启用 Gzip 压缩
- 配置静态资源缓存

## 安全建议

1. **不要在镜像中包含敏感信息**
   - 使用环境变量注入配置
   - 使用 Docker secrets 管理密钥

2. **使用非 root 用户运行**
   - 镜像已配置 nodejs 用户
   - 最小权限原则

3. **定期更新基础镜像**
   - 及时修复安全漏洞
   - 使用官方镜像

4. **网络隔离**
   - 使用独立 Docker 网络
   - 限制容器间通信

## 备份和恢复

### 备份数据

```bash
# 备份数据库
docker exec toonflow-prod tar czf /tmp/data-backup.tar.gz /app/data
docker cp toonflow-prod:/tmp/data-backup.tar.gz ./backup/

# 备份日志
docker exec toonflow-prod tar czf /tmp/logs-backup.tar.gz /var/log
docker cp toonflow-prod:/tmp/logs-backup.tar.gz ./backup/
```

### 恢复数据

```bash
# 恢复数据库
docker cp ./backup/data-backup.tar.gz toonflow-prod:/tmp/
docker exec toonflow-prod tar xzf /tmp/data-backup.tar.gz -C /
docker restart toonflow-prod
```

## 更新升级

### 滚动更新

```bash
# 拉取新版本
docker pull ghcr.io/hbai-ltd/toonflow-app:v1.0.8

# 停止旧容器
docker stop toonflow-prod

# 启动新容器
TAG=v1.0.8 docker-compose -f docker/docker-compose.prod.yml up -d

# 验证新版本
docker logs -f toonflow-prod
```

### 回滚

```bash
# 停止当前版本
docker stop toonflow-prod

# 启动旧版本
TAG=v1.0.7 docker-compose -f docker/docker-compose.prod.yml up -d
```

## 监控集成

### Prometheus

```yaml
# 添加到 docker-compose.prod.yml
prometheus:
  image: prom/prometheus
  volumes:
    - ./prometheus.yml:/etc/prometheus/prometheus.yml
  ports:
    - "9090:9090"
```

### Grafana

```yaml
grafana:
  image: grafana/grafana
  ports:
    - "3000:3000"
  environment:
    - GF_SECURITY_ADMIN_PASSWORD=admin
```

## 支持

- 项目仓库: https://github.com/HBAI-Ltd/Toonflow-app
- 问题反馈: https://github.com/HBAI-Ltd/Toonflow-app/issues
- 邮箱: ltlctools@outlook.com
