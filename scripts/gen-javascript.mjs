import fs from 'fs';
import path from 'path';

const BASE = 'c:\\Atian\\Project\\Trae\\FANDEX-vue\\src\\content\\docs';

function fm(order, title, module, category, difficulty, description) {
  return `---
order: ${order}
title: '${title}'
module: '${module}'
category: '${category}'
difficulty: '${difficulty}'
description: '${description}'
author: 'fanquanpp'
updated: 2026-06-14
---`;
}

function writeFile(dir, filename, content) {
  const fullPath = path.join(BASE, dir, filename);
  if (fs.existsSync(fullPath)) {
    console.log(`SKIP: ${fullPath}`);
    return 0;
  }
  fs.writeFileSync(fullPath, content, 'utf-8');
  return 1;
}

let total = 0;

function addFile(moduleDir, category, order, title, desc, difficulty, content) {
  const filename = title + '.md';
  const fullContent = fm(order, title, moduleDir, category, difficulty, desc) + '\n\n' + content;
  total += writeFile(moduleDir, filename, fullContent);
}

// ==================== JavaScript ====================
addFile(
  'javascript',
  'JavaScript',
  50,
  '高阶函数',
  '以函数为参数或返回值的编程模式',
  'intermediate',
  `## 1. 高阶函数概述

### 1.1 定义

高阶函数（Higher-Order Function）是满足以下条件之一的函数：

- 接受一个或多个函数作为参数
- 返回一个函数作为结果

\`\`\`javascript
// 函数作为参数
function applyOperation(arr, operation) {
  return arr.map(operation);
}

const doubled = applyOperation([1, 2, 3], x => x * 2);
console.log(doubled); // [2, 4, 6]

// 函数作为返回值
function createMultiplier(factor) {
  return function(number) {
    return number * factor;
  };
}

const triple = createMultiplier(3);
console.log(triple(5)); // 15
\`\`\`

### 1.2 为什么需要高阶函数

| 优势 | 说明 |
|------|------|
| **抽象** | 隐藏实现细节，关注"做什么"而非"怎么做" |
| **复用** | 将通用逻辑提取为高阶函数，减少重复代码 |
| **组合** | 通过函数组合构建复杂逻辑 |
| **声明式** | 代码更接近自然语言描述 |

## 2. 内置高阶函数

### 2.1 Array.prototype.map

\`\`\`javascript
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 30 },
  { name: 'Charlie', age: 35 }
];

const names = users.map(user => user.name);
console.log(names); // ['Alice', 'Bob', 'Charlie']
\`\`\`

### 2.2 Array.prototype.filter

\`\`\`javascript
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

const evens = numbers.filter(n => n % 2 === 0);
console.log(evens); // [2, 4, 6, 8, 10]

// 链式调用
const result = numbers
  .filter(n => n % 2 === 0)
  .map(n => n ** 2);
console.log(result); // [4, 16, 36, 64, 100]
\`\`\`

### 2.3 Array.prototype.reduce

\`\`\`javascript
// 求和
const sum = [1, 2, 3, 4, 5].reduce((acc, cur) => acc + cur, 0);
console.log(sum); // 15

// 统计词频
const words = ['apple', 'banana', 'apple', 'cherry', 'banana', 'apple'];
const wordCount = words.reduce((acc, word) => {
  acc[word] = (acc[word] || 0) + 1;
  return acc;
}, {});

// 管道函数
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);
const add1 = x => x + 1;
const double = x => x * 2;
const transform = pipe(add1, double);
console.log(transform(5)); // 12
\`\`\`

### 2.4 其他内置高阶函数

| 方法 | 说明 | 返回值 |
|------|------|--------|
| \`forEach\` | 遍历执行 | \`undefined\` |
| \`find\` | 查找第一个匹配 | 元素或 \`undefined\` |
| \`findIndex\` | 查找第一个匹配索引 | 索引或 \`-1\` |
| \`some\` | 是否存在匹配 | \`boolean\` |
| \`every\` | 是否全部匹配 | \`boolean\` |
| \`sort\` | 排序 | 排序后的数组 |
| \`flatMap\` | map + flat(1) | 新数组 |

## 3. 自定义高阶函数

### 3.1 函数组合

\`\`\`javascript
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);
const pipe = (...fns) => x => fns.reduce((v, f) => f(v), x);

const add10 = x => x + 10;
const multiply3 = x => x * 3;
const toString = x => \`Result: \${x}\`;

const compute = pipe(add10, multiply3, toString);
console.log(compute(5)); // "Result: 45"
\`\`\`

### 3.2 记忆化

\`\`\`javascript
function memoize(fn) {
  const cache = new Map();
  return function(...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = fn.apply(this, args);
    cache.set(key, result);
    return result;
  };
}

const fibonacci = memoize(function(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
});

console.log(fibonacci(50)); // 12586269025
\`\`\`

### 3.3 节流与防抖

\`\`\`javascript
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

function throttle(fn, interval) {
  let lastTime = 0;
  return function(...args) {
    const now = Date.now();
    if (now - lastTime >= interval) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
}
\`\`\`

## 4. 性能考量

| 注意事项 | 说明 |
|----------|------|
| 避免在渲染循环中创建函数 | 每次渲染创建新闭包增加 GC 压力 |
| 链式调用创建中间数组 | 大数据集考虑 reduce |
| 记忆化的内存开销 | 缓存会持续增长，需要清理策略 |
`
);

