#!/usr/bin/env python3
"""测试移除水印优化效果"""

import sys
sys.path.insert(0, '.')

from PIL import Image, ImageDraw
from processors.remove_watermark import remove_watermark_auto
import cv2
import numpy as np

print("=" * 60)
print("💧 移除水印优化测试")
print("=" * 60)

# 创建测试图片 - 模拟带白色水印的图片
print("\n📝 创建测试图片...")

# 测试 1: 深色背景 + 白色文字水印
print("\n测试 1: 深色背景 + 白色水印...")
img1 = Image.new('RGB', (800, 600), color=(50, 50, 80))
draw1 = ImageDraw.Draw(img1)
draw1.text((650, 550), "© Watermark", fill=(255, 255, 255, 220), font_size=20)
img1.save('/tmp/remove_test1_original.jpg')
result1 = remove_watermark_auto(img1)
result1.save('/tmp/remove_test1_result.jpg')
print("✅ 已保存：/tmp/remove_test1_original.jpg -> /tmp/remove_test1_result.jpg")

# 测试 2: 浅色背景 + 白色水印
print("\n测试 2: 浅色背景 + 白色水印...")
img2 = Image.new('RGB', (800, 600), color=(200, 210, 220))
draw2 = ImageDraw.Draw(img2)
draw2.text((650, 550), "© Test", fill=(255, 255, 255, 200), font_size=20)
img2.save('/tmp/remove_test2_original.jpg')
result2 = remove_watermark_auto(img2)
result2.save('/tmp/remove_test2_result.jpg')
print("✅ 已保存：/tmp/remove_test2_original.jpg -> /tmp/remove_test2_result.jpg")

# 测试 3: 渐变背景 + 白色水印
print("\n测试 3: 渐变背景 + 白色水印...")
img3 = Image.new('RGB', (800, 600))
for y in range(600):
    for x in range(800):
        img3.putpixel((x, y), (int(100 + x/8), int(150 + y/6), int(200 - x/8)))
draw3 = ImageDraw.Draw(img3)
draw3.text((600, 500), "© Demo", fill=(255, 255, 255, 230), font_size=24)
img3.save('/tmp/remove_test3_original.jpg')
result3 = remove_watermark_auto(img3)
result3.save('/tmp/remove_test3_result.jpg')
print("✅ 已保存：/tmp/remove_test3_original.jpg -> /tmp/remove_test3_result.jpg")

# 测试 4: 角落水印
print("\n测试 4: 右下角大水印...")
img4 = Image.new('RGB', (1920, 1080), color=(80, 120, 160))
draw4 = ImageDraw.Draw(img4)
draw4.text((1700, 1000), "© Copyright 2026", fill=(255, 255, 255, 200), font_size=30)
img4.save('/tmp/remove_test4_original.jpg')
result4 = remove_watermark_auto(img4)
result4.save('/tmp/remove_test4_result.jpg')
print("✅ 已保存：/tmp/remove_test4_original.jpg -> /tmp/remove_test4_result.jpg")

print("\n" + "=" * 60)
print("✅ 移除水印测试完成！")
print("=" * 60)
print("\n测试文件:")
print("  - /tmp/remove_test1_original.jpg  深色背景原图")
print("  - /tmp/remove_test1_result.jpg    深色背景结果")
print("  - /tmp/remove_test2_original.jpg  浅色背景原图")
print("  - /tmp/remove_test2_result.jpg    浅色背景结果")
print("  - /tmp/remove_test3_original.jpg  渐变背景原图")
print("  - /tmp/remove_test3_result.jpg    渐变背景结果")
print("  - /tmp/remove_test4_original.jpg  大水印原图")
print("  - /tmp/remove_test4_result.jpg    大水印结果")
