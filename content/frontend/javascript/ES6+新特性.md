---
order: 105
tags:
  - javascript
  - es6
difficulty: intermediate
title: 'ES6+ 新特性'
module: javascript
category: 'JS Basics'
description: ES6至ES2024重要新特性：解构赋值、展开运算符、Symbol、Proxy、可选链、空值合并等详解。
author: fanquanpp
updated: '2026-06-13'
related:
  - javascript/Promise静态方法
  - javascript/异步并发控制
  - javascript/深拷贝与浅拷贝
  - javascript/防抖与节流
prerequisites:
  - javascript/语法速查
---

## 1. 解构赋值

### 1.1 数组解构

```javascript
// 基本解构
const [a, b, c] = [1, 2, 3];
console.log(a, b, c); // 1 2 3

// 跳过元素
const [first, , third] = [1, 2, 3];
console.log(first, third); // 1 3

// 默认值
const [x, y, z = 10] = [1, 2];
console.log(x, y, z); // 1 2 10

// 交换变量
let m = 1,
  n = 2;
[m, n] = [n, m];
console.log(m, n); // 2 1

// 嵌套解构
const [i, [j, k]] = [1, [2, 3]];
console.log(i, j, k); // 1 2 3

// 剩余元素
const [head, ...tail] = [1, 2, 3, 4, 5];
console.log(head, tail); // 1 [2, 3, 4, 5]

// 函数返回值解构
function getMinMax(arr) {
  return [Math.min(...arr), Math.max(...arr)];
}
const [min, max] = getMinMax([3, 1, 4, 1, 5]);
console.log(min, max); // 1 5
```

### 1.2 对象解构

```javascript
// 基本解构
const { name, age } = { name: 'Alice', age: 25 };
console.log(name, age); // Alice 25

// 重命名
const { name: userName, age: userAge } = { name: 'Alice', age: 25 };
console.log(userName, userAge); // Alice 25

// 默认值
const { x = 1, y = 2 } = { x: 10 };
console.log(x, y); // 10 2

// 重命名 + 默认值
const { prop: alias = 'default' } = {};
console.log(alias); // "default"

// 嵌套解构
const user = {
  id: 1,
  profile: {
    name: 'Alice',
    address: { city: 'Beijing' },
  },
};
const {
  profile: {
    name,
    address: { city },
  },
} = user;
console.log(name, city); // Alice Beijing

// 剩余属性
const { a: pa, ...rest } = { a: 1, b: 2, c: 3 };
console.log(pa, rest); // 1 { b: 2, c: 3 }

// 函数参数解构
function greet({ name, age = 0, greeting = 'Hello' }) {
  console.log(`${greeting}, ${name}! You are ${age} years old.`);
}
greet({ name: 'Alice', age: 25 }); // Hello, Alice! You are 25 years old.
```

## 2. 展开运算符

### 2.1 数组展开

```javascript
// 合并数组
const arr1 = [1, 2, 3];
const arr2 = [4, 5, 6];
const merged = [...arr1, ...arr2];
console.log(merged); // [1, 2, 3, 4, 5, 6]

// 复制数组（浅拷贝）
const original = [1, 2, 3];
const copy = [...original];
console.log(copy); // [1, 2, 3]
console.log(copy !== original); // true

// 数组插入
const arr = [1, 2, 5, 6];
const result = [1, 2, ...[3, 4], 5, 6];
console.log(result); // [1, 2, 3, 4, 5, 6]

// 将类数组转为数组
function sum() {
  const args = [...arguments];
  return args.reduce((a, b) => a + b, 0);
}
console.log(sum(1, 2, 3)); // 6

// Math方法
const numbers = [5, 2, 8, 1, 9];
console.log(Math.max(...numbers)); // 9
console.log(Math.min(...numbers)); // 1
```

### 2.2 对象展开