addFile(
  'javascript',
  'JavaScript',
  51,
  '递归与尾调用优化',
  '递归原理、尾调用与TCO实践',
  'intermediate',
  `## 1. 递归基础

### 1.1 递归定义

递归（Recursion）是函数直接或间接调用自身的编程技术。每个递归必须包含：

- **基线条件**（Base Case）：停止递归的条件
- **递归条件**（Recursive Case）：将问题分解为更小的子问题

\`\`\`javascript
function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

console.log(factorial(5)); // 120
\`\`\`

### 1.2 递归调用栈

\`\`\`
factorial(4) 的调用栈：
factorial(4) = 4 * factorial(3)
             = 4 * 3 * factorial(2)
             = 4 * 3 * 2 * factorial(1)
             = 4 * 3 * 2 * 1 = 24
\`\`\`

## 2. 常见递归模式

\`\`\`javascript
// 数组求和
function sum(arr) {
  if (arr.length === 0) return 0;
  return arr[0] + sum(arr.slice(1));
}

// 反转字符串
function reverse(str) {
  if (str.length <= 1) return str;
  return reverse(str.slice(1)) + str[0];
}

// 二分查找
function binarySearch(arr, target, left = 0, right = arr.length - 1) {
  if (left > right) return -1;
  const mid = Math.floor((left + right) / 2);
  if (arr[mid] === target) return mid;
  if (arr[mid] > target) return binarySearch(arr, target, left, mid - 1);
  return binarySearch(arr, target, mid + 1, right);
}

// 快速排序
function quickSort(arr) {
  if (arr.length <= 1) return arr;
  const pivot = arr[0];
  const left = arr.slice(1).filter(x => x <= pivot);
  const right = arr.slice(1).filter(x => x > pivot);
  return [...quickSort(left), pivot, ...quickSort(right)];
}
\`\`\`

## 3. 尾调用优化（TCO）

### 3.1 尾调用定义

尾调用（Tail Call）是指函数的最后一步是调用另一个函数：

\`\`\`javascript
// 尾调用
function tailCall(x) {
  return anotherFunction(x);
}

// 非尾调用
function notTailCall(x) {
  return anotherFunction(x) + 1;
}
\`\`\`

### 3.2 尾递归改写

\`\`\`javascript
// 普通递归 → 尾递归
function factorial(n, acc = 1) {
  if (n <= 1) return acc;
  return factorial(n - 1, n * acc);
}

function fibonacci(n, a = 0, b = 1) {
  if (n === 0) return a;
  if (n === 1) return b;
  return fibonacci(n - 1, b, a + b);
}
\`\`\`

### 3.3 浏览器 TCO 支持

| 引擎 | TCO 支持 |
|------|---------|
| Safari/JSC | ✅ 完整支持 |
| Chrome/V8 | ❌ 不支持 |
| Firefox/SpiderMonkey | ❌ 不支持 |

## 4. 蹦床函数

\`\`\`javascript
function trampoline(fn) {
  return function(...args) {
    let result = fn(...args);
    while (typeof result === 'function') {
      result = result();
    }
    return result;
  };
}

function factorialThunk(n, acc = 1) {
  if (n <= 1) return acc;
  return () => factorialThunk(n - 1, n * acc);
}

const factorial = trampoline(factorialThunk);
console.log(factorial(100000)); // 不会栈溢出
\`\`\`
`
);

addFile(
  'javascript',
  'JavaScript',
  52,
  '柯里化与偏函数',
  '函数柯里化与偏函数应用',
  'intermediate',
  `## 1. 柯里化（Currying）

### 1.1 定义

柯里化是将一个接受多个参数的函数转换为一系列只接受单个参数的函数：

\`\`\`
f(a, b, c) → f(a)(b)(c)
\`\`\`

\`\`\`javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function(...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}

const add = curry((a, b, c) => a + b + c);
console.log(add(1)(2)(3));   // 6
console.log(add(1, 2)(3));   // 6
\`\`\`

### 1.2 实际应用

\`\`\`javascript
// 日志函数
const log = curry((level, timestamp, message) => {
  console.log(\`[\${level}] \${timestamp}: \${message}\`);
});
const infoLog = log('INFO');

// 过滤器
const filter = curry((predicate, array) => array.filter(predicate));
const isEven = n => n % 2 === 0;
const filterEven = filter(isEven);
console.log(filterEven([1, 2, 3, 4, 5, 6])); // [2, 4, 6]
\`\`\`

## 2. 偏函数（Partial Application）

\`\`\`javascript
function partial(fn, ...presetArgs) {
  return function(...laterArgs) {
    return fn(...presetArgs, ...laterArgs);
  };
}

const greet = (greeting, name, punctuation) =>
  \`\${greeting}, \${name}\${punctuation}\`;

const hello = partial(greet, 'Hello');
console.log(hello('World', '!')); // "Hello, World!"
\`\`\`

## 3. 柯里化 vs 偏函数

| 特性 | 柯里化 | 偏函数 |
|------|--------|--------|
| 参数传递 | 每次一个 | 一次可多个 |
| 返回形式 | 链式单参函数 | 固定部分参数的函数 |
| 参数顺序 | 严格从左到右 | 可跳过（用占位符） |
| 适用场景 | 函数组合 | 固定配置参数 |
`
);

addFile(
  'javascript',
  'JavaScript',
  53,
  '生成器函数',
  'Generator函数与迭代协议',
  'intermediate',
  `## 1. 生成器函数基础

\`\`\`javascript
function* simpleGenerator() {
  yield 1;
  yield 2;
  return 3;
}

const gen = simpleGenerator();
console.log(gen.next()); // { value: 1, done: false }
console.log(gen.next()); // { value: 2, done: false }
console.log(gen.next()); // { value: 3, done: true }
\`\`\`

### 1.1 yield 接收值

\`\`\`javascript
function* dialog() {
  const name = yield '你叫什么名字？';
  const age = yield \`你好 \${name}，你多大了？\`;
  return \`\${name}，\${age}岁\`;
}

const it = dialog();
console.log(it.next());       // { value: '你叫什么名字？', done: false }
console.log(it.next('Alice')); // { value: '你好 Alice，你多大了？', done: false }
console.log(it.next(25));      // { value: 'Alice，25岁', done: true }
\`\`\`

### 1.2 yield* 委托

\`\`\`javascript
function* inner() { yield 'a'; yield 'b'; }
function* outer() { yield 1; yield* inner(); yield 2; }

for (const value of outer()) {
  console.log(value); // 1, 'a', 'b', 2
}
\`\`\`

## 2. 迭代协议

\`\`\`javascript
// 自定义可迭代对象
const range = {
  from: 1, to: 5,
  [Symbol.iterator]() {
    let current = this.from;
    return {
      next() {
        return current <= this.to
          ? { value: current++, done: false }
          : { done: true };
      }.bind(this);
    }.bind({ to: this.to });
  }
};
\`\`\`

## 3. 异步生成器

\`\`\`javascript
async function* fetchPages(baseUrl) {
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const response = await fetch(\`\${baseUrl}?page=\${page}\`);
    const data = await response.json();
    yield data.items;
    hasMore = data.hasNext;
    page++;
  }
}

// 消费
async function processAll() {
  for await (const items of fetchPages('/api/posts')) {
    console.log(items);
  }
}
\`\`\`

## 4. 生成器方法

| 方法 | 说明 |
|------|------|
| \`next(value)\` | 恢复执行 |
| \`return(value)\` | 终止生成器 |
| \`throw(error)\` | 在 yield 处抛出错误 |
`
);

