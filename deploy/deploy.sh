#!/bin/bash
# 💧 Watermark Tool - 部署脚本
# 用于腾讯云服务器一键部署

set -e

echo "🚀 开始部署 Watermark Tool..."

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker 未安装，正在安装..."
    curl -fsSL https://get.docker.com | sh
    systemctl enable docker
    systemctl start docker
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose 未安装，正在安装..."
    curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 进入部署目录
cd "$(dirname "$0")"

# 构建并启动
echo "📦 构建 Docker 镜像..."
docker-compose build

echo "🎯 启动服务..."
docker-compose up -d

# 等待服务就绪
echo "⏳ 等待服务启动..."
sleep 5

# 健康检查
if curl -f http://localhost:8000/health &> /dev/null; then
    echo "✅ 部署成功！"
    echo ""
    echo "📍 访问地址："
    echo "   API: http://localhost:8000"
    echo "   前端：http://localhost:80 (需要启动 nginx 服务)"
    echo ""
    echo "🔧 常用命令："
    echo "   查看日志：docker-compose logs -f"
    echo "   重启服务：docker-compose restart"
    echo "   停止服务：docker-compose down"
else
    echo "❌ 服务启动失败，请检查日志："
    docker-compose logs
    exit 1
fi
