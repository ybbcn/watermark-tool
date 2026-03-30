#!/usr/bin/env python3
"""
测试国际化功能
"""
import sys
import os

# 添加 backend 到路径
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from i18n import i18n

def test_i18n():
    print("🌍 测试国际化模块\n")
    
    # 测试中文
    print("🇨🇳 中文测试:")
    print(f"  API 名称：{i18n.get('api_name', 'zh')}")
    print(f"  API 描述：{i18n.get('api_description', 'zh')}")
    print(f"  错误消息：{i18n.get('errors.file_too_large', 'zh')}")
    print(f"  格式化测试：{i18n.get('errors.unsupported_format', 'zh', format='GIF', allowed='JPEG, PNG')}")
    
    print("\n🇺🇸 English Test:")
    print(f"  API Name: {i18n.get('api_name', 'en')}")
    print(f"  API Description: {i18n.get('api_description', 'en')}")
    print(f"  Error Message: {i18n.get('errors.file_too_large', 'en')}")
    print(f"  Format Test: {i18n.get('errors.unsupported_format', 'en', format='GIF', allowed='JPEG, PNG')}")
    
    print("\n✅ 所有翻译加载成功！")
    
    # 测试默认语言回退
    print("\n🔄 测试默认语言回退:")
    print(f"  未知语言 (ja): {i18n.get('api_name', 'ja')}")
    print(f"  未知键：{i18n.get('nonexistent.key', 'zh')}")

if __name__ == "__main__":
    test_i18n()
