#!/bin/bash

# Toonflow 部署脚本
# 用法: ./deploy.sh [环境] [版本]
# 示例: ./deploy.sh prod v1.0.7

set -e

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
PROJECT_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 默认参数
ENV=${1:-local}
VERSION=${2:-latest}

echo -e "${GREEN}=== Toonflow 部署脚本 ===${NC}"
echo "环境: $ENV"
echo "版本: $VERSION"
echo ""

# 检查 Docker 是否安装
if ! command -v docker &> /dev/null; then
    echo -e "${RED}错误: Docker 未安装${NC}"
    exit 1
fi

# 检查 Docker Compose 是否安装
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}错误: Docker Compose 未安装${NC}"
    exit 1
fi

# 根据环境选择配置文件
case $ENV in
    local)
        COMPOSE_FILE="$SCRIPT_DIR/docker-compose.local.yml"
        echo -e "${YELLOW}使用本地开发配置${NC}"
        ;;
    prod)
        COMPOSE_FILE="$SCRIPT_DIR/docker-compose.prod.yml"
        echo -e "${YELLOW}使用生产环境配置${NC}"
        ;;
    *)
        echo -e "${RED}错误: 未知环境 '$ENV'${NC}"
        echo "支持的环境: local, prod"
        exit 1
        ;;
esac

# 检查配置文件是否存在
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}错误: 配置文件 $COMPOSE_FILE 不存在${NC}"
    exit 1
fi

# 创建必要的目录
echo -e "${GREEN}创建必要的目录...${NC}"
mkdir -p "$SCRIPT_DIR/logs" "$SCRIPT_DIR/data" "$SCRIPT_DIR/uploads"

cd "$PROJECT_ROOT"

# 停止现有容器
echo -e "${GREEN}停止现有容器...${NC}"
docker-compose -f "$COMPOSE_FILE" down || true

# 清理旧镜像（可选）
read -p "是否清理旧镜像? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${GREEN}清理旧镜像...${NC}"
    docker image prune -f
fi

# 构建并启动容器
echo -e "${GREEN}构建并启动容器...${NC}"
if [ "$ENV" = "prod" ]; then
    TAG=$VERSION docker-compose -f "$COMPOSE_FILE" up -d --build
else
    docker-compose -f "$COMPOSE_FILE" up -d --build
fi

# 等待服务启动
echo -e "${GREEN}等待服务启动...${NC}"
sleep 10

# 检查容器状态
echo -e "${GREEN}检查容器状态...${NC}"
docker-compose -f "$COMPOSE_FILE" ps

# 检查健康状态
echo -e "${GREEN}检查健康状态...${NC}"
CONTAINER_NAME=$(docker-compose -f "$COMPOSE_FILE" ps -q | head -n 1)
if [ -n "$CONTAINER_NAME" ]; then
    HEALTH_STATUS=$(docker inspect --format='{{.State.Health.Status}}' $CONTAINER_NAME 2>/dev/null || echo "unknown")
    echo "健康状态: $HEALTH_STATUS"
fi

# 显示日志
echo -e "${GREEN}最近的日志:${NC}"
docker-compose -f "$COMPOSE_FILE" logs --tail=20

echo ""
echo -e "${GREEN}=== 部署完成 ===${NC}"
echo "访问地址: http://localhost:80"
echo "API 地址: http://localhost:60000"
echo ""
echo "查看日志: docker-compose -f $COMPOSE_FILE logs -f"
echo "停止服务: docker-compose -f $COMPOSE_FILE down"
echo "重启服务: docker-compose -f $COMPOSE_FILE restart"
