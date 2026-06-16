---
order: 90
title: 'JavaScript 最新特性与运行时'
module: javascript
category: 'JS Advanced'
difficulty: advanced
description: 'ES2024-2026 新特性、V8 引擎原理、Node.js 22+、Deno 2.0、Bun 运行时与 WebAssembly 进阶。'
author: fanquanpp
updated: '2026-06-14'
related:
  - javascript/对象与数组
  - javascript/DOM操作与事件
  - javascript/模块化
  - javascript/异步编程
prerequisites:
  - javascript/语法速查
---

## 1. ES2024-ES2026 新特性

### 1.1 ES2024 已发布特性

**Object.groupBy / Map.groupBy**

```javascript
// 按属性分组
const inventory = [
  { name: '芦笋', type: '蔬菜', quantity: 5 },
  { name: '香蕉', type: '水果', quantity: 10 },
  { name: '山羊', type: '动物', quantity: 3 },
  { name: '樱桃', type: '水果', quantity: 8 },
];

// Object.groupBy 返回 null-prototype 对象
const grouped = Object.groupBy(inventory, ({ type }) => type);
// { 蔬菜: [{name: '芦笋', ...}], 水果: [...], 动物: [...] }

// Map.groupBy 返回 Map
const restockMap = Map.groupBy(inventory, ({ quantity }) => (quantity < 6 ? '补货' : '充足'));
// Map { '补货' => [...], '充足' => [...] }
```

**Well-Formed Unicode Strings**

```javascript
// 检查字符串是否包含孤立的代理项
const str1 = 'hello';
const str2 = '\uD800'; // 孤立的高代理项

str1.isWellFormed(); // true
str2.isWellFormed(); // false

// 转换为格式正确的字符串
const bad = 'abc\uD800def';
bad.toWellFormed(); // 'abc\uFFFDdef' — 替换为替换字符
```

**Promise.withResolvers**

```javascript
// 之前：需要先声明再赋值
let resolve, reject;
const promise = new Promise((res, rej) => {
  resolve = res;
  reject = rej;
});

// ES2024：一步到位
const { promise, resolve, reject } = Promise.withResolvers();

// 实际应用：可取消的异步操作
function createCancellableTask() {
  const { promise, resolve, reject } = Promise.withResolvers();
  const controller = new AbortController();

  controller.signal.addEventListener('abort', () => {
    reject(new DOMException('操作已取消', 'AbortError'));
  });

  return { promise, resolve, reject, controller };
}
```

**Atomics.waitAsync**

```javascript
// 在 Worker 中异步等待 SharedArrayBuffer 的值变化
const sab = new SharedArrayBuffer(4);
const int32 = new Int32Array(sab);

// 异步等待（不阻塞主线程）
const result = Atomics.waitAsync(int32, 0, 0);
// result.value 是一个 Promise
result.value.then(() => {
  console.log('值已变化');
});

// 在另一个线程中通知
Atomics.notify(int32, 0);
```

### 1.2 ES2025/ES2026 提案特性

**Set 方法**

```javascript
const setA = new Set([1, 2, 3, 4]);
const setB = new Set([3, 4, 5, 6]);

setA.union(setB); // Set {1, 2, 3, 4, 5, 6}
setA.intersection(setB); // Set {3, 4}
setA.difference(setB); // Set {1, 2}
setA.symmetricDifference(setB); // Set {1, 2, 5, 6}
setA.isSubsetOf(setB); // false
setA.isSupersetOf(setB); // false
setA.isDisjointFrom(new Set([5, 6])); // true
```

**Temporal API（阶段3提案）**

Temporal 是 Date 对象的现代替代品，提供不可变、时区感知的日期时间 API：

