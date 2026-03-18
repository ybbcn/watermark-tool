#!/usr/bin/env python3
"""测试默认值 - 字体 16，间距 100"""

import sys
sys.path.insert(0, '.')

from PIL import Image
from processors.text_watermark import add_text_watermark
from processors.logo_watermark import add_logo_watermark

print("=" * 60)
print("💧 测试默认值 - 字体 16，间距 100")
print("=" * 60)

test_img = Image.new('RGB', (1920, 1080), color=(100, 150, 200))

# 测试 1: 默认字体大小 16
print("\n📝 测试 1: 默认字体大小 16...")
result = add_text_watermark(
    test_img.copy(),
    text="水印",
    position="bottom-right",
    opacity=0.8,
    font_size=16,
    color="#000000",
    rotation=0,
    shadow="none",
    bg="none",
    tile="none",
    spacing=100
)
result.save('/tmp/test_font16.jpg')
print("✅ 字体 16 - /tmp/test_font16.jpg")

# 测试 2: 默认间距 100（网格平铺）
print("\n📝 测试 2: 默认间距 100（网格平铺）...")
result = add_text_watermark(
    test_img.copy(),
    text="水印",
    position="center",
    opacity=0.6,
    font_size=16,
    color="#000000",
    rotation=-30,
    shadow="light",
    bg="none",
    tile="tile",
    spacing=100
)
result.save('/tmp/test_spacing100_tile.jpg')
print("✅ 间距 100 网格平铺 - /tmp/test_spacing100_tile.jpg")

# 测试 3: 默认间距 100（对角线）
print("\n📝 测试 3: 默认间距 100（对角线）...")
result = add_text_watermark(
    test_img.copy(),
    text="水印",
    position="center",
    opacity=0.6,
    font_size=16,
    color="#000000",
    rotation=-30,
    shadow="light",
    bg="none",
    tile="diagonal",
    spacing=100
)
result.save('/tmp/test_spacing100_diagonal.jpg')
print("✅ 间距 100 对角线 - /tmp/test_spacing100_diagonal.jpg")

# 测试 4: 间距拖动测试（0, 50, 100, 200, 300）
print("\n📝 测试 4: 间距拖动测试...")
for spacing in [0, 50, 100, 200, 300]:
    result = add_text_watermark(
        test_img.copy(),
        text="水印",
        position="center",
        opacity=0.6,
        font_size=16,
        color="#000000",
        rotation=-30,
        shadow="light",
        bg="none",
        tile="tile",
        spacing=spacing
    )
    result.save(f'/tmp/test_spacing_{spacing}.jpg')
    print(f"✅ 间距 {spacing}px - /tmp/test_spacing_{spacing}.jpg")

# 测试 5: Logo 水印默认间距 100
print("\n📝 测试 5: Logo 水印默认间距 100...")
logo_img = Image.new('RGBA', (200, 200), color=(255, 0, 0, 200))
result = add_logo_watermark(
    test_img.copy(),
    logo_img,
    position="center",
    scale=0.1,
    opacity=0.6,
    rotation=-45,
    tile="tile",
    spacing=100
)
result.save('/tmp/test_logo_spacing100.jpg')
print("✅ Logo 间距 100 - /tmp/test_logo_spacing100.jpg")

print("\n" + "=" * 60)
print("✅ 所有测试完成！")
print("=" * 60)
print("\n测试文件:")
print("  - /tmp/test_font16.jpg              字体 16")
print("  - /tmp/test_spacing100_tile.jpg     间距 100 网格")
print("  - /tmp/test_spacing100_diagonal.jpg 间距 100 对角线")
print("  - /tmp/test_spacing_0.jpg           间距 0")
print("  - /tmp/test_spacing_50.jpg          间距 50")
print("  - /tmp/test_spacing_100.jpg         间距 100")
print("  - /tmp/test_spacing_200.jpg         间距 200")
print("  - /tmp/test_spacing_300.jpg         间距 300")
print("  - /tmp/test_logo_spacing100.jpg     Logo 间距 100")
