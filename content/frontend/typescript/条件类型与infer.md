---
order: 100
title: 条件类型与infer
module: typescript
category: 'dev-lang'
difficulty: advanced
description: 'TypeScript条件类型与infer关键字详解：Conditional Types、类型推断与分布式条件类型。'
author: fanquanpp
updated: '2026-06-14'
related:
  - typescript/satisfies操作符
  - typescript/迁移实战
  - typescript/编译与性能优化
  - typescript/映射类型与键重映射
prerequisites:
  - typescript/语法速查
---

## 1. 条件类型基础

### 1.1 基本语法

条件类型根据类型关系选择不同的类型结果：

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<'hello'>; // true
type B = IsString<42>; // false
```

语法结构：`T extends U ? X : Y`

### 1.2 extends 的含义

`extends` 在条件类型中表示"是否可赋值给"：

```typescript
type IsAssignable<T, U> = T extends U ? true : false;

type A = IsAssignable<string, any>; // true
type B = IsAssignable<never, string>; // never — 特殊行为
type C = IsAssignable<string, number>; // false
```

## 2. 分布式条件类型

### 2.1 自动分发

当条件类型的检查参数是裸类型参数（naked type parameter）时，会自动对联合类型分发：

```typescript
type ToArray<T> = T extends any ? T[] : never;

type Result = ToArray<string | number>;
// 等价于：ToArray<string> | ToArray<number>
// 结果：string[] | number[]
```

### 2.2 阻止分发

用 `[T]` 包裹阻止分发：

```typescript
type ToArrayNoDistribute<T> = [T] extends [any] ? T[] : never;

type Result = ToArrayNoDistribute<string | number>;
// 结果：(string | number)[] — 不分发
```

### 2.3 实用分发模式

```typescript
// 过滤联合类型中的 null/undefined
type NonNullable<T> = T extends null | undefined ? never : T;

type A = NonNullable<string | null | number | undefined>;
// string | number

// 提取函数类型
type ExtractFunction<T> = T extends (...args: any[]) => any ? T : never;

type B = ExtractFunction<string | (() => void) | number>;
// () => void
```

## 3. infer 关键字

### 3.1 基本用法

`infer` 在 extends 子句中声明类型变量，由 TypeScript 推断：

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;

type A = ReturnType<() => string>; // string
type B = ReturnType<(x: number) => boolean>; // boolean
```

### 3.2 提取函数参数

```typescript
type Parameters<T> = T extends (...args: infer P) => any ? P : never;

type A = Parameters<(x: string, y: number) => void>;
// [string, number]
```

### 3.3 提取 Promise 值

```typescript
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

type A = Awaited<Promise<string>>; // string
type B = Awaited<Promise<Promise<number>>>; // number（递归解包）
```

### 3.4 提取数组元素

```typescript
type First<T extends any[]> = T extends [infer F, ...any[]] ? F : never;
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;

type A = First<[1, 2, 3]>; // 1
type B = Last<[1, 2, 3]>; // 3
```

### 3.5 提取字符串部分

```typescript
type GetPrefix<S extends string> = S extends `${infer P}_${string}` ? P : S;

type A = GetPrefix<'user_name'>; // 'user'
type B = GetPrefix<'hello'>; // 'hello'
```

## 4. 多 infer 位置

```typescript
// 同时提取函数参数和返回值
type FunctionInfo<T> = T extends (...args: infer Args) => infer Return
  ? { args: Args; return: Return }
  : never;

type Info = FunctionInfo<(x: string, y: number) => boolean>;
// { args: [string, number]; return: boolean }
```

## 5. 条件类型实战

### 5.1 深层只读

```typescript
type DeepReadonly<T> = T extends Function
  ? T
  : T extends object
    ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
    : T;
```

### 5.2 类型过滤

```typescript
type PickByValue<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K];
};

type User = { name: string; age: number; active: boolean };
type StringFields = PickByValue<User, string>; // { name: string }
```

### 5.3 函数重载推断

```typescript
// 获取最后一个重载签名（最具体的）
type LastOverload<T> = T extends {
  (...args: infer A): infer R;
  (...args: any[]): any;
}
  ? (...args: A) => R
  : never;
```
