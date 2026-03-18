#!/usr/bin/env python3
"""终极版水印去除测试"""

import sys
sys.path.insert(0, '.')

from PIL import Image, ImageDraw
from processors.remove_watermark import remove_watermark_auto
import numpy as np

print("=" * 70)
print("💧 终极版水印去除测试 - 多尺度 + 引导滤波 + 泊松混合")
print("=" * 70)

# 测试 1: 标准测试 - 深色背景
print("\n📝 测试 1: 深色背景 + 白色水印...")
img1 = Image.new('RGB', (800, 600), color=(50, 50, 80))
draw1 = ImageDraw.Draw(img1)
draw1.text((650, 550), "© Watermark", fill=(255, 255, 255, 220))
img1.save('/tmp/ultimate_test1_orig.jpg')
result1 = remove_watermark_auto(img1)
result1.save('/tmp/ultimate_test1_result.jpg')
print("✅ 已保存对比图")

# 测试 2: 渐变背景
print("\n📝 测试 2: 渐变背景...")
img2 = Image.new('RGB', (800, 600))
for y in range(600):
    for x in range(800):
        img2.putpixel((x, y), (int(100 + x/8), int(150 + y/6), int(200 - x/8)))
draw2 = ImageDraw.Draw(img2)
draw2.text((600, 500), "© Gradient", fill=(255, 255, 255, 230))
img2.save('/tmp/ultimate_test2_orig.jpg')
result2 = remove_watermark_auto(img2)
result2.save('/tmp/ultimate_test2_result.jpg')
print("✅ 已保存对比图")

# 测试 3: 真实场景模拟 - 照片风格
print("\n📝 测试 3: 真实照片风格...")
# 创建类似照片的颜色分布
img3_array = np.random.normal(128, 40, (600, 800, 3)).astype(np.uint8)
img3 = Image.fromarray(img3_array)
draw3 = ImageDraw.Draw(img3)
draw3.text((600, 520), "© Photo 2026", fill=(255, 255, 255, 200))
img3.save('/tmp/ultimate_test3_orig.jpg')
result3 = remove_watermark_auto(img3)
result3.save('/tmp/ultimate_test3_result.jpg')
print("✅ 已保存对比图")

# 测试 4: 大水印
print("\n📝 测试 4: 大尺寸水印...")
img4 = Image.new('RGB', (1920, 1080), color=(80, 120, 160))
draw4 = ImageDraw.Draw(img4)
draw4.text((1600, 950), "© Copyright Protection", fill=(255, 255, 255, 180))
img4.save('/tmp/ultimate_test4_orig.jpg')
result4 = remove_watermark_auto(img4)
result4.save('/tmp/ultimate_test4_result.jpg')
print("✅ 已保存对比图")

# 测试 5: 半透明水印
print("\n📝 测试 5: 半透明水印...")
img5 = Image.new('RGB', (800, 600), color=(100, 150, 200))
draw5 = ImageDraw.Draw(img5)
draw5.text((600, 500), "© Alpha", fill=(255, 255, 255, 100))
img5.save('/tmp/ultimate_test5_orig.jpg')
result5 = remove_watermark_auto(img5)
result5.save('/tmp/ultimate_test5_result.jpg')
print("✅ 已保存对比图")

print("\n" + "=" * 70)
print("✅ 终极版测试完成！")
print("=" * 70)
print("\n💡 核心技术:")
print("  1. 多尺度修复 (3/7/15/25px 半径)")
print("  2. 自适应权重融合")
print("  3. 引导滤波平滑边缘")
print("  4. 泊松混合自然过渡")
print("  5. 梯度域颜色校正")
print("  6. 双边滤波去噪")
print("\n📁 测试文件:")
print("  - /tmp/ultimate_test{1-5}_orig.jpg    原图")
print("  - /tmp/ultimate_test{1-5}_result.jpg  去除结果")
