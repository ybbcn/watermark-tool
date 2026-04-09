/**
 * PayPal 支付工具库
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

export interface CreateOrderRequest {
  intent: 'CAPTURE' | 'AUTHORIZE';
  purchase_units: Array<{
    amount: {
      currency_code: string;
      value: string;
    };
    description?: string;
  }>;
}

// PayPal 配置
const PAYPAL_CONFIG: PayPalConfig = {
  clientId: process.env.PAYPAL_CLIENT_ID || '',
  clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
  baseUrl: process.env.PAYPAL_BASE_URL || 'https://api-m.paypal.com', // 正式环境
  // 测试环境：https://api-m.sandbox.paypal.com
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
    throw new Error(`Failed to get access token: ${response.status}`);
  }
  
  const data = await response.json();
  return data.access_token;
}

/**
 * 创建 PayPal 订单
 */
export async function createOrder(amount: number, currency: string = 'USD', description?: string): Promise<PayPalOrder> {
  const accessToken = await getAccessToken();
  
  const requestBody: CreateOrderRequest = {
    intent: 'CAPTURE',
    purchase_units: [{
      amount: {
        currency_code: currency,
        value: amount.toFixed(2),
      },
      description,
    }],
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
    throw new Error(`Failed to create order: ${response.status}`);
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
    throw new Error(`Failed to capture order: ${response.status}`);
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
    throw new Error(`Failed to get order details: ${response.status}`);
  }
  
  return await response.json();
}
