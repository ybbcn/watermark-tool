# Watermark Worker - Cloudflare Workers 版本

## 部署步骤

### 1. 安装依赖

```bash
cd workers/watermark
npm install
```

### 2. 配置 Cloudflare

确保你已经登录 Cloudflare CLI：

```bash
npx wrangler login
```

### 3. 部署

```bash
npm run deploy
```

部署成功后会返回 Worker URL，例如：
```
https://watermark-worker.your-subdomain.workers.dev
```

### 4. 更新前端 API 地址

将 `frontend/index.html` 第 314 行的 API 地址改成你的 Worker URL：

```javascript
const API_BASE = (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname.endsWith('.local'))
    ? 'http://localhost:8000'
    : 'https://watermark-worker.your-subdomain.workers.dev';  // 改成你的 URL
```

然后提交到 GitHub，Cloudflare Pages 会自动重新部署。

## 本地开发测试

```bash
npm run dev
# 访问 http://localhost:8787
```

## API 端点

| 端点 | 方法 | 说明 |
|------|------|------|
| `/` | GET | API 信息 |
| `/health` | GET | 健康检查 |
| `/api/add-watermark` | POST | 添加文字水印 |
| `/api/add-logo-watermark` | POST | 添加 Logo 水印 |
| `/api/remove-watermark` | POST | 移除水印 |

## 参数说明

### 添加文字水印
- `file`: 图片文件
- `text`: 水印文字
- `position`: 位置 (top-left, top-right, bottom-left, bottom-right, center)
- `opacity`: 透明度 (0-1)
- `font_size`: 字体大小
- `color`: 颜色 (HEX, 如 #000000)
- `rotation`: 旋转角度 (-180 到 180)
- `shadow`: 阴影 (none, light, medium, heavy)
- `bg`: 背景 (none, solid, blur)
- `tile`: 平铺模式 (none, tile, diagonal)
- `spacing`: 平铺间距

### 添加 Logo 水印
- `file`: 原图
- `logo`: Logo 图片 (PNG 透明背景)
- `position`: 位置
- `scale`: 大小比例 (0.05-0.5)
- `opacity`: 透明度 (0-1)
- `rotation`: 旋转角度
- `tile`: 平铺模式
- `spacing`: 平铺间距

## 注意

- 图片大小限制：10MB
- 支持格式：JPEG, PNG, WEBP
- 水印移除功能是简化版，实际效果可能不如 Python 版本
