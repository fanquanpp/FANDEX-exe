---
order: 68
title: Records与Tuples
module: javascript
category: JavaScript
difficulty: advanced
description: 'TC39 Record与Tuple不可变数据提案'
author: fanquanpp
updated: '2026-06-14'
related:
  - javascript/迭代器帮助器
  - javascript/Promise构造器
  - javascript/对象与数组
  - javascript/DOM操作与事件
prerequisites:
  - javascript/语法速查
---

## 1. Record 与 Tuple 概述

Record 和 Tuple 是 TC39 提案中的两种新的不可变数据结构：

- **Record**：不可变的对象（类似冻结的对象）
- **Tuple**：不可变的数组（类似冻结的数组）

```javascript
// Record — 使用 #{} 语法
const record = #{ name: 'Alice', age: 25 };

// Tuple — 使用 #[] 语法
const tuple = #[1, 2, 3];
```

## 2. 不可变性

```javascript
const record = #{ name: 'Alice' };
// record.name = 'Bob';  // TypeError — 不可修改
// record.email = 'a@b'; // TypeError — 不可添加
// delete record.name;    // TypeError — 不可删除

const tuple = #[1, 2, 3];
// tuple[0] = 10;  // TypeError
// tuple.push(4);  // TypeError
```

## 3. 深度不可变

```javascript
// Record 和 Tuple 只能包含原始值或其他 Record/Tuple
const valid = #{
  name: 'Alice',
  scores: #[90, 85, 95],
  address: #{ city: 'Beijing' }
};

// 不能包含可变对象
// const invalid = #{ arr: [1, 2, 3] }; // TypeError
// 需要转换
const converted = #{ arr: Tuple.from([1, 2, 3]) };
```

## 4. 值语义（按值比较）

这是 Record/Tuple 最重要的特性——它们使用值语义进行比较：

```javascript
// 对象是引用比较
console.log({ a: 1 } === { a: 1 }); // false

// Record 是值比较
console.log(#{ a: 1 } === #{ a: 1 }); // true

// 数组是引用比较
console.log([1, 2] === [1, 2]); // false

// Tuple 是值比较
console.log(#[1, 2] === #[1, 2]); // true

// 可以用作 Map 键和 Set 值
const map = new Map();
map.set(#{ x: 1, y: 2 }, 'point');
console.log(map.get(#{ x: 1, y: 2 })); // 'point'

const set = new Set();
set.add(#[1, 2, 3]);
console.log(set.has(#[1, 2, 3])); // true
```

## 5. 转换

```javascript
// 从可变数据转换
const obj = { name: 'Alice', age: 25 };
const record = Record(obj);

const arr = [1, 2, 3];
const tuple = Tuple.from(arr);

// 转回可变数据
const objAgain = Object.fromEntries(record);
const arrAgain = Array.from(tuple);

// JSON 兼容
const json = JSON.stringify(record);
const parsed = Record(JSON.parse(json));
```

## 6. 实际应用

### 6.1 React 状态优化

```javascript
// 使用 Record 作为 state，引用比较即可判断变化
function Component({ data }) {
  // data 是 Record，值相等则 === 为 true
  // React.memo 可以正确避免重渲染
}

// 对比：普通对象每次都是新引用
const state1 = { count: 0 };
const state2 = { count: 0 };
state1 === state2; // false → 触发重渲染
```

### 6.2 缓存键

```javascript
// 复合键缓存
const cache = new Map();

function getCacheKey(args) {
  return Tuple.from(args);
}

function cachedFetch(...args) {
  const key = getCacheKey(args);
  if (cache.has(key)) return cache.get(key);
  const result = fetch(...args);
  cache.set(key, result);
  return result;
}
```

## 7. 与 Object.freeze 的区别

| 特性          | Record/Tuple   | Object.freeze |
| ------------- | -------------- | ------------- |
| 比较方式      | 值比较         | 引用比较      |
| 深度不可变    | 天然深度不可变 | 浅层冻结      |
| 可用作 Map 键 |                |               |
| 性能          | 优化为值比较   | 普通对象      |
| 语法          | `#{}` / `#[]`  | 运行时调用    |

> **注意**：Record 和 Tuple 目前处于 Stage 2/3 阶段，语法可能变化。可关注 TC39 提案进展。
