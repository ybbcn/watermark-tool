#!/usr/bin/env python3
"""测试优化后的水印去除效果"""

import sys
sys.path.insert(0, '.')

from PIL import Image, ImageDraw
from processors.remove_watermark import remove_watermark_auto
import numpy as np

print("=" * 70)
print("💧 水印去除优化测试 - 多策略融合 + 实时预览")
print("=" * 70)

# 测试 1: 深色背景 + 白色文字水印
print("\n📝 测试 1: 深色背景 + 白色文字水印...")
img1 = Image.new('RGB', (800, 600), color=(50, 50, 80))
draw1 = ImageDraw.Draw(img1)
draw1.text((650, 550), "© Watermark", fill=(255, 255, 255, 220))
img1.save('/tmp/remove_opt_test1_orig.jpg')
result1 = remove_watermark_auto(img1)
result1.save('/tmp/remove_opt_test1_result.jpg')
print("✅ 深色背景 - 已保存")

# 测试 2: 浅色背景 + 白色水印
print("\n📝 测试 2: 浅色背景 + 白色水印...")
img2 = Image.new('RGB', (800, 600), color=(200, 210, 220))
draw2 = ImageDraw.Draw(img2)
draw2.text((650, 550), "© Test", fill=(255, 255, 255, 200))
img2.save('/tmp/remove_opt_test2_orig.jpg')
result2 = remove_watermark_auto(img2)
result2.save('/tmp/remove_opt_test2_result.jpg')
print("✅ 浅色背景 - 已保存")

# 测试 3: 渐变背景 + 水印
print("\n📝 测试 3: 渐变背景 + 水印...")
img3 = Image.new('RGB', (800, 600))
for y in range(600):
    for x in range(800):
        img3.putpixel((x, y), (int(100 + x/8), int(150 + y/6), int(200 - x/8)))
draw3 = ImageDraw.Draw(img3)
draw3.text((600, 500), "© Demo", fill=(255, 255, 255, 230))
img3.save('/tmp/remove_opt_test3_orig.jpg')
result3 = remove_watermark_auto(img3)
result3.save('/tmp/remove_opt_test3_result.jpg')
print("✅ 渐变背景 - 已保存")

# 测试 4: 大尺寸水印
print("\n📝 测试 4: 大尺寸水印...")
img4 = Image.new('RGB', (1920, 1080), color=(80, 120, 160))
draw4 = ImageDraw.Draw(img4)
draw4.text((1700, 1000), "© Copyright 2026", fill=(255, 255, 255, 200))
img4.save('/tmp/remove_opt_test4_orig.jpg')
result4 = remove_watermark_auto(img4)
result4.save('/tmp/remove_opt_test4_result.jpg')
print("✅ 大尺寸水印 - 已保存")

# 测试 5: 半透明水印
print("\n📝 测试 5: 半透明水印...")
img5 = Image.new('RGB', (800, 600), color=(100, 150, 200))
draw5 = ImageDraw.Draw(img5)
draw5.text((600, 500), "© Transparent", fill=(255, 255, 255, 128))  # 50% 透明
img5.save('/tmp/remove_opt_test5_orig.jpg')
result5 = remove_watermark_auto(img5)
result5.save('/tmp/remove_opt_test5_result.jpg')
print("✅ 半透明水印 - 已保存")

# 测试 6: 复杂背景
print("\n📝 测试 6: 复杂背景（噪点）...")
img6_array = np.random.randint(50, 200, (600, 800, 3), dtype=np.uint8)
img6 = Image.fromarray(img6_array)
draw6 = ImageDraw.Draw(img6)
draw6.text((600, 500), "© Noisy", fill=(255, 255, 255, 220))
img6.save('/tmp/remove_opt_test6_orig.jpg')
result6 = remove_watermark_auto(img6)
result6.save('/tmp/remove_opt_test6_result.jpg')
print("✅ 复杂背景 - 已保存")

print("\n" + "=" * 70)
print("✅ 所有测试完成！")
print("=" * 70)
print("\n测试文件对比:")
print("  1. /tmp/remove_opt_test1_orig.jpg    -> /tmp/remove_opt_test1_result.jpg")
print("  2. /tmp/remove_opt_test2_orig.jpg    -> /tmp/remove_opt_test2_result.jpg")
print("  3. /tmp/remove_opt_test3_orig.jpg    -> /tmp/remove_opt_test3_result.jpg")
print("  4. /tmp/remove_opt_test4_orig.jpg    -> /tmp/remove_opt_test4_result.jpg")
print("  5. /tmp/remove_opt_test5_orig.jpg    -> /tmp/remove_opt_test5_result.jpg")
print("  6. /tmp/remove_opt_test6_orig.jpg    -> /tmp/remove_opt_test6_result.jpg")
print("\n💡 改进点:")
print("  - 多策略融合检测（亮度 + 饱和度 + 角区域 + 边缘）")
print("  - 多尺度修复（3/7/11 像素半径自适应）")
print("  - 颜色校正（修复区域与边缘颜色匹配）")
print("  - 实时预览（上传后自动处理显示效果）")