addFile(
  'javascript',
  'JavaScript',
  54,
  'Proxy与Reflect',
  '元编程：代理与反射API',
  'advanced',
  `## 1. Proxy 概述

\`\`\`javascript
const target = { name: 'Alice', age: 25 };
const handler = {
  get(target, prop) {
    console.log(\`读取属性: \${prop}\`);
    return target[prop];
  },
  set(target, prop, value) {
    console.log(\`设置属性: \${prop} = \${value}\`);
    target[prop] = value;
    return true;
  }
};

const proxy = new Proxy(target, handler);
console.log(proxy.name);  // 读取属性: name → Alice
proxy.age = 30;           // 设置属性: age = 30
\`\`\`

## 2. 可拦截的操作

| 陷阱 | 拦截操作 |
|------|---------|
| \`get\` | \`proxy[prop]\` |
| \`set\` | \`proxy[prop] = val\` |
| \`has\` | \`prop in proxy\` |
| \`deleteProperty\` | \`delete proxy[prop]\` |
| \`ownKeys\` | \`Object.keys()\` |
| \`apply\` | \`proxy(...args)\` |
| \`construct\` | \`new proxy(...args)\` |

## 3. Reflect API

\`\`\`javascript
const handler = {
  get(target, prop, receiver) {
    console.log(\`get \${prop}\`);
    return Reflect.get(target, prop, receiver);
  },
  set(target, prop, value, receiver) {
    console.log(\`set \${prop}\`);
    return Reflect.set(target, prop, value, receiver);
  }
};
\`\`\`

## 4. 实际应用

### 4.1 响应式数据绑定

\`\`\`javascript
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
    }
  });
}
\`\`\`

### 4.2 私有属性保护

\`\`\`javascript
function privatize(obj) {
  return new Proxy(obj, {
    get(target, prop) {
      if (prop.startsWith('_')) throw new Error(\`私有属性 \${prop}\`);
      return Reflect.get(target, prop);
    },
    has(target, prop) {
      if (prop.startsWith('_')) return false;
      return Reflect.has(target, prop);
    },
    ownKeys(target) {
      return Reflect.ownKeys(target).filter(k => !k.startsWith('_'));
    }
  });
}
\`\`\`

## 5. 可撤销代理

\`\`\`javascript
const { proxy, revoke } = Proxy.revocable(target, handler);
revoke(); // 撤销后任何操作都会抛出 TypeError
\`\`\`
`
);

addFile(
  'javascript',
  'JavaScript',
  55,
  'Object扩展',
  'ES6+ Object新方法与特性',
  'intermediate',
  `## 1. Object 静态方法

### 1.1 Object.assign 与展开运算符

\`\`\`javascript
// 浅拷贝
const copy = Object.assign({}, original);
const copy2 = { ...original };

// 合并
const merged = Object.assign({}, a, b);
const merged2 = { ...a, ...b };

// 深拷贝
const deep = structuredClone(original);
\`\`\`

### 1.2 Object.is

\`\`\`javascript
Object.is(NaN, NaN);  // true（=== 为 false）
Object.is(-0, 0);     // false（=== 为 true）
\`\`\`

### 1.3 keys/values/entries/fromEntries

\`\`\`javascript
const obj = { name: 'Alice', age: 25 };
Object.keys(obj);    // ['name', 'age']
Object.values(obj);  // ['Alice', 25]
Object.entries(obj); // [['name','Alice'], ['age',25]]

// Map 与 Object 互转
const map = new Map(Object.entries(obj));
const obj2 = Object.fromEntries(map);
\`\`\`

## 2. Object.groupBy（ES2024）

\`\`\`javascript
const inventory = [
  { name: 'asparagus', type: 'vegetables' },
  { name: 'bananas', type: 'fruit' },
  { name: 'goat', type: 'meat' }
];

const result = Object.groupBy(inventory, ({ type }) => type);
// { vegetables: [...], fruit: [...], meat: [...] }
\`\`\`

## 3. Object.hasOwn（ES2022）

\`\`\`javascript
const obj = Object.create({ inherited: true });
obj.own = true;

Object.hasOwn(obj, 'own');       // true
Object.hasOwn(obj, 'inherited'); // false
// 比 hasOwnProperty 更安全，对 null 原型对象也能工作
\`\`\`

## 4. 属性描述符与对象保护

\`\`\`javascript
// 冻结
Object.freeze(obj);        // 完全不可变（浅层）
Object.seal(obj);          // 不能添加/删除
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
\`\`\`
`
);

