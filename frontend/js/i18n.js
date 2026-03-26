/**
 * 前端国际化支持
 */
const i18n = {
    currentLang: 'zh',
    
    translations: {
        zh: {
            // 导航栏
            'nav.subtitle': '在线水印处理 · 内存处理 · 隐私安全',
            
            // 免责声明
            'legal.title': '法律声明',
            'legal.text': '本工具仅供学习和个人使用。请勿用于移除他人拥有版权的水印。',
            
            // 选项卡
            'tab.addText': '添加文字水印',
            'tab.addLogo': '添加 Logo 水印',
            'tab.remove': '移除水印',
            
            // 通用
            'common.clickOrDrag': '点击或拖拽上传图片',
            'common.supportedFormats': '支持 JPG, PNG, WebP，最大 10MB',
            'common.original': '原图',
            'common.preview': '效果预览',
            'common.processing': '处理中...',
            'common.realtimePreview': '调整后实时预览',
            'common.processAndDownload': '处理并下载',
            'common.basicSettings': '基础设置',
            'common.advancedSettings': '高级设置',
            
            // 文字水印
            'textWatermark.title': '添加文字水印',
            'textWatermark.label': '水印文字',
            'textWatermark.placeholder': '水印',
            'textWatermark.position': '位置',
            'textWatermark.color': '文字颜色',
            'textWatermark.opacity': '透明度',
            'textWatermark.fontSize': '字体大小',
            'textWatermark.rotation': '旋转角度',
            'textWatermark.shadow': '阴影',
            'textWatermark.bg': '背景',
            'textWatermark.tile': '平铺模式',
            'textWatermark.spacing': '平铺间隙',
            'textWatermark.position.bottomRight': '右下角',
            'textWatermark.position.bottomLeft': '左下角',
            'textWatermark.position.topRight': '右上角',
            'textWatermark.position.topLeft': '左上角',
            'textWatermark.position.center': '居中',
            'textWatermark.shadow.none': '无',
            'textWatermark.shadow.light': '轻微',
            'textWatermark.shadow.medium': '中等',
            'textWatermark.shadow.heavy': '强烈',
            'textWatermark.bg.none': '无',
            'textWatermark.bg.solid': '纯色',
            'textWatermark.bg.blur': '模糊',
            'textWatermark.tile.none': '单个',
            'textWatermark.tile.tile': '网格平铺',
            'textWatermark.tile.diagonal': '对角线',
            
            // Logo 水印
            'logoWatermark.title': '添加 Logo 水印',
            'logoWatermark.uploadOriginal': '上传原图',
            'logoWatermark.uploadLogo': '上传 Logo（PNG 透明背景）',
            'logoWatermark.scale': 'Logo 大小',
            'logoWatermark.opacity': '透明度',
            'logoWatermark.rotation': '旋转角度',
            'logoWatermark.tile': '平铺模式',
            'logoWatermark.spacing': '平铺间隙',
            
            // 移除水印
            'removeWatermark.title': '移除水印（自动检测）',
            'removeWatermark.description': '✨ 采用多策略融合算法，自动检测并移除水印，支持实时预览。',
            
            // 页脚
            'footer.text': '💧 Watermark Tool v1.0 · 图片内存处理，不存储到服务器',
            
            // 语言切换
            'lang.switch': '中文',
            'lang.en': 'English',
            'lang.zh': '中文',
            
            // 消息
            'msg.fileTooLarge': '图片大小超过 10MB 限制',
            'msg.processSuccess': '处理完成！',
            'msg.processFailed': '处理失败：',
            'msg.pleaseUploadImage': '请先上传图片',
            'msg.pleaseUploadOriginal': '请先上传原图',
            'msg.pleaseUploadLogo': '请上传 Logo 图片'
        },
        
        en: {
            // Navigation
            'nav.subtitle': 'Online Watermark Processing · In-Memory · Privacy Secure',
            
            // Legal
            'legal.title': 'Legal Notice',
            'legal.text': 'This tool is for learning and personal use only. Do not use to remove copyrighted watermarks.',
            
            // Tabs
            'tab.addText': 'Add Text Watermark',
            'tab.addLogo': 'Add Logo Watermark',
            'tab.remove': 'Remove Watermark',
            
            // Common
            'common.clickOrDrag': 'Click or drag to upload image',
            'common.supportedFormats': 'Supports JPG, PNG, WebP, max 10MB',
            'common.original': 'Original',
            'common.preview': 'Preview',
            'common.processing': 'Processing...',
            'common.realtimePreview': 'Real-time preview after adjustment',
            'common.processAndDownload': 'Process & Download',
            'common.basicSettings': 'Basic Settings',
            'common.advancedSettings': 'Advanced Settings',
            
            // Text Watermark
            'textWatermark.title': 'Add Text Watermark',
            'textWatermark.label': 'Watermark Text',
            'textWatermark.placeholder': 'Watermark',
            'textWatermark.position': 'Position',
            'textWatermark.color': 'Text Color',
            'textWatermark.opacity': 'Opacity',
            'textWatermark.fontSize': 'Font Size',
            'textWatermark.rotation': 'Rotation',
            'textWatermark.shadow': 'Shadow',
            'textWatermark.bg': 'Background',
            'textWatermark.tile': 'Tile Mode',
            'textWatermark.spacing': 'Tile Spacing',
            'textWatermark.position.bottomRight': 'Bottom Right',
            'textWatermark.position.bottomLeft': 'Bottom Left',
            'textWatermark.position.topRight': 'Top Right',
            'textWatermark.position.topLeft': 'Top Left',
            'textWatermark.position.center': 'Center',
            'textWatermark.shadow.none': 'None',
            'textWatermark.shadow.light': 'Light',
            'textWatermark.shadow.medium': 'Medium',
            'textWatermark.shadow.heavy': 'Heavy',
            'textWatermark.bg.none': 'None',
            'textWatermark.bg.solid': 'Solid',
            'textWatermark.bg.blur': 'Blur',
            'textWatermark.tile.none': 'Single',
            'textWatermark.tile.tile': 'Grid Tile',
            'textWatermark.tile.diagonal': 'Diagonal',
            
            // Logo Watermark
            'logoWatermark.title': 'Add Logo Watermark',
            'logoWatermark.uploadOriginal': 'Upload Original Image',
            'logoWatermark.uploadLogo': 'Upload Logo (PNG with transparency)',
            'logoWatermark.scale': 'Logo Scale',
            'logoWatermark.opacity': 'Opacity',
            'logoWatermark.rotation': 'Rotation',
            'logoWatermark.tile': 'Tile Mode',
            'logoWatermark.spacing': 'Tile Spacing',
            
            // Remove Watermark
            'removeWatermark.title': 'Remove Watermark (Auto Detect)',
            'removeWatermark.description': '✨ Uses multi-strategy fusion algorithm to auto-detect and remove watermarks with real-time preview.',
            
            // Footer
            'footer.text': '💧 Watermark Tool v1.0 · Images processed in-memory, not stored on server',
            
            // Language Switch
            'lang.switch': 'English',
            'lang.zh': '中文',
            'lang.en': 'English',
            
            // Messages
            'msg.fileTooLarge': 'Image file size exceeds 10MB limit',
            'msg.processSuccess': 'Processing completed!',
            'msg.processFailed': 'Processing failed: ',
            'msg.pleaseUploadImage': 'Please upload an image first',
            'msg.pleaseUploadOriginal': 'Please upload original image first',
            'msg.pleaseUploadLogo': 'Please upload logo image'
        }
    },
    
    /**
     * 初始化语言
     */
    init(lang) {
        this.currentLang = lang || 'zh';
        console.log('[i18n] 初始化语言:', this.currentLang);
        this.applyTranslations();
    },
    
    /**
     * 获取翻译文本
     */
    t(key) {
        const lang = this.currentLang;
        const keys = key.split('.');
        let value = this.translations[lang];
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return key; // 返回键本身作为回退
            }
        }
        
        return value || key;
    },
    
    /**
     * 应用所有翻译
     */
    applyTranslations() {
        // 更新 HTML lang 属性
        document.documentElement.lang = this.currentLang === 'zh' ? 'zh-CN' : 'en';
        
        // 更新所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const value = this.t(key);
            
            // 跳过语言切换按钮，由 updateLangSwitcher 专门处理
            if (el.id === 'lang-switcher') return;
            
            if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
                if (el.placeholder) {
                    el.placeholder = value;
                }
            } else {
                el.textContent = value;
            }
        });
        
        // 更新所有带有 data-i18n-placeholder 属性的元素
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });
        
        // 更新所有带有 data-i18n-title 属性的元素
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.t(key);
        });
        
        // 更新所有带有 data-i18n-options 的 select 元素
        document.querySelectorAll('[data-i18n-options]').forEach(el => {
            const prefix = el.getAttribute('data-i18n-options');
            el.querySelectorAll('option').forEach(opt => {
                const key = prefix + '.' + opt.value;
                const value = this.t(key);
                if (value) opt.textContent = value;
            });
        });
        
        // 保存语言选择
        localStorage.setItem('watermark_lang', this.currentLang);
        
        // 更新语言切换按钮文本（最后调用）
        this.updateLangSwitcher();
    },
    
    /**
     * 切换语言
     */
    toggleLang() {
        const oldLang = this.currentLang;
        this.currentLang = this.currentLang === 'zh' ? 'en' : 'zh';
        console.log('[i18n] 切换语言:', oldLang, '→', this.currentLang);
        this.applyTranslations();
    },
    
    /**
     * 设置语言
     */
    setLang(lang) {
        if (['zh', 'en'].includes(lang)) {
            this.currentLang = lang;
            this.applyTranslations();
        }
    },
    
    /**
     * 更新语言切换按钮
     */
    updateLangSwitcher() {
        const btn = document.getElementById('lang-switcher');
        if (btn) {
            const otherLang = this.currentLang === 'zh' ? 'en' : 'zh';
            const label = this.t('lang.' + otherLang);
            console.log('[i18n] 更新按钮:', '当前语言=' + this.currentLang, '按钮文本=' + label);
            btn.textContent = label;
            btn.setAttribute('data-lang', otherLang);
        } else {
            console.warn('[i18n] 未找到 lang-switcher 按钮');
        }
    },
    
    /**
     * 从 URL 参数或 localStorage 获取语言
     */
    getPreferredLang() {
        // 1. 优先从 URL 参数获取
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        if (urlLang && ['zh', 'en'].includes(urlLang)) {
            return urlLang;
        }
        
        // 2. 从 localStorage 获取
        const savedLang = localStorage.getItem('watermark_lang');
        if (savedLang && ['zh', 'en'].includes(savedLang)) {
            return savedLang;
        }
        
        // 3. 从浏览器语言获取
        const browserLang = navigator.language.split('-')[0].toLowerCase();
        if (['zh', 'cn'].includes(browserLang)) {
            return 'zh';
        } else if (browserLang === 'en') {
            return 'en';
        }
        
        // 4. 默认中文
        return 'zh';
    }
};

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', () => {
    const preferredLang = i18n.getPreferredLang();
    i18n.init(preferredLang);
});
