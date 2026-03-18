#!/usr/bin/env python3
"""
测试水印功能
"""

import sys
sys.path.insert(0, '.')

from PIL import Image
from processors.text_watermark import add_text_watermark
from processors.logo_watermark import add_logo_watermark
from processors.remove_watermark import remove_watermark_auto
import io

# 创建测试图片（红色背景）
test_img = Image.new('RGB', (800, 600), color=(255, 0, 0))

# 测试文字水印
print("📝 测试文字水印...")
result = add_text_watermark(
    test_img,
    text="© Test Watermark",
    position="bottom-right",
    opacity=0.8,
    font_size=48
)

# 保存测试结果
result.save('/tmp/test_watermark_result.jpg', quality=95)
print("✅ 测试图片已保存：/tmp/test_watermark_result.jpg")

# 验证水印是否存在（检查右下角像素是否有变化）
original = test_img.load()
watermarked = result.load()

# 检查右下角区域
diff_count = 0
for y in range(500, 600):
    for x in range(600, 800):
        if original[x, y] != watermarked[x, y]:
            diff_count += 1

print(f"📊 右下角区域差异像素数：{diff_count}")
if diff_count > 0:
    print("✅ 水印已成功添加！")
else:
    print("❌ 水印未显示，需要进一步排查")