addFile(
  'javascript',
  'JavaScript',
  56,
  '事件循环',
  'JavaScript事件循环机制详解',
  'intermediate',
  `## 1. 事件循环基础

JavaScript 是单线程语言，事件循环是实现异步非阻塞的核心机制。

\`\`\`javascript
console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');
// 输出：1, 4, 3, 2
\`\`\`

## 2. 宏任务与微任务

| 宏任务 | 微任务 |
|--------|--------|
| \`<script>\` 整体代码 | Promise.then/catch/finally |
| setTimeout/setInterval | MutationObserver |
| I/O 回调 | queueMicrotask |
| UI 渲染 | process.nextTick（Node.js） |
| setImmediate（Node.js） | |

### 执行顺序

1. 执行同步代码（宏任务）
2. 清空所有微任务
3. 执行一个宏任务
4. 重复 2-3

\`\`\`javascript
async function async1() {
  console.log('async1 start');
  await async2();
  console.log('async1 end');
}

async function async2() {
  console.log('async2');
}

console.log('script start');
setTimeout(() => console.log('setTimeout'), 0);
async1();
new Promise(resolve => {
  console.log('promise1');
  resolve();
}).then(() => console.log('promise2'));
console.log('script end');

// 输出：script start, async1 start, async2, promise1, script end,
//       async1 end, promise2, setTimeout
\`\`\`

## 3. Node.js 事件循环

\`\`\`
timers → pending → idle/prepare → poll → check → close callbacks
\`\`\`

\`\`\`javascript
// process.nextTick 优先级最高
setImmediate(() => console.log('immediate'));
Promise.resolve().then(() => console.log('promise'));
process.nextTick(() => console.log('nextTick'));
// 输出：nextTick → promise → immediate
\`\`\`

## 4. requestAnimationFrame

\`\`\`javascript
// rAF 在渲染前执行，跟随屏幕刷新率
function animate() {
  element.style.transform = \`translateX(\${x}px)\`;
  requestAnimationFrame(animate);
}
\`\`\`
`
);

addFile(
  'javascript',
  'JavaScript',
  57,
  '具名捕获组',
  '正则表达式具名捕获组',
  'intermediate',
  `## 1. 具名捕获组基础

\`\`\`javascript
// 传统捕获组
const dateRegex = /(\\d{4})-(\\d{2})-(\\d{2})/;
const match = '2026-06-14'.match(dateRegex);
console.log(match[1]); // '2026'

// 具名捕获组
const namedRegex = /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/;
const namedMatch = '2026-06-14'.match(namedRegex);
console.log(namedMatch.groups.year);  // '2026'
console.log(namedMatch.groups.month); // '06'
console.log(namedMatch.groups.day);   // '14'
\`\`\`

## 2. 与 replace 配合

\`\`\`javascript
// $<name> 替换
const result = '2026-06-14'.replace(
  /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/,
  '$<day>/$<month>/$<year>'
);
console.log(result); // '14/06/2026'

// 替换函数
const formatted = '2026-06-14'.replace(
  /(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/,
  (...args) => {
    const { year, month, day } = args.at(-1);
    return \`\${year}年\${parseInt(month)}月\${parseInt(day)}日\`;
  }
);
\`\`\`

## 3. 具名反向引用

\`\`\`javascript
// \\k<name> 引用具名组
const duplicateWord = /\\b(?<word>\\w+)\\s+\\k<word>\\b/gi;
const htmlTag = /<(?<tag>\\w+)[^>]*>(?<content>[\\s\\S]*?)<\\/\\k<tag>>/g;
\`\`\`

## 4. 实际应用

\`\`\`javascript
// URL 解析
const urlRegex = /^(?<protocol>https?):\\/\\/(?<host>[^:/]+)(?::(?<port>\\d+))?(?<path>\\/[^?#]*)?(?:\\?(?<query>[^#]*))?(?:#(?<fragment>.*))?$/;

// 模板引擎
function template(str, data) {
  return str.replace(/\\$\\{(?<key>\\w+)\\}/g, (...args) => {
    const { key } = args.at(-1);
    return data[key] ?? '';
  });
}
\`\`\`
`
);

addFile(
  'javascript',
  'JavaScript',
  58,
  '断言',
  '正则表达式先行与后行断言',
  'intermediate',
  `## 1. 断言类型

| 类型 | 语法 | 说明 |
|------|------|------|
| 正向先行断言 | \`(?=pattern)\` | 后面必须匹配 |
| 负向先行断言 | \`(?!pattern)\` | 后面不能匹配 |
| 正向后行断言 | \`(?<=pattern)\` | 前面必须匹配 |
| 负向后行断言 | \`(?<!pattern)\` | 前面不能匹配 |

## 2. 先行断言

\`\`\`javascript
// 正向先行：匹配后面跟着"元"的数字
const priceRegex = /\\d+(?=元)/g;
'苹果5元，香蕉3元'.match(priceRegex); // ['5', '3']

// 密码强度验证
const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/;

// 负向先行：排除特定模式
const notLog = /^(?!.*\\.log$).+$/;
\`\`\`

## 3. 后行断言

\`\`\`javascript
// 正向后行：匹配"价格："后面的数字
const afterLabel = /(?<=价格：)\\d+/g;
'苹果价格：5，香蕉价格：3'.match(afterLabel); // ['5', '3']

// 负向后行
const positiveVerb = /(?<!不)喜欢/g;
\`\`\`

## 4. 组合使用

\`\`\`javascript
// 匹配 HTML 标签内文本
const innerText = /(?<=<\\w+>)[^<]+(?=<\\/\\w+>)/g;
'<div>Hello</div><span>World</span>'.match(innerText); // ['Hello', 'World']

// 匹配不在引号内的逗号
const outsideQuotes = /,(?=(?:[^"]*"[^"]*")*[^"]*$)/g;
\`\`\`
`
);

