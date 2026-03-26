# 💧 Watermark Tool - 多语言部署指南

## 🌍 语言支持

本项目支持中英文两种语言，通过单一代码库实现，可根据部署地区自动切换语言。

### 语言配置方式

#### 1. 后端语言 (API 响应)

通过环境变量 `LANGUAGE` 控制：

```bash
# 中文 (国内部署)
LANGUAGE=zh

# English (国外部署)
LANGUAGE=en
```

#### 2. 前端语言 (用户界面)

前端支持自动检测和手动切换：

- **自动检测**: 根据浏览器语言设置自动选择
- **URL 参数**: `?lang=zh` 或 `?lang=en`
- **手动切换**: 点击右上角语言切换按钮
- **本地存储**: 记住用户上次选择的语言

---

## 🚀 部署方案

### 方案 A: 国内部署 (中文)

```bash
cd /path/to/watermark-tool/deploy

# 设置语言为中文
export LANGUAGE=zh

# Docker Compose 启动
docker-compose up -d

# 或使用 .env 文件
echo "LANGUAGE=zh" > .env
docker-compose --env-file .env up -d
```

访问：http://your-domain.com (中文界面)

---

### 方案 B: 国外部署 (英文)

```bash
cd /path/to/watermark-tool/deploy

# 设置语言为英文
export LANGUAGE=en

# Docker Compose 启动
docker-compose up -d

# 或使用 .env 文件
echo "LANGUAGE=en" > .env
docker-compose --env-file .env up -d
```

访问：http://your-domain.com (English interface)

---

### 方案 C: 同时支持中英文 (推荐)

同一套部署同时支持两种语言，根据用户浏览器自动切换：

```bash
cd /path/to/watermark-tool/deploy

# 设置默认语言 (当无法检测浏览器语言时使用)
export LANGUAGE=zh  # 或 en

docker-compose up -d
```

**访问方式：**

- 自动检测：用户浏览器中文 → 显示中文，英文 → 显示 English
- 手动切换：点击右上角语言切换按钮
- URL 指定：
  - http://your-domain.com?lang=zh (强制中文)
  - http://your-domain.com?lang=en (强制 English)

---

## 📝 环境变量说明

| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `LANGUAGE` | `zh` | 后端默认语言，也是前端 fallback 语言 |
| `PYTHONUNBUFFERED` | `1` | Python 输出不缓冲 (日志实时显示) |

---

## 🌐 域名部署建议

### 国内 (中文)
- 域名：`watermark.cn` / `shuiyin.io`
- 服务器：腾讯云 / 阿里云
- 语言：`LANGUAGE=zh`

### 国外 (英文)
- 域名：`watermarktool.io` / `removewatermark.app`
- 服务器：Vercel / Railway / AWS
- 语言：`LANGUAGE=en`

### 同时支持
- 单一部署，自动根据用户浏览器语言切换
- 或使用不同子域名：
  - `cn.watermarktool.com` → 中文
  - `en.watermarktool.com` → English

---

## 🔧 本地开发

```bash
cd backend

# 创建虚拟环境
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动后端 (中文)
LANGUAGE=zh python main.py

# 启动后端 (英文)
LANGUAGE=en python main.py

# 访问 API 文档
# http://localhost:8000/docs
```

前端直接用浏览器打开 `frontend/index.html` 即可，或通过本地服务器：

```bash
cd frontend
python -m http.server 3000
# 访问 http://localhost:3000
```

---

## 📦 文件结构

```
watermark-tool/
├── backend/
│   ├── i18n/              # 国际化翻译文件
│   │   ├── zh.json        # 中文翻译
│   │   └── en.json        # 英文翻译
│   ├── i18n/__init__.py   # 国际化模块
│   └── main.py            # FastAPI 后端 (已支持多语言)
├── frontend/
│   ├── index.html         # 前端页面 (已支持多语言切换)
│   └── js/
│       └── i18n.js        # 前端国际化支持
└── deploy/
    ├── docker-compose.yml # Docker 部署配置 (支持 LANGUAGE 环境变量)
    └── ...
```

---

## ✅ 多语言支持清单

### 后端 (Backend)
- ✅ API 文档标题和描述
- ✅ 错误消息 (文件过大、格式不支持、处理失败等)
- ✅ 根路径响应内容

### 前端 (Frontend)
- ✅ 导航栏副标题
- ✅ 法律声明
- ✅ 功能选项卡
- ✅ 所有表单标签和提示
- ✅ 所有下拉选项
- ✅ 按钮文字
- ✅ 页脚信息
- ✅ 弹窗提示消息 (alert)
- ✅ 语言切换按钮

---

## 🎯 语言切换逻辑

### 前端语言检测顺序：
1. URL 参数 `?lang=xx`
2. localStorage 中保存的用户选择
3. 浏览器语言设置 `navigator.language`
4. 默认中文 `zh`

### 后端语言检测：
- 根据 HTTP 请求头 `Accept-Language`
- 未提供时使用环境变量 `LANGUAGE`

---

## 💡 最佳实践

1. **单一部署，自动切换** (推荐)
   - 减少维护成本
   - 用户体验更好
   - SEO 友好

2. **使用 .env 文件管理配置**
   ```bash
   # deploy/.env
   LANGUAGE=zh
   PYTHONUNBUFFERED=1
   ```

3. **生产环境设置默认语言**
   - 根据目标用户群体设置
   - 国内用户多 → `zh`
   - 国际用户多 → `en`

---

## 📞 问题排查

### 语言没有切换？

1. 检查环境变量是否正确设置
2. 重启 Docker 容器：`docker-compose restart`
3. 清除浏览器缓存和 localStorage
4. 检查 URL 参数：`?lang=zh` 或 `?lang=en`

### 部分文字未翻译？

- 检查 HTML 中是否添加了 `data-i18n` 属性
- 检查 `i18n.js` 中的翻译字典是否完整
- 查看浏览器控制台是否有 JavaScript 错误

---

**🎉 完成！现在你的水印工具支持中英文双语了！**