```javascript
// 当前时间
const now = Temporal.Now.zonedDateTimeISO();
const instant = Temporal.Now.instant();

// 创建日期时间
const meeting = Temporal.ZonedDateTime.from({
  year: 2026,
  month: 6,
  day: 14,
  hour: 14,
  minute: 30,
  timeZone: 'Asia/Shanghai',
});

// 日期运算
const tomorrow = meeting.add({ days: 1 });
const duration = meeting.until(tomorrow); // PT24H

// 时区转换
const nyTime = meeting.withTimeZone('America/New_York');

// 日期比较
const earlier = Temporal.PlainDate.from('2026-01-01');
const later = Temporal.PlainDate.from('2026-12-31');
earlier.until(later).days; // 364

// 格式化
meeting.toLocaleString('zh-CN', {
  dateStyle: 'full',
  timeStyle: 'long',
});
```

**Record & Tuple（阶段2/3提案）**

不可变的值类型数据结构：

```javascript
// Record —— 不可变对象
const record = #{
  name: '张三',
  age: 30,
  skills: #['JavaScript', 'TypeScript'],
};

// Tuple —— 不可变数组
const tuple = #[1, 2, 3, 4, 5];

// 深度比较
#{ x: 1, y: 2 } === #{ x: 1, y: 2 }; // true（值比较！）
#[1, 2, 3] === #[1, 2, 3];           // true

// 在 Map/Set 中用作键
const cache = new Map();
cache.set(#{ lat: 39.9, lng: 116.4 }, '北京');
cache.get(#{ lat: 39.9, lng: 116.4 }); // '北京'
```

**Pattern Matching（阶段1提案）**

```javascript
// 提案语法（可能变化）
const result = match (command) {
  { type: 'click', target: { id } } => `点击了 ${id}`,
  { type: 'keypress', key: 'Enter' } => '按下回车',
  { type: 'keypress', key } => `按下 ${key}`,
  _ => '未知命令',
};
```

## 2. V8 引擎原理

### 2.1 执行管线

V8 的执行管线经过多次演进，当前架构为 **Ignition + TurboFan** 双层架构：

```
JavaScript 源码
    ↓ (解析)
AST (抽象语法树)
    ↓ (Ignition 解释器)
字节码执行 → 收集类型反馈 (Feedback Vector)
    ↓ (热点代码检测)
TurboFan 优化编译器 → 生成机器码
    ↓ (类型不稳定时)
去优化 (Deoptimization) → 回退到 Ignition
```

**Ignition 解释器**：

- 将 AST 编译为字节码，快速启动执行
- 收集运行时类型信息（Feedback Vector）
- 字节码是 TurboFan 优化的基础

**TurboFan 优化编译器**：

- 基于 Sea-of-Nodes IR 的优化编译
- 利用类型反馈进行推测性优化
- 内联缓存（Inline Cache）加速属性访问

### 2.2 内联缓存（Inline Cache）

```javascript
function getX(obj) {
  return obj.x; // V8 会为这个属性访问创建 IC
}

// 第一次调用 —— 收集形状信息
getX({ x: 1, y: 2 }); // IC 记录: 形状 {x, y}，偏移量 0

// 后续相同形状 —— 快速路径
getX({ x: 3, y: 4 }); // 直接从偏移量 0 读取，无需查找

// 不同形状 —— IC 失效，需要多态处理
getX({ x: 5, z: 6 }); // 形状不同，IC 变为多态
```

**优化建议**：保持对象形状一致，避免在运行时增删属性。

### 2.3 垃圾回收

V8 采用分代垃圾回收策略：

| 回收器       | 目标   | 算法              | 触发条件         | 暂停时间 |
| :----------- | :----- | :---------------- | :--------------- | :------- |
| Scavenge     | 新生代 | Cheney 半空间复制 | 新生代空间不足   | < 1ms    |
| Mark-Sweep   | 老生代 | 标记-清除         | 老生代空间不足   | 较长     |
| Mark-Compact | 老生代 | 标记-整理         | 碎片化严重       | 较长     |
| Incremental  | 老生代 | 增量标记          | 交替执行标记与JS | 分散     |
| Concurrent   | 老生代 | 并发标记/清除     | 后台线程执行     | 最小化   |

