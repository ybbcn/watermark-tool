import { NextRequest, NextResponse } from "next/server";
import { captureOrder, getOrderDetails } from "@/lib/paypal";
import { getCloudflareContext } from "@cloudflare/next-on-pages";
import { getUserByEmail, updateUserQuota } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, userId, userEmail, plan } = body;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    // 捕获订单
    const captureResult = await captureOrder(orderId);
    
    if (captureResult.status !== 'COMPLETED') {
      return NextResponse.json(
        { 
          error: 'Payment not completed',
          status: captureResult.status
        },
        { status: 400 }
      );
    }
    
    // 获取订单详情
    const orderDetails = await getOrderDetails(orderId);
    const amount = orderDetails.purchase_units?.[0]?.amount?.value;
    const currency = orderDetails.purchase_units?.[0]?.amount?.currency_code;
    
    console.log('✅ [PayPal] Payment completed:', {
      orderId,
      amount,
      currency,
      userId,
      plan,
    });
    
    // 更新用户配额
    if (userId || userEmail) {
      try {
        const env = await getCloudflareContext();
        const db = (env as any).env?.DB || (env as any).DB;
        
        if (db) {
          // 根据邮箱查找用户
          const user = userEmail ? await getUserByEmail(db, userEmail) : null;
          
          if (user) {
            // 根据计划更新配额
            const quotaUpdate = {
              Pro: { daily_limit: 100 },
              Enterprise: { daily_limit: 999999 },
            }[plan] || { daily_limit: 100 };
            
            // 更新用户订阅状态
            await db.prepare(`
              UPDATE users 
              SET subscription_type = ?, 
                  daily_limit = ?,
                  daily_used = 0,
                  daily_reset_at = strftime('%s', 'now'),
                  updated_at = strftime('%s', 'now')
              WHERE id = ?
            `).bind(plan.toLowerCase(), quotaUpdate.daily_limit, user.id).run();
            
            console.log('✅ [PayPal] User subscription updated:', {
              userId: user.id,
              plan,
              ...quotaUpdate,
            });
          }
        }
      } catch (dbError) {
        console.error('❌ [PayPal] Database update error:', dbError);
        // 不返回错误，支付已成功
      }
    }
    
    return NextResponse.json({
      success: true,
      status: 'COMPLETED',
      amount,
      currency,
      plan,
    });
  } catch (error) {
    console.error('❌ [PayPal] Capture order error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to capture PayPal order',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
