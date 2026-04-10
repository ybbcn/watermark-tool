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
  tiled?: boolean;        // 平铺效果
  diagonal?: boolean;     // 对角线效果
  spacing?: number;       // 平铺间距
}

export interface RemoveWatermarkOptions {
  tolerance: number;
  feather: number;
}

/**
 * 绘制单个文字水印
 */
function drawTextWatermark(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  options: WatermarkOptions
) {
  const fontSize = options.fontSize || Math.floor(ctx.canvas.width / 20);
  ctx.font = `${fontSize}px Arial`;
  ctx.fillStyle = options.color || 'rgba(255, 255, 255, 1)';
  ctx.globalAlpha = options.opacity;

  if (options.rotation) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((options.rotation * Math.PI) / 180);
    ctx.fillText(text, 0, 0);
    ctx.restore();
  } else {
    ctx.fillText(text, x, y);
  }
}

/**
 * 绘制单个图片水印
 */
function drawImageWatermark(
  ctx: CanvasRenderingContext2D,
  watermark: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  options: WatermarkOptions
) {
  ctx.save();
  ctx.globalAlpha = options.opacity;

  if (options.rotation) {
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate((options.rotation * Math.PI) / 180);
    ctx.drawImage(watermark, -width / 2, -height / 2, width, height);
  } else {
    ctx.drawImage(watermark, x, y, width, height);
  }

  ctx.restore();
}

/**
 * 添加文字水印（支持平铺和对角线）
 */
export function addTextWatermark(
  canvas: HTMLCanvasElement,
  options: WatermarkOptions
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  if (!options.text) return canvas;

  const fontSize = options.fontSize || Math.floor(canvas.width / 20);
  ctx.font = `${fontSize}px Arial`;
  const textMetrics = ctx.measureText(options.text);
  const textWidth = textMetrics.width;
  const textHeight = fontSize;
  const spacing = options.spacing || 100;

  // 平铺模式
  if (options.tiled) {
    for (let y = textHeight; y < canvas.height; y += spacing) {
      for (let x = 0; x < canvas.width; x += textWidth + spacing) {
        drawTextWatermark(ctx, options.text, x, y, options);
      }
    }
  }
  // 对角线模式
  else if (options.diagonal) {
    const angle = Math.atan2(canvas.height, canvas.width);
    const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
    
    for (let i = -diagonal; i < diagonal; i += textWidth + spacing) {
      const x = canvas.width / 2 + i * Math.cos(angle);
      const y = canvas.height / 2 + i * Math.sin(angle);
      drawTextWatermark(ctx, options.text, x, y, options);
    }
  }
  // 单个水印模式
  else {
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

    drawTextWatermark(ctx, options.text, x, y, options);
  }

  ctx.globalAlpha = 1.0;
  return canvas;
}

/**
 * 添加图片水印（支持平铺和对角线）
 */
export function addImageWatermark(
  canvas: HTMLCanvasElement,
  watermark: HTMLImageElement,
  options: WatermarkOptions
): HTMLCanvasElement {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Cannot get canvas context');

  const baseWidth = canvas.width / 4;
  const scale = options.scale || 0.25;
  const width = baseWidth * scale;
  const ratio = watermark.height / watermark.width;
  const height = width * ratio;
  const spacing = options.spacing || 100;

  // 平铺模式
  if (options.tiled) {
    for (let y = 0; y < canvas.height; y += height + spacing) {
      for (let x = 0; x < canvas.width; x += width + spacing) {
        drawImageWatermark(ctx, watermark, x, y, width, height, options);
      }
    }
  }
  // 对角线模式
  else if (options.diagonal) {
    const angle = Math.atan2(canvas.height, canvas.width);
    const diagonal = Math.sqrt(canvas.width ** 2 + canvas.height ** 2);
    
    for (let i = -diagonal; i < diagonal; i += width + spacing) {
      const x = canvas.width / 2 + i * Math.cos(angle) - width / 2;
      const y = canvas.height / 2 + i * Math.sin(angle) - height / 2;
      drawImageWatermark(ctx, watermark, x, y, width, height, options);
    }
  }
  // 单个水印模式
  else {
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

    drawImageWatermark(ctx, watermark, x, y, width, height, options);
  }

  ctx.globalAlpha = 1.0;
  return canvas;
}

/**
 * 处理图片并导出
 */
export async function processImage(
  file: File,
  operation: 'add-text' | 'add-image',
  options: WatermarkOptions
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
        URL.revokeObjectURL(url);
        reject(new Error('Cannot get canvas context'));
        return;
      }
      
      // 绘制原图
      ctx.drawImage(img, 0, 0);
      
      try {
        // 执行操作
        if (operation === 'add-text') {
          addTextWatermark(canvas, options);
          console.log('✅ [Image Processor] Text watermark applied');
        } else if (operation === 'add-image') {
          if (options.image) {
            addImageWatermark(canvas, options.image, options);
            console.log('✅ [Image Processor] Image watermark applied');
          } else {
            console.warn('⚠️ [Image Processor] No watermark image provided');
          }
        }
        
        // 导出结果
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(url);
            if (blob) {
              console.log(`✅ [Image Processor] Exported blob: ${blob.size} bytes`);
              resolve(blob);
            } else {
              reject(new Error('Failed to export image'));
            }
          },
          file.type || 'image/jpeg',
          0.95
        );
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    
    img.src = url;
  });
}
