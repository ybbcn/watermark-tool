#!/usr/bin/env python3
"""全面测试水印功能"""

import sys
sys.path.insert(0, '.')

from PIL import Image, ImageDraw
from processors.text_watermark import add_text_watermark
from processors.logo_watermark import add_logo_watermark
from processors.remove_watermark import remove_watermark_auto

print("=" * 50)
print("💧 Watermark Tool - 全面测试")
print("=" * 50)

# 创建测试图片
test_img = Image.new('RGB', (1920, 1080), color=(100, 150, 200))

# 测试 1: 默认设置（黑色文字，字体 18，"水印"）
print("\n📝 测试 1: 默认设置...")
result = add_text_watermark(
    test_img.copy(),
    text="水印",
    position="bottom-right",
    opacity=0.8,
    font_size=18,
    color="#000000",
    rotation=0,
    shadow="medium",
    bg="none",
    tile="none"
)
result.save('/tmp/test_default.jpg')
print("✅ 默认设置 - 已保存：/tmp/test_default.jpg")

# 测试 2: 网格平铺
print("\n📝 测试 2: 网格平铺...")
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
    tile="tile"
)
result.save('/tmp/test_tile.jpg')
print("✅ 网格平铺 - 已保存：/tmp/test_tile.jpg")

# 测试 3: 对角线平铺
print("\n📝 测试 3: 对角线平铺...")
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
    tile="diagonal"
)
result.save('/tmp/test_diagonal.jpg')
print("✅ 对角线平铺 - 已保存：/tmp/test_diagonal.jpg")

# 测试 4: 旋转 + 阴影
print("\n📝 测试 4: 旋转 + 阴影...")
result = add_text_watermark(
    test_img.copy(),
    text="© 测试文字",
    position="center",
    opacity=0.9,
    font_size=36,
    color="#FF0000",
    rotation=45,
    shadow="heavy",
    bg="blur",
    tile="none"
)
result.save('/tmp/test_rotation.jpg')
print("✅ 旋转 + 阴影 - 已保存：/tmp/test_rotation.jpg")

# 测试 5: Logo 水印
print("\n📝 测试 5: Logo 水印...")
logo_img = Image.new('RGBA', (200, 200), color=(255, 0, 0, 200))
result = add_logo_watermark(
    test_img.copy(),
    logo_img,
    position="bottom-right",
    scale=0.15
)
result.save('/tmp/test_logo.jpg')
print("✅ Logo 水印 - 已保存：/tmp/test_logo.jpg")

# 测试 6: 移除水印
print("\n📝 测试 6: 移除水印...")
# 创建一个带白色水印的图片
img_with_wm = Image.new('RGB', (800, 600), color=(50, 50, 50))
draw = ImageDraw.Draw(img_with_wm)
draw.text((700, 550), "水印", fill=(255, 255, 255, 200))
result = remove_watermark_auto(img_with_wm)
result.save('/tmp/test_remove.jpg')
print("✅ 移除水印 - 已保存：/tmp/test_remove.jpg")

print("\n" + "=" * 50)
print("✅ 所有测试完成！")
print("=" * 50)
print("\n测试文件列表:")
print("  1. /tmp/test_default.jpg      - 默认设置")
print("  2. /tmp/test_tile.jpg         - 网格平铺")
print("  3. /tmp/test_diagonal.jpg     - 对角线平铺")
print("  4. /tmp/test_rotation.jpg     - 旋转 + 阴影")
print("  5. /tmp/test_logo.jpg         - Logo 水印")
print("  6. /tmp/test_remove.jpg       - 移除水印")
