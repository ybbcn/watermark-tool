#!/usr/bin/env node
/**
 * 临时配额重置脚本
 * 用于紧急清除用户配额限制
 */

const https = require('https');

const CONFIG = {
  baseUrl: 'https://ybbtool.com',
};

/**
 * 调用管理 API 重置配额（需要管理员权限）
 */
async function resetQuota(email) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email, action: 'reset-quota' });
    
    const options = {
      hostname: 'ybbtool.com',
      port: 443,
      path: '/api/admin/reset-quota',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };
    
    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        console.log(`\n📊 响应状态：${res.statusCode}`);
        try {
          const json = JSON.parse(responseData);
          console.log('📝 响应内容:', JSON.stringify(json, null, 2));
          resolve(json);
        } catch (e) {
          console.log('📝 响应内容 (raw):', responseData.substring(0, 500));
          resolve({ raw: responseData });
        }
      });
    });
    
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

/**
 * 主函数
 */
async function main() {
  console.log('🔧 配额重置工具\n');
  console.log('说明：此脚本用于紧急清除用户配额限制\n');
  
  const email = process.argv[2];
  
  if (!email) {
    console.log('❌ 请提供邮箱地址');
    console.log('用法：node reset-quota-temp.js <你的邮箱>\n');
    console.log('示例：node reset-quota-temp.js user@example.com\n');
    process.exit(1);
  }
  
  console.log(`📧 目标邮箱：${email}`);
  console.log('🔄 正在重置配额...\n');
  
  try {
    const result = await resetQuota(email);
    console.log('\n✅ 配额重置完成！');
    console.log('请刷新页面或重新登录查看最新配额。\n');
  } catch (error) {
    console.log('\n❌ 重置失败:', error.message);
    console.log('\n建议：');
    console.log('1. 确认邮箱地址正确');
    console.log('2. 等待 Cloudflare Pages 部署完成（约 2-5 分钟）');
    console.log('3. 如果仍然失败，请联系管理员手动重置\n');
  }
}

main();
