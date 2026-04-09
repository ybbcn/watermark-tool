import { NextRequest, NextResponse } from "next/server";
import { getCloudflareContext } from "@cloudflare/next-on-pages";

/**
 * PayPal Webhook 处理器
 * 用于接收支付成功、订阅激活等通知
 */

export async function POST(request: NextRequest) {
  try {
    // 获取请求头
    const transmissionId = request.headers.get('paypal-transmission-id');
    const transmissionTime = request.headers.get('paypal-transmission-time');
    const certUrl = request.headers.get('paypal-cert-url');
    const actualSignature = request.headers.get('paypal-transmission-sig');
    
    const body = await request.json();
    const eventType = body.event_type;
    const resource = body.resource;
    
    console.log('🔔 [PayPal Webhook] Event received:', {
      eventType,
      transmissionId,
      time: transmissionTime,
    });
    
    // TODO: 验证 Webhook 签名（生产环境必须）
    // const isValid = await verifyWebhookSignature(request);
    // if (!isValid) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }
    
    // 处理不同类型的事件
    switch (eventType) {
      // ========== 一次性支付 ==========
      case 'PAYMENT.CAPTURE.COMPLETED':
        await handlePaymentCompleted(resource);
        break;
      
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.FAILED':
        await handlePaymentFailed(resource);
        break;
      
      // ========== 订阅相关 ==========
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(resource);
        break;
      
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        await handleSubscriptionCancelled(resource);
        break;
      
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await handleSubscriptionExpired(resource);
        break;
      
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        await handleSubscriptionPaymentFailed(resource);
        break;
      
      // ========== 退款 ==========
      case 'CHECKOUT.ORDER.REFUNDED':
        await handleOrderRefunded(resource);
        break;
      
      default:
        console.log('⚠️ [PayPal Webhook] Unhandled event type:', eventType);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ [PayPal Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

/**
 * 处理支付完成
 */
async function handlePaymentCompleted(resource: any) {
  console.log('✅ [PayPal] Payment completed:', {
    orderId: resource.id,
    amount: resource.amount?.value,
    currency: resource.amount?.currency_code,
  });
  
  // 获取数据库连接
  const env = await getCloudflareContext();
  const db = (env as any).env?.DB || (env as any).DB;
  
  if (!db) {
    console.warn('⚠️ [PayPal] Database not available');
    return;
  }
  
  // 根据订单号更新用户状态
  // TODO: 实现订单到用户的映射
}

/**
 * 处理支付失败
 */
async function handlePaymentFailed(resource: any) {
  console.warn('❌ [PayPal] Payment failed:', {
    orderId: resource.id,
    status: resource.status,
  });
}

/**
 * 处理订阅激活
 */
async function handleSubscriptionActivated(resource: any) {
  console.log('✅ [PayPal] Subscription activated:', {
    subscriptionId: resource.id,
    planId: resource.plan_id,
    status: resource.status,
  });
  
  const env = await getCloudflareContext();
  const db = (env as any).env?.DB || (env as any).DB;
  
  if (!db) return;
  
  // 更新用户订阅状态
  // TODO: 实现订阅到用户的映射
}

/**
 * 处理订阅取消
 */
async function handleSubscriptionCancelled(resource: any) {
  console.log('⚠️ [PayPal] Subscription cancelled:', {
    subscriptionId: resource.id,
  });
  
  const env = await getCloudflareContext();
  const db = (env as any).env?.DB || (env as any).DB;
  
  if (!db) return;
  
  // 更新用户订阅状态为取消
  // TODO: 实现
}

/**
 * 处理订阅过期
 */
async function handleSubscriptionExpired(resource: any) {
  console.log('⚠️ [PayPal] Subscription expired:', {
    subscriptionId: resource.id,
  });
  
  const env = await getCloudflareContext();
  const db = (env as any).env?.DB || (env as any).DB;
  
  if (!db) return;
  
  // 恢复用户为免费版
  // TODO: 实现
}

/**
 * 处理订阅支付失败
 */
async function handleSubscriptionPaymentFailed(resource: any) {
  console.warn('❌ [PayPal] Subscription payment failed:', {
    subscriptionId: resource.id,
  });
  
  // 可以发送邮件通知用户
  // TODO: 实现
}

/**
 * 处理订单退款
 */
async function handleOrderRefunded(resource: any) {
  console.log('💰 [PayPal] Order refunded:', {
    orderId: resource.id,
  });
  
  // 取消用户的高级权限
  // TODO: 实现
}

/**
 * 验证 Webhook 签名（生产环境使用）
 */
async function verifyWebhookSignature(request: NextRequest): Promise<boolean> {
  // TODO: 实现签名验证
  // 参考：https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature
  return true; // 沙箱环境暂时跳过验证
}