```javascript
// 合并对象（后面的属性覆盖前面的）
const defaults = { theme: 'light', fontSize: 14, lang: 'zh' };
const userPrefs = { theme: 'dark', fontSize: 16 };
const config = { ...defaults, ...userPrefs };
console.log(config); // { theme: 'dark', fontSize: 16, lang: 'zh' }

// 浅拷贝对象
const original = { a: 1, b: { c: 2 } };
const copy = { ...original };
copy.a = 10;
copy.b.c = 20; // 注意：嵌套对象是引用！
console.log(original.a); // 1（不受影响）
console.log(original.b.c); // 20（受影响！）

// 深拷贝方案
const deepCopy = structuredClone(original); // ES2022

// 添加/覆盖属性
const user = { name: 'Alice', age: 25 };
const updated = { ...user, age: 26, email: 'alice@example.com' };
console.log(updated); // { name: 'Alice', age: 26, email: 'alice@example.com' }

// 移除属性
const { removed, ...withoutRemoved } = { a: 1, removed: 2, b: 3 };
console.log(withoutRemoved); // { a: 1, b: 3 }
```

## 3. Symbol

### 3.1 基本用法

```javascript
// 创建Symbol
const sym1 = Symbol();
const sym2 = Symbol('description'); // 描述仅用于调试

console.log(Symbol('foo') === Symbol('foo')); // false，每个Symbol唯一

// 作为对象属性键
const id = Symbol('id');
const user = {
  name: 'Alice',
  [id]: 12345,
};
console.log(user[id]); // 12345

// Symbol属性不出现在常规遍历中
console.log(Object.keys(user)); // ['name']
console.log(Object.getOwnPropertySymbols(user)); // [Symbol(id)]
console.log(Reflect.ownKeys(user)); // ['name', Symbol(id)]

// 全局Symbol注册表
const globalSym1 = Symbol.for('app.id');
const globalSym2 = Symbol.for('app.id');
console.log(globalSym1 === globalSym2); // true
console.log(Symbol.keyFor(globalSym1)); // "app.id"
```

### 3.2 内置 Symbol

```javascript
// Symbol.iterator: 自定义迭代行为
const range = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    const last = this.to;
    return {
      next() {
        return current <= last ? { value: current++, done: false } : { done: true };
      },
    };
  },
};

for (const num of range) {
  console.log(num); // 1, 2, 3, 4, 5
}

// Symbol.toPrimitive: 自定义类型转换
const temperature = {
  celsius: 25,
  [Symbol.toPrimitive](hint) {
    if (hint === 'number') return this.celsius;
    if (hint === 'string') return `${this.celsius}°C`;
    return this.celsius;
  },
};

console.log(+temperature); // 25（number hint）
console.log(`${temperature}`); // "25°C"（string hint）
console.log(temperature + 5); // 30（default hint）
```

## 4. Proxy 与 Reflect

### 4.1 Proxy 代理

```javascript
// 基本代理
const target = { name: 'Alice', age: 25 };
const handler = {
  get(obj, prop) {
    console.log(`读取属性: ${prop}`);
    return prop in obj ? obj[prop] : '属性不存在';
  },
  set(obj, prop, value) {
    console.log(`设置属性: ${prop} = ${value}`);
    if (prop === 'age' && (typeof value !== 'number' || value < 0)) {
      throw new TypeError('年龄必须是非负数');
    }
    obj[prop] = value;
    return true;
  },
  deleteProperty(obj, prop) {
    console.log(`删除属性: ${prop}`);
    delete obj[prop];
    return true;
  },
};

const proxy = new Proxy(target, handler);
console.log(proxy.name); // 读取属性: name → "Alice"
proxy.age = 30; // 设置属性: age = 30
// proxy.age = -1;          // TypeError: 年龄必须是非负数
console.log(proxy.unknown); // 读取属性: unknown → "属性不存在"
```

### 4.2 实用代理模式

