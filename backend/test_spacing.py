#!/usr/bin/env python3
"""测试间距调整 - 0-300px，默认 36px"""

import sys
sys.path.insert(0, '.')

from PIL import Image
from processors.text_watermark import add_text_watermark
from processors.logo_watermark import add_logo_watermark

print("=" * 60)
print("💧 水印间距测试 - 范围 0-300px，默认 36px")
print("=" * 60)

test_img = Image.new('RGB', (1920, 1080), color=(100, 150, 200))

# 测试不同间距
spacings = [0, 36, 100, 200, 300]

for spacing in spacings:
    print(f"\n📝 测试间距 {spacing}px...")
    result = add_text_watermark(
        test_img.copy(),
        text="水印",
        position="center",
        opacity=0.6,
        font_size=24,
        color="#000000",
        rotation=-30,
        shadow="light",
        bg="none",
        tile="tile",
        spacing=spacing
    )
    result.save(f'/tmp/spacing_{spacing}px.jpg')
    print(f"✅ 间距 {spacing}px - /tmp/spacing_{spacing}px.jpg")

# 测试默认值（36px）
print("\n📝 测试默认值（36px）...")
result = add_text_watermark(
    test_img.copy(),
    text="水印",
    position="center",
    opacity=0.6,
    font_size=24,
    color="#000000",
    rotation=-30,
    shadow="light",
    bg="none",
    tile="tile",
    spacing=36
)
result.save('/tmp/spacing_default.jpg')
print("✅ 默认间距 36px - /tmp/spacing_default.jpg")

print("\n" + "=" * 60)
print("✅ 间距测试完成！")
print("=" * 60)
print("\n测试文件:")
print("  - /tmp/spacing_0px.jpg      间距 0px（无间隙）")
print("  - /tmp/spacing_36px.jpg     间距 36px（默认）")
print("  - /tmp/spacing_100px.jpg    间距 100px")
print("  - /tmp/spacing_200px.jpg    间距 200px")
print("  - /tmp/spacing_300px.jpg    间距 300px（最大）")
print("  - /tmp/spacing_default.jpg  默认值测试")