addFile(
  'javascript',
  'JavaScript',
  59,
  'Unicode属性转义',
  '正则表达式Unicode属性转义',
  'intermediate',
  `## 1. Unicode 属性转义

使用 \`\\p{...}\` 语法匹配 Unicode 字符属性，必须配合 \`u\` 标志：

\`\`\`javascript
// 匹配任何 Unicode 字母
/\\p{Letter}/u.test('中'); // true
/\\p{Letter}/u.test('1'); // false

// 匹配任何 Unicode 数字
/\\p{Number}/u.test('１'); // true（全角数字）
/\\p{Number}/u.test('Ⅳ'); // true（罗马数字）
\`\`\`

## 2. 常用属性

\`\`\`javascript
// 通用类别
/\\p{L}/u   // Letter — 所有字母
/\\p{Lu}/u  // 大写字母
/\\p{Ll}/u  // 小写字母
/\\p{Lo}/u  // 其他字母（如中文）
/\\p{N}/u   // Number — 所有数字
/\\p{P}/u   // Punctuation — 标点
/\\p{S}/u   // Symbol — 符号
/\\p{Sc}/u  // 货币符号

// 脚本属性
/\\p{Script=Han}/u      // 中文
/\\p{Script=Hiragana}/u // 平假名
/\\p{Script=Arabic}/u   // 阿拉伯文

// 二进制属性
/\\p{Emoji}/u               // Emoji
/\\p{Emoji_Presentation}/u  // 默认显示为 emoji
/\\p{Hex_Digit}/u           // 十六进制数字
\`\`\`

## 3. 否定形式

\`\`\`javascript
/\\P{Letter}/u  // 大写 P 表示否定
/[^\\p{Letter}]/u // 等价写法
\`\`\`

## 4. 实际应用

\`\`\`javascript
// 多语言单词匹配
const anyWord = /\\p{L}+/gu;
'Hello 世界 مرحبا'.match(anyWord); // ['Hello', '世界', 'مرحبا']

// 多语言用户名验证
const usernameRegex = /^[\\p{L}\\p{N}_]{3,20}$/u;

// 移除 emoji
function removeEmoji(text) {
  return text.replace(/\\p{Emoji}/gu, '');
}
\`\`\`
`
);

addFile(
  'javascript',
  'JavaScript',
  60,
  '自定义Error',
  '创建自定义错误类型与错误链',
  'intermediate',
  `## 1. 自定义错误类

\`\`\`javascript
class AppError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = options.code || 'UNKNOWN_ERROR';
    this.statusCode = options.statusCode || 500;
    this.details = options.details || null;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// 错误类型层次
class NetworkError extends AppError {
  constructor(message, options = {}) {
    super(message, { code: 'NETWORK_ERROR', ...options });
  }
}

class TimeoutError extends NetworkError {
  constructor(message, options = {}) {
    super(message, { code: 'TIMEOUT_ERROR', ...options });
  }
}

class ValidationError extends AppError {
  constructor(message, options = {}) {
    super(message, { code: 'VALIDATION_ERROR', ...options });
    this.fields = options.fields || [];
  }
}

// instanceof 正常工作
const err = new TimeoutError('请求超时');
console.log(err instanceof TimeoutError);  // true
console.log(err instanceof NetworkError);   // true
console.log(err instanceof AppError);       // true
\`\`\`

## 2. 错误链（Error Cause）

\`\`\`javascript
// ES2022 内置 cause 支持
try {
  JSON.parse('invalid');
} catch (e) {
  throw new AppError('数据解析失败', { cause: e });
}

// 获取完整错误链
class ChainedError extends Error {
  get chain() {
    const errors = [this];
    let current = this.cause;
    while (current) {
      errors.push(current);
      current = current.cause;
    }
    return errors;
  }

  get rootCause() {
    let current = this.cause;
    while (current?.cause) current = current.cause;
    return current;
  }
}
\`\`\`

## 3. 聚合错误（AggregateError）

\`\`\`javascript
const errors = [new Error('A'), new Error('B')];
const aggregate = new AggregateError(errors, '多个错误');
console.log(aggregate.errors.length); // 2

// Promise.any 失败时产生 AggregateError
Promise.any([
  Promise.reject(new Error('A')),
  Promise.reject(new Error('B'))
]).catch(err => {
  console.log(err instanceof AggregateError); // true
});
\`\`\`
`
);

addFile(
  'javascript',
  'JavaScript',
  61,
  'BOM',
  '浏览器对象模型详解',
  'beginner',
  `## 1. BOM 概述

浏览器对象模型（BOM）的核心对象是 \`window\`，既是全局对象，也是浏览器窗口的表示。

## 2. window 对象

\`\`\`javascript
// 窗口尺寸
console.log(window.innerWidth);   // 视口宽度
console.log(window.innerHeight);  // 视口高度

// 滚动
window.scrollTo({ top: 0, behavior: 'smooth' });
window.scrollBy(0, 100);

// 定时器
setTimeout(() => {}, 1000);
setInterval(() => {}, 1000);
requestAnimationFrame(animate);
\`\`\`

## 3. location 对象

\`\`\`javascript
console.log(location.href);     // 完整 URL
console.log(location.protocol); // 'https:'
console.log(location.host);     // 'example.com:8080'
console.log(location.pathname); // '/path'
console.log(location.search);   // '?q=test'
console.log(location.hash);     // '#section'

// URL 参数
const params = new URLSearchParams(location.search);
params.get('q'); // 'test'

// 导航
location.assign(url);   // 可后退
location.replace(url);  // 不可后退
location.reload();      // 重新加载
\`\`\`

## 4. navigator 对象

\`\`\`javascript
navigator.userAgent;
navigator.language;
navigator.onLine;       // 是否在线
navigator.cookieEnabled;

// 剪贴板
await navigator.clipboard.writeText('Hello');
const text = await navigator.clipboard.readText();

// 地理位置
navigator.geolocation.getCurrentPosition(pos => {
  console.log(pos.coords.latitude, pos.coords.longitude);
});

// 通知
const permission = await Notification.requestPermission();
new Notification('标题', { body: '内容' });
\`\`\`

## 5. history 对象

\`\`\`javascript
history.back();
history.forward();
history.go(-2);

// SPA 路由
history.pushState({ page: 1 }, '', '/page1');
history.replaceState({ page: 2 }, '', '/page2');

window.addEventListener('popstate', (e) => {
  console.log(e.state);
});
\`\`\`
`
);

