import { NextRequest, NextResponse } from "next/server";

/**
 * PayPal Webhook 处理器
 * 用于接收支付成功、订阅激活等通知
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const eventType = body.event_type;
    const resource = body.resource;
    
    console.log('🔔 [PayPal Webhook] Event received:', {
      eventType,
      transmissionId: request.headers.get('paypal-transmission-id'),
      time: request.headers.get('paypal-transmission-time'),
    });
    
    // 处理不同类型的事件
    switch (eventType) {
      // ========== 一次性支付 ==========
      case 'PAYMENT.CAPTURE.COMPLETED':
        console.log('✅ [PayPal] Payment completed:', {
          orderId: resource.id,
          amount: resource.amount?.value,
          currency: resource.amount?.currency_code,
        });
        break;
      
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.FAILED':
        console.warn('❌ [PayPal] Payment failed:', {
          orderId: resource.id,
          status: resource.status,
        });
        break;
      
      // ========== 订阅相关 ==========
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        console.log('✅ [PayPal] Subscription activated:', {
          subscriptionId: resource.id,
          planId: resource.plan_id,
        });
        break;
      
      case 'BILLING.SUBSCRIPTION.CANCELLED':
        console.warn('⚠️ [PayPal] Subscription cancelled:', {
          subscriptionId: resource.id,
        });
        break;
      
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        console.warn('⚠️ [PayPal] Subscription expired:', {
          subscriptionId: resource.id,
        });
        break;
      
      case 'BILLING.SUBSCRIPTION.PAYMENT.FAILED':
        console.warn('❌ [PayPal] Subscription payment failed:', {
          subscriptionId: resource.id,
        });
        break;
      
      // ========== 退款 ==========
      case 'CHECKOUT.ORDER.REFUNDED':
        console.log('💰 [PayPal] Order refunded:', {
          orderId: resource.id,
        });
        break;
      
      default:
        console.log('ℹ️ [PayPal Webhook] Unhandled event type:', eventType);
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
