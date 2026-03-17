#!/bin/bash
# Watermark Tool 一键部署脚本
# 适用于腾讯云服务器（国内版）

set -e

echo "🚀 Watermark Tool 部署脚本"
echo "=========================="

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，正在安装..."
    curl -fsSL https://get.docker.com | sh
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，正在安装..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 进入项目目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

echo "📦 构建 Docker 镜像..."
docker-compose build

echo "🚀 启动服务..."
docker-compose up -d

echo ""
echo "✅ 部署完成!"
echo ""
echo "📍 访问地址:"
echo "   前端：http://$(curl -s ifconfig.me):3000"
echo "   API:  http://$(curl -s ifconfig.me):8000"
echo ""
echo "📊 查看日志：docker-compose logs -f"
echo "🛑 停止服务：docker-compose down"
echo ""
