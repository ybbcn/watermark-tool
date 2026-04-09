import { NextRequest, NextResponse } from "next/server";
import { createOrder, createSubscription, SUBSCRIPTION_PLANS, CREDIT_PACKS } from "@/lib/paypal";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    console.log('🔔 [PayPal] Creating order...', request.url);
    
    const body = await request.json();
    const { amount, currency = 'USD', plan, type = 'one-time', credits } = body;
    
    console.log('📝 [PayPal] Request body:', { amount, currency, type, plan });
    
    if (!amount || typeof amount !== 'number') {
      console.error('❌ [PayPal] Invalid amount:', amount);
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }
    
    // 一次性支付（积分包）
    if (type === 'one-time') {
      const description = credits 
        ? `${credits} 次处理积分包`
        : 'One-time payment';
      
      const order = await createOrder(amount, currency, description);
      
      return NextResponse.json({
        success: true,
        orderId: order.id,
        approvalUrl: order.links?.find((link: any) => link.rel === 'approve')?.href,
        type: 'one-time',
        credits,
      });
    }
    
    // 订阅支付（暂时禁用，需要先创建订阅计划）
    if (type === 'subscription') {
      console.warn('⚠️ [PayPal] Subscription not configured yet, falling back to one-time payment');
      // 暂时作为一次性支付处理
    }
  } catch (error) {
    console.error('❌ [PayPal] Create order error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create PayPal order',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
