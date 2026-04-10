#!/usr/bin/env node
/**
 * 水印功能完整测试脚本
 * 测试水印处理、配额扣减、配额显示
 */

const https = require('https');
const crypto = require('crypto');

const CONFIG = {
  baseUrl: 'https://ybbtool.com',
};

/**
 * 创建测试图片（带简单像素数据）
 */
function createTestImage() {
  // 创建一个简单的 PNG 图片（100x100 像素，蓝色背景）
  const pngHeader = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,
    0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52,
    0x00, 0x00, 0x00, 0x64, 0x00, 0x00, 0x00, 0x64,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x88, 0x95, 0x1E,
    0x1D, 0x00, 0x00, 0x00, 0x01, 0x73, 0x52, 0x47,
    0x42, 0x00, 0xAE, 0xCE, 0x1C, 0xE9, 0x00, 0x00,
    0x00, 0x18, 0x49, 0x44, 0x41, 0x54, 0x78, 0xDA,
    0x62, 0x60, 0x60, 0x60, 0x60, 0x60, 0x60, 0x60,
    0x60, 0x60, 0x60, 0x60, 0x60, 0x60, 0x60, 0x60,
    0x00, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x01,
    0x00, 0x0D, 0xDD, 0x8D, 0x01, 0x00, 0x00, 0x00,
    0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60,
    0x82
  ]);
  
  return pngHeader;
}

/**
 * 测试水印处理 API
 */
async function testWatermarkProcessing(sessionCookie) {
  console.log('📝 测试 1: 水印处理功能\n');
  
  const file = createTestImage();
  const boundary = '----WebKitFormBoundary' + crypto.randomBytes(16).toString('hex');
  
  const bodyParts = [
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from('Content-Disposition: form-data; name="file"; filename="test.png"\r\n'),
    Buffer.from('Content-Type: image/png\r\n\r\n'),
    file,
    Buffer.from('\r\n'),
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from('Content-Disposition: form-data; name="text"\r\n\r\n'),
    Buffer.from('测试水印\r\n'),
    Buffer.from('\r\n'),
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from('Content-Disposition: form-data; name="position"\r\n\r\n'),
    Buffer.from('bottom-right\r\n'),
    Buffer.from('\r\n'),
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from('Content-Disposition: form-data; name="opacity"\r\n\r\n'),
    Buffer.from('1.0\r\n'),
    Buffer.from('\r\n'),
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from('Content-Disposition: form-data; name="fontSize"\r\n\r\n'),
    Buffer.from('48\r\n'),
    Buffer.from('\r\n'),
    Buffer.from(`--${boundary}\r\n`),
    Buffer.from('Content-Disposition: form-data; name="color"\r\n\r\n'),
    Buffer.from('#FFFFFF\r\n'),
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
      let data = Buffer.alloc(0);
      res.on('data', chunk => data = Buffer.concat([data, chunk]));
      res.on('end', () => {
        console.log('状态码:', res.statusCode);
        console.log('Content-Type:', res.headers['content-type']);
        console.log('响应大小:', data.length, 'bytes');
        
        if (res.statusCode === 200 && data.length > 0) {
          console.log('✅ 水印处理成功！\n');
          resolve({ success: true, size: data.length });
        } else {
          try {
            const json = JSON.parse(data.toString());
            console.log('响应:', JSON.stringify(json, null, 2));
            resolve({ success: false, error: json });
          } catch (e) {
            console.log('响应 (raw):', data.toString().substring(0, 200));
            resolve({ success: false, error: data.toString() });
          }
        }
      });
    });
    
    req.on('error', (e) => {
      console.log('错误:', e.message);
      resolve({ success: false, error: e.message });
    });
    
    req.write(body);
    req.end();
  });
}

/**
 * 测试配额 API
 */
async function testQuotaAPI(sessionCookie) {
  console.log('📝 测试 2: 配额查询 API (/api/user/info)\n');
  
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
          
          if (json.user && json.user.daily_limit !== undefined) {
            console.log(`✅ 配额查询成功：${json.user.daily_used || 0}/${json.user.daily_limit}\n`);
            resolve({ success: true, data: json });
          } else {
            console.log('❌ 配额数据缺失\n');
            resolve({ success: false, data: json });
          }
        } catch (e) {
          console.log('响应 (raw):', data.substring(0, 200));
          resolve({ success: false, error: e.message });
        }
      });
    });
    
    req.on('error', (e) => {
      console.log('错误:', e.message);
      resolve({ success: false, error: e.message });
    });
    
    req.end();
  });
}

/**
 * 测试 Session API
 */
async function testSession(sessionCookie) {
  console.log('📝 测试 0: Session 检查 (/api/auth/session)\n');
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'ybbtool.com',
      path: '/api/auth/session',
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
          
          if (json.user) {
            console.log(`✅ 已登录：${json.user.email}\n`);
            resolve({ success: true, user: json.user });
          } else {
            console.log('❌ 未登录\n');
            resolve({ success: false, user: null });
          }
        } catch (e) {
          console.log('响应 (raw):', data.substring(0, 200));
          resolve({ success: false, error: e.message });
        }
      });
    });
    
    req.on('error', (e) => {
      console.log('错误:', e.message);
      resolve({ success: false, error: e.message });
    });
    
    req.end();
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('       水印功能完整测试 - ybbtool.com');
  console.log('═══════════════════════════════════════════════════════\n');
  
  const sessionCookie = process.argv[2];
  
  if (!sessionCookie) {
    console.log('❌ 请提供 Session Cookie\n');
    console.log('使用方法：');
    console.log('1. 在浏览器打开 https://ybbtool.com');
    console.log('2. 登录你的 Google 账号');
    console.log('3. 打开开发者工具 (F12) → Network 标签');
    console.log('4. 刷新页面，找到任意请求');
    console.log('5. 复制 Cookie 值（整个 Cookie 字符串）');
    console.log('6. 运行：node test-watermark-full.js "session=xxx; other=yyy"\n');
    
    // 无 cookie 测试
    console.log('📝 使用无 cookie 状态测试（未登录）...\n');
    await testWatermarkProcessing('');
    return;
  }
  
  console.log(`🔑 使用提供的 Session Cookie\n`);
  
  // 测试 1: Session
  const sessionResult = await testSession(sessionCookie);
  
  if (!sessionResult.success) {
    console.log('❌ Session 无效，请重新登录\n');
    return;
  }
  
  // 测试 2: 配额查询
  const quotaBefore = await testQuotaAPI(sessionCookie);
  
  // 测试 3: 水印处理
  const watermarkResult = await testWatermarkProcessing(sessionCookie);
  
  if (watermarkResult.success) {
    console.log('✅ 水印处理测试通过！\n');
  } else {
    console.log('❌ 水印处理测试失败\n');
  }
  
  // 测试 4: 配额查询（处理后）
  console.log('📝 测试 3: 配额查询（处理后）\n');
  const quotaAfter = await testQuotaAPI(sessionCookie);
  
  // 比较配额变化
  if (quotaBefore.success && quotaAfter.success) {
    const before = quotaBefore.data.user.daily_used || 0;
    const after = quotaAfter.data.user.daily_used || 0;
    
    if (after > before) {
      console.log(`✅ 配额已扣减：${before} → ${after}\n`);
    } else {
      console.log(`⚠️ 配额未变化：${after}/${quotaAfter.data.user.daily_limit}\n`);
    }
  }
  
  console.log('═══════════════════════════════════════════════════════');
  console.log('测试完成！');
  console.log('═══════════════════════════════════════════════════════\n');
}

main().catch(console.error);
