#!/usr/bin/env python3
"""调试水印检测"""

import sys
sys.path.insert(0, '.')

from PIL import Image, ImageDraw
from processors.remove_watermark import detect_watermark_mask
import cv2
import numpy as np

# 创建测试图
img = Image.new('RGB', (800, 600), color=(50, 50, 80))
draw = ImageDraw.Draw(img)
draw.text((650, 550), "© Watermark", fill=(255, 255, 255, 220))
img.save('/tmp/debug_orig.jpg')

# 转换为 OpenCV 格式
img_array = np.array(img)
img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)

# 检测掩码
mask = detect_watermark_mask(img_bgr)

print(f"图片尺寸：{img.width}x{img.height}")
print(f"掩码尺寸：{mask.shape}")
print(f"掩码非零像素：{np.sum(mask > 0)}")
print(f"掩码覆盖率：{np.sum(mask > 0) / (img.width * img.height) * 100:.2f}%")

# 保存掩码
cv2.imwrite('/tmp/debug_mask.jpg', mask)

# 显示掩码统计
print("\n掩码统计:")
print(f"  最小值：{mask.min()}")
print(f"  最大值：{mask.max()}")
print(f"  平均值：{mask.mean():.2f}")

# 尝试不同的阈值
for thresh in [50, 100, 150, 200]:
    mask_bin = (mask > thresh).astype(np.uint8) * 255
    count = np.sum(mask_bin > 0)
    print(f"  阈值 {thresh}: {count} 像素 ({count / (img.width * img.height) * 100:.2f}%)")

print("\n✅ 已保存:")
print("  - /tmp/debug_orig.jpg   原图")
print("  - /tmp/debug_mask.jpg   检测掩码")
