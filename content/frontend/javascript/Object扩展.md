---
order: 55
title: Object扩展
module: javascript
category: JavaScript
difficulty: intermediate
description: 'ES6+ Object新方法与特性'
author: fanquanpp
updated: '2026-06-14'
related:
  - javascript/生成器函数
  - javascript/Proxy与Reflect
  - javascript/事件循环
  - javascript/具名捕获组
prerequisites:
  - javascript/语法速查
---

## 1. Object 静态方法

### 1.1 Object.assign 与展开运算符

```javascript
// 浅拷贝
const copy = Object.assign({}, original);
const copy2 = { ...original };

// 合并
const merged = Object.assign({}, a, b);
const merged2 = { ...a, ...b };

// 深拷贝
const deep = structuredClone(original);
```

### 1.2 Object.is

```javascript
Object.is(NaN, NaN); // true（=== 为 false）
Object.is(-0, 0); // false（=== 为 true）
```

### 1.3 keys/values/entries/fromEntries

```javascript
const obj = { name: 'Alice', age: 25 };
Object.keys(obj); // ['name', 'age']
Object.values(obj); // ['Alice', 25]
Object.entries(obj); // [['name','Alice'], ['age',25]]

// Map 与 Object 互转
const map = new Map(Object.entries(obj));
const obj2 = Object.fromEntries(map);
```

## 2. Object.groupBy（ES2024）

```javascript
const inventory = [
  { name: 'asparagus', type: 'vegetables' },
  { name: 'bananas', type: 'fruit' },
  { name: 'goat', type: 'meat' },
];

const result = Object.groupBy(inventory, ({ type }) => type);
// { vegetables: [...], fruit: [...], meat: [...] }
```

## 3. Object.hasOwn（ES2022）

```javascript
const obj = Object.create({ inherited: true });
obj.own = true;

Object.hasOwn(obj, 'own'); // true
Object.hasOwn(obj, 'inherited'); // false
// 比 hasOwnProperty 更安全，对 null 原型对象也能工作
```

## 4. 属性描述符与对象保护

```javascript
// 冻结
Object.freeze(obj); // 完全不可变（浅层）
Object.seal(obj); // 不能添加/删除
Object.preventExtensions(obj); // 不能添加

// 深度冻结
function deepFreeze(obj) {
  Object.freeze(obj);
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val && typeof val === 'object' && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  }
  return obj;
}
```
