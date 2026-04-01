# 💧 Watermark Tool - Cloudflare 技术架构方案

## 📋 现有功能清单

### 核心功能
1. ✅ **添加文字水印** - 位置、透明度、字体大小调整
2. ✅ **添加 Logo 水印** - PNG 透明背景，可缩放
3. ✅ **移除水印** - 自动检测高亮区域（白色水印）
4. ✅ **图片预览** - 上传后实时预览
5. ✅ **结果下载** - 处理完成后自动下载
6. ✅ **多语言支持** - 中英文自动切换 (i18n)
7. ✅ **用户认证** - Google OAuth 登录

### 技术特点
- 内存处理，不存储用户图片
- 隐私安全
- 响应式设计

---

## 🏗️ Cloudflare 技术架构

### 方案 A：纯 Cloudflare 方案（推荐）

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare Pages                      │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Next.js 15 (App Router)             │    │
│  │  - 静态页面 (SSG)                                │    │
│  │  - Edge API Routes (水印处理)                    │    │
│  │  - Cloudflare Access (认证)                      │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare D1 (SQLite)                      │
│  - 用户数据存储                                          │
│  - 会话管理                                              │
└─────────────────────────────────────────────────────────┘
```

**优势**:
- ✅ 完全 Serverless，零运维
- ✅ 全球 CDN 加速
- ✅ 免费额度高
- ✅ 自动扩展

**挑战**:
- ⚠️ Cloudflare Workers 不支持 Python/OpenCV
- ⚠️ 需要重写图片处理逻辑为 JavaScript/TypeScript

---

### 方案 B：混合架构（快速迁移）

```
┌──────────────────┐         ┌──────────────────────┐
│  Cloudflare Pages│         │   VPS/云服务器        │
│  (前端 + 认证)    │◄───────►│   (FastAPI 后端)      │
│  - Next.js 15    │  HTTP   │   - Python 3.11      │
│  - TailwindCSS   │  API    │   - OpenCV/Pillow    │
│  - Cloudflare    │         │   - 原有代码复用      │
│    Access        │         │                      │
└──────────────────┘         └──────────────────────┘
```

**优势**:
- ✅ 后端代码几乎不用改
- ✅ 图片处理功能完整保留
- ✅ 前端享受 Cloudflare CDN
- ✅ 快速上线

**成本**:
- 💰 需要一台 VPS（腾讯云轻量约 ¥24/月）

---

### 方案 C：Cloudflare Workers + WASM（技术先进）

```
┌─────────────────────────────────────────────────────────┐
│                    Cloudflare Pages                      │
│  ┌─────────────────────────────────────────────────┐    │
│  │              Next.js 15 (App Router)             │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Workers                          │
│  ┌─────────────────────────────────────────────────┐    │
│  │  Rust + OpenCV (编译为 WASM)                     │    │
│  │  - 添加文字水印                                  │    │
│  │  - 添加图片水印                                  │    │
│  │  - 移除水印                                      │    │
│  └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

**优势**:
- ✅ 完全 Serverless
- ✅ 性能优秀（WASM 接近原生）
- ✅ 技术先进

**挑战**:
- ⚠️ 需要学习 Rust
- ⚠️ 开发周期长（2-3 周）
- ⚠️ OpenCV WASM 配置复杂

---

## 🎯 推荐方案：方案 B（混合架构）

### 理由
1. **快速上线** - 1-2 天即可完成迁移
2. **功能完整** - 保留所有现有功能
3. **成本可控** - VPS 成本低
4. **可演进** - 后续可逐步迁移到方案 A 或 C

---

## 📦 实施步骤

### 第 1 步：部署后端到 VPS

```bash
# 1. 购买腾讯云服务器（Ubuntu 22.04）
# 2. SSH 登录服务器
ssh root@your-server-ip

# 3. 安装 Docker
curl -fsSL https://get.docker.com | sh

# 4. 部署后端
cd /opt
git clone https://github.com/ybbcn/watermark-tool.git
cd watermark-tool/deploy

# 5. 配置环境变量
cat > .env << EOF
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
AUTH_SECRET=your_auth_secret
EOF

# 6. 启动服务
docker-compose up -d

# 7. 配置 Nginx 反向代理
# （或使用 Cloudflare Tunnel）
```

### 第 2 步：改造前端适配 Cloudflare Pages

```typescript
// 修改 API 调用指向 VPS
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.ybbtool.com';

// 保留 NextAuth.js v5（在 VPS 上运行）
// 或使用 Cloudflare Access 替代
```

### 第 3 步：配置 Cloudflare Access（可选）

```bash
# 1. 在 Cloudflare Dashboard 启用 Access
# 2. 创建 Application
# 3. 配置认证策略（Google OAuth）
# 4. 获取 Access 域名
```

### 第 4 步：部署前端到 Cloudflare Pages

```bash
cd frontend
npm install
npm run build
npx wrangler pages deploy .vercel/output/static \
  --project-name=watermark-tool \
  --branch=master
```

---

## 🔧 代码改造清单

### 前端改造（最小改动）

| 文件 | 改动 | 说明 |
|------|------|------|
| `app/page.tsx` | 修改 API URL | 指向 VPS 后端 |
| `app/api/add-watermark/route.ts` | 删除或转发 | 由 VPS 处理 |
| `auth.ts` | 保留或替换 | 使用 VPS 认证或 Cloudflare Access |
| `.env.local` | 添加 `NEXT_PUBLIC_API_URL` | 后端 API 地址 |

### 后端改造（几乎不改）

| 文件 | 改动 | 说明 |
|------|------|------|
| `main.py` | 无需修改 | 保持原有逻辑 |
| `processors/*.py` | 无需修改 | 图片处理核心 |
| `requirements.txt` | 无需修改 | 依赖不变 |
| `Dockerfile` | 优化镜像大小 | 使用多阶段构建 |

---

## 📊 成本对比

| 方案 | 月度成本 | 开发周期 | 维护成本 |
|------|---------|---------|---------|
| 方案 A（纯 Cloudflare） | ¥0（免费额度内） | 2-3 周 | 低 |
| **方案 B（混合）** | **¥24（VPS）** | **1-2 天** | **中** |
| 方案 C（WASM） | ¥0（免费额度内） | 3-4 周 | 中 |
| 原方案（全 VPS） | ¥50+ | 已完成 | 高 |

---

## 🚀 立即执行（方案 B）

### 今天可以完成：

1. ✅ 购买并配置 VPS
2. ✅ 部署 Docker 后端
3. ✅ 修改前端 API 配置
4. ✅ 部署前端到 Cloudflare Pages
5. ✅ 配置域名和 HTTPS

### 明天可以完成：

1. ✅ 测试所有功能
2. ✅ 配置 Cloudflare Access（可选）
3. ✅ 性能优化
4. ✅ 正式上线

---

## 📞 下一步

请告诉我你选择哪个方案，我会立即开始实施：

- **A** - 纯 Cloudflare（需要重写图片处理）
- **B** - 混合架构（快速，推荐）
- **C** - Workers + WASM（技术挑战）

或者你有其他想法，我们可以讨论！