addFile(
  'javascript',
  'JavaScript',
  62,
  'Fetch-API',
  '现代网络请求API详解',
  'intermediate',
  `## 1. Fetch API 基础

\`\`\`javascript
// GET
const response = await fetch('/api/users');
const data = await response.json();

// POST
const response = await fetch('/api/users', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice' })
});

// Fetch 不会对 HTTP 错误状态码抛出异常！
if (!response.ok) {
  throw new Error(\`HTTP \${response.status}\`);
}
\`\`\`

## 2. Response 对象

\`\`\`javascript
response.status;       // 200
response.ok;           // true
response.headers.get('Content-Type');

// 解析响应体（只能读取一次）
await response.json();
await response.text();
await response.blob();
await response.arrayBuffer();

// 克隆
const cloned = response.clone();
\`\`\`

## 3. 请求取消

\`\`\`javascript
const controller = new AbortController();
fetch('/api/data', { signal: controller.signal })
  .catch(err => {
    if (err.name === 'AbortError') console.log('请求被取消');
  });
controller.abort();

// 超时取消
function fetchWithTimeout(url, timeout = 5000) {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), timeout);
  return fetch(url, { signal: controller.signal });
}
\`\`\`

## 4. 流式处理

\`\`\`javascript
// 下载进度
async function downloadWithProgress(url, onProgress) {
  const response = await fetch(url);
  const total = parseInt(response.headers.get('Content-Length'), 10);
  const reader = response.body.getReader();
  let received = 0;
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    received += value.length;
    onProgress(received, total);
  }
  return new Blob(chunks);
}
\`\`\`

## 5. 封装 HTTP 客户端

\`\`\`javascript
class HttpClient {
  constructor(baseURL, defaultOptions = {}) {
    this.baseURL = baseURL;
    this.defaultOptions = defaultOptions;
  }

  async request(url, options = {}) {
    const response = await fetch(this.baseURL + url, {
      ...this.defaultOptions, ...options,
      headers: { ...this.defaultOptions.headers, ...options.headers }
    });
    if (!response.ok) throw new Error(\`HTTP \${response.status}\`);
    return response.json();
  }

  get(url, opts) { return this.request(url, { ...opts, method: 'GET' }); }
  post(url, body, opts) {
    return this.request(url, {
      ...opts, method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }
}
\`\`\`
`
);

addFile(
  'javascript',
  'JavaScript',
  63,
  'Web存储API',
  'localStorage、sessionStorage与Cookie',
  'beginner',
  `## 1. Web 存储对比

| 存储方式 | 容量 | 生命周期 | 随请求发送 |
|----------|------|---------|-----------|
| Cookie | ~4KB | 可设过期时间 | ✅ |
| localStorage | ~5-10MB | 永久 | ❌ |
| sessionStorage | ~5-10MB | 标签页关闭 | ❌ |

## 2. localStorage

\`\`\`javascript
localStorage.setItem('name', 'Alice');
localStorage.getItem('name');   // 'Alice'
localStorage.removeItem('name');
localStorage.clear();

// 存储对象
const storage = {
  get(key, defaultValue = null) {
    const value = localStorage.getItem(key);
    if (value === null) return defaultValue;
    try { return JSON.parse(value); } catch { return value; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
};

storage.set('settings', { theme: 'dark' });
storage.get('settings'); // { theme: 'dark' }

// 跨标签页监听
window.addEventListener('storage', (e) => {
  console.log(e.key, e.oldValue, e.newValue);
});
\`\`\`

## 3. Cookie

\`\`\`javascript
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
\`\`\`

| 属性 | 说明 |
|------|------|
| \`max-age\` | 秒数 |
| \`secure\` | 仅 HTTPS |
| \`SameSite\` | Strict/Lax/None |
| \`HttpOnly\` | JS 无法访问（防 XSS） |
`
);

addFile(
  'javascript',
  'JavaScript',
  64,
  'IndexedDB',
  '浏览器端结构化存储数据库',
  'intermediate',
  `## 1. IndexedDB 概述

| 特性 | 说明 |
|------|------|
| 类型 | NoSQL 键值对数据库 |
| 容量 | 数百MB到数GB |
| 事务 | 所有操作必须在事务中 |
| 异步 | 不阻塞主线程 |

## 2. 基本操作

\`\`\`javascript
// 打开数据库
const request = indexedDB.open('MyDatabase', 1);

request.onupgradeneeded = (event) => {
  const db = event.target.result;
  if (!db.objectStoreNames.contains('users')) {
    const store = db.createObjectStore('users', { keyPath: 'id' });
    store.createIndex('name', 'name', { unique: false });
    store.createIndex('email', 'email', { unique: true });
  }
};

// Promise 封装
function dbOp(db, store, mode, callback) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const req = callback(tx.objectStore(store));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

// CRUD
await dbOp(db, 'users', 'readwrite', s => s.add({ id: 1, name: 'Alice' }));
await dbOp(db, 'users', 'readonly', s => s.get(1));
await dbOp(db, 'users', 'readwrite', s => s.put({ id: 1, name: 'Bob' }));
await dbOp(db, 'users', 'readwrite', s => s.delete(1));
\`\`\`

## 3. 索引与查询

\`\`\`javascript
// 索引查询
const index = store.index('email');
index.get('alice@example.com');

// 范围查询
IDBKeyRange.only(25);
IDBKeyRange.lowerBound(18);
IDBKeyRange.upperBound(65);
IDBKeyRange.bound(18, 65);

// 游标遍历
store.openCursor(null, 'next');  // 正序
store.openCursor(null, 'prev');  // 倒序
\`\`\`

## 4. 事务

\`\`\`javascript
const tx = db.transaction(['users', 'orders'], 'readwrite');
tx.oncomplete = () => console.log('完成');
tx.onerror = () => console.error('失败');
tx.abort(); // 回滚
\`\`\`
`
);

