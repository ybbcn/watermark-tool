# 💧 Watermark Tool - 技术设计文档

**版本：** 1.0  
**日期：** 2026-03-17  

---

## 1. 系统架构

### 1.1 整体架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户层                                │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │  浏览器   │  │  移动端   │  │   API    │                  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘                  │
└───────┼─────────────┼─────────────┼─────────────────────────┘
        │             │             │
        └─────────────┴─────────────┘
                      │ HTTPS
        ┌─────────────▼─────────────┐
        │      Cloudflare CDN       │  (国外版)
        │    或 腾讯云 CDN          │  (国内版)
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │      Nginx 反向代理        │
        │  - 静态资源 / → 3000       │
        │  - API /api/ → 8000       │
        │  - 限流、SSL 终止           │
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │     FastAPI 应用服务       │
        │  ┌─────────────────────┐  │
        │  │  Uvicorn Workers    │  │
        │  │  (Gunicorn 管理)    │  │
        │  └─────────────────────┘  │
        └─────────────┬─────────────┘
                      │
        ┌─────────────▼─────────────┐
        │      图片处理引擎         │
        │  - Pillow (添加水印)      │
        │  - OpenCV (移除水印)      │
        │  - 内存处理，不落地        │
        └───────────────────────────┘
```

---

## 2. 模块设计

### 2.1 后端模块

```
backend/
├── main.py                 # 应用入口，路由定义
├── config.py               # 配置管理
├── middleware/
│   ├── cors.py            # CORS 中间件
│   ├── rate_limit.py      # 限流中间件
│   └── logging.py         # 日志中间件
├── api/
│   ├── routes/
│   │   ├── watermark.py   # 水印相关路由
│   │   └── health.py      # 健康检查
│   └── schemas/
│       └── responses.py   # 响应模型
├── services/
│   ├── add_watermark.py   # 添加水印服务
│   └── remove_watermark.py # 移除水印服务
├── utils/
│   ├── image.py           # 图片工具函数
│   └── validator.py       # 参数校验
└── tests/
    ├── test_add.py
    └── test_remove.py
```

### 2.2 核心服务

#### AddWatermarkService

```python
class AddWatermarkService:
    """添加水印服务"""
    
    def add_text_watermark(
        self,
        image: Image.Image,
        text: str,
        position: str,
        opacity: float,
        font_size: Optional[int] = None
    ) -> Image.Image:
        """添加文字水印"""
        pass
    
    def add_logo_watermark(
        self,
        image: Image.Image,
        logo: Image.Image,
        position: str,
        scale: float
    ) -> Image.Image:
        """添加 Logo 水印"""
        pass
```

#### RemoveWatermarkService

```python
class RemoveWatermarkService:
    """移除水印服务"""
    
    def remove_auto(self, image: np.ndarray) -> np.ndarray:
        """自动检测并移除（简化版）"""
        pass
    
    def remove_with_mask(
        self,
        image: np.ndarray,
        mask: np.ndarray
    ) -> np.ndarray:
        """使用掩码移除（进阶版）"""
        pass
```

---

## 3. 数据库设计

### 3.1 MVP 版本

**无数据库** - 所有图片内存处理，请求结束后释放。

### 3.2 V2 版本（预留）

```sql
-- 用户表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255),
    api_key VARCHAR(64) UNIQUE,
    quota_daily INTEGER DEFAULT 10,
    quota_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 处理记录表
CREATE TABLE processing_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    operation_type VARCHAR(50) NOT NULL,  -- add_text, add_logo, remove
    original_size INTEGER,
    result_size INTEGER,
    processing_time_ms INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 使用配额表
CREATE TABLE daily_quota (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    date DATE NOT NULL,
    used_count INTEGER DEFAULT 0,
    UNIQUE(user_id, date),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 索引
CREATE INDEX idx_records_user ON processing_records(user_id);
CREATE INDEX idx_records_date ON processing_records(created_at);
CREATE INDEX idx_quota_user_date ON daily_quota(user_id, date);
```

---

## 4. API 详细设计

### 4.1 添加文字水印

**请求：**

```http
POST /api/add-watermark
Content-Type: multipart/form-data
Authorization: Bearer {token}  (可选)

{
  "file": <binary>,
  "text": "© MyName",
  "position": "bottom-right",
  "opacity": 0.5
}
```

**响应：**

```http
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Disposition: attachment; filename="watermarked.jpg"
X-Processing-Time: 1.234

<binary image data>
```

**错误响应：**

```json
{
  "detail": "图片大小超过限制 (最大 10MB)"
}
```

### 4.2 移除水印

**请求：**

```http
POST /api/remove-watermark
Content-Type: multipart/form-data

{
  "file": <binary>,
  "mask_type": "auto"
}
```

**响应：**

```http
HTTP/1.1 200 OK
Content-Type: image/jpeg
Content-Disposition: attachment; filename="removed.jpg"
```

---

## 5. 前端设计

### 5.1 页面结构

```
frontend/
├── index.html              # 主页面
├── css/
│   └── style.css          # 自定义样式（可选）
├── js/
│   ├── app.js             # 主应用逻辑
│   ├── uploader.js        # 上传组件
│   └── processor.js       # 处理逻辑
└── assets/
    └── logo.png           # 站点 Logo
```

### 5.2 核心组件

#### 上传组件

```javascript
class ImageUploader {
  constructor(options) {
    this.maxSize = options.maxSize || 10 * 1024 * 1024; // 10MB
    this.accept = options.accept || 'image/*';
  }

  async upload(file) {
    // 验证文件大小
    if (file.size > this.maxSize) {
      throw new Error('文件过大');
    }
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      throw new Error('不支持的文件类型');
    }
    
    // 读取并预览
    return this.readFile(file);
  }
}
```

#### 处理组件

```javascript
class WatermarkProcessor {
  constructor(apiBase) {
    this.apiBase = apiBase;
  }

