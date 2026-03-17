# Watermark Tool 部署指南

## 📦 项目结构

```
watermark-tool/
├── backend/           # Python FastAPI 后端
├── frontend/          # 静态 HTML 前端
├── deploy/            # 部署配置
├── Dockerfile
└── docker-compose.yml
```

---

## 🇨🇳 国内版部署（腾讯云服务器）

### 方式 1：Docker Compose（推荐）

```bash
# 1. 上传项目到服务器
scp -r watermark-tool root@your-server:/opt/

# 2. SSH 登录服务器
ssh root@your-server

# 3. 进入目录
cd /opt/watermark-tool

# 4. 构建并启动
docker-compose up -d --build

# 5. 查看日志
docker-compose logs -f
```

### 方式 2：直接运行

```bash
# 安装依赖
cd /opt/watermark-tool/backend
pip install -r requirements.txt

# 启动后端（后台运行）
nohup uvicorn backend.main:app --host 0.0.0.0 --port 8000 &

# 启动前端（后台运行）
cd ../frontend
nohup python3 -m http.server 3000 &
```

### 配置 Nginx（可选）

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 腾讯云安全组配置

| 端口 | 协议 | 说明 |
|-----|------|------|
| 80 | TCP | HTTP |
| 443 | TCP | HTTPS（如需） |
| 3000 | TCP | 前端（可选） |
| 8000 | TCP | API（可选） |

---

## 🌍 国外版部署（Cloudflare）

### 方案 1：Cloudflare Pages + Workers

**前端部署到 Pages：**

```bash
# 1. 登录 Cloudflare Dashboard
# 2. 进入 Pages → Create Project
# 3. 连接 GitHub 仓库或直接上传 frontend/ 目录
# 4. 构建配置：
#    - Build command: 留空（静态文件）
#    - Build output directory: frontend/
```

**后端部署到 Workers：**

由于 Workers 不支持 Python，需要：
1. 用 Hono.js 重写 API，或
2. 部署到 Cloudflare Workers + 外部 Python 服务

### 方案 2：Cloudflare Tunnel + 自托管

```bash
# 1. 安装 cloudflared
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64
chmod +x cloudflared-linux-amd64
sudo mv cloudflared-linux-amd64 /usr/local/bin/cloudflared

# 2. 登录 Cloudflare
cloudflared tunnel login

# 3. 创建隧道
cloudflared tunnel create watermark-tool

# 4. 配置隧道（创建 ~/.cloudflared/config.yml）
cat > ~/.cloudflared/config.yml << EOF
tunnel: watermark-tool
credentials-file: /root/.cloudflared/watermark-tool.json

ingress:
  - hostname: watermark.your-domain.com
    service: http://localhost:3000
  - hostname: api.watermark.your-domain.com
    service: http://localhost:8000
  - service: http_status:404
EOF

# 5. 启动隧道
cloudflared tunnel run watermark-tool

# 6. 后台运行（systemd）
cloudflared service install
```

### 方案 3：部署到 Railway / Render

```bash
# Railway 自动识别 Dockerfile
# 1. 登录 https://railway.app
# 2. New Project → Deploy from GitHub
# 3. 设置环境变量
# 4. 自动部署

# 或使用 Render
# https://render.com → New Web Service
```

---

## 🔧 环境变量

| 变量 | 说明 | 默认值 |
|-----|------|-------|
| `PORT` | API 端口 | 8000 |
| `FRONTEND_PORT` | 前端端口 | 3000 |
| `CORS_ORIGINS` | CORS 允许域名 | * |

---

## 📊 监控

```bash
# 查看 Docker 状态
docker-compose ps

# 查看日志
docker-compose logs -f

# 资源使用
docker stats
```

---

## ⚠️ 注意事项

1. **内存限制** - 大图片可能占用较多内存，建议设置图片大小限制
2. **并发限制** - 生产环境建议使用 Gunicorn + Uvicorn workers
3. **HTTPS** - 生产环境务必使用 HTTPS
4. **速率限制** - 添加 API 请求频率限制防止滥用

---

## 🚀 快速测试

```bash
# 本地运行
cd /home/yx/watermark-tool

# 后端
cd backend && uvicorn main:app --reload

# 前端（新终端）
cd ../frontend && python3 -m http.server 3000

# 访问 http://localhost:3000
```