addFile(
  'javascript',
  'JavaScript',
  65,
  'Temporal',
  'TC39 Temporal日期时间API提案',
  'advanced',
  `## 1. Temporal 概述

Temporal 是 TC39 提案中的现代日期时间 API，旨在替代 \`Date\` 对象。

### Date 的问题

| 问题 | 说明 |
|------|------|
| 月份从 0 开始 | \`new Date(2026, 0, 1)\` 是1月 |
| 可变性 | Date 对象是可变的 |
| 时区处理差 | 仅支持 UTC 和本地时区 |
| 缺少类型区分 | 不区分日期、时间、日期时间 |

### Temporal 的类型

| 类型 | 说明 |
|------|------|
| \`Temporal.Now\` | 获取当前时刻 |
| \`Temporal.Instant\` | 精确时间点 |
| \`Temporal.ZonedDateTime\` | 带时区的日期时间 |
| \`Temporal.PlainDateTime\` | 无时区的日期时间 |
| \`Temporal.PlainDate\` | 纯日期 |
| \`Temporal.PlainTime\` | 纯时间 |
| \`Temporal.Duration\` | 时间段 |

## 2. 基本用法

\`\`\`javascript
// 当前时间
const now = Temporal.Now.instant();
const today = Temporal.Now.plainDateISO();
const time = Temporal.Now.plainTimeISO();

// 创建
const date = Temporal.PlainDate.from('2026-06-14');
const dt = Temporal.PlainDateTime.from('2026-06-14T10:30:00');

// 属性
console.log(date.year);        // 2026
console.log(date.month);       // 6
console.log(date.day);         // 14
console.log(date.dayOfWeek);   // 6
console.log(date.dayOfYear);   // 165
console.log(date.daysInMonth); // 30
console.log(date.inLeapYear);  // false
\`\`\`

## 3. 日期运算

\`\`\`javascript
const date = Temporal.PlainDate.from('2026-06-14');

const nextWeek = date.add({ days: 7 });
const nextMonth = date.add({ months: 1 });

// 计算差值
const duration = date.until(Temporal.PlainDate.from('2026-12-31'));
console.log(duration.toString()); // P6M17D

// 比较
date.equals(otherDate);
Temporal.PlainDate.compare(date1, date2);
\`\`\`

## 4. 时区处理

\`\`\`javascript
const zdt = Temporal.ZonedDateTime.from({
  year: 2026, month: 6, day: 14,
  hour: 10, timeZone: 'Asia/Shanghai'
});

// 时区转换
const nyTime = zdt.withTimeZone('America/New_York');
\`\`\`

## 5. 格式化

\`\`\`javascript
const date = Temporal.PlainDate.from('2026-06-14');
date.toString();  // '2026-06-14'
date.toLocaleString('zh-CN', { dateStyle: 'full' });
\`\`\`

> **注意**：Temporal 目前处于 Stage 3 阶段，尚未成为正式标准。可使用 \`@js-temporal/polyfill\` 提前体验。
`
);

addFile(
  'javascript',
  'JavaScript',
  66,
  '迭代器帮助器',
  'Iterator Helpers提案详解',
  'advanced',
  `## 1. Iterator Helpers 概述

Iterator Helpers 是 TC39 提案，为迭代器添加了类似数组的高阶方法，使惰性计算链式操作成为可能。

\`\`\`javascript
// 传统方式：先转为数组再操作
const result = [...someIterator]
  .filter(x => x > 0)
  .map(x => x * 2)
  .slice(0, 10);

// Iterator Helpers：惰性计算
const result = someIterator
  .filter(x => x > 0)
  .map(x => x * 2)
  .take(10);
\`\`\`

## 2. 可用方法

### 2.1 转换方法

\`\`\`javascript
function* numbers() {
  let i = 0;
  while (true) yield i++;
}

const iter = numbers();

// map — 转换每个元素
const doubled = iter.map(x => x * 2);

// filter — 过滤元素
const evens = iter.filter(x => x % 2 === 0);

// flatMap — 转换并展平
const pairs = iter.flatMap(x => [x, x * 10]);
\`\`\`

### 2.2 截取方法

\`\`\`javascript
// take — 取前 n 个
const first5 = numbers().take(5);
console.log([...first5]); // [0, 1, 2, 3, 4]

// drop — 跳过前 n 个
const after5 = numbers().drop(5).take(3);
console.log([...after5]); // [5, 6, 7]
\`\`\`

### 2.3 终止方法

\`\`\`javascript
// reduce — 归约
const sum = numbers().take(5).reduce((acc, x) => acc + x, 0);
console.log(sum); // 10

// toArray — 转为数组
const arr = numbers().take(3).toArray();
console.log(arr); // [0, 1, 2]

// forEach — 遍历
numbers().take(3).forEach(x => console.log(x));

// some / every
const hasEven = numbers().take(5).some(x => x % 2 === 0);
const allPositive = numbers().take(5).every(x => x >= 0);

// find
const found = numbers().find(x => x > 3);
\`\`\`

## 3. 惰性计算的优势

\`\`\`javascript
// 无限序列只需计算需要的部分
function* fibonacci() {
  let a = 0, b = 1;
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// 只计算前 10 个偶数斐波那契数
const evenFibs = fibonacci()
  .filter(x => x % 2 === 0)
  .take(10)
  .toArray();

console.log(evenFibs);
// [0, 2, 8, 34, 144, 610, 2584, 10946, 46368, 196418]
\`\`\`

## 4. 与数组方法的区别

| 特性 | 数组方法 | Iterator Helpers |
|------|---------|-----------------|
| 计算 | 立即（eager） | 惰性（lazy） |
| 中间数组 | 每步创建 | 不创建 |
| 无限序列 | ❌ 不支持 | ✅ 支持 |
| 可重复消费 | ✅ | ❌（一次性） |
| 索引访问 | ✅ | ❌ |

\`\`\`javascript
// 数组方式：3 个中间数组
const result1 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
  .filter(x => x % 2 === 0)  // [2, 4, 6, 8, 10]
  .map(x => x * 2)           // [4, 8, 12, 16, 20]
  .slice(0, 3);              // [4, 8, 12]

// 迭代器方式：无中间数组
const result2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].values()
  .filter(x => x % 2 === 0)
  .map(x => x * 2)
  .take(3)
  .toArray();                // [4, 8, 12]
\`\`\`

## 5. 兼容性

> Iterator Helpers 目前处于 Stage 3/4 阶段，主流浏览器正在逐步支持。可使用 core-js 或 polyfill-io 提前使用。
`
);

