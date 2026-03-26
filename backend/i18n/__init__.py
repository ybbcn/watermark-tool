"""
国际化支持模块
"""
import json
import os
from typing import Dict, Any

class I18n:
    """简单的国际化类"""
    
    def __init__(self, default_lang: str = "zh"):
        self.default_lang = default_lang
        self.translations: Dict[str, Dict[str, Any]] = {}
        self.load_translations()
    
    def load_translations(self):
        """加载翻译文件"""
        i18n_dir = os.path.dirname(__file__)
        for filename in os.listdir(i18n_dir):
            if filename.endswith('.json'):
                lang = filename[:-5]  # 移除 .json
                if lang != '__init__':
                    filepath = os.path.join(i18n_dir, filename)
                    with open(filepath, 'r', encoding='utf-8') as f:
                        self.translations[lang] = json.load(f)
    
    def get(self, key: str, lang: str = None, **kwargs) -> str:
        """
        获取翻译文本
        
        Args:
            key: 翻译键，如 "errors.file_too_large"
            lang: 语言代码，如 "zh" 或 "en"
            **kwargs: 用于格式化字符串的参数
        
        Returns:
            翻译后的文本
        """
        if lang is None:
            lang = self.default_lang
        
        keys = key.split('.')
        value = self.translations.get(lang, self.translations.get(self.default_lang, {}))
        
        for k in keys:
            if isinstance(value, dict):
                value = value.get(k, key)
            else:
                return key
        
        if isinstance(value, str) and kwargs:
            try:
                value = value.format(**kwargs)
            except KeyError:
                pass
        
        return value


# 全局实例
i18n = I18n()
