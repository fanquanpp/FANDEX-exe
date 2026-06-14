---
order: 81
title: 'satisfies操作符'
module: 'typescript'
category: 'TypeScript'
difficulty: 'intermediate'
description: 'satisfies操作符详解'
author: 'fanquanpp'
updated: 2026-06-14
---

## 1. satisfies 语法

```typescript
const colors = {
  red: [255, 0, 0],
  green: '#00ff00',
  blue: [0, 0, 255],
} satisfies Record<string, string | number[]>;
```

## 2. satisfies vs 类型注解

```typescript
// 类型注解：拓宽类型
const colors1: Record<string, string | number[]> = {
  red: [255, 0, 0],
  green: '#00ff00',
};
colors1.red[0]; // string | number — 类型被拓宽

// satisfies：保留具体类型
const colors2 = {
  red: [255, 0, 0],
  green: '#00ff00',
} satisfies Record<string, string | number[]>;
colors2.red[0]; // number — 保留具体类型
colors2.green.toUpperCase(); // string — 保留具体类型
```

## 3. 实际应用

```typescript
// 配置对象
const config = {
  api: { baseURL: 'https://api.example.com', timeout: 5000 },
  features: { darkMode: true, analytics: false },
} satisfies Record<string, Record<string, string | number | boolean>>;

config.api.baseURL; // string
config.features.darkMode; // boolean

// 映射常量
const STATUS_CODES = {
  OK: 200,
  NOT_FOUND: 404,
  ERROR: 500,
} satisfies Record<string, number>;

STATUS_CODES.OK; // 200 — 数字字面量类型
```
