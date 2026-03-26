# 💧 Watermark Tool

在线水印处理工具 - 添加和移除水印，内存处理模式，保护用户隐私。

> 🌍 **支持中英文双语** / **Supports Chinese & English**
> 
> 查看多语言部署指南：[MULTILINGUAL.md](MULTILINGUAL.md)

## 🎯 产品定位

让每个人都能简单、快速、安全地处理图片水印。

## ✨ 核心功能

| 功能 | 描述 | 状态 |
|------|------|------|
| 添加文字水印 | 支持位置、透明度、字体大小调整 | ✅ |
| 添加 Logo 水印 | 支持 PNG 透明背景，可缩放 | ✅ |
| 移除水印 | 自动检测高亮区域（白色水印） | ✅ |
| 图片预览 | 上传后实时预览 | ✅ |
| 结果下载 | 处理完成后自动下载 | ✅ |
| **多语言支持** | 中英文自动切换 | ✅ |

## 🛠️ 技术栈

- **前端**: HTML + TailwindCSS (无需构建)
- **后端**: Python 3.11 + FastAPI + Uvicorn
- **图片处理**: Pillow + OpenCV + NumPy
- **部署**: Docker + Docker Compose

## 🚀 快速开始

### 本地开发

```bash
# 进入后端目录
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动后端
python main.py
# 或：uvicorn main:app --reload --host 0.0.0.0 --port 8000

# 访问 API 文档
# http://localhost:8000/docs
```

### Docker 部署

```bash
# 开发模式（仅后端）
cd deploy
docker-compose up -d

# 生产模式（后端 + Nginx）
docker-compose --profile production up -d

# 设置语言 (可选)
export LANGUAGE=en  # 或 zh (默认)
docker-compose up -d
```

📖 **多语言部署**: 查看 [MULTILINGUAL.md](MULTILINGUAL.md) 了解完整的多语言配置指南。

### 腾讯云服务器部署

```bash
# SSH 登录服务器后
cd /path/to/watermark-tool/deploy
chmod +x deploy.sh
./deploy.sh
```

## 📡 API 文档

启动后端后访问：http://localhost:8000/docs

### 添加文字水印

```bash
POST /api/add-watermark
Content-Type: multipart/form-data

参数:
- file: 图片文件 (必填)
- text: 水印文字 (必填)
- position: 位置 (可选，默认 bottom-right)
  选项：top-left, top-right, bottom-left, bottom-right, center
- opacity: 透明度 0-1 (可选，默认 0.5)
- font_size: 字体大小 (可选，默认 48)

响应：图片文件流 (image/jpeg)
```

### 添加 Logo 水印

```bash
POST /api/add-logo-watermark
Content-Type: multipart/form-data

参数:
- file: 原图 (必填)
- logo: Logo 图片 (必填)
- position: 位置 (可选，默认 bottom-right)
- scale: 大小比例 0-1 (可选，默认 0.2)

响应：图片文件流 (image/jpeg)
```

### 移除水印

```bash
POST /api/remove-watermark
Content-Type: multipart/form-data

参数:
- file: 图片文件 (必填)
- mask_type: 处理模式 (可选，默认 auto)
  选项：auto (MVP 版本仅支持此模式)

响应：图片文件流 (image/jpeg)
```

## 📁 项目结构

```
watermark-tool/
├── backend/
│   ├── main.py                 # FastAPI 应用入口
│   ├── requirements.txt        # Python 依赖
│   └── processors/
│       ├── text_watermark.py   # 文字水印处理器
│       ├── logo_watermark.py   # Logo 水印处理器
│       └── remove_watermark.py # 水印移除处理器
├── frontend/
│   └── index.html              # 前端页面
├── deploy/
│   ├── Dockerfile              # Docker 镜像
│   ├── docker-compose.yml      # Docker Compose 配置
│   ├── nginx.conf              # Nginx 配置
│   └── deploy.sh               # 部署脚本
└── README.md                   # 项目说明
```

## 🔒 隐私与安全

- **内存处理**: 所有图片在内存中处理，不存储到服务器
- **无数据库**: MVP 版本无需数据库，无用户数据持久化
- **CORS 配置**: 支持跨域访问

## ⚠️ 法律声明

本工具仅供学习和个人使用。请勿用于移除他人拥有版权的水印，由此产生的法律后果由使用者自行承担。

使用本工具即表示您同意：
- 仅对拥有版权或授权的图片进行处理
- 不将处理结果用于商业侵权
- 遵守当地法律法规

## 📊 性能指标

| 指标 | 目标值 |
|------|--------|
| 平均处理时间 | <3 秒 |
| 最大图片大小 | 10MB |
| 支持格式 | JPG, PNG, WebP |

## 🗺️ 开发计划

### MVP (当前版本)
- [x] 添加文字水印
- [x] 添加 Logo 水印
- [x] 移除水印（简化版）
- [x] 图片预览
- [x] 结果下载

### P1 功能
- [ ] 批量处理
- [ ] 自定义蒙版（手动标注移除区域）

### P2 功能
- [ ] 用户系统（登录、历史记录）
- [ ] 付费功能（高级去水印、API 调用）

## 💰 部署成本

| 方案 | 初期成本 | 月度成本 | 适合阶段 |
|------|----------|----------|----------|
| 腾讯云 | ¥70 | ¥70 | 国内用户为主 |
| Railway | $0 | $5-20 | 测试/小流量 |
| 自托管 + CF | $5 | $5-10 | 国外用户为主 |

## 📝 License

MIT License
