# 🔧 语言切换问题诊断与修复

## 问题现象

点击 "English" 按钮后，界面没有切换成英文。

## 可能的原因

### 1. 浏览器缓存 ❌

**症状**: 修改了代码但浏览器仍然使用旧版本

**解决方案**:
```
强制刷新页面:
- Windows/Linux: Ctrl + F5
- Mac: Cmd + Shift + R
- 或者清除浏览器缓存
```

### 2. localStorage 缓存 ❌

**症状**: 页面加载时从 localStorage 读取了旧的语言设置

**解决方案**:
打开浏览器控制台 (F12)，执行：
```javascript
localStorage.removeItem('watermark_lang');
location.reload();
```

### 3. JavaScript 错误 ❌

**症状**: 控制台有 JavaScript 错误，导致 i18n 未初始化

**检查方法**:
1. 打开浏览器开发者工具 (F12)
2. 切换到 Console 标签
3. 刷新页面，查看是否有错误

**常见错误**:
- `i18n is not defined` - 脚本加载顺序问题
- `Cannot read property 'toggleLang' of undefined` - i18n 未正确初始化

### 4. 脚本加载失败 ❌

**症状**: i18n.js 文件未正确加载

**检查方法**:
打开浏览器开发者工具 (F12) → Network 标签，查看 `js/i18n.js` 是否成功加载 (状态码 200)

---

## 🔍 诊断步骤

### 步骤 1: 检查 i18n 是否加载

打开浏览器控制台 (F12)，输入：
```javascript
console.log(typeof i18n);
console.log(i18n.currentLang);
```

**预期输出**:
```
"object"
"zh" 或 "en"
```

如果输出 `undefined`，说明 i18n 未正确加载。

### 步骤 2: 测试翻译功能

在控制台输入：
```javascript
console.log(i18n.t('tab.addText'));
```

**预期输出**:
- 中文：`"添加文字水印"`
- 英文：`"Add Text Watermark"`

### 步骤 3: 手动切换语言

在控制台输入：
```javascript
i18n.toggleLang();
```

如果界面切换成功，说明代码正常，问题在按钮点击事件。

### 步骤 4: 检查按钮绑定

在控制台输入：
```javascript
document.getElementById('lang-switcher').onclick
```

**预期输出**: 应该显示函数定义

---

## ✅ 快速修复

### 方法 1: 强制刷新 (最简单)

1. 按 `Ctrl + Shift + R` (或 `Cmd + Shift + R`)
2. 或者清除浏览器缓存后刷新

### 方法 2: 清除 localStorage

打开控制台，执行：
```javascript
localStorage.clear();
location.reload();
```

### 方法 3: 使用 URL 参数强制语言

访问时添加语言参数：
```
英文：http://43.136.128.130:8080/?lang=en
中文：http://43.136.128.130:8080/?lang=zh
```

---

## 🐛 代码问题排查

### 检查点 1: i18n.js 是否正确加载

查看 HTML 中是否有：
```html
<script src="js/i18n.js"></script>
```

### 检查点 2: DOMContentLoaded 事件

i18n.js 中使用：
```javascript
document.addEventListener('DOMContentLoaded', () => {
    const preferredLang = i18n.getPreferredLang();
    i18n.init(preferredLang);
});
```

如果页面有其他 DOMContentLoaded 监听器，可能会有冲突。

### 检查点 3: 按钮点击事件

确保按钮有正确的 onclick：
```html
<button id="lang-switcher" onclick="i18n.toggleLang()">English</button>
```

---

## 🧪 测试页面

访问测试页面验证功能：
```
http://43.136.128.130:8080/test-lang.html
```

这个页面会显示当前语言状态和翻译结果。

---

## 📞 仍然无法解决？

### 收集以下信息：

1. **浏览器信息**: Chrome/Firefox/Safari 版本
2. **控制台错误**: F12 → Console 中的错误信息
3. **网络请求**: F12 → Network 中 js/i18n.js 的状态码
4. **当前状态**: 
   ```javascript
   console.log({
       i18n_loaded: typeof i18n,
       currentLang: i18n?.currentLang,
       button_exists: !!document.getElementById('lang-switcher'),
       localStorage: localStorage.getItem('watermark_lang')
   });
   ```

### 临时解决方案

如果语言切换仍然不工作，可以使用 URL 参数强制语言：
- 中文版：`http://43.136.128.130:8080/?lang=zh`
- 英文版：`http://43.136.128.130:8080/?lang=en`

---

## 🎯 验证修复

修复后，应该看到：

1. ✅ 页面右上角显示 "English" 按钮
2. ✅ 点击后所有文本切换为英文
3. ✅ 按钮文本变为 "中文"
4. ✅ 再次点击切换回中文
5. ✅ 刷新页面后保持上次选择的语言

---

**最后更新**: 2026-03-23 23:25
