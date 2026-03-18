"""
💧 Watermark Tool - Backend API
FastAPI 应用，提供水印添加和移除功能
内存处理模式，图片不存储到服务器
"""

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import Response, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np
import io
import os
from typing import Optional

from processors.text_watermark import add_text_watermark
from processors.logo_watermark import add_logo_watermark
from processors.remove_watermark import remove_watermark_auto

app = FastAPI(
    title="💧 Watermark Tool API",
    description="在线水印处理工具 - 添加和移除水印",
    version="1.0.0"
)

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 常量配置
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
ALLOWED_FORMATS = ["JPEG", "JPG", "PNG", "WEBP"]
POSITION_MAP = {
    "top-left": (10, 10),
    "top-right": lambda w, h, pw, ph: (w - pw - 10, 10),
    "bottom-left": lambda w, h, pw, ph: (10, h - ph - 10),
    "bottom-right": lambda w, h, pw, ph: (w - pw - 10, h - ph - 10),
    "center": lambda w, h, pw, ph: ((w - pw) // 2, (h - ph) // 2),
}


def validate_image(file: UploadFile) -> Image.Image:
    """验证并加载图片"""
    # 检查文件大小
    file.file.seek(0, 2)
    file_size = file.file.tell()
    file.file.seek(0)
    
    if file_size > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="图片大小超过 10MB 限制")
    
    # 加载并验证图片
    try:
        img = Image.open(file.file)
        img.load()  # 强制加载到内存
        
        if img.format not in ALLOWED_FORMATS:
            raise HTTPException(
                status_code=400, 
                detail=f"不支持的图片格式：{img.format}。支持：{', '.join(ALLOWED_FORMATS)}"
            )
        
        # 转换为 RGB 模式（处理 RGBA 等）
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        
        return img
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"图片加载失败：{str(e)}")


def image_to_response(img: Image.Image, format: str = "JPEG") -> StreamingResponse:
    """将图片转换为响应流"""
    buf = io.BytesIO()
    img.save(buf, format=format, quality=95)
    buf.seek(0)
    
    content_type = {
        "JPEG": "image/jpeg",
        "PNG": "image/png",
        "WEBP": "image/webp"
    }.get(format, "image/jpeg")
    
    return StreamingResponse(
        buf,
        media_type=content_type,
        headers={
            "Content-Disposition": "attachment; filename=watermarked_image.jpg"
        }
    )


@app.get("/")
async def root():
    """API 首页"""
    return {
        "name": "💧 Watermark Tool API",
        "version": "1.0.0",
        "endpoints": {
            "add_watermark": "POST /api/add-watermark",
            "add_logo_watermark": "POST /api/add-logo-watermark",
            "remove_watermark": "POST /api/remove-watermark"
        }
    }


@app.get("/health")
async def health_check():
    """健康检查"""
    return {"status": "healthy"}


@app.post("/api/add-watermark")
async def api_add_watermark(
    file: UploadFile = File(..., description="原图"),
    text: str = Form(..., description="水印文字"),
    position: str = Form("bottom-right", description="位置"),
    opacity: float = Form(0.8, ge=0, le=1, description="透明度 0-1"),
    font_size: int = Form(16, ge=12, le=200, description="字体大小"),
    color: str = Form("#000000", description="文字颜色 (HEX 格式)"),
    rotation: int = Form(0, ge=-180, le=180, description="旋转角度"),
    shadow: str = Form("none", description="阴影：none, light, medium, heavy"),
    bg: str = Form("none", description="背景：none, solid, blur"),
    tile: str = Form("none", description="平铺：none, tile, diagonal"),
    spacing: int = Form(100, ge=0, le=300, description="平铺间隙 (px)")
):
    """
    添加文字水印
    
    - **file**: 原图文件
    - **text**: 水印文字
    - **position**: 位置选项
    - **opacity**: 透明度 (0-1)
    - **font_size**: 字体大小
    """
    img = validate_image(file)
    
    try:
        result = add_text_watermark(
            img, 
            text, 
            position=position, 
            opacity=opacity,
            font_size=font_size,
            color=color,
            rotation=rotation,
            shadow=shadow,
            bg=bg,
            tile=tile,
            spacing=spacing
        )
        return image_to_response(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"处理失败：{str(e)}")


@app.post("/api/add-logo-watermark")
async def api_add_logo_watermark(
    file: UploadFile = File(..., description="原图"),
    logo: UploadFile = File(..., description="Logo 图片"),
    position: str = Form("bottom-right", description="位置"),
    scale: float = Form(0.2, ge=0.05, le=0.5, description="Logo 大小比例"),
    opacity: float = Form(0.8, ge=0, le=1, description="透明度"),
    rotation: int = Form(0, ge=-180, le=180, description="旋转角度"),
    tile: str = Form("none", description="平铺：none, tile, diagonal"),
    spacing: int = Form(100, ge=0, le=300, description="平铺间隙 (px)")
):
    """
    添加 Logo 水印
    
    - **file**: 原图文件
    - **logo**: Logo 图片 (PNG 透明背景)
    - **position**: 位置选项
    - **scale**: Logo 大小比例 (0.05-0.5)
    """
    img = validate_image(file)
    
    # 验证并加载 Logo
    try:
        logo_img = Image.open(logo.file)
        logo_img.load()
        if logo_img.mode != 'RGBA':
            logo_img = logo_img.convert('RGBA')
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Logo 加载失败：{str(e)}")
    
    try:
        result = add_logo_watermark(
            img, 
            logo_img, 
            position=position, 
            scale=scale,
            opacity=opacity,
            rotation=rotation,
            tile=tile,
            spacing=spacing
        )
        return image_to_response(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"处理失败：{str(e)}")


@app.post("/api/remove-watermark")
async def api_remove_watermark(
    file: UploadFile = File(..., description="原图"),
    mask_type: str = Form("auto", description="处理模式：auto(自动检测高亮区域), manual(手动标注 - 暂未实现)")
):
    """
    移除水印
    
    - **file**: 原图文件
    - **mask_type**: 处理模式
        - auto: 自动检测高亮区域（白色水印）
        - manual: 手动标注区域（暂未实现）
    """
    img = validate_image(file)
    
    if mask_type != "auto":
        raise HTTPException(
            status_code=400, 
            detail="MVP 版本仅支持 auto 模式，manual 模式将在后续版本实现"
        )
    
    try:
        result = remove_watermark_auto(img)
        return image_to_response(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"处理失败：{str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