```javascript
// 查看内存使用
const used = process.memoryUsage();
console.log({
  rss: `${(used.rss / 1024 / 1024).toFixed(2)} MB`, // 常驻内存
  heapTotal: `${(used.heapTotal / 1024 / 1024).toFixed(2)} MB`,
  heapUsed: `${(used.heapUsed / 1024 / 1024).toFixed(2)} MB`,
  external: `${(used.external / 1024 / 1024).toFixed(2)} MB`,
});

// 触发 GC（需要 --expose-gc 标志）
if (global.gc) {
  global.gc();
}
```

**内存优化实践**：

```javascript
//  闭包意外持有大对象
function createHandler() {
  const hugeData = new Array(1_000_000).fill('*');
  return () => hugeData.length; // hugeData 无法被回收
}

//  只保留需要的值
function createHandler() {
  const hugeData = new Array(1_000_000).fill('*');
  const length = hugeData.length; // 提取原始值
  return () => length; // hugeData 可被回收
}

//  全局缓存无限增长
const cache = new Map();
function addToCache(key, value) {
  cache.set(key, value); // 永远不会清理
}

//  使用 WeakRef 或 LRU 缓存
const cache = new Map();
function addToCache(key, value) {
  if (cache.size > 1000) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }
  cache.set(key, value);
}
```

## 3. Node.js 22+

### 3.1 ESM 默认支持

Node.js 22 进一步完善了 ESM 支持：

```json
// package.json
{
  "name": "my-app",
  "type": "module", // 默认使用 ESM
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "require": "./dist/index.cjs",
      "types": "./dist/index.d.ts"
    }
  }
}
```

```javascript
// ESM 中的顶级 await
import { readFileSync } from 'fs';

const config = JSON.parse(readFileSync('./config.json', 'utf-8'));

// 条件导入
let db;
if (config.dbType === 'postgres') {
  db = await import('./adapters/postgres.js');
} else {
  db = await import('./adapters/sqlite.js');
}
```

### 3.2 Watch 模式

```bash
# Node.js 22 内置文件监视（替代 nodemon）
node --watch src/index.js

# 带监视的测试运行
node --watch --test src/**/*.test.js

# 监视特定目录
node --watch-path=./src --watch-path=./config src/index.js
```

### 3.3 权限模型

Node.js 22 引入了实验性的权限模型，限制脚本对系统资源的访问：

```bash
# 限制文件系统读取
node --experimental-permission --allow-fs-read=/tmp,/app/data app.js

# 限制文件系统写入
node --experimental-permission --allow-fs-write=/tmp/output app.js

# 限制网络访问
node --experimental-permission --allow-net=example.com:443 app.js

# 限制子进程
node --experimental-permission --deny-child-process app.js

# 限制 Worker
node --experimental-permission --deny-worker app.js
```

```javascript
// 运行时检查权限
if (process.permission.has('fs.read', '/etc/secrets')) {
  const secret = readFileSync('/etc/secrets/key', 'utf-8');
} else {
  console.warn('无权限读取密钥文件');
}
```

### 3.4 内置测试运行器

```javascript
import { describe, it, before, after, mock } from 'node:test';
import assert from 'node:assert/strict';

describe('UserService', () => {
  let service;

  before(async () => {
    service = new UserService();
    await service.initialize();
  });

  after(async () => {
    await service.cleanup();
  });

  it('应正确创建用户', async () => {
    const user = await service.create({
      name: '张三',
      email: 'zhang@example.com',
    });
    assert.equal(user.name, '张三');
    assert.ok(user.id);
  });

  it('应拒绝重复邮箱', async () => {
    await assert.rejects(
      () => service.create({ name: '李四', email: 'zhang@example.com' }),
      { message: /邮箱已存在/ }
    );
  });

  it('模拟函数调用', (t) => {
    const fetch = t.mock.fn(async (url) => ({ data: 'mocked' }));
    const result = await fetch('/api/users');
    assert.equal(fetch.mock.callCount(), 1);
    assert.deepEqual(result, { data: 'mocked' });
  });
});
```

```bash
# 运行测试
node --test

# 运行特定测试文件
node --test src/user.test.js

# 覆盖率报告
node --test --experimental-test-coverage src/
```

## 4. Deno 2.0

