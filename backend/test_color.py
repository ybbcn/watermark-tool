#!/usr/bin/env python3
"""测试颜色参数"""

import sys
sys.path.insert(0, '.')

from PIL import Image
from processors.text_watermark import add_text_watermark, hex_to_rgb

# 测试颜色转换
print("测试 hex_to_rgb:")
print(f"  #FFFFFF -> {hex_to_rgb('#FFFFFF')}")
print(f"  #ff0000 -> {hex_to_rgb('#ff0000')}")
print(f"  #00ff00 -> {hex_to_rgb('#00ff00')}")
print(f"  #0000ff -> {hex_to_rgb('#0000ff')}")

# 创建测试图片（红色背景）
test_img = Image.new('RGB', (800, 600), color=(100, 100, 100))

# 测试不同颜色
colors = ['#FFFFFF', '#FF0000', '#00FF00', '#0000FF', '#FFFF00']

for color in colors:
    result = add_text_watermark(
        test_img.copy(),
        text=f"Test {color}",
        position="bottom-right",
        opacity=1.0,
        font_size=48,
        color=color
    )
    result.save(f'/tmp/test_color_{color[1:]}.jpg')
    print(f"✅ 已保存：/tmp/test_color_{color[1:]}.jpg")
