import { NextRequest, NextResponse } from "next/server";
import { createOrder, createSubscription, SUBSCRIPTION_PLANS, CREDIT_PACKS } from "@/lib/paypal";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, currency = 'USD', plan, type = 'one-time', credits } = body;
    
    if (!amount || typeof amount !== 'number') {
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
    
    // 订阅支付
    if (type === 'subscription') {
      // 获取用户邮箱（从 session 或其他地方）
      const sessionRes = await fetch(new URL('/api/auth/session', request.url), {
        headers: { cookie: request.headers.get('cookie') || '' },
      });
      const sessionData = await sessionRes.json();
      const userEmail = sessionData.user?.email;
      
      // 根据计划 ID 选择对应的订阅计划
      let planId = SUBSCRIPTION_PLANS.PRO_MONTHLY;
      
      if (plan === 'pro-yearly') {
        planId = SUBSCRIPTION_PLANS.PRO_YEARLY;
      } else if (plan === 'enterprise') {
        planId = SUBSCRIPTION_PLANS.ENTERPRISE_MONTHLY;
      }
      
      // 创建订阅
      const subscription = await createSubscription(planId, userEmail);
      
      return NextResponse.json({
        success: true,
        subscriptionId: subscription.id,
        approvalUrl: subscription.links?.find((link: any) => link.rel === 'approve')?.href,
        type: 'subscription',
        plan,
      });
    }
    
    return NextResponse.json(
      { error: 'Invalid payment type' },
      { status: 400 }
    );
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
