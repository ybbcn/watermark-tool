/**
 * PayPal 支付工具库 - 支持一次性支付和订阅
 */

export interface PayPalConfig {
  clientId: string;
  clientSecret: string;
  baseUrl: string;
}

export interface PayPalOrder {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface PayPalSubscription {
  id: string;
  status: string;
  plan_id: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

// PayPal 配置
const PAYPAL_CONFIG: PayPalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID || '',
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
  baseUrl: process.env.PAYPAL_BASE_URL || 'https://api-m.sandbox.paypal.com',
};

/**
 * 获取 PayPal Access Token
 */
export async function getAccessToken(): Promise<string> {
  const auth = Buffer.from(`${PAYPAL_CONFIG.clientId}:${PAYPAL_CONFIG.clientSecret}`).toString('base64');
  
  const response = await fetch(`${PAYPAL_CONFIG.baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get access token: ${response.status} - ${error}`);
  }
  
  const data = await response.json();
  return data.access_token;
}

/**
 * 创建一次性支付订单
 */
export async function createOrder(
  amount: number, 
  currency: string = 'USD', 
  description?: string,
  intent: 'CAPTURE' | 'AUTHORIZE' = 'CAPTURE'
): Promise<PayPalOrder> {
  const accessToken = await getAccessToken();
  
  const requestBody = {
    intent,
    purchase_units: [{
      amount: {
        currency_code: currency,
        value: amount.toFixed(2),
      },
      description: description || 'One-time payment',
    }],
    application_context: {
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ybbtool.com'}/payment/success`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ybbtool.com'}/payment/cancel`,
      brand_name: 'Watermark Tool',
      landing_page: 'LOGIN',
    },
  };
  
  const response = await fetch(`${PAYPAL_CONFIG.baseUrl}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create order: ${response.status} - ${error}`);
  }
  
  return await response.json();
}

/**
 * 创建订阅计划（需要先创建 Billing Plan）
 */
export async function createSubscription(
  planId: string,
  userEmail?: string
): Promise<PayPalSubscription> {
  const accessToken = await getAccessToken();
  
  const requestBody = {
    plan_id: planId,
    start_time: new Date(Date.now() + 60000).toISOString(), // 1 分钟后开始
    subscriber: userEmail ? {
      email_address: userEmail,
    } : undefined,
    application_context: {
      brand_name: 'Watermark Tool',
      locale: 'en-US',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'SUBSCRIBE_NOW',
      payment_method: {
        payer_selected: 'PAYPAL',
        payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
      },
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ybbtool.com'}/payment/success?type=subscription`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ybbtool.com'}/payment/cancel`,
    },
  };
  
  const response = await fetch(`${PAYPAL_CONFIG.baseUrl}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create subscription: ${response.status} - ${error}`);
  }
  
  return await response.json();
}

/**
 * 创建订阅计划（一次性创建）
 */
export async function createBillingPlan(
  name: string,
  description: string,
  amount: number,
  currency: string = 'USD',
  interval: 'DAY' | 'WEEK' | 'MONTH' | 'YEAR' = 'MONTH',
  intervalCount: number = 1
): Promise<any> {
  const accessToken = await getAccessToken();
  
  const requestBody = {
    product_id: 'PROD_WATERMARK_TOOL', // 需要先创建产品
    name,
    description,
    status: 'ACTIVE',
    billing_cycles: [
      {
        frequency: {
          interval_unit: interval,
          interval_count: intervalCount,
        },
        tenure_type: 'REGULAR',
        sequence: 1,
        total_cycles: 0, // 0 = 无限循环
        pricing_scheme: {
          fixed_price: {
            value: amount.toFixed(2),
            currency_code: currency,
          },
        },
      },
    ],
    payment_preferences: {
      auto_bill_outstanding: true,
      setup_fee: null,
      failure_threshold: 3,
    },
  };
  
  const response = await fetch(`${PAYPAL_CONFIG.baseUrl}/v1/billing/plans`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create billing plan: ${response.status} - ${error}`);
  }
  
  return await response.json();
}

/**
 * 捕获订单（完成支付）
 */
export async function captureOrder(orderId: string): Promise<any> {
  const accessToken = await getAccessToken();
  
  const response = await fetch(`${PAYPAL_CONFIG.baseUrl}/v2/checkout/orders/${orderId}/capture`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to capture order: ${response.status} - ${error}`);
  }
  
  return await response.json();
}

/**
 * 获取订单详情
 */
export async function getOrderDetails(orderId: string): Promise<any> {
  const accessToken = await getAccessToken();
  
  const response = await fetch(`${PAYPAL_CONFIG.baseUrl}/v2/checkout/orders/${orderId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get order details: ${response.status} - ${error}`);
  }
  
  return await response.json();
}

/**
 * 获取订阅详情
 */
export async function getSubscriptionDetails(subscriptionId: string): Promise<any> {
  const accessToken = await getAccessToken();
  
  const response = await fetch(`${PAYPAL_CONFIG.baseUrl}/v1/billing/subscriptions/${subscriptionId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get subscription details: ${response.status} - ${error}`);
  }
  
  return await response.json();
}

/**
 * 取消订阅
 */
export async function cancelSubscription(subscriptionId: string, reason?: string): Promise<void> {
  const accessToken = await getAccessToken();
  
  const response = await fetch(`${PAYPAL_CONFIG.baseUrl}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ reason: reason || 'User cancelled' }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to cancel subscription: ${response.status} - ${error}`);
  }
}

// 预定义的订阅计划 ID（需要在 PayPal Dashboard 创建）
export const SUBSCRIPTION_PLANS = {
  PRO_MONTHLY: 'P-PRO-MONTHLY-PLAN-ID',
  PRO_YEARLY: 'P-PRO-YEARLY-PLAN-ID',
  ENTERPRISE_MONTHLY: 'P-ENT-MONTHLY-PLAN-ID',
};

// 积分包配置
export const CREDIT_PACKS = {
  SMALL: { id: 'CREDIT_SMALL', amount: 4.99, credits: 10 },
  MEDIUM: { id: 'CREDIT_MEDIUM', amount: 9.99, credits: 25 },
  LARGE: { id: 'CREDIT_LARGE', amount: 19.99, credits: 60 },
};
