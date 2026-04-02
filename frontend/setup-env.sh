#!/bin/bash

# Watermark Tool - 本地开发环境配置脚本
# 用于快速设置 Google OAuth 环境变量

cd /root/.openclaw/workspace/watermark-tool/frontend

echo "🔧 正在配置本地开发环境..."
echo ""
echo "⚠️  请从 TOOLS.md 或 Cloudflare Dashboard 复制以下环境变量："
echo ""
echo "  GOOGLE_CLIENT_ID=你的 Google Client ID"
echo "  GOOGLE_CLIENT_SECRET=你的 Google Client Secret"
echo "  AUTH_SECRET=你的 AUTH_SECRET"
echo ""

# 提示用户输入
read -p "请输入 GOOGLE_CLIENT_ID: " CLIENT_ID
read -p "请输入 GOOGLE_CLIENT_SECRET: " CLIENT_SECRET
read -p "请输入 AUTH_SECRET: " AUTH_SECRET

# 创建 .env.local 文件
cat > .env.local << EOF
# Google OAuth 配置
GOOGLE_CLIENT_ID=${CLIENT_ID}
GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}

# NextAuth.js Secret (用于 JWT 签名)
AUTH_SECRET=${AUTH_SECRET}
EOF

echo ""
echo "✅ .env.local 文件已创建"
echo ""
echo "📝 配置内容："
cat .env.local | grep -v "SECRET" | sed 's/=.*$/=***/'
echo "(敏感信息已隐藏)"
echo ""
echo "🚀 现在可以运行：npm run dev"
echo "🌐 访问：http://localhost:3000"
