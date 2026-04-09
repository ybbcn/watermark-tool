# 💰 PayPal Webhook 配置指南

## 📋 什么是 Webhook？

Webhook 是 PayPal 主动通知你的服务器支付事件的方式，例如：
- ✅ 支付成功
- ✅ 订阅激活
- ⚠️ 支付失败
- ⚠️ 订阅取消

---

## 🛠️ 配置步骤

### 步骤 1：访问 PayPal Developer Dashboard

1. 访问：https://developer.paypal.cn（中国）或 https://developer.paypal.com（国际）
2. 登录你的 PayPal 账户
3. 进入 **Dashboard**

### 步骤 2：创建 Webhook

1. 点击左侧菜单 **Apps & Credentials**
2. 确保在 **Sandbox** 模式（测试环境）
3. 点击你的应用名称
4. 向下滚动找到 **Webhooks** 部分
5. 点击 **Add webhook**

### 步骤 3：配置 Webhook

填写以下信息：

| 字段 | 值 |
|------|-----|
| **Webhook URL** | `https://ybbtool.com/api/payment/paypal/webhook` |
| **Event types** | 选择以下事件（见下方） |

### 步骤 4：选择事件类型

勾选以下事件：

#### 一次性支付
- ✅ `PAYMENT.CAPTURE.COMPLETED` - 支付完成
- ✅ `PAYMENT.CAPTURE.DENIED` - 支付拒绝
- ✅ `PAYMENT.CAPTURE.FAILED` - 支付失败
- ✅ `CHECKOUT.ORDER.REFUNDED` - 订单退款

#### 订阅支付
- ✅ `BILLING.SUBSCRIPTION.ACTIVATED` - 订阅激活
- ✅ `BILLING.SUBSCRIPTION.CANCELLED` - 订阅取消
- ✅ `BILLING.SUBSCRIPTION.EXPIRED` - 订阅过期
- ✅ `BILLING.SUBSCRIPTION.PAYMENT.FAILED` - 订阅支付失败
- ✅ `BILLING.SUBSCRIPTION.UPDATED` - 订阅更新

### 步骤 5：保存 Webhook

点击 **Save** 保存配置。

### 步骤 6：记录 Webhook ID

保存后，你会看到：
- **Webhook ID**（例如：`8AB12345CD678901E`）
- **Webhook URL**
- **Created** 时间

**请记录 Webhook ID**，后续可能需要用到。

---

## 🧪 测试 Webhook

### 方法 1：PayPal Dashboard 发送测试事件

1. 在 Webhook 详情页
2. 点击 **Send notification**
3. 选择事件类型（如 `PAYMENT.CAPTURE.COMPLETED`）
4. 点击 **Send**
5. 查看响应

### 方法 2：查看 Webhook 日志

1. Dashboard → **Webhooks** → **History**
2. 查看所有发送的 Webhook 事件
3. 查看成功/失败状态
4. 可以重发失败的事件

---

## 🔍 验证 Webhook 是否工作

### 1. 检查日志

访问 Cloudflare Pages 日志：
```
https://dash.cloudflare.com → Workers & Pages → watermark-tool → Deployments → Logs
```

搜索 `PayPal Webhook` 查看接收到的事件。

### 2. 本地测试

使用 PayPal 的 Webhook 模拟器：
```bash
curl -X POST https://ybbtool.com/api/payment/paypal/webhook \
  -H "Content-Type: application/json" \
  -H "paypal-transmission-id: test-123" \
  -H "paypal-transmission-time: 2024-01-01T00:00:00Z" \
  -d '{
    "event_type": "PAYMENT.CAPTURE.COMPLETED",
    "resource": {
      "id": "TEST-ORDER-ID",
      "status": "COMPLETED",
      "amount": {
        "value": "9.99",
        "currency_code": "USD"
      }
    }
  }'
```

---

## ⚠️ 注意事项

### 1. 环境区分
- **Sandbox** - 测试环境（当前使用）
- **Live** - 正式环境（上线后配置）

### 2. Webhook 签名验证
生产环境必须验证签名，防止伪造请求：

```typescript
// 在 webhook/route.ts 中实现
const isValid = await verifyWebhookSignature(request);
if (!isValid) {
  return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
}
```

### 3. 错误处理
- Webhook 失败会自动重试（最多 10 次）
- 确保你的端点返回 `200 OK` 表示成功接收

---

## 📊 Webhook 事件处理流程

```
PayPal → Webhook → 验证签名 → 处理事件 → 更新数据库 → 发送通知
   ↓
记录日志
```

---

## 🎯 已完成的功能

- ✅ Webhook 端点创建
- ✅ 事件类型处理
- ✅ 日志记录
- ⏳ 数据库更新（需要实现订单映射）
- ⏳ 邮件通知（可选）

---

## 📝 下一步

1. ✅ 在 PayPal Dashboard 配置 Webhook URL
2. ✅ 选择需要的事件类型
3. ✅ 测试 Webhook 接收
4. ⏳ 实现订单到用户的映射
5. ⏳ 实现订阅状态更新
6. ⏳ 添加邮件通知

---

**🥜 花生提示**：
- 先在 **Sandbox 环境** 测试
- 测试完成后再配置 **Live 环境**
- 配置完成后告诉我，我会帮你测试！