addFile(
  'javascript',
  'JavaScript',
  67,
  'Promise-withResolvers',
  'Promise.withResolvers()详解',
  'intermediate',
  `## 1. Promise.withResolvers 概述

\`Promise.withResolvers()\` 是 ES2024 新增的静态方法，它返回一个包含 \`promise\`、\`resolve\`、\`reject\` 的对象，避免了手动提取 resolve/reject 的样板代码。

## 2. 传统写法 vs 新写法

### 2.1 传统写法

\`\`\`javascript
let resolve, reject;
const promise = new Promise((res, rej) => {
  resolve = res;
  reject = rej;
});

// 使用
resolve('done');
\`\`\`

### 2.2 新写法

\`\`\`javascript
const { promise, resolve, reject } = Promise.withResolvers();

resolve('done');
\`\`\`

## 3. 实际应用

### 3.1 事件包装

\`\`\`javascript
function waitForEvent(element, eventName) {
  const { promise, resolve } = Promise.withResolvers();
  element.addEventListener(eventName, resolve, { once: true });
  return promise;
}

// 使用
const click = await waitForEvent(button, 'click');
\`\`\`

### 3.2 流式处理

\`\`\`javascript
function createReadableStreamFromAsyncIterator(asyncIterator) {
  const { promise, resolve, reject } = Promise.withResolvers();

  return new ReadableStream({
    async pull(controller) {
      try {
        const { value, done } = await asyncIterator.next();
        if (done) {
          controller.close();
        } else {
          controller.enqueue(value);
        }
        resolve();
      } catch (err) {
        reject(err);
        throw err;
      }
    }
  });
}
\`\`\`

### 3.3 超时控制

\`\`\`javascript
function withTimeout(promise, ms) {
  const { promise: timeoutPromise, resolve } = Promise.withResolvers();
  const timer = setTimeout(() => resolve('timeout'), ms);

  return Promise.race([
    promise.finally(() => clearTimeout(timer)),
    timeoutPromise
  ]);
}
\`\`\`

### 3.4 一次性信号

\`\`\`javascript
class Signal {
  #promise;
  #resolve;

  constructor() {
    const { promise, resolve } = Promise.withResolvers();
    this.#promise = promise;
    this.#resolve = resolve;
  }

  wait() { return this.#promise; }
  emit(value) { this.#resolve(value); }
}

const ready = new Signal();
// 生产者
ready.emit('data');
// 消费者
const data = await ready.wait();
\`\`\`

## 4. 与传统写法的完整对比

\`\`\`javascript
// 传统写法的问题
// 1. resolve/reject 在回调外部使用需要提前声明
// 2. 代码不够直观
// 3. TypeScript 类型推断困难

// 新写法的优势
// 1. 声明即解构，一步到位
// 2. resolve/reject 与 promise 同级，逻辑清晰
// 3. TypeScript 类型推断更友好
\`\`\`
`
);

addFile(
  'javascript',
  'JavaScript',
  68,
  'Records与Tuples',
  'TC39 Record与Tuple不可变数据提案',
  'advanced',
  `## 1. Record 与 Tuple 概述

Record 和 Tuple 是 TC39 提案中的两种新的不可变数据结构：

- **Record**：不可变的对象（类似冻结的对象）
- **Tuple**：不可变的数组（类似冻结的数组）

\`\`\`javascript
// Record — 使用 #{} 语法
const record = #{ name: 'Alice', age: 25 };

// Tuple — 使用 #[] 语法
const tuple = #[1, 2, 3];
\`\`\`

## 2. 不可变性

\`\`\`javascript
const record = #{ name: 'Alice' };
// record.name = 'Bob';  // TypeError — 不可修改
// record.email = 'a@b'; // TypeError — 不可添加
// delete record.name;    // TypeError — 不可删除

const tuple = #[1, 2, 3];
// tuple[0] = 10;  // TypeError
// tuple.push(4);  // TypeError
\`\`\`

## 3. 深度不可变

\`\`\`javascript
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
\`\`\`

## 4. 值语义（按值比较）

这是 Record/Tuple 最重要的特性——它们使用值语义进行比较：

\`\`\`javascript
// 对象是引用比较
console.log({ a: 1 } === { a: 1 }); // false

// Record 是值比较
console.log(#{ a: 1 } === #{ a: 1 }); // true ✅

// 数组是引用比较
console.log([1, 2] === [1, 2]); // false

// Tuple 是值比较
console.log(#[1, 2] === #[1, 2]); // true ✅

// 可以用作 Map 键和 Set 值
const map = new Map();
map.set(#{ x: 1, y: 2 }, 'point');
console.log(map.get(#{ x: 1, y: 2 })); // 'point' ✅

const set = new Set();
set.add(#[1, 2, 3]);
console.log(set.has(#[1, 2, 3])); // true ✅
\`\`\`

## 5. 转换

\`\`\`javascript
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
\`\`\`

## 6. 实际应用

### 6.1 React 状态优化

\`\`\`javascript
// 使用 Record 作为 state，引用比较即可判断变化
function Component({ data }) {
  // data 是 Record，值相等则 === 为 true
  // React.memo 可以正确避免重渲染
}

// 对比：普通对象每次都是新引用
const state1 = { count: 0 };
const state2 = { count: 0 };
state1 === state2; // false → 触发重渲染
\`\`\`

### 6.2 缓存键

\`\`\`javascript
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
\`\`\`

## 7. 与 Object.freeze 的区别

| 特性 | Record/Tuple | Object.freeze |
|------|-------------|---------------|
| 比较方式 | 值比较 | 引用比较 |
| 深度不可变 | ✅ 天然深度不可变 | ❌ 浅层冻结 |
| 可用作 Map 键 | ✅ | ❌ |
| 性能 | 优化为值比较 | 普通对象 |
| 语法 | \`#{}\` / \`#[]\` | 运行时调用 |

> **注意**：Record 和 Tuple 目前处于 Stage 2/3 阶段，语法可能变化。可关注 TC39 提案进展。
`
);

console.log(`\nDone! Total files created: ${total}`);
