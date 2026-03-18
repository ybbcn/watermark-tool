"""
文字水印处理器 - 完整修复版
支持旋转、阴影、背景、平铺、间隙调整等高级功能
"""

from PIL import Image, ImageDraw, ImageFont, ImageFilter
from typing import Tuple
import math


def get_font(size: int) -> ImageFont.FreeTypeFont:
    """获取字体"""
    font_paths = [
        "/usr/share/fonts/truetype/wqy/wqy-zenhei.ttc",
        "/usr/share/fonts/truetype/droid/DroidSansFallbackFull.ttf",
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
        "/System/Library/Fonts/PingFang.ttc",
        "C:\\Windows\\Fonts\\msyh.ttc",
        "C:\\Windows\\Fonts\\simhei.ttf",
    ]
    for font_path in font_paths:
        try:
            return ImageFont.truetype(font_path, size)
        except (IOError, OSError, FileNotFoundError):
            continue
    try:
        return ImageFont.truetype("DejaVuSans-Bold.ttf", size)
    except:
        return ImageFont.load_default()


def hex_to_rgb(hex_color: str) -> Tuple[int, int, int]:
    """将 HEX 颜色转换为 RGB 元组"""
    hex_color = hex_color.lstrip('#')
    return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))


def apply_shadow(draw: ImageDraw.Draw, text: str, position: Tuple[int, int], font: ImageFont.FreeTypeFont, fill_color: Tuple[int, int, int, int], shadow_type: str):
    """应用阴影效果"""
    x, y = position
    shadow_offsets = {
        "light": [(2, 2)],
        "medium": [(2, 2), (4, 4), (-2, -2)],
        "heavy": [(2, 2), (4, 4), (6, 6), (-2, -2), (-4, -4)]
    }
    offsets = shadow_offsets.get(shadow_type, [])
    for dx, dy in offsets:
        draw.text((x + dx, y + dy), text, font=font, fill=(0, 0, 0, 180))
    draw.text((x, y), text, font=font, fill=fill_color)


def rotate_image(img: Image.Image, angle: float) -> Image.Image:
    """旋转图片"""
    if angle == 0:
        return img
    return img.rotate(-angle, expand=True, resample=Image.Resampling.BICUBIC)


