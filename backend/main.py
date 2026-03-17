"""
Watermark Tool - MVP Backend
支持添加/移除水印，图片内存处理不存储
"""
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import io
import base64
from PIL import Image, ImageDraw, ImageFont
import cv2
import numpy as np

app = FastAPI(title="Watermark Tool API", version="1.0.0")

# CORS 配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境替换为具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    return {"message": "Watermark Tool API", "version": "1.0.0", "status": "running"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.post("/api/add-watermark")
async def add_watermark(
    file: UploadFile = File(...),
    text: str = Form(...),
    position: str = Form("bottom-right"),
    opacity: float = Form(0.5)
):
    """添加文字水印"""
    try:
        # 读取图片到内存
        img_data = await file.read()
        img = Image.open(io.BytesIO(img_data)).convert("RGBA")
        
        # 创建水印层
        watermark = Image.new("RGBA", img.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(watermark)
        
        # 计算位置
        width, height = img.size
        margin = 50
        
        positions = {
            "top-left": (margin, margin),
            "top-right": (width - margin - 200, margin),
            "bottom-left": (margin, height - margin - 50),
            "bottom-right": (width - margin - 200, height - margin - 50),
            "center": (width // 2 - 100, height // 2 - 25)
        }
        
        pos = positions.get(position, positions["bottom-right"])
        
        # 绘制水印文字
        font_size = max(20, min(width, height) // 20)
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", font_size)
        except:
            font = ImageFont.load_default()
        
        alpha = int(255 * opacity)
        draw.text(pos, text, fill=(255, 255, 255, alpha), font=font)
        
        # 合并图片
        result = Image.alpha_composite(img, watermark)
        
        # 输出到内存
        output = io.BytesIO()
        result.convert("RGB").save(output, format="JPEG", quality=95)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="image/jpeg",
            headers={"Content-Disposition": "attachment; filename=watermarked.jpg"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/add-logo-watermark")
async def add_logo_watermark(
    file: UploadFile = File(...),
    logo: UploadFile = File(...),
    position: str = Form("bottom-right"),
    scale: float = Form(0.2)
):
    """添加 Logo 图片水印"""
    try:
        # 读取原图
        img_data = await file.read()
        img = Image.open(io.BytesIO(img_data)).convert("RGBA")
        
        # 读取 Logo
        logo_data = await logo.read()
        logo_img = Image.open(io.BytesIO(logo_data)).convert("RGBA")
        
        # 缩放 Logo
        logo_width = int(img.size[0] * scale)
        ratio = logo_width / logo_img.size[0]
        logo_height = int(logo_img.size[1] * ratio)
        logo_img = logo_img.resize((logo_width, logo_height), Image.Resampling.LANCZOS)
        
        # 计算位置
        margin = 50
        positions = {
            "top-left": (margin, margin),
            "top-right": (img.size[0] - margin - logo_width, margin),
            "bottom-left": (margin, img.size[1] - margin - logo_height),
            "bottom-right": (img.size[0] - margin - logo_width, img.size[1] - margin - logo_height),
            "center": (img.size[0] // 2 - logo_width // 2, img.size[1] // 2 - logo_height // 2)
        }
        
        pos = positions.get(position, positions["bottom-right"])
        
        # 合并
        result = img.copy()
        result.paste(logo_img, pos, logo_img)
        
        # 输出
        output = io.BytesIO()
        result.convert("RGB").save(output, format="JPEG", quality=95)
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="image/jpeg",
            headers={"Content-Disposition": "attachment; filename=watermarked.jpg"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/remove-watermark")
async def remove_watermark(
    file: UploadFile = File(...),
    mask_type: str = Form("auto")
):
    """
    移除水印（简化版 - 使用 OpenCV inpaint）
    完整版可集成 LaMa 模型
    """
    try:
        # 读取图片
        img_data = await file.read()
        img_array = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        if img is None:
            raise HTTPException(status_code=400, detail="无法解析图片")
        
        # 简化版：自动检测高亮区域作为水印（实际生产需要用户标注或使用 AI 模型）
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, mask = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY)
        
        # 膨胀掩码
        kernel = np.ones((5, 5), np.uint8)
        mask = cv2.dilate(mask, kernel, iterations=2)
        
        # Inpaint 修复
        result = cv2.inpaint(img, mask, 3, cv2.INPAINT_TELEA)
        
        # 编码为 JPEG
        _, buffer = cv2.imencode('.jpg', result, [cv2.IMWRITE_JPEG_QUALITY, 95])
        
        return StreamingResponse(
            io.BytesIO(buffer),
            media_type="image/jpeg",
            headers={"Content-Disposition": "attachment; filename=removed.jpg"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/remove-watermark-advanced")
async def remove_watermark_advanced(
    file: UploadFile = File(...),
    mask_base64: str = Form(...)
):
    """
    高级移除水印 - 需要用户提供掩码
    生产环境可集成 LaMa 模型
    """
    try:
        # 读取图片
        img_data = await file.read()
        img_array = np.frombuffer(img_data, np.uint8)
        img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
        
        # 解码掩码
        mask_data = base64.b64decode(mask_base64)
        mask = cv2.imdecode(np.frombuffer(mask_data, np.uint8), cv2.IMREAD_GRAYSCALE)
        
        if img is None or mask is None:
            raise HTTPException(status_code=400, detail="无法解析图片或掩码")
        
        # 调整掩码大小
        mask = cv2.resize(mask, (img.shape[1], img.shape[0]))
        
        # 二值化掩码
        _, mask = cv2.threshold(mask, 127, 255, cv2.THRESH_BINARY)
        
        # Inpaint 修复
        result = cv2.inpaint(img, mask, 3, cv2.INPAINT_TELEA)
        
        # 编码
        _, buffer = cv2.imencode('.jpg', result, [cv2.IMWRITE_JPEG_QUALITY, 95])
        
        return StreamingResponse(
            io.BytesIO(buffer),
            media_type="image/jpeg",
            headers={"Content-Disposition": "attachment; filename=removed.jpg"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
