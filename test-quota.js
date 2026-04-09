/**
 * 配额扣减测试脚本
 * 用于验证配额扣减功能是否正常工作
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// 配置
const CONFIG = {
  baseUrl: 'https://ybbtool.com',
  testEmail: 'test@example.com',  // 替换为你的测试邮箱
};

/**
 * 创建测试图片（1x1 像素的 PNG）
 */
function createTestImage() {
  // 一个简单的 1x1 像素 PNG
  const pngData = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  return pngData;
}

/**
 * 创建 multipart/form-data 请求体
 */
function createMultipartBody(imageData, boundary) {
  const body = [];
  
  // 文件部分
  body.push(Buffer.from(`--${boundary}\r\n`));
  body.push(Buffer.from(`Content-Disposition: form-data; name="file"; filename="test.png"\r\n`));
  body.push(Buffer.from(`Content-Type: image/png\r\n\r\n`));
  body.push(imageData);
  body.push(Buffer.from(`\r\n`));
  
  // 结束边界
  body.push(Buffer.from(`--${boundary}--\r\n`));
  
  return Buffer.concat(body);
}

/**
 * 测试水印 API（需要登录后的 cookie）
 */
function testWatermarkApi(cookie) {
  return new Promise((resolve, reject) => {
    const imageData = createTestImage();
    const boundary = '----WebKitFormBoundary' + Math.random().toString(36).substring(2);
    const body = createMultipartBody(imageData, boundary);
    
    const options = {
      hostname: 'ybbtool.com',
      port: 443,
      path: '/api/add-watermark',
      method: 'POST',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
        'Cookie': cookie || '',
      },
    };
    
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        console.log(`\n📊 Response Status: ${res.statusCode}`);
        console.log('📄 Response Headers:', res.headers);
        try {
          const json = JSON.parse(data);
          console.log('📝 Response Body:', JSON.stringify(json, null, 2));
        } catch (e) {
          console.log('📝 Response Body (raw):', data.substring(0, 500));
        }
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
        });
      });
    });
    
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('🧪 开始测试配额扣减功能...\n');
  console.log('📍 测试目标:', CONFIG.baseUrl);
  console.log('📧 测试邮箱:', CONFIG.testEmail);
  console.log('');
  
  console.log('⚠️  注意：此测试需要你先手动登录获取 cookie');
  console.log('');
  console.log('📋 测试步骤：');
  console.log('1. 在浏览器中访问 https://ybbtool.com');
  console.log('2. 登录你的账户');
  console.log('3. 打开开发者工具 (F12) -> Network 标签');
  console.log('4. 刷新页面，找到任意请求，复制 Cookie 值');
  console.log('5. 将 Cookie 粘贴到下方提示处');
  console.log('');
  
  // 简单测试（无 cookie，测试匿名用户）
  console.log('🔍 测试 1: 匿名用户（无 cookie）');
  try {
    await testWatermarkApi('');
    console.log('✅ 匿名用户测试完成\n');
  } catch (error) {
    console.log('❌ 匿名用户测试失败:', error.message, '\n');
  }
  
  console.log('💡 如需测试登录用户配额扣减，请提供 cookie 后再次运行此脚本');
  console.log('');
  console.log('🔍 验证配额是否扣减的方法：');
  console.log('1. 访问 Cloudflare Dashboard -> Workers & Pages -> watermark-tool');
  console.log('2. 点击 Deployments -> 最新部署 -> View deployment');
  console.log('3. 查看 Logs，搜索 "Quota consumed" 或 "Quota NOT consumed"');
  console.log('');
  console.log('或者使用 Wrangler CLI 查询数据库：');
  console.log('wrangler d1 execute watermark-tool-db --command "SELECT id, email, daily_limit, daily_used FROM users WHERE email = \'你的邮箱\'"');
}

main().catch(console.error);
