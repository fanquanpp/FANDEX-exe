---
order: 68
title: 类型推断infer扩展
module: typescript
category: TypeScript
difficulty: advanced
description: infer在各类场景中的应用
author: fanquanpp
updated: '2026-06-14'
related:
  - typescript/工具类型实现原理
  - typescript/条件类型分发
  - typescript/递归类型与深度操作
  - typescript/条件类型与映射类型
prerequisites:
  - typescript/语法速查
---

## 1. 函数类型推断

```typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
type Parameters<T> = T extends (...args: infer P) => any ? P : never;
type FirstParameter<T> = T extends (first: infer F, ...rest: any[]) => any ? F : never;
type LastParameter<T> = T extends (...args: [...any[], infer L]) => any ? L : never;
```

## 2. Promise 推断

```typescript
type Awaited<T> = T extends Promise<infer U> ? Awaited<U> : T;

type Deep = Promise<Promise<Promise<number>>>;
type Result = Awaited<Deep>; // number
```

## 3. 数组/元组推断

```typescript
type Head<T extends any[]> = T extends [infer H, ...any[]] ? H : never;
type Tail<T extends any[]> = T extends [any, ...infer R] ? R : never;
type Last<T extends any[]> = T extends [...any[], infer L] ? L : never;
type ElementOf<T> = T extends (infer E)[] ? E : never;
```

## 4. 字符串推断

```typescript
type TrimLeft<S extends string> = S extends ` ${infer Rest}` ? TrimLeft<Rest> : S;
type TrimRight<S extends string> = S extends `${infer Rest} ` ? TrimRight<Rest> : S;
type Trim<S> = TrimLeft<TrimRight<S>>;

type Split<S extends string, D extends string> = S extends `${infer Head}${D}${infer Tail}`
  ? [Head, ...Split<Tail, D>]
  : [S];

type Join<T extends string[], D extends string> = T extends [
  infer Head extends string,
  ...infer Rest extends string[],
]
  ? Rest extends []
    ? Head
    : `${Head}${D}${Join<Rest, D>}`
  : '';
```

## 5. 对象类型推断

```typescript
type PickByValue<T, V> = { [K in keyof T as T[K] extends V ? K : never]: T[K] };
type OmitByValue<T, V> = { [K in keyof T as T[K] extends V ? never : K]: T[K] };
```