Deno 2.0 在保持安全默认的同时，大幅提升了与 npm 生态的兼容性。

### 4.1 核心改进

```bash
# 安装 Deno 2.0
irm https://deno.land/install.ps1 | iex

# 直接运行 npm 包
deno run npm:express

# 从 npm 导入
```

```typescript
// deno.json 配置
{
  "tasks": {
    "dev": "deno run --watch src/main.ts",
    "test": "deno test --allow-all",
    "build": "deno compile src/main.ts"
  },
  "imports": {
    "oak": "npm:oak@14",
    "postgres": "npm:postgres@3",
    "std/": "https://deno.land/std@0.224/"
  },
  "compilerOptions": {
    "strict": true
  }
}
```

### 4.2 权限系统

```typescript
// 细粒度权限控制
// deno run --allow-net=api.example.com --allow-read=./data --allow-env=NODE_ENV main.ts

const response = await fetch('https://api.example.com/users');
const users = await response.json();

// 运行时权限请求
const status = await Deno.permissions.request({ name: 'read', path: '/tmp' });
if (status.state === 'granted') {
  const data = await Deno.readTextFile('/tmp/data.json');
}
```

### 4.3 单文件编译

```bash
# 编译为独立可执行文件
deno compile --allow-net --allow-read --output myapp src/main.ts

# 交叉编译
deno compile --target x86_64-pc-windows-msvc --output myapp.exe src/main.ts
deno compile --target aarch64-apple-darwin --output myapp-mac src/main.ts
deno compile --target x86_64-unknown-linux-gnu --output myapp-linux src/main.ts
```

## 5. Bun 运行时

Bun 是一个高性能的全栈 JavaScript 运行时，集运行时、包管理器、构建工具和测试框架于一体。

### 5.1 核心特性

```bash
# 安装 Bun
powershell -c "irm bun.sh/install.ps1 | iex"

# 运行脚本（比 Node.js 快 3-4 倍启动）
bun run src/index.ts

# 包管理（比 npm 快 30 倍）
bun install
bun add express
bun add -d @types/express

# 运行测试
bun test

# 构建打包
bun build ./src/index.ts --outdir ./dist --target bun
bun build ./src/index.ts --outdir ./dist --target node
bun build ./src/index.ts --outdir ./dist --target browser
```

### 5.2 内置 API

```typescript
// 内置 SQLite
const db = new Database(':memory:');
db.run('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT)');
db.run('INSERT INTO users (name) VALUES (?)', '张三');
const users = db.query('SELECT * FROM users');

// 内置 HTTP 服务器
const server = Bun.serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === '/api/users') {
      const users = await getUsers();
      return Response.json(users);
    }

    return new Response('Not Found', { status: 404 });
  },
});

console.log(`服务器运行在 http://localhost:${server.port}`);

// 内置文件 I/O（高性能）
const file = Bun.file('./data/large.json');
const data = await file.json(); // 零拷贝读取

// 写入文件
await Bun.write('./output.txt', 'Hello, Bun!');

// 环境变量
const dbUrl = Bun.env.DATABASE_URL;

// 热重载开发
// bun run --hot src/index.ts
```

### 5.3 Bun 与 Node.js 对比

| 特性       | Node.js    | Bun              |
| :--------- | :--------- | :--------------- |
| 启动速度   | 基准       | 3-4 倍更快       |
| 包安装速度 | 基准       | 30 倍更快        |
| SQLite     | 需第三方库 | 内置             |
| 测试框架   | 需第三方库 | 内置             |
| 打包器     | 需第三方库 | 内置             |
| TypeScript | 需编译     | 原生运行         |
| npm 兼容性 | 完全兼容   | 高度兼容（98%+） |
| 稳定性     | 生产就绪   | 快速成熟中       |

## 6. WebAssembly 进阶

### 6.1 WebAssembly 组件模型

组件模型（Component Model）是 WebAssembly 的下一代标准，解决了模块互操作性问题：

```wat
;; component.wit —— 接口定义
package example:calculator;

interface calc {
  add: func(a: s32, b: s32) -> s32;
  multiply: func(a: s32, b: s32) -> s32;
}

