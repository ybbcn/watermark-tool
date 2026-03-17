# 💧 Watermark Tool

在线水印工具 - 支持添加/移除水印，图片内存处理不存储。

## ✨ 特性

- 🖼️ **添加文字水印** - 自定义位置、透明度
- 🏷️ **添加 Logo 水印** - 支持图片水印
- 🧹 **移除水印** - AI 智能移除（简化版）
- 🔒 **隐私保护** - 图片仅在内存处理，不存储
- 🚀 **快速部署** - Docker 一键部署

## 🏗️ 架构

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   前端      │ ──→ │   后端 API   │ ──→ │  图片处理   │
│ (HTML+JS)   │     │ (FastAPI)    │     │ (Pillow+CV) │
└─────────────┘     └──────────────┘     └─────────────┘
```

## 🚀 快速开始

### 本地测试

```bash
# 启动后端
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# 启动前端（新终端）
cd ../frontend
python3 -m http.server 3000

# 访问 http://localhost:3000
```

### Docker 部署

```bash
docker-compose up -d --build
```

## 📦 部署方案

### 国内版（腾讯云）

1. 上传项目到服务器
2. 运行 `./deploy/deploy.sh`
3. 配置 Nginx（可选）

详见：[deploy/README.md](deploy/README.md)

### 国外版（Cloudflare）

1. 前端部署到 Cloudflare Pages
2. 后端使用 Cloudflare Tunnel 或 Railway
3. 配置自定义域名

详见：[deploy/README.md](deploy/README.md)

## 📊 API 文档

启动后访问：`http://localhost:8000/docs`

### 主要接口

| 接口 | 方法 | 说明 |
|-----|------|------|
| `/api/add-watermark` | POST | 添加文字水印 |
| `/api/add-logo-watermark` | POST | 添加 Logo 水印 |
| `/api/remove-watermark` | POST | 移除水印 |

## 🛠️ 技术栈

- **前端**: HTML + TailwindCSS + Vanilla JS
- **后端**: Python 3.11 + FastAPI
- **图片处理**: Pillow + OpenCV
- **部署**: Docker + Docker Compose

## ⚠️ 免责声明

本工具仅供学习和个人使用。请勿用于移除他人版权水印，由此产生的法律后果由使用者自行承担。

## 📄 License

MIT
