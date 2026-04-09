import { NextRequest, NextResponse } from "next/server";
import { captureOrder, getOrderDetails } from "@/lib/paypal";

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId } = body;
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }
    
    console.log('🔔 [PayPal] Capturing order:', orderId);
    
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
    });
    
    // TODO: 更新用户配额（需要实现数据库访问）
    
    return NextResponse.json({
      success: true,
      status: 'COMPLETED',
      amount,
      currency,
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
