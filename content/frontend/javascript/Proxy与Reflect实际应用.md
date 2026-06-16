---
order: 108
title: Proxy与Reflect实际应用
module: javascript
category: 'dev-lang'
difficulty: advanced
description: 'JavaScript Proxy与Reflect实际应用场景：响应式系统、验证、缓存、日志。'
author: fanquanpp
updated: '2026-06-14'
related:
  - javascript/防抖与节流
  - javascript/数组高阶方法
  - javascript/模块动态导入与代码分割
  - javascript/原型与继承
prerequisites:
  - javascript/语法速查
---

## 1. Proxy 基础

### 1.1 语法

```javascript
const proxy = new Proxy(target, handler);
```

| 参数      | 说明                           |
| --------- | ------------------------------ |
| `target`  | 被代理的原始对象               |
| `handler` | 定义拦截操作的对象（陷阱函数） |

### 1.2 可拦截的操作

| 陷阱（Trap）               | 拦截的操作                        |
| -------------------------- | --------------------------------- |
| `get`                      | 读取属性 `proxy.key`              |
| `set`                      | 设置属性 `proxy.key = value`      |
| `has`                      | `key in proxy`                    |
| `deleteProperty`           | `delete proxy.key`                |
| `ownKeys`                  | `Object.keys(proxy)`              |
| `getOwnPropertyDescriptor` | `Object.getOwnPropertyDescriptor` |
| `getPrototypeOf`           | `Object.getPrototypeOf(proxy)`    |
| `setPrototypeOf`           | `Object.setPrototypeOf(proxy)`    |
| `isExtensible`             | `Object.isExtensible(proxy)`      |
| `preventExtensions`        | `Object.preventExtensions(proxy)` |
| `apply`                    | 函数调用 `proxy(...args)`         |
| `construct`                | `new proxy(...args)`              |

## 2. Reflect 配合 Proxy

### 2.1 Reflect 的作用

`Reflect` 提供与 Proxy 陷阱一一对应的静态方法，用于在陷阱中执行默认行为：

```javascript
const proxy = new Proxy(obj, {
  get(target, key, receiver) {
    console.log(`读取 ${String(key)}`);
    return Reflect.get(target, key, receiver); // 执行默认行为
  },
  set(target, key, value, receiver) {
    console.log(`设置 ${String(key)} = ${value}`);
    return Reflect.set(target, key, value, receiver);
  },
});
```

### 2.2 为什么用 Reflect 而非直接操作

```javascript
//  直接操作可能忽略属性描述符
set(target, key, value) {
  target[key] = value; // 忽略 setter、writable 等限制
  return true;
}

//  Reflect 尊重属性描述符
set(target, key, value, receiver) {
  return Reflect.set(target, key, value, receiver); // 正确触发 setter
}
```

## 3. 实际应用场景

### 3.1 响应式系统（Vue 3 原理）

```javascript
function reactive(target) {
  const deps = new Map(); // key → Set<effect>

  const track = (key) => {
    if (activeEffect) {
      let dep = deps.get(key);
      if (!dep) {
        dep = new Set();
        deps.set(key, dep);
      }
      dep.add(activeEffect);
    }
  };

  const trigger = (key) => {
    const dep = deps.get(key);
    if (dep) {
      dep.forEach((effect) => effect());
    }
  };

  return new Proxy(target, {
    get(target, key, receiver) {
      track(key);
      const result = Reflect.get(target, key, receiver);
      // 深层响应式
      if (typeof result === 'object' && result !== null) {
        return reactive(result);
      }
      return result;
    },
    set(target, key, value, receiver) {
      const oldValue = Reflect.get(target, key, receiver);
      const result = Reflect.set(target, key, value, receiver);
      if (oldValue !== value) {
        trigger(key);
      }
      return result;
    },
  });
}

let activeEffect = null;
function effect(fn) {
  activeEffect = fn;
  fn();
  activeEffect = null;
}

// 使用
const state = reactive({ count: 0 });
effect(() => {
  console.log('count changed:', state.count);
});
state.count++; // 自动触发: "count changed: 1"
```

### 3.2 属性验证