```javascript
// 1. 验证代理
function validatedObject(schema) {
  return new Proxy(
    {},
    {
      set(obj, prop, value) {
        if (schema[prop]) {
          const { type, validator } = schema[prop];
          if (type && typeof value !== type) {
            throw new TypeError(`${prop} must be ${type}`);
          }
          if (validator && !validator(value)) {
            throw new TypeError(`${prop} validation failed`);
          }
        }
        obj[prop] = value;
        return true;
      },
    }
  );
}

const user = validatedObject({
  name: { type: 'string' },
  age: { type: 'number', validator: (v) => v >= 0 && v <= 150 },
});
user.name = 'Alice';
user.age = 25;
// user.age = -1;  // TypeError

// 2. 只读代理
function readOnly(obj) {
  return new Proxy(obj, {
    set() {
      throw new Error('只读对象，不可修改');
    },
    deleteProperty() {
      throw new Error('只读对象，不可删除');
    },
  });
}

const config = readOnly({ version: '1.0', debug: false });
// config.version = '2.0';  // Error: 只读对象

// 3. 缓存代理
function createCache(fn) {
  const cache = new Map();
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        console.log('缓存命中');
        return cache.get(key);
      }
      const result = Reflect.apply(target, thisArg, args);
      cache.set(key, result);
      return result;
    },
  });
}

const expensiveCalc = createCache((n) => {
  console.log('计算中...');
  return n * n;
});
expensiveCalc(5); // 计算中... → 25
expensiveCalc(5); // 缓存命中 → 25
```

## 5. 可选链与空值合并

### 5.1 可选链操作符 ?.

```javascript
const user = {
  profile: {
    address: {
      city: 'Beijing',
    },
  },
};

// 传统写法
const city1 = user && user.profile && user.profile.address && user.profile.address.city;

// 可选链
const city2 = user?.profile?.address?.city; // "Beijing"
const zip = user?.profile?.address?.zip; // undefined（不会报错）

// 函数调用
const obj = { method: () => 'result' };
console.log(obj.method?.()); // "result"
console.log(obj.nonExist?.()); // undefined

// 数组访问
const arr = null;
console.log(arr?.[0]); // undefined

// 与解构结合
const { profile: { address: { street } } = {} } = user || {};
```

### 5.2 空值合并操作符 ??

```javascript
// ?? 只在 null/undefined 时使用默认值
const value1 = null ?? 'default'; // "default"
const value2 = undefined ?? 'default'; // "default"
const value3 = 0 ?? 'default'; // 0（不是null/undefined）
const value4 = '' ?? 'default'; // ""（不是null/undefined）
const value5 = false ?? 'default'; // false

// 对比 ||
const value6 = 0 || 'default'; // "default"（0是falsy）
const value7 = '' || 'default'; // "default"（空字符串是falsy）

// 实际应用：配置合并
function createConfig(options) {
  return {
    timeout: options.timeout ?? 5000, // 0是有效值
    retries: options.retries ?? 3,
    debug: options.debug ?? false, // false是有效值
    prefix: options.prefix ?? 'app', // ''是有效值
  };
}
```

## 6. 其他重要特性

### 6.1 逻辑赋值运算符（ES2021）

```javascript
let a = null;
a ??= 'default'; // a = a ?? 'default' → "default"

let b = 0;
b ||= 10; // b = b || 10 → 10

let c = { x: 1 };
c &&= c.x; // c = c && c.x → 1
```

### 6.2 Object 新方法

```javascript
// Object.entries / Object.values / Object.keys
const obj = { a: 1, b: 2, c: 3 };
console.log(Object.keys(obj)); // ['a', 'b', 'c']
console.log(Object.values(obj)); // [1, 2, 3]
console.log(Object.entries(obj)); // [['a',1], ['b',2], ['c',3]]

// Object.fromEntries（ES2019）
const entries = [
  ['a', 1],
  ['b', 2],
];
const newObj = Object.fromEntries(entries);
console.log(newObj); // { a: 1, b: 2 }

// 对象过滤
const filtered = Object.fromEntries(Object.entries(obj).filter(([key, value]) => value > 1));
console.log(filtered); // { b: 2, c: 3 }

// Object.assign vs 展开运算符
const target = { a: 1 };
const source = { b: 2 };
Object.assign(target, source); // 修改target
const merged = { ...target, ...source }; // 创建新对象
```

