#!/usr/bin/env python3
"""测试修复后的功能"""

import sys
sys.path.insert(0, '.')

from PIL import Image
from processors.text_watermark import add_text_watermark

# 创建测试图片（模拟真实图片）
test_img = Image.new('RGB', (1920, 1080), color=(50, 50, 80))

print("📝 测试 1: 文字完整显示...")
result = add_text_watermark(
    test_img.copy(),
    text="© 这是一个很长的水印文字测试 2026",
    position="bottom-right",
    opacity=0.8,
    font_size=48,
    color="#FFFFFF",
    rotation=0,
    shadow="medium",
    bg="none",
    tile="none"
)
result.save('/tmp/test_complete_text.jpg')
print("✅ 已保存：/tmp/test_complete_text.jpg")

print("\n📝 测试 2: 对角线平铺...")
result = add_text_watermark(
    test_img.copy(),
    text="© 对角线平铺测试",
    position="center",
    opacity=0.5,
    font_size=36,
    color="#FFFF00",
    rotation=-30,
    shadow="light",
    bg="none",
    tile="diagonal"
)
result.save('/tmp/test_diagonal_tile.jpg')
print("✅ 已保存：/tmp/test_diagonal_tile.jpg")

print("\n📝 测试 3: 网格平铺...")
result = add_text_watermark(
    test_img.copy(),
    text="© 网格平铺",
    position="center",
    opacity=0.4,
    font_size=36,
    color="#00FF00",
    rotation=-45,
    shadow="none",
    bg="none",
    tile="tile"
)
result.save('/tmp/test_grid_tile.jpg')
print("✅ 已保存：/tmp/test_grid_tile.jpg")

print("\n📝 测试 4: 旋转 + 阴影...")
result = add_text_watermark(
    test_img.copy(),
    text="© 旋转 45 度",
    position="center",
    opacity=0.9,
    font_size=60,
    color="#FF0000",
    rotation=45,
    shadow="heavy",
    bg="blur",
    tile="none"
)
result.save('/tmp/test_rotation_shadow.jpg')
print("✅ 已保存：/tmp/test_rotation_shadow.jpg")

print("\n📝 测试 5: 高清晰度水印...")
result = add_text_watermark(
    test_img.copy(),
    text="© 高清晰度",
    position="bottom-right",
    opacity=1.0,
    font_size=72,
    color="#FFFFFF",
    rotation=0,
    shadow="medium",
    bg="none",
    tile="none"
)
result.save('/tmp/test_high_quality.jpg')
print("✅ 已保存：/tmp/test_high_quality.jpg")

print("\n✅ 所有测试完成！")
