# 💧 Watermark Tool - 访问说明

## ✅ 当前状态

### 服务运行正常
- ✅ 后端 API: `http://localhost:8000` - 运行中
- ✅ 前端页面：`http://localhost:3000` - 运行中
- ✅ Nginx 反向代理：`http://localhost:80` - 运行中

### 服务器信息
- **内网 IP**: `10.6.0.17`
- **公网 IP**: `43.136.128.130`
- **服务器**: 腾讯云轻量应用服务器

---

## 🌐 访问方式

### 方式 1: 服务器本地访问
```bash
# 前端
http://localhost:3000

# 后端 API
http://localhost:8000

# 通过 Nginx (推荐)
http://localhost/
```

### 方式 2: 内网访问（同一内网的其他服务器）
```bash
http://10.6.0.17/
```

### 方式 3: 公网访问（需要配置安全组）

**⚠️ 重要：公网无法访问的原因**

你的服务器是**腾讯云轻量应用服务器**，需要在腾讯云控制台配置**防火墙/安全组**规则。

#### 配置步骤：

1. **登录腾讯云控制台**
   - 访问：https://console.cloud.tencent.com/lighthouse/

2. **找到你的服务器**
   - 实例名称：`VM-0-17-ubuntu`
   - 实例 ID：查看控制台

3. **配置防火墙规则**
   - 进入服务器详情页 → **防火墙** 标签
   - 添加规则：
     ```
     端口：80
     协议：TCP
     来源：0.0.0.0/0 (允许所有 IP)
     备注：Web 服务
     ```

4. **保存规则**
   - 等待 1-2 分钟生效

5. **测试访问**
   ```
   http://43.136.128.130/
   ```

---

## 🔧 配置域名（可选）

如果你有域名，可以配置域名访问：

### 步骤 1: DNS 解析

在你的域名服务商处添加 A 记录：

```
类型：A
主机记录：@ (或 www)
记录值：43.136.128.130
TTL: 600
```

### 步骤 2: 修改 Nginx 配置

编辑 `/etc/nginx/sites-available/watermark-tool`：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;  # 替换为你的域名
    ...
}
```

### 步骤 3: 重启 Nginx

```bash
/usr/sbin/nginx -t && /usr/sbin/nginx -s reload
```

### 步骤 4: 访问域名

```
http://your-domain.com/
```

---

## 🚀 快速测试

### 测试本地访问
```bash
curl http://localhost/
```

### 测试内网访问
```bash
curl http://10.6.0.17/
```

### 测试公网访问（配置防火墙后）
```bash
curl http://43.136.128.130/
```

---

## 📝 Nginx 配置说明

当前 Nginx 配置：

```nginx
server {
    listen 80;
    server_name _;  # 接受所有域名

    # 前端页面代理到 3000 端口
    location / {
        proxy_pass http://127.0.0.1:3000;
        ...
    }

    # API 代理到 8000 端口
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        ...
    }

    # API 文档
    location /docs {
        proxy_pass http://127.0.0.1:8000/docs;
        ...
    }
}
```

---

## 🔍 故障排查

### 问题 1: 公网无法访问

**原因**: 腾讯云防火墙未开放 80 端口

**解决**: 
1. 登录腾讯云控制台
2. 进入服务器 → 防火墙
3. 添加规则：端口 80，来源 0.0.0.0/0

### 问题 2: 页面显示 Nginx 默认页

**原因**: 默认配置未删除

**解决**:
```bash
rm /etc/nginx/sites-enabled/default
/usr/sbin/nginx -s reload
```

### 问题 3: API 返回 404

**原因**: 路由配置问题

**解决**: 
- 确保访问 `http://your-ip/api/...`
- 检查后端服务是否运行：`ps aux | grep python`

---

## 🛑 停止服务

```bash
# 停止后端
pkill -f "python main.py"

# 停止前端
pkill -f "python3 -m http.server"

# 停止 Nginx
/usr/sbin/nginx -s stop
```

---

## 📞 腾讯云防火墙配置截图指引

1. 登录 https://console.cloud.tencent.com/
2. 进入 **轻量应用服务器**
3. 点击你的服务器 `VM-0-17-ubuntu`
4. 点击顶部 **防火墙** 标签
5. 点击 **添加规则**
6. 填写：
   - 端口：`80`
   - 协议：`TCP`
   - 来源：`0.0.0.0/0`
7. 点击 **确定**

等待 1-2 分钟后，即可通过公网 IP 访问！

---

**现在就去腾讯云控制台配置防火墙吧！** 🔥

配置完成后访问：`http://43.136.128.130/`
