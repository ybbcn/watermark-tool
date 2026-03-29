/**
 * 💧 Watermark Tool - Cloudflare Workers Backend
 * 水印工具 - 支持文字水印、Logo水印、水印移除
 */

import { Jimp } from 'jimp';

/**
 * 解析 FormData 中的文件和数据
 */
async function parseFormData(request) {
  const formData = await request.formData();
  const file = formData.get('file');
  if (!file) {
    throw new Error('No file provided');
  }
  
  const data = {};
  for (const [key, value] of formData.entries()) {
    if (key !== 'file' && key !== 'logo') {
      data[key] = value;
    }
  }
  
  return { file, logo: formData.get('logo'), data };
}

/**
 * 将 Jimp 图片转换为 Buffer
 */
async function imageToBuffer(image) {
  const buffer = await image.getBuffer('image/jpeg');
  return buffer;
}

/**
 * 计算位置坐标
 */
function getPosition(position, imgWidth, imgHeight, itemWidth, itemHeight, padding = 30) {
  switch (position) {
    case 'top-left':
      return { x: padding, y: padding };
    case 'top-right':
      return { x: imgWidth - itemWidth - padding, y: padding };
    case 'bottom-left':
      return { x: padding, y: imgHeight - itemHeight - padding };
    case 'bottom-right':
      return { x: imgWidth - itemWidth - padding, y: imgHeight - itemHeight - padding };
    case 'center':
      return { x: Math.floor((imgWidth - itemWidth) / 2), y: Math.floor((imgHeight - itemHeight) / 2) };
    default:
      return { x: imgWidth - itemWidth - padding, y: imgHeight - itemHeight - padding };
  }
}

/**
 * 将 HEX 颜色转换为 RGB 对象
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

/**
 * 添加文字水印
 */
async function addTextWatermark(image, options) {
  const {
    text,
    position = 'bottom-right',
    opacity = 0.8,
    fontSize = 16,
    color = '#000000',
    rotation = 0,
    shadow = 'none',
    bg = 'none',
    tile = 'none',
    spacing = 100
  } = options;

  const width = image.width;
  const height = image.height;
  const rgb = hexToRgb(color);
  const alpha = Math.floor(opacity * 255);
  
  // 自适应字体大小
  let actualFontSize = Math.min(fontSize, Math.floor(width / 10), Math.floor(height / 5));
  actualFontSize = Math.max(actualFontSize, 12);
  
  // 加载字体 - Jimp 内置字体
  const fontPath = actualFontSize >= 32 ? Jimp.FONT_SANS_32_WHITE : Jimp.FONT_SANS_16_WHITE;
  const font = await Jimp.loadFont(fontPath);
  
  // 测量文字尺寸
  const textWidth = Jimp.measureText(font, text);
  const textHeight = Jimp.measureTextHeight(font, text, width);
  
  // 创建水印图层
  const wmWidth = textWidth + 40;
  const wmHeight = textHeight + 40;
  const watermark = new Jimp(wmWidth, wmHeight, 0x00000000);
  
  // 绘制文字
  const hexColor = Jimp.rgbaToInt(rgb.r, rgb.g, rgb.b, alpha);
  watermark.print(font, 20, 20, text);
  
  // 处理平铺模式
  if (tile !== 'none') {
    const result = image.clone();
    const tileSize = Math.max(wmWidth, wmHeight) + spacing;
    
    for (let y = 0; y < height; y += tileSize) {
      for (let x = 0; x < width; x += tileSize) {
        result.composite(watermark, x, y, {
          mode: Jimp.BLEND_SOURCE_OVER,
          opacitySource: alpha / 255,
          opacityDest: 1
        });
      }
    }
    return result;
  }
  
  // 单个水印模式
  const pos = getPosition(position, width, height, wmWidth, wmHeight);
  
  // 如果有背景
  if (bg !== 'none') {
    const bgLayer = new Jimp(wmWidth, wmHeight, 0x000000cc);
    watermark.composite(bgLayer, 0, 0, {
      mode: Jimp.BLEND_SOURCE_OVER,
      opacitySource: 1,
      opacityDest: 0.8
    });
  }
  
  // 应用旋转
  let finalWatermark = watermark;
  if (rotation !== 0) {
    finalWatermark = watermark.rotate(rotation, false);
  }
  
  // 合并到原图
  const result = image.clone();
  result.composite(finalWatermark, pos.x, pos.y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: alpha / 255,
    opacityDest: 1
  });
  
  return result;
}

/**
 * 添加 Logo 水印
 */
async function addLogoWatermark(image, logoBuffer, options) {
  const {
    position = 'bottom-right',
    scale = 0.2,
    opacity = 0.8,
    rotation = 0,
    tile = 'none',
    spacing = 100
  } = options;

  const width = image.width;
  const height = image.height;
  
  // 加载 Logo
  const logo = await Jimp.read(logoBuffer);
  
  // 计算 Logo 大小
  const baseSize = Math.min(width, height);
  const logoWidth = Math.floor(baseSize * scale);
  const logoHeight = Math.floor(logo.height * (logoWidth / logo.width));
  
  // 缩放 Logo
  logo.resize(logoWidth, logoHeight);
  
  // 应用透明度
  logo.opacity(opacity);
  
  // 处理平铺模式
  if (tile !== 'none') {
    const result = image.clone();
    const tileSize = Math.max(logoWidth, logoHeight) + spacing;
    
    for (let y = 0; y < height; y += tileSize) {
      for (let x = 0; x < width; x += tileSize) {
        result.composite(logo, x, y, {
          mode: Jimp.BLEND_SOURCE_OVER,
          opacitySource: opacity,
          opacityDest: 1
        });
      }
    }
    return result;
  }
  
  // 单个 Logo 模式
  const pos = getPosition(position, width, height, logoWidth, logoHeight);
  
  // 应用旋转
  let finalLogo = logo;
  if (rotation !== 0) {
    finalLogo = logo.rotate(rotation, false);
  }
  
  // 合并
  const result = image.clone();
  result.composite(finalLogo, pos.x, pos.y, {
    mode: Jimp.BLEND_SOURCE_OVER,
    opacitySource: opacity,
    opacityDest: 1
  });
  
  return result;
}