def create_tiled_watermark(base_img: Image.Image, watermark_img: Image.Image, tile_mode: str, spacing: int) -> Image.Image:
    """创建平铺水印"""
    result = Image.new('RGBA', base_img.size, (0, 0, 0, 0))
    wm_width, wm_height = watermark_img.size
    
    # 使用用户指定的间距，最小为 1 避免除零错误
    spacing_x = max(spacing, 1)
    spacing_y = max(spacing, 1)
    
    if tile_mode == "tile":
        # 网格平铺
        for y in range(-spacing_y, base_img.height + spacing_y, spacing_y):
            for x in range(-spacing_x, base_img.width + spacing_x, spacing_x):
                result.paste(watermark_img, (x, y), watermark_img)
    
    elif tile_mode == "diagonal":
        # 对角线平铺 - 修复版
        row = 0
        for y in range(-spacing_y * 2, base_img.height + spacing_y * 2, spacing_y):
            offset = (row % 2) * (spacing_x // 2)
            for x in range(-spacing_x * 2, base_img.width + spacing_x * 2, spacing_x):
                result.paste(watermark_img, (x + offset, y), watermark_img)
            row += 1
    
    return result


def add_text_watermark(
    img: Image.Image,
    text: str,
    position: str = "bottom-right",
    opacity: float = 0.8,
    font_size: int = 18,
    color: str = "#000000",
    rotation: int = 0,
    shadow: str = "none",
    bg: str = "none",
    tile: str = "none",
    spacing: int = 300
) -> Image.Image:
    """
    添加文字水印（支持高级功能）
    """
    # 确保原图是 RGBA 模式
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # 获取字体
    font = get_font(font_size)
    
    # 计算文字大小
    temp_layer = Image.new('RGBA', (1, 1), (0, 0, 0, 0))
    temp_draw = ImageDraw.Draw(temp_layer)
    bbox = temp_draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    # 增加额外的底部边距，确保文字显示完整
    text_height = int(text_height * 1.3)
    
    # 自适应字体大小
    max_width = img.width * 0.9
    max_height = img.height * 0.3
    if text_width > max_width or text_height > max_height:
        scale_width = max_width / text_width if text_width > max_width else 1
        scale_height = max_height / text_height if text_height > max_height else 1
        scale = min(scale_width, scale_height)
        font_size = max(int(font_size * scale), 12)
        font = get_font(font_size)
        temp_layer = Image.new('RGBA', (1, 1), (0, 0, 0, 0))
        temp_draw = ImageDraw.Draw(temp_layer)
        bbox = temp_draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        text_height = int(text_height * 1.3)
    
    # 解析颜色
    r, g, b = hex_to_rgb(color)
    alpha = int(255 * opacity)
    fill_color = (r, g, b, alpha)
    
    # 处理平铺模式
    if tile != "none":
        # 创建单个水印图层
        single_size = max(text_width, text_height) + 80
        single_wm = Image.new('RGBA', (single_size, single_size), (0, 0, 0, 0))
        single_draw = ImageDraw.Draw(single_wm)
        
        # 绘制文字（居中）
        text_x = (single_size - text_width) // 2
        text_y = (single_size - text_height) // 2
        
        if shadow != "none":
            apply_shadow(single_draw, text, (text_x, text_y), font, fill_color, shadow)
        else:
            single_draw.text((text_x, text_y), text, font=font, fill=fill_color)
        
        # 旋转
        if rotation != 0:
            single_wm = rotate_image(single_wm, rotation)
        
        # 应用平铺
        result_layer = create_tiled_watermark(img, single_wm, tile, spacing)
        result = Image.alpha_composite(img, result_layer)
        return result.convert('RGB')
    
    # 非平铺模式 - 单个水印
    # 添加背景
    if bg != "none":
        bg_padding = 15
        bg_width = text_width + bg_padding * 2
        bg_height = text_height + bg_padding * 2
        bg_layer = Image.new('RGBA', (bg_width, bg_height), (0, 0, 0, 180))
        if bg == "blur":
            bg_layer = bg_layer.filter(ImageFilter.GaussianBlur(radius=5))
        x, y = get_position(position, img.width, img.height, bg_width, bg_height)
        text_x, text_y = x + bg_padding, y + bg_padding
    else:
        x, y = get_position(position, img.width, img.height, text_width, text_height)
        text_x, text_y = x, y
    
    # 创建文字图层
    text_layer = Image.new('RGBA', (text_width, text_height), (0, 0, 0, 0))
    text_draw = ImageDraw.Draw(text_layer)
    
    # 绘制文字（带阴影）
    if shadow != "none":
        apply_shadow(text_draw, text, (0, 0), font, fill_color, shadow)
    else:
        text_draw.text((0, 0), text, font=font, fill=fill_color)
    
    # 旋转文字
    if rotation != 0:
        text_layer = rotate_image(text_layer, rotation)
        tw, th = text_layer.size
        text_x = text_x - (tw - text_width) // 2
        text_y = text_y - (th - text_height) // 2
    
    # 创建最终图层并粘贴
    final_layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    final_layer.paste(text_layer, (int(text_x), int(text_y)), text_layer)
    
    # 合并
    result = Image.alpha_composite(img, final_layer)
    return result.convert('RGB')


def get_position(position: str, img_width: int, img_height: int, text_width: int, text_height: int) -> Tuple[int, int]:
    """根据位置名称计算实际坐标"""
    padding = 30  # 增加边距确保文字完整显示
    if position == "top-left":
        return (padding, padding)
    elif position == "top-right":
        return (img_width - text_width - padding, padding)
    elif position == "bottom-left":
        return (padding, img_height - text_height - padding)
    elif position == "bottom-right":
        return (img_width - text_width - padding, img_height - text_height - padding)
    elif position == "center":
        return ((img_width - text_width) // 2, (img_height - text_height) // 2)
    else:
        return (img_width - text_width - padding, img_height - text_height - padding)
