---
order: 105
title: tsconfig严格模式
module: typescript
category: 'dev-lang'
difficulty: advanced
description: 'TypeScript tsconfig严格模式详解：strict、noImplicitAny、strictNullChecks等选项。'
author: fanquanpp
updated: '2026-06-14'
related:
  - typescript/类型体操
  - typescript/模块声明与全局类型增强
  - typescript/装饰器标准实现
  - 'typescript/项目示例-类型安全的API客户端'
prerequisites:
  - typescript/语法速查
---

## 1. strict 总开关

```json
{
  "compilerOptions": {
    "strict": true
  }
}
```

`strict: true` 等价于同时启用以下所有选项：

| 选项                           | 说明                              |
| ------------------------------ | --------------------------------- |
| `strictNullChecks`             | null/undefined 不能赋值给其他类型 |
| `noImplicitAny`                | 禁止隐式 any                      |
| `strictFunctionTypes`          | 函数参数逆变检查                  |
| `strictBindCallApply`          | bind/call/apply 严格类型          |
| `strictPropertyInitialization` | 类属性必须初始化                  |
| `noImplicitThis`               | 禁止隐式 any 的 this              |
| `alwaysStrict`                 | 输出 "use strict"                 |
| `useUnknownInCatchVariables`   | catch 变量为 unknown              |

## 2. 核心选项详解

### 2.1 noImplicitAny

```typescript
//  隐式 any
function parse(input) {
  // Parameter 'input' implicitly has an 'any' type
  return input.trim();
}

//  显式类型
function parse(input: string): string {
  return input.trim();
}
```

### 2.2 strictNullChecks

```typescript
//  null 不安全
let name: string = null; // Error

//  明确包含 null
let name: string | null = null;

// 可选链
function greet(name: string | null) {
  console.log(name?.toUpperCase());
}

// 类型守卫
function process(value: string | null) {
  if (value === null) return;
  console.log(value.toUpperCase()); // string
}
```

### 2.3 strictFunctionTypes

```typescript
// 函数参数逆变
type AnimalHandler = (animal: Animal) => void;
type DogHandler = (dog: Dog) => void;

let handler: AnimalHandler = (dog: Dog) => {}; //  不安全
```

### 2.4 strictPropertyInitialization

```typescript
class User {
  name: string; //  属性未初始化

  constructor() {}

  //  方式一：构造函数中初始化
  // constructor() { this.name = ''; }

  //  方式二：确定赋值断言
  // name!: string;

  //  方式三：可选属性
  // name?: string;
}
```

## 3. 其他推荐选项

```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "forceConsistentCasingInFileNames": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### noUncheckedIndexedAccess

```typescript
const arr = [1, 2, 3];
const item = arr[10]; // number | undefined

const obj: Record<string, string> = {};
const value = obj.key; // string | undefined
```

## 4. 渐进式迁移

```json
// 逐步启用严格选项
{
  "compilerOptions": {
    "strictNullChecks": true, // 第一步
    "noImplicitAny": true, // 第二步
    "strict": true // 最终目标
  }
}
```

对于难以修复的文件，使用 `// @ts-nocheck` 或 `// @ts-ignore` 临时跳过。