```javascript
function validated(target, schema) {
  return new Proxy(target, {
    set(target, key, value, receiver) {
      if (schema[key]) {
        const validator = schema[key];
        if (!validator.validate(value)) {
          throw new TypeError(`Invalid value for ${String(key)}: ${value}`);
        }
      }
      return Reflect.set(target, key, value, receiver);
    },
  });
}

const user = validated(
  {},
  {
    age: { validate: (v) => typeof v === 'number' && v >= 0 && v <= 150 },
    email: { validate: (v) => typeof v === 'string' && /^[^\s@]+@[^\s@]+$/.test(v) },
  }
);

user.age = 25; //
user.age = -1; // TypeError: Invalid value for age: -1
user.email = 'a@b.com'; //
user.email = 'invalid'; // TypeError
```

### 3.3 缓存代理

```javascript
function cachedFetch(target) {
  const cache = new Map();

  return new Proxy(target, {
    apply(target, thisArg, args) {
      const key = JSON.stringify(args);
      if (cache.has(key)) {
        console.log('Cache hit:', key);
        return Promise.resolve(cache.get(key));
      }
      return Reflect.apply(target, thisArg, args).then((result) => {
        cache.set(key, result);
        return result;
      });
    },
  });
}

const cachedApi = cachedFetch(async (url) => {
  const res = await fetch(url);
  return res.json();
});

// 第一次请求：实际发起
await cachedApi('/api/users');
// 第二次请求：缓存命中
await cachedApi('/api/users');
```

### 3.4 私有属性

```javascript
function withPrivate(target, privateKeys) {
  return new Proxy(target, {
    get(target, key) {
      if (privateKeys.includes(key)) {
        throw new Error(`Cannot access private property: ${String(key)}`);
      }
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      if (privateKeys.includes(key)) {
        throw new Error(`Cannot set private property: ${String(key)}`);
      }
      return Reflect.set(target, key, value);
    },
    ownKeys(target) {
      return Reflect.ownKeys(target).filter((key) => !privateKeys.includes(key));
    },
    getOwnPropertyDescriptor(target, key) {
      if (privateKeys.includes(key)) return undefined;
      return Reflect.getOwnPropertyDescriptor(target, key);
    },
  });
}

const obj = withPrivate({ name: 'Alice', _secret: 'password' }, ['_secret']);
obj.name; // 'Alice'
obj._secret; // Error: Cannot access private property: _secret
Object.keys(obj); // ['name']
```

### 3.5 函数日志

```javascript
function withLogging(fn) {
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      console.log(`调用 ${target.name}(${args.map((a) => JSON.stringify(a)).join(', ')})`);
      const start = performance.now();
      const result = Reflect.apply(target, thisArg, args);
      const duration = performance.now() - start;
      console.log(`返回: ${JSON.stringify(result)} (${duration.toFixed(2)}ms)`);
      return result;
    },
  });
}

const add = withLogging(function add(a, b) {
  return a + b;
});

add(1, 2);
// 调用 add(1, 2)
// 返回: 3 (0.01ms)
```

### 3.6 负索引数组

```javascript
function negativeIndexArray(arr) {
  return new Proxy(arr, {
    get(target, key) {
      if (typeof key === 'string' && /^-\d+$/.test(key)) {
        const index = target.length + parseInt(key);
        return Reflect.get(target, index);
      }
      return Reflect.get(target, key);
    },
    set(target, key, value) {
      if (typeof key === 'string' && /^-\d+$/.test(key)) {
        const index = target.length + parseInt(key);
        return Reflect.set(target, index, value);
      }
      return Reflect.set(target, key, value);
    },
  });
}

const arr = negativeIndexArray([10, 20, 30, 40, 50]);
arr[-1]; // 50
arr[-2]; // 40
```

## 4. 可撤销代理

```javascript
const { proxy, revoke } = Proxy.revocable(target, handler);

// 使用 proxy
proxy.key; // 正常工作

// 撤销代理
revoke();

// 再次使用会报错
proxy.key; // TypeError: Cannot perform 'get' on a proxy that has been revoked
```

适用场景：临时授权访问、API 密钥传递后立即撤销。
