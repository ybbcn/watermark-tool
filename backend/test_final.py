#!/usr/bin/env python3
"""最终测试 - 验证所有修复"""

import sys
sys.path.insert(0, '.')

from PIL import Image
from processors.text_watermark import add_text_watermark
from processors.logo_watermark import add_logo_watermark

print("=" * 60)
print("💧 Watermark Tool - 最终测试")
print("=" * 60)

# 创建测试图片
test_img = Image.new('RGB', (1920, 1080), color=(100, 150, 200))

# 测试 1: 默认设置（黑色，18 号字体，"水印"，无阴影）
print("\n📝 测试 1: 默认设置...")
result = add_text_watermark(
    test_img.copy(),
    text="水印",
    position="bottom-right",
    opacity=0.8,
    font_size=18,
    color="#000000",
    rotation=0,
    shadow="none",
    bg="none",
    tile="none",
    spacing=300
)
result.save('/tmp/final_default.jpg')
print("✅ 默认设置 - /tmp/final_default.jpg")

# 测试 2: 网格平铺（间距 200px）
print("\n📝 测试 2: 网格平铺 (间距 200px)...")
result = add_text_watermark(
    test_img.copy(),
    text="水印",
    position="center",
    opacity=0.5,
    font_size=24,
    color="#000000",
    rotation=-30,
    shadow="light",
    bg="none",
    tile="tile",
    spacing=200
)
result.save('/tmp/final_tile_200.jpg')
print("✅ 网格平铺 (200px) - /tmp/final_tile_200.jpg")

# 测试 3: 网格平铺（间距 400px）
print("\n📝 测试 3: 网格平铺 (间距 400px)...")
result = add_text_watermark(
    test_img.copy(),
    text="水印",
    position="center",
    opacity=0.5,
    font_size=24,
    color="#000000",
    rotation=-30,
    shadow="light",
    bg="none",
    tile="tile",
    spacing=400
)
result.save('/tmp/final_tile_400.jpg')
print("✅ 网格平铺 (400px) - /tmp/final_tile_400.jpg")

# 测试 4: 对角线平铺（间距 300px）
print("\n📝 测试 4: 对角线平铺 (间距 300px)...")
result = add_text_watermark(
    test_img.copy(),
    text="水印",
    position="center",
    opacity=0.5,
    font_size=24,
    color="#000000",
    rotation=-30,
    shadow="light",
    bg="none",
    tile="diagonal",
    spacing=300
)
result.save('/tmp/final_diagonal_300.jpg')
print("✅ 对角线平铺 (300px) - /tmp/final_diagonal_300.jpg")

# 测试 5: 对角线平铺（间距 500px）
print("\n📝 测试 5: 对角线平铺 (间距 500px)...")
result = add_text_watermark(
    test_img.copy(),
    text="水印",
    position="center",
    opacity=0.5,
    font_size=24,
    color="#000000",
    rotation=-30,
    shadow="light",
    bg="none",
    tile="diagonal",
    spacing=500
)
result.save('/tmp/final_diagonal_500.jpg')
print("✅ 对角线平铺 (500px) - /tmp/final_diagonal_500.jpg")

# 测试 6: Logo 水印（单个）
print("\n📝 测试 6: Logo 水印（单个）...")
logo_img = Image.new('RGBA', (200, 200), color=(255, 0, 0, 200))
result = add_logo_watermark(
    test_img.copy(),
    logo_img,
    position="bottom-right",
    scale=0.15,
    opacity=0.8,
    rotation=0,
    tile="none",
    spacing=300
)
result.save('/tmp/final_logo_single.jpg')
print("✅ Logo 水印（单个）- /tmp/final_logo_single.jpg")

# 测试 7: Logo 水印（网格平铺）
print("\n📝 测试 7: Logo 水印（网格平铺）...")
result = add_logo_watermark(
    test_img.copy(),
    logo_img,
    position="center",
    scale=0.1,
    opacity=0.6,
    rotation=-45,
    tile="tile",
    spacing=250
)
result.save('/tmp/final_logo_tile.jpg')
print("✅ Logo 水印（网格平铺）- /tmp/final_logo_tile.jpg")

# 测试 8: Logo 水印（对角线平铺）
print("\n📝 测试 8: Logo 水印（对角线平铺）...")
result = add_logo_watermark(
    test_img.copy(),
    logo_img,
    position="center",
    scale=0.1,
    opacity=0.6,
    rotation=-45,
    tile="diagonal",
    spacing=300
)
result.save('/tmp/final_logo_diagonal.jpg')
print("✅ Logo 水印（对角线平铺）- /tmp/final_logo_diagonal.jpg")

print("\n" + "=" * 60)
print("✅ 所有测试完成！")
print("=" * 60)
print("\n测试文件:")
print("  文字水印:")
print("    - /tmp/final_default.jpg       默认设置")
print("    - /tmp/final_tile_200.jpg      网格平铺 200px")
print("    - /tmp/final_tile_400.jpg      网格平铺 400px")
print("    - /tmp/final_diagonal_300.jpg  对角线 300px")
print("    - /tmp/final_diagonal_500.jpg  对角线 500px")
print("  Logo 水印:")
print("    - /tmp/final_logo_single.jpg   单个")
print("    - /tmp/final_logo_tile.jpg     网格平铺")
print("    - /tmp/final_logo_diagonal.jpg 对角线平铺")
