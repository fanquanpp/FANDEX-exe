---
order: 63
title: Web存储API
module: javascript
category: JavaScript
difficulty: beginner
description: localStorage、sessionStorage与Cookie
author: fanquanpp
updated: '2026-06-14'
related:
  - javascript/浏览器对象模型
  - javascript/网络请求API
  - javascript/索引数据库
  - javascript/时间API
prerequisites:
  - javascript/语法速查
---

## 1. Web 存储对比

| 存储方式       | 容量    | 生命周期     | 随请求发送 |
| -------------- | ------- | ------------ | ---------- |
| Cookie         | ~4KB    | 可设过期时间 |            |
| localStorage   | ~5-10MB | 永久         |            |
| sessionStorage | ~5-10MB | 标签页关闭   |            |

## 2. localStorage

```javascript
localStorage.setItem('name', 'Alice');
localStorage.getItem('name'); // 'Alice'
localStorage.removeItem('name');
localStorage.clear();

// 存储对象
const storage = {
  get(key, defaultValue = null) {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

storage.set('settings', { theme: 'dark' });
storage.get('settings'); // { theme: 'dark' }

// 跨标签页监听
window.addEventListener('storage', (e) => {
  console.log(e.key, e.oldValue, e.newValue);
});
```

## 3. Cookie

```javascript
document.cookie = 'name=Alice; max-age=86400; path=/; secure; SameSite=Strict';

// 解析
function getCookies() {
  return document.cookie.split('; ').reduce((acc, pair) => {
    const [key, value] = pair.split('=');
    acc[decodeURIComponent(key)] = decodeURIComponent(value);
    return acc;
  }, {});
}

// 删除
document.cookie = 'name=; max-age=0; path=/';
```

| 属性       | 说明                  |
| ---------- | --------------------- |
| `max-age`  | 秒数                  |
| `secure`   | 仅 HTTPS              |
| `SameSite` | Strict/Lax/None       |
| `HttpOnly` | JS 无法访问（防 XSS） |