/**
 * 移除水印 - 简化版
 * 使用边缘检测和平滑处理
 */
async function removeWatermark(image) {
  // 这个是一个简化版本
  // 完整的 OpenCV inpaint 算法需要更复杂的实现
  // 这里使用高斯模糊来减少水印痕迹
  const blurred = image.clone();
  blurred.blur(3);
  
  // 混合原始图片和模糊版本
  // 这不是一个真正的"移除"，而是减轻水印效果
  const width = image.width;
  const height = image.height;
  
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      // 只在边缘区域应用模糊
      const pixel = image.getPixelColor(x, y);
      const blurredPixel = blurred.getPixelColor(x, y);
      
      // 简单混合
      const r = (Jimp.intToRGBA(pixel).r * 0.7 + Jimp.intToRGBA(blurredPixel).r * 0.3);
      const g = (Jimp.intToRGBA(pixel).g * 0.7 + Jimp.intToRGBA(blurredPixel).g * 0.3);
      const b = (Jimp.intToRGBA(pixel).b * 0.7 + Jimp.intToRGBA(blurredPixel).b * 0.3);
      
      const newColor = Jimp.rgbaToInt(
        Math.floor(r),
        Math.floor(g),
        Math.floor(b),
        255
      );
      image.setPixelColor(newColor, x, y);
    }
  }
  
  return image;
}

/**
 * 创建响应
 */
function createResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*'
    }
  });
}

/**
 * 创建图片响应
 */
function createImageResponse(buffer) {
  return new Response(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'image/jpeg',
      'Content-Disposition': 'attachment; filename="watermarked.jpg"',
      'Access-Control-Allow-Origin': '*'
    }
  });
}

/**
 * 主处理函数
 */
async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;
  
  // CORS 预检请求
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*'
      }
    });
  }
  
  try {
    // 首页
    if (path === '/' || path === '') {
      return createResponse({
        name: 'Watermark Tool API',
        version: '1.0.0',
        endpoints: {
          add_watermark: 'POST /api/add-watermark',
          add_logo_watermark: 'POST /api/add-logo-watermark',
          remove_watermark: 'POST /api/remove-watermark'
        }
      });
    }
    
    // 健康检查
    if (path === '/health') {
      return createResponse({ status: 'healthy' });
    }
    
    // 添加文字水印
    if (path === '/api/add-watermark' && request.method === 'POST') {
      const { file, data } = await parseFormData(request);
      const buffer = await file.arrayBuffer();
      const image = await Jimp.read(buffer);
      
      const result = await addTextWatermark(image, {
        text: data.text || 'Watermark',
        position: data.position || 'bottom-right',
        opacity: parseFloat(data.opacity) || 0.8,
        fontSize: parseInt(data.font_size) || 16,
        color: data.color || '#000000',
        rotation: parseInt(data.rotation) || 0,
        shadow: data.shadow || 'none',
        bg: data.bg || 'none',
        tile: data.tile || 'none',
        spacing: parseInt(data.spacing) || 100
      });
      
      const outputBuffer = await result.getBuffer('image/jpeg');
      return createImageResponse(outputBuffer);
    }
    
    // 添加 Logo 水印
    if (path === '/api/add-logo-watermark' && request.method === 'POST') {
      const { file, logo, data } = await parseFormData(request);
      
      if (!logo) {
        return createResponse({ error: 'No logo provided' }, 400);
      }
      
      const imageBuffer = await file.arrayBuffer();
      const logoBuffer = await logo.arrayBuffer();
      
      const image = await Jimp.read(imageBuffer);
      
      const result = await addLogoWatermark(image, logoBuffer, {
        position: data.position || 'bottom-right',
        scale: parseFloat(data.scale) || 0.2,
        opacity: parseFloat(data.opacity) || 0.8,
        rotation: parseInt(data.rotation) || 0,
        tile: data.tile || 'none',
        spacing: parseInt(data.spacing) || 100
      });
      
      const outputBuffer = await result.getBuffer('image/jpeg');
      return createImageResponse(outputBuffer);
    }
    
    // 移除水印
    if (path === '/api/remove-watermark' && request.method === 'POST') {
      const { file } = await parseFormData(request);
      const buffer = await file.arrayBuffer();
      const image = await Jimp.read(buffer);
      
      const result = await removeWatermark(image);
      const outputBuffer = await result.getBuffer('image/jpeg');
      return createImageResponse(outputBuffer);
    }
    
    // 404
    return createResponse({ error: 'Not found' }, 404);
    
  } catch (error) {
    console.error('Error:', error);
    return createResponse({ error: error.message }, 500);
  }
}

/**
 * Cloudflare Worker 入口点
 */
export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  }
};
