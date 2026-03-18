"""
水印移除处理器 - 实用版
使用简单有效的检测策略
"""

import cv2
import numpy as np
from PIL import Image


def detect_watermark_mask(img: np.ndarray) -> np.ndarray:
    """
    检测水印区域 - 实用版
    使用 Otsu 自适应阈值 + 角区域重点检测
    """
    h, w = img.shape[:2]
    gray = cv2.cvtColor(img, cv2.COLOR_RGB2GRAY)
    
    # ========== 1. Otsu 自适应阈值 ==========
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    _, mask_otsu = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    
    # 取较亮的部分（水印通常是白色）
    _, mask_white = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)
    
    # ========== 2. 角区域重点检测 ==========
    mask_corners = np.zeros_like(gray)
    corner_h, corner_w = h // 4, w // 4
    
    corners = [
        (0, 0, corner_w, corner_h),
        (w - corner_w, 0, w, corner_h),
        (0, h - corner_h, corner_w, h),
        (w - corner_w, h - corner_h, w, h)
    ]
    
    for x1, y1, x2, y2 in corners:
        corner_gray = gray[y1:y2, x1:x2]
        # 角区域使用更宽松的阈值
        _, corner_mask = cv2.threshold(corner_gray, 120, 255, cv2.THRESH_BINARY)
        mask_corners[y1:y2, x1:x2] = corner_mask
    
    # ========== 3. 融合掩码 ==========
    mask = cv2.bitwise_or(mask_white, mask_corners)
    
    # ========== 4. 形态学增强 ==========
    kernel = np.ones((15, 15), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=5)
    mask = cv2.dilate(mask, kernel, iterations=5)
    
    # ========== 5. 高斯平滑 ==========
    mask = cv2.GaussianBlur(mask, (21, 21), 0)
    _, mask = cv2.threshold(mask, 80, 255, cv2.THRESH_BINARY)
    
    # 如果检测到区域太小
    if np.sum(mask > 0) < 100:
        return np.zeros_like(gray)
    
    return mask


def remove_watermark_auto(img: Image.Image) -> Image.Image:
    """
    自动移除水印
    """
    # 转换为 OpenCV 格式
    img_array = np.array(img)
    img_bgr = cv2.cvtColor(img_array, cv2.COLOR_RGB2BGR)
    
    # 检测水印掩码
    mask = detect_watermark_mask(img_bgr)
    
    # 如果没有检测到水印，返回原图
    if np.sum(mask > 0) < 100:
        return img
    
    # 使用 TELEA 算法修复
    result = cv2.inpaint(img_bgr, mask, inpaintRadius=21, flags=cv2.INPAINT_TELEA)
    
    # 转回 RGB
    result_rgb = cv2.cvtColor(result, cv2.COLOR_BGR2RGB)
    
    # 转回 PIL Image
    return Image.fromarray(result_rgb)