world calculator {
  export calc;
}
```

```rust
// Rust 实现 WebAssembly 组件
use wit_bindgen::generate::Guest;

generate!({
    path: "../wit",
    world: "calculator",
});

struct Calculator;

impl Guest for Calculator {
    fn add(a: i32, b: i32) -> i32 {
        a + b
    }

    fn multiply(a: i32, b: i32) -> i32 {
        a * b
    }
}
```

### 6.2 WASI（WebAssembly System Interface）

WASI 提供了安全的系统访问接口：

```rust
// 使用 WASI 的 Rust 项目
use std::fs;
use std::io::{self, Read};

fn read_config() -> Result<String, io::Error> {
    let mut file = fs::File::open("/data/config.json")?;
    let mut contents = String::new();
    file.read_to_string(&mut contents)?;
    Ok(contents)
}
```

```bash
# 编译为 WASI 目标
cargo build --target wasm32-wasip1

# 使用 Wasmtime 运行
wasmtime --dir=/data::/data target/wasm32-wasip1/debug/myapp.wasm
```

### 6.3 JavaScript 与 WebAssembly 互操作

```javascript
// 加载和实例化 WebAssembly 模块
async function loadWasm() {
  const { instance } = await WebAssembly.instantiateStreaming(fetch('/wasm/image-processor.wasm'), {
    env: {
      memory: new WebAssembly.Memory({ initial: 256, maximum: 512 }),
      log: (ptr, len) => {
        const view = new Uint8Array(memory.buffer, ptr, len);
        console.log(new TextDecoder().decode(view));
      },
    },
  });

  const { memory, process_image, allocate, deallocate } = instance.exports;

  return { memory, process_image, allocate, deallocate };
}

// 高性能图像处理
async function processImage(imageData) {
  const wasm = await loadWasm();

  // 在 WASM 内存中分配空间
  const ptr = wasm.allocate(imageData.length);
  const view = new Uint8Array(wasm.memory.buffer);
  view.set(imageData, ptr);

  // 调用 WASM 函数处理
  wasm.process_image(ptr, imageData.length, imageData.width, imageData.height);

  // 读取处理结果
  const result = new Uint8Array(wasm.memory.buffer, ptr, imageData.length);
  wasm.deallocate(ptr, imageData.length);

  return result;
}
```

### 6.4 WebAssembly 线程与 SIMD

```javascript
// WebAssembly SIMD —— 向量运算加速
const simdModule = await WebAssembly.instantiateStreaming(fetch('/wasm/simd-processing.wasm'));

// WASM 线程（SharedArrayBuffer）
const memory = new WebAssembly.Memory({
  initial: 10,
  maximum: 100,
  shared: true, // 启用共享内存
});

// 多个 Worker 共享同一块内存
const workerCode = `
  self.onmessage = ({ data }) => {
    const { module, memory, start, end } = data;
    WebAssembly.instantiate(module, { env: { memory } })
      .then(({ instance }) => {
        instance.exports.processChunk(start, end);
        self.postMessage('done');
      });
  };
`;

const blob = new Blob([workerCode], { type: 'application/javascript' });
const workers = Array.from({ length: 4 }, () => new Worker(URL.createObjectURL(blob)));
```

## 7. 小结

JavaScript 生态正在经历深刻的变革：

- **语言层面**：ES2024+ 的 `groupBy`、`Set` 方法、`Temporal` API 等持续填补标准库空白；`Record & Tuple` 和 `Pattern Matching` 将带来范式级改变
- **引擎层面**：V8 的 Ignition+TurboFan 架构持续优化，垃圾回收越来越精细
- **运行时层面**：Node.js 22+ 的权限模型和内置测试走向成熟；Deno 2.0 兼顾安全与生态；Bun 以极致性能切入全栈场景
- **WebAssembly**：组件模型和 WASI 正在将 WebAssembly 从浏览器扩展到服务端，成为真正的跨平台运行格式

这些发展共同推动 JavaScript 从"浏览器脚本语言"进化为全栈、高性能、类型安全的通用编程平台。
