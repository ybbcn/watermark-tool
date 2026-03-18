"""
Logo 水印处理器 - 支持高级功能
支持旋转、透明度、平铺、间隙调整等
"""

from PIL import Image
from typing import Tuple


def get_position(position: str, img_width: int, img_height: int, logo_width: int, logo_height: int) -> Tuple[int, int]:
    """根据位置名称计算实际坐标"""
    padding = 30
    if position == "top-left":
        return (padding, padding)
    elif position == "top-right":
        return (img_width - logo_width - padding, padding)
    elif position == "bottom-left":
        return (padding, img_height - logo_height - padding)
    elif position == "bottom-right":
        return (img_width - logo_width - padding, img_height - logo_height - padding)
    elif position == "center":
        return ((img_width - logo_width) // 2, (img_height - logo_height) // 2)
    else:
        return (img_width - logo_width - padding, img_height - logo_height - padding)


def rotate_image(img: Image.Image, angle: float) -> Image.Image:
    """旋转图片"""
    if angle == 0:
        return img
    return img.rotate(-angle, expand=True, resample=Image.Resampling.BICUBIC)


def create_tiled_logo(base_img: Image.Image, logo_img: Image.Image, tile_mode: str, spacing: int) -> Image.Image:
    """创建平铺 Logo 水印"""
    result = Image.new('RGBA', base_img.size, (0, 0, 0, 0))
    wm_width, wm_height = logo_img.size
    
    # 最小间距为 1 避免除零错误
    spacing_x = max(spacing, 1)
    spacing_y = max(spacing, 1)
    
    if tile_mode == "tile":
        # 网格平铺
        for y in range(-spacing_y, base_img.height + spacing_y, spacing_y):
            for x in range(-spacing_x, base_img.width + spacing_x, spacing_x):
                result.paste(logo_img, (x, y), logo_img)
    
    elif tile_mode == "diagonal":
        # 对角线平铺
        row = 0
        for y in range(-spacing_y * 2, base_img.height + spacing_y * 2, spacing_y):
            offset = (row % 2) * (spacing_x // 2)
            for x in range(-spacing_x * 2, base_img.width + spacing_x * 2, spacing_x):
                result.paste(logo_img, (x + offset, y), logo_img)
            row += 1
    
    return result


def add_logo_watermark(
    img: Image.Image,
    logo: Image.Image,
    position: str = "bottom-right",
    scale: float = 0.2,
    opacity: float = 0.8,
    rotation: int = 0,
    tile: str = "none",
    spacing: int = 300
) -> Image.Image:
    """
    添加 Logo 水印（支持高级功能）
    
    Args:
        img: 原图 (RGB 模式)
        logo: Logo 图片 (RGBA 模式)
        position: 位置
        scale: Logo 大小比例 (0.05-0.5)
        opacity: 透明度 (0-1)
        rotation: 旋转角度 (-180 到 180)
        tile: 平铺模式 (none, tile, diagonal)
        spacing: 平铺间隙 (px)
    """
    # 确保原图是 RGBA 模式
    if img.mode != 'RGBA':
        img = img.convert('RGBA')
    
    # 确保 Logo 是 RGBA 模式
    if logo.mode != 'RGBA':
        logo = logo.convert('RGBA')
    
    # 计算 Logo 大小
    base_size = min(img.width, img.height)
    new_logo_width = int(base_size * scale)
    new_logo_height = int(logo.height * (new_logo_width / logo.width))
    
    # 缩放 Logo
    logo_resized = logo.resize((new_logo_width, new_logo_height), Image.Resampling.LANCZOS)
    
    # 应用透明度
    if opacity < 1.0:
        alpha = logo_resized.split()[3]
        alpha = alpha.point(lambda p: int(p * opacity))
        logo_resized.putalpha(alpha)
    
    # 处理平铺模式
    if tile != "none":
        # 创建单个 Logo 图层
        single_size = max(new_logo_width, new_logo_height) + 80
        single_logo = Image.new('RGBA', (single_size, single_size), (0, 0, 0, 0))
        logo_x = (single_size - new_logo_width) // 2
        logo_y = (single_size - new_logo_height) // 2
        single_logo.paste(logo_resized, (logo_x, logo_y), logo_resized)
        
        # 旋转
        if rotation != 0:
            single_logo = rotate_image(single_logo, rotation)
        
        # 应用平铺
        result_layer = create_tiled_logo(img, single_logo, tile, spacing)
        result = Image.alpha_composite(img, result_layer)
        return result.convert('RGB')
    
    # 非平铺模式 - 单个 Logo
    # 旋转
    if rotation != 0:
        logo_resized = rotate_image(logo_resized, rotation)
        new_logo_width, new_logo_height = logo_resized.size
    
    # 计算位置
    x, y = get_position(position, img.width, img.height, new_logo_width, new_logo_height)
    
    # 创建透明图层并粘贴
    logo_layer = Image.new('RGBA', img.size, (0, 0, 0, 0))
    logo_layer.paste(logo_resized, (int(x), int(y)), logo_resized)
    
    # 合并
    result = Image.alpha_composite(img, logo_layer)
    return result.convert('RGB')
