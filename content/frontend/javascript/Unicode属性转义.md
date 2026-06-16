---
order: 59
title: Unicode属性转义
module: javascript
category: JavaScript
difficulty: intermediate
description: 正则表达式Unicode属性转义
author: fanquanpp
updated: '2026-06-14'
related:
  - javascript/具名捕获组
  - javascript/断言
  - 'javascript/函数-作用域与闭包'
  - javascript/自定义Error
prerequisites:
  - javascript/语法速查
---

## 1. Unicode 属性转义

使用 `\p{...}` 语法匹配 Unicode 字符属性，必须配合 `u` 标志：

```javascript
// 匹配任何 Unicode 字母
/\p{Letter}/u.test('中'); // true
/\p{Letter}/u.test('1'); // false

// 匹配任何 Unicode 数字
/\p{Number}/u.test('１'); // true（全角数字）
/\p{Number}/u.test('Ⅳ'); // true（罗马数字）
```

## 2. 常用属性

```javascript
// 通用类别
/\p{L}/u   // Letter — 所有字母
/\p{Lu}/u  // 大写字母
/\p{Ll}/u  // 小写字母
/\p{Lo}/u  // 其他字母（如中文）
/\p{N}/u   // Number — 所有数字
/\p{P}/u   // Punctuation — 标点
/\p{S}/u   // Symbol — 符号
/\p{Sc}/u  // 货币符号

// 脚本属性
/\p{Script=Han}/u      // 中文
/\p{Script=Hiragana}/u // 平假名
/\p{Script=Arabic}/u   // 阿拉伯文

// 二进制属性
/\p{Emoji}/u               // Emoji
/\p{Emoji_Presentation}/u  // 默认显示为 emoji
/\p{Hex_Digit}/u           // 十六进制数字
```

## 3. 否定形式

```javascript
/\P{Letter}/u  // 大写 P 表示否定
/[^\p{Letter}]/u // 等价写法
```

## 4. 实际应用

```javascript
// 多语言单词匹配
const anyWord = /\p{L}+/gu;
'Hello 世界 مرحبا'.match(anyWord); // ['Hello', '世界', 'مرحبا']

// 多语言用户名验证
const usernameRegex = /^[\p{L}\p{N}_]{3,20}$/u;

// 移除 emoji
function removeEmoji(text) {
  return text.replace(/\p{Emoji}/gu, '');
}
```
