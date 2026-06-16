---
order: 54
title: Proxy与Reflect
module: javascript
category: JavaScript
difficulty: advanced
description: 元编程：代理与反射API
author: fanquanpp
updated: '2026-06-14'
related:
  - javascript/柯里化与偏函数
  - javascript/生成器函数
  - javascript/Object扩展
  - javascript/事件循环
prerequisites:
  - javascript/语法速查
---

## 1. Proxy 概述

```javascript
const target = { name: 'Alice', age: 25 };
const handler = {
  get(target, prop) {
    console.log(`读取属性: ${prop}`);
    return target[prop];
  },
  set(target, prop, value) {
    console.log(`设置属性: ${prop} = ${value}`);
    target[prop] = value;
    return true;
  },
};

const proxy = new Proxy(target, handler);
console.log(proxy.name); // 读取属性: name → Alice
proxy.age = 30; // 设置属性: age = 30
```

## 2. 可拦截的操作

| 陷阱             | 拦截操作             |
| ---------------- | -------------------- |
| `get`            | `proxy[prop]`        |
| `set`            | `proxy[prop] = val`  |
| `has`            | `prop in proxy`      |
| `deleteProperty` | `delete proxy[prop]` |
| `ownKeys`        | `Object.keys()`      |
| `apply`          | `proxy(...args)`     |
| `construct`      | `new proxy(...args)` |

## 3. Reflect API

```javascript
const handler = {
  get(target, prop, receiver) {
    console.log(`get ${prop}`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.log(`set ${prop}`);
    return Reflect.set(target, prop, value, receiver);
  },
};
```

## 4. 实际应用

### 4.1 响应式数据绑定

```javascript
function reactive(obj, onChange) {
  return new Proxy(obj, {
    set(target, prop, value) {
      const old = target[prop];
      target[prop] = value;
      if (old !== value) onChange(prop, value, old);
      return true;
    },
    get(target, prop) {
      const value = target[prop];
      if (value && typeof value === 'object') {
        return reactive(value, onChange);
      }
      return value;
    },
  });
}
```

### 4.2 私有属性保护

```javascript
function privatize(obj) {
  return new Proxy(obj, {
    get(target, prop) {
      if (prop.startsWith('_')) throw new Error(`私有属性 ${prop}`);
      return Reflect.get(target, prop);
    },
    has(target, prop) {
      if (prop.startsWith('_')) return false;
      return Reflect.has(target, prop);
    },
    ownKeys(target) {
      return Reflect.ownKeys(target).filter((k) => !k.startsWith('_'));
    },
  });
}
```

## 5. 可撤销代理

```javascript
const { proxy, revoke } = Proxy.revocable(target, handler);
revoke(); // 撤销后任何操作都会抛出 TypeError
```
