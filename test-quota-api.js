#!/usr/bin/env node
/**
 * 配额 API 测试脚本
 * 测试完整的配额检查和扣减流程
 */

const https = require('https');

const CONFIG = {
  baseUrl: 'https://ybbtool.com',
  testEmail: 'yanxuebb@gmail.com',
};

/**
 * 测试 Session API
 */
async function testSession() {
  console.log('📝 测试 1: 检查 Session API\n');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'ybbtool.com',
      path: '/api/auth/session',
      method: 'GET',
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('状态码:', res.statusCode);
        try {
          const json = JSON.parse(data);
          console.log('响应:', JSON.stringify(json, null, 2));
          resolve(json);
        } catch (e) {
          console.log('响应 (raw):', data.substring(0, 200));
          resolve({ raw: data });
        }
      });
    });
    
    req.on('error', (e) => {
      console.log('错误:', e.message);
      resolve({ error: e.message });
    });
    
    req.end();
  });
}

/**
 * 测试配额检查 API
 */
async function testQuotaAPI(sessionCookie) {
  console.log('\n📝 测试 2: 检查配额 API (/api/user/info)\n');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'ybbtool.com',
      path: '/api/user/info',
      method: 'GET',
      headers: {
        'Cookie': sessionCookie || '',
      },
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('状态码:', res.statusCode);
        try {
          const json = JSON.parse(data);
          console.log('响应:', JSON.stringify(json, null, 2));
          resolve(json);
        } catch (e) {
          console.log('响应 (raw):', data.substring(0, 200));
          resolve({ raw: data });
        }
      });
    });
    
    req.on('error', (e) => {
      console.log('错误:', e.message);
      resolve({ error: e.message });
    });
    
    req.end();
  });
}

/**
 * 测试水印处理 API
 */
async function testWatermarkAPI(sessionCookie) {
  console.log('\n📝 测试 3: 测试水印处理 API (/api/add-watermark)\n');
  
  // 创建一个简单的测试图片（1x1 像素 PNG）
  const pngData = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  
  const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
  
  const bodyParts = [
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from('Content-Disposition: form-data; name="file"; filename="test.png"\r\n'),
    Buffer.from('Content-Type: image/png\r\n\r\n'),
    pngData,
    Buffer.from('\r\n'),
    Buffer.from(`--${boundary}--\r\n`),
  ];
  
  const body = Buffer.concat(bodyParts);
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'ybbtool.com',
      path: '/api/add-watermark',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        'Cookie': sessionCookie || '',
      },
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('状态码:', res.statusCode);
        try {
          const json = JSON.parse(data);
          console.log('响应:', JSON.stringify(json, null, 2));
          resolve(json);
        } catch (e) {
          console.log('响应 (raw):', data.substring(0, 200));
          resolve({ raw: data });
        }
      });
    });
    
    req.on('error', (e) => {
      console.log('错误:', e.message);
      resolve({ error: e.message });
    });
    
    req.write(body);
    req.end();
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('       配额完整测试 - ybbtool.com');
  console.log('═══════════════════════════════════════════════════════\n');
  
  // 测试 1: Session
  const sessionResult = await testSession();
  
  // 测试 2: 配额 API（无 cookie）
  await testQuotaAPI('');
  
  // 测试 3: 水印处理（无 cookie）
  await testWatermarkAPI('');
  
  console.log('\n═══════════════════════════════════════════════════════');
  console.log('测试完成！');
  console.log('═══════════════════════════════════════════════════════\n');
  
  console.log('💡 提示：以上测试使用无 cookie 状态（未登录）');
  console.log('');
  console.log('如需测试登录状态，请：');
  console.log('1. 在浏览器打开 https://ybbtool.com');
  console.log('2. 登录你的 Google 账号');
  console.log('3. 打开开发者工具 (F12) → Network 标签');
  console.log('4. 刷新页面，找到任意请求');
  console.log('5. 复制 Cookie 值');
  console.log('6. 运行：node test-quota-api.js <cookie>');
  console.log('');
}

main().catch(console.error);
