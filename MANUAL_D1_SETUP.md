# 🗄️ D1 数据库绑定配置 - 最后方案

## ❌ 问题

通过 API 和 wrangler CLI 配置 D1 绑定都失败了。Cloudflare Pages 的 D1 绑定**必须在 Dashboard 手动配置**。

## ✅ 解决方案：Cloudflare Dashboard 手动配置

### 步骤 1：访问 Dashboard
打开：https://dash.cloudflare.com

### 步骤 2：进入 Pages 项目
1. 左侧菜单：**Workers & Pages**
2. 找到并点击：**watermark-tool**
3. 点击左侧：**Settings**

### 步骤 3：配置 D1 绑定
1. 向下滚动到 **Functions** 部分
2. 找到 **D1 database bindings**
3. 点击：**+ Add binding**（或 **Edit**）

填写：
| 字段 | 值 |
|------|-----|
| **Variable name** | `DB` |
| **D1 database** | `watermark-tool-db` |

> 💡 如果下拉列表中没有 `watermark-tool-db`，说明数据库不存在。需要先创建。

4. 点击：**Save**

### 步骤 4：重新部署
配置更改后需要重新部署：

1. 点击左侧：**Deployments**
2. 找到最新的部署
3. 点击右侧的 **⋮**（三个点）
4. 选择：**Retry deployment**

等待 2-3 分钟部署完成。

### 步骤 5：验证
访问：https://ybbtool.com/api/test-db

**预期响应**：
```json
{
  "success": true,
  "message": "数据库连接正常",
  "result": { "test": 1 }
}
```

---

## 🧪 测试配额扣减

验证 D1 绑定正常后，测试完整流程：

```bash
# 测试水印功能并扣减配额
curl -s https://ybbtool.com/api/add-watermark \
  -X POST \
  -F "file=@test-image.png" \
  -o /tmp/watermarked.jpg \
  -w "HTTP Status: %{http_code}\n"

# 查看结果
ls -lh /tmp/watermarked.jpg
```

**预期**：
- HTTP Status: 200
- 文件已下载
- 配额已扣减（daily_used +1）

---

## 📞 配置完成后告诉我

配置 D1 绑定并重新部署后，请告诉我：
1. `/api/test-db` 的响应
2. 水印功能是否正常
3. 配额是否扣减

我会继续帮你测试和完善！🥜
