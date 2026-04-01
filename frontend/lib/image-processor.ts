/**
 * 水印处理核心库 - 纯浏览器端实现
 * 使用 Canvas API，无需服务器
 */

export interface WatermarkOptions {
  text?: string;
  image?: HTMLImageElement;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity: number;
  scale: number;
  fontSize?: number;
  color?: string;
  rotation?: number;
}

export interface RemoveWatermarkOptions {
  tolerance: number;
  feather: number;
}

/**
 * 添加文字水印
 */
export function addTextWatermark(
  canvas: HTMLCanvasElement,
  options: WatermarkOptions
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  // 绘制原始图片
  const img = canvas.querySelector('img');
  if (img) {
    ctx.drawImage(img, 0, 0);
  }

  if (!options.text) return canvas;

  // 配置文字样式
  const fontSize = options.fontSize || Math.floor(canvas.width / 20);
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = options.color || 'rgba(255, 255, 255, 0.8)';
  ctx.globalAlpha = options.opacity;

  // 计算位置
  const textMetrics = ctx.measureText(options.text);
  const textWidth = textMetrics.width;
  const textHeight = fontSize;
  const padding = 20;

  let x = 0, y = 0;
  switch (options.position) {
    case 'top-left':
      x = padding;
      y = textHeight + padding;
      break;
    case 'top-right':
      x = canvas.width - textWidth - padding;
      y = textHeight + padding;
      break;
    case 'bottom-left':
      x = padding;
      y = canvas.height - padding;
      break;
    case 'bottom-right':
      x = canvas.width - textWidth - padding;
      y = canvas.height - padding;
      break;
    case 'center':
      x = (canvas.width - textWidth) / 2;
      y = (canvas.height + textHeight) / 2;
      break;
  }

  // 旋转
  if (options.rotation) {
    ctx.save();
    ctx.translate(x + textWidth / 2, y - textHeight / 2);
    ctx.rotate((options.rotation * Math.PI) / 180);
    ctx.fillText(options.text, -textWidth / 2, 0);
    ctx.restore();
  } else {
    ctx.fillText(options.text, x, y);
  }

  ctx.globalAlpha = 1.0;
  return canvas;
}

/**
 * 添加图片水印（Logo）
 */
export function addImageWatermark(
  canvas: HTMLCanvasElement,
  watermark: HTMLImageElement,
  options: WatermarkOptions
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  // 计算水印尺寸
  const baseWidth = canvas.width / 4;
  const scale = options.scale || 0.25;
  const width = baseWidth * scale;
  const ratio = watermark.height / watermark.width;
  const height = width * ratio;

  // 计算位置
  const padding = 20;
  let x = 0, y = 0;
  switch (options.position) {
    case 'top-left':
      x = padding;
      y = padding;
      break;
    case 'top-right':
      x = canvas.width - width - padding;
      y = padding;
      break;
    case 'bottom-left':
      x = padding;
      y = canvas.height - height - padding;
      break;
    case 'bottom-right':
      x = canvas.width - width - padding;
      y = canvas.height - height - padding;
      break;
    case 'center':
      x = (canvas.width - width) / 2;
      y = (canvas.height - height) / 2;
      break;
  }

  // 保存状态
  ctx.save();
  ctx.globalAlpha = options.opacity;

  // 旋转
  if (options.rotation) {
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate((options.rotation * Math.PI) / 180);
    ctx.drawImage(watermark, -width / 2, -height / 2, width, height);
  } else {
    ctx.drawImage(watermark, x, y, width, height);
  }

  ctx.restore();
  ctx.globalAlpha = 1.0;
  return canvas;
}

/**
 * 移除水印（简化版 - 基于颜色阈值）
 * 使用 inpainting 算法的简化实现
 */
export function removeWatermark(
  canvas: HTMLCanvasElement,
  options: RemoveWatermarkOptions
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  const width = canvas.width;
  const height = canvas.height;

  // 检测高亮区域（白色水印）
  const mask = new Uint8Array(width * height);
  const tolerance = options.tolerance || 240;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const brightness = (r + g + b) / 3;
    
    const pixelIndex = i / 4;
    mask[pixelIndex] = brightness > tolerance ? 1 : 0;
  }

  // 简单的邻域平均修复
  const feather = options.feather || 3;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (mask[idx] === 1) {
        // 收集周围非水印像素
        let sumR = 0, sumG = 0, sumB = 0, count = 0;
        
        for (let dy = -feather; dy <= feather; dy++) {
          for (let dx = -feather; dx <= feather; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = ny * width + nx;
              if (mask[nIdx] === 0) {
                const pixelIdx = nIdx * 4;
                sumR += data[pixelIdx];
                sumG += data[pixelIdx + 1];
                sumB += data[pixelIdx + 2];
                count++;
              }
            }
          }
        }
        
        if (count > 0) {
          const pixelIdx = idx * 4;
          data[pixelIdx] = sumR / count;
          data[pixelIdx + 1] = sumG / count;
          data[pixelIdx + 2] = sumB / count;
        }
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * 处理图片并导出
 */
export async function processImage(
  file: File,
  operation: 'add-text' | 'add-image' | 'remove',
  options: WatermarkOptions | RemoveWatermarkOptions
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Cannot get canvas context'));
        return;
      }
      
      // 绘制原图
      ctx.drawImage(img, 0, 0);
      
      // 执行操作
      if (operation === 'add-text' && 'text' in options) {
        addTextWatermark(canvas, options as WatermarkOptions);
      } else if (operation === 'add-image' && 'image' in options) {
        addImageWatermark(canvas, options.image!, options as WatermarkOptions);
      } else if (operation === 'remove') {
        removeWatermark(canvas, options as RemoveWatermarkOptions);
      }
      
      // 导出结果
      canvas.toBlob(
        (blob) => {
          if (blob) {
            URL.revokeObjectURL(url);
            resolve(blob);
          } else {
            reject(new Error('Failed to export image'));
          }
        },
        file.type,
        0.95
      );
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}
