#!/bin/bash

# 测试水印 API
# 用法：./test-api.sh [图片文件路径]

IMAGE_FILE="${1:-test-image.png}"

# 创建测试图片（如果没有）
if [ ! -f "$IMAGE_FILE" ]; then
  echo "📷 创建测试图片..."
  # 创建一个简单的 1x1 像素 PNG
  echo "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==" | base64 -d > "$IMAGE_FILE"
fi

echo "🧪 测试水印 API..."
echo "📁 使用文件：$IMAGE_FILE"
echo ""

# 发送请求并显示详细响应
curl -v -X POST \
  https://ybbtool.com/api/add-watermark \
  -F "file=@$IMAGE_FILE" \
  2>&1 | tee /tmp/watermark-api-test.log

echo ""
echo "📄 完整日志已保存到：/tmp/watermark-api-test.log"