### 6.3 Array 新方法

```javascript
// Array.from: 从类数组或可迭代对象创建数组
const set = new Set([1, 2, 3]);
const arr = Array.from(set);

// Array.of: 创建数组
const arr2 = Array.of(1, 2, 3);

// flat / flatMap（ES2019）
const nested = [1, [2, [3, [4]]]];
console.log(nested.flat()); // [1, 2, [3, [4]]]
console.log(nested.flat(2)); // [1, 2, 3, [4]]
console.log(nested.flat(Infinity)); // [1, 2, 3, 4]

// flatMap
const sentences = ['Hello World', 'Good Morning'];
const words = sentences.flatMap((s) => s.split(' '));
console.log(words); // ['Hello', 'World', 'Good', 'Morning']

// at（ES2022）
const arr3 = [1, 2, 3, 4, 5];
console.log(arr3.at(-1)); // 5（最后一个元素）
console.log(arr3.at(-2)); // 4

// findLast / findLastIndex（ES2023）
const nums = [1, 2, 3, 4, 3, 5];
console.log(nums.findLast((n) => n === 3)); // 3
console.log(nums.findLastIndex((n) => n === 3)); // 4

// toSorted / toReversed / toSpliced（ES2023，不修改原数组）
const original = [3, 1, 4, 1, 5];
const sorted = original.toSorted();
console.log(sorted); // [1, 1, 3, 4, 5]
console.log(original); // [3, 1, 4, 1, 5]（不变）
```

### 6.4 String 新方法

```javascript
// trimStart / trimEnd（ES2019）
const str = '  hello  ';
console.log(str.trimStart()); // "hello  "
console.log(str.trimEnd()); // "  hello"

// replaceAll（ES2021）
const text = 'aaa';
console.log(text.replaceAll('a', 'b')); // "bbb"

// at（ES2022）
const str2 = 'Hello';
console.log(str2.at(-1)); // 'o'

// includes / startsWith / endsWith（ES6）
console.log('Hello World'.includes('World')); // true
console.log('Hello World'.startsWith('Hello')); // true
console.log('Hello World'.endsWith('World')); // true
```

## 7. 常见问题与解决方案

### 7.1 展开运算符浅拷贝陷阱

```javascript
// 问题：嵌套对象是引用
const obj = { a: 1, b: { c: 2 } };
const copy = { ...obj };
copy.b.c = 99;
console.log(obj.b.c); // 99（原对象也被修改）

// 解决方案1：深拷贝
const deepCopy = structuredClone(obj);

// 解决方案2：逐层展开
const deepSpread = { ...obj, b: { ...obj.b } };
```

### 7.2 Proxy 性能

```javascript
// Proxy有性能开销，避免在高频操作中使用
// 错误：在热路径使用Proxy
const proxy = new Proxy(array, handler);
for (let i = 0; i < 1000000; i++) {
  proxy[i]; // 每次访问都经过代理
}

// 正确：仅在需要时使用代理，或使用Object.defineProperty
```

## 8. 总结与最佳实践

### 8.1 特性使用优先级

1. **解构赋值**：提取数据首选，代码更简洁
2. **展开运算符**：合并和复制数据首选
3. **可选链 + 空值合并**：安全访问嵌套属性
4. **Proxy**：需要拦截操作时使用，避免滥用
5. **Symbol**：需要唯一键或自定义行为时使用

### 8.2 最佳实践

1. **解构提供默认值**：增强健壮性
2. **展开运算符做浅拷贝**：深拷贝用 `structuredClone`
3. **`??` 代替 `||`**：当 0、''、false 是有效值时
4. **可选链代替手动检查**：`a?.b?.c` 代替 `a && a.b && a.b.c`
5. **关注新特性兼容性**：使用 Babel 或检查 Can I Use