  async addWatermark(file, options) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('text', options.text);
    formData.append('position', options.position);
    formData.append('opacity', options.opacity);

    const response = await fetch(`${this.apiBase}/api/add-watermark`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail);
    }

    return await response.blob();
  }
}
```

---

## 6. 部署架构

### 6.1 国内版（腾讯云）

```
┌─────────────────────────────────────────────┐
│              腾讯云                          │
│                                             │
│  ┌─────────┐    ┌─────────────────────┐    │
│  │  域名    │───→│  负载均衡 (可选)     │    │
│  │ 备案    │    └──────────┬──────────┘    │
│  └─────────┘               │               │
│                           ▼               │
│                  ┌─────────────────┐      │
│                  │   Nginx         │      │
│                  │   - SSL 终止     │      │
│                  │   - 反向代理     │      │
│                  │   - 静态资源     │      │
│                  └────────┬────────┘      │
│                           │               │
│         ┌─────────────────┼─────────────┐ │
│         │                 │             │ │
│         ▼                 ▼             │ │
│  ┌─────────────┐  ┌─────────────┐      │ │
│  │ 前端 :3000   │  │ 后端 :8000   │      │ │
│  │ Python HTTP │  │ FastAPI     │      │ │
│  └─────────────┘  └──────┬──────┘      │ │
│                          │             │ │
│                   ┌──────▼──────┐      │ │
│                   │ 图片处理     │      │ │
│                   │ 内存操作     │      │ │
│                   └─────────────┘      │ │
│                                        │ │
└────────────────────────────────────────┘
```

### 6.2 国外版（Cloudflare）

```
┌─────────────────────────────────────────────┐
│              Cloudflare                      │
│                                             │
│  ┌─────────┐    ┌─────────────────────┐    │
│  │  域名    │───→│  Pages (前端)       │    │
│  │  DNS    │    │  静态托管            │    │
│  └─────────┘    └─────────────────────┘    │
│         │                                  │
│         │ API 调用                          │
│         ▼                                  │
│  ┌─────────────────────────────────────┐  │
│  │  Cloudflare Tunnel                  │  │
│  │  - 加密隧道                          │  │
│  │  - 隐藏源站 IP                        │  │
│  └─────────────┬───────────────────────┘  │
│                │                          │
└────────────────┼──────────────────────────┘
                 │
                 ▼
      ┌──────────────────────┐
      │   Railway / VPS      │
      │   - FastAPI 后端      │
      │   - 图片处理          │
      └──────────────────────┘
```

---

## 7. 性能优化

### 7.1 图片处理优化

```python
# 1. 使用 libjpeg-turbo 加速
# requirements.txt
pillow-simd==9.0.0.post1  # 替代 pillow

# 2. 限制图片尺寸
def resize_if_needed(image, max_size=2000):
    if max(image.size) > max_size:
        ratio = max_size / max(image.size)
        new_size = (int(image.size[0] * ratio), int(image.size[1] * ratio))
        return image.resize(new_size, Image.Resampling.LANCZOS)
    return image

# 3. 使用 WebP 格式（更小体积）
output.save(buffer, format='WEBP', quality=85)
```

### 7.2 并发处理

```python
# Gunicorn 配置 (gunicorn.conf.py)
workers = 4  # CPU 核心数 * 2 + 1
worker_class = 'uvicorn.workers.UvicornWorker'
worker_connections = 1000
timeout = 30
keepalive = 5

# 限流
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/api/add-watermark")
@limiter.limit("10/minute")  # 每分钟 10 次
async def add_watermark(...):
    pass
```

---

## 8. 监控与日志

### 8.1 日志配置

```python
# logging_config.py
LOGGING_CONFIG = {
    "version": 1,
    "handlers": {
        "default": {
            "class": "logging.handlers.RotatingFileHandler",
            "filename": "/var/log/watermark/app.log",
            "maxBytes": 10 * 1024 * 1024,  # 10MB
            "backupCount": 5,
            "formatter": "standard",
        },
    },
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(message)s"
        },
    },
    "root": {
        "level": "INFO",
        "handlers": ["default"],
    },
}
```

### 8.2 监控指标

| 指标 | 采集方式 | 告警阈值 |
|-----|---------|---------|
| API 响应时间 | Prometheus | P99 > 5s |
| 错误率 | 日志分析 | > 5% |
| 内存使用 | 系统监控 | > 80% |
| 磁盘使用 | 系统监控 | > 90% |
| 并发请求数 | Nginx 日志 | > 100 |

---

## 9. 安全设计

### 9.1 输入验证

```python
from fastapi import HTTPException
import re

def validate_image(file: UploadFile):
    # 验证文件类型
    allowed_types = ['image/jpeg', 'image/png', 'image/webp']
    if file.content_type not in allowed_types:
        raise HTTPException(400, "不支持的图片格式")
    
    # 验证文件大小
    file.seek(0, 2)  # 移动到文件末尾
    size = file.tell()
    file.seek(0)  # 重置指针
    
    if size > 10 * 1024 * 1024:  # 10MB
        raise HTTPException(400, "图片大小超过限制")
    
    # 验证文件名（防止路径遍历）
    if not re.match(r'^[\w\-.]+$', file.filename):
        raise HTTPException(400, "无效的文件名")
```

### 9.2 限流防刷

```python
# 基于 IP 限流
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

# 全局限流
app.state.limiter = limiter

# 路由限流
@app.post("/api/add-watermark")
@limiter.limit("20/minute")
async def add_watermark(...):
    pass
```

---

**文档结束**
