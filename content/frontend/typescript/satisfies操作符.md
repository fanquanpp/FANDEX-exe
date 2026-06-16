---
order: 81
title: satisfies操作符
module: typescript
category: TypeScript
difficulty: intermediate
description: satisfies操作符详解
author: fanquanpp
updated: '2026-06-14'
related:
  - typescript/TypeScript5新特性
  - typescript/工程化配置
  - typescript/迁移实战
  - typescript/条件类型与infer
prerequisites:
  - typescript/语法速查
---

## 概述

satisfies 操作符是 TypeScript 4.9 引入的关键特性，它允许在保留表达式具体类型的同时验证表达式是否符合某个类型。与类型注解不同，satisfies 不会拓宽变量的类型，而是仅做类型检查后保留最精确的类型信息。这在配置对象、常量映射和联合类型属性的场景中特别有用，既能获得类型安全保证，又能保留自动补全和类型推断的精确性。

## 基础概念

**类型注解（: Type）**：将变量标注为指定类型，TypeScript 会将变量的类型拓宽为注解类型。这意味着访问属性时只能看到注解类型的成员，丢失了具体的字面量类型信息。

**satisfies 操作符**：仅验证表达式是否符合目标类型，不改变推断出的类型。变量的类型仍然是其最具体的推断类型，但 TypeScript 会确保它满足约束。

**保留具体类型**：satisfies 的核心价值在于保留字面量类型、联合类型中的具体分支以及数组的元素类型等精确信息，同时确保类型安全。

## 快速上手

### 基本语法

```typescript
// satisfies 语法：表达式 satisfies 类型
const colors = {
  red: [255, 0, 0],
  green: '#00ff00',
  blue: [0, 0, 255],
} satisfies Record<string, string | number[]>;

// 类型检查通过，且保留具体类型
colors.red[0]; // number — 保留数组元素类型
colors.green.toUpperCase(); // string — 保留字符串类型
```

### satisfies vs 类型注解

```typescript
// 类型注解：拓宽类型，丢失具体信息
const colors1: Record<string, string | number[]> = {
  red: [255, 0, 0],
  green: '#00ff00',
};
colors1.red[0]; // string | number — 类型被拓宽
colors1.green.toUpperCase(); // 错误：string | number[] 上没有 toUpperCase

// satisfies：保留具体类型
const colors2 = {
  red: [255, 0, 0],
  green: '#00ff00',
} satisfies Record<string, string | number[]>;
colors2.red[0]; // number — 保留具体类型
colors2.green.toUpperCase(); // string — 保留具体类型，可以调用字符串方法
```

## 详细用法

### 配置对象验证

```typescript
// 应用配置：每个属性的类型不同
interface AppConfig {
  api: { baseURL: string; timeout: number };
  features: { darkMode: boolean; analytics: boolean };
  theme: 'light' | 'dark' | 'auto';
}

// 使用 satisfies 验证配置，同时保留具体类型
const config = {
  api: { baseURL: 'https://api.example.com', timeout: 5000 },
  features: { darkMode: true, analytics: false },
  theme: 'light',
} satisfies AppConfig;

// 保留具体类型，自动补全更精确
config.api.baseURL; // string
config.api.timeout; // number
config.features.darkMode; // boolean
config.theme; // 'light'（字面量类型，而非联合类型）

// 如果配置不符合类型，编译时报错
const badConfig = {
  api: { baseURL: 'https://api.example.com', timeout: '5000' }, // 错误：timeout 应为 number
  features: { darkMode: true, analytics: false },
  theme: 'blue', // 错误：'blue' 不能赋值给 'light' | 'dark' | 'auto'
} satisfies AppConfig;
```

### 映射常量

```typescript
// HTTP 状态码映射
const STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NOT_FOUND: 404,
  ERROR: 500,
} satisfies Record<string, number>;

// 保留数字字面量类型
STATUS_CODES.OK; // 200（字面量类型）
STATUS_CODES.NOT_FOUND; // 404（字面量类型）

// 事件处理器映射
type EventHandler = (event: Event) => void;
const handlers = {
  click: (e: MouseEvent) => console.log('clicked', e.clientX),
  keydown: (e: KeyboardEvent) => console.log('key', e.key),
  focus: (e: FocusEvent) => console.log('focused'),
} satisfies Record<string, EventHandler>;

// 保留具体的事件类型
handlers.click; // (e: MouseEvent) => void
handlers.keydown; // (e: KeyboardEvent) => void
```

### 联合类型属性

```typescript
// 每个属性的值类型不同
type ThemeConfig = {
  colors: string[] | string;
  spacing: number | [number, number];
  borderRadius: number | string;
};

const theme = {
  colors: ['#333', '#666', '#999'],
  spacing: [8, 16] as [number, number],
  borderRadius: '4px',
} satisfies ThemeConfig;

// 保留具体类型
theme.colors; // string[]（而非 string[] | string）
theme.spacing; // [number, number]（而非 number | [number, number]）
theme.borderRadius; // string（而非 number | string）
```

### 与 as const 配合

```typescript
// satisfies + as const：既验证类型，又保留只读字面量类型
const ROUTES = {
  home: '/',
  users: '/users',
  profile: '/profile/:id',
} as const satisfies Record<string, string>;

// 完全只读，且保留字面量类型
ROUTES.home; // '/'（只读字面量）
ROUTES.users; // '/users'（只读字面量）

// 尝试修改会报错
// ROUTES.home = '/new'; // 错误：只读属性
```

## 常见场景

### 组件 Props 类型验证

```typescript
// React 组件 Props 定义
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger';
  size: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

// 默认 Props 使用 satisfies 验证
const defaultProps = {
  variant: 'primary',
  size: 'md',
  disabled: false,
} satisfies Partial<ButtonProps>;

// 保留字面量类型
defaultProps.variant; // 'primary'（字面量类型）
defaultProps.size; // 'md'（字面量类型）
```

### API 响应类型验证

```typescript
// 定义 API 响应类型
interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}

// 运行时数据使用 satisfies 验证
const mockUser = {
  id: 1,
  name: '张三',
  email: 'zhangsan@example.com',
  role: 'admin',
} satisfies UserResponse;

// 保留字面量类型
mockUser.role; // 'admin'（字面量类型，可用于条件判断）
```

### 枚举替代方案

```typescript
// 使用 satisfies 替代枚举，获得更好的类型推断
const Direction = {
  Up: 'UP',
  Down: 'DOWN',
  Left: 'LEFT',
  Right: 'RIGHT',
} as const satisfies Record<string, string>;

type Direction = (typeof Direction)[keyof typeof Direction];
// 'UP' | 'DOWN' | 'LEFT' | 'RIGHT'

// 使用
function move(dir: Direction) {
  // ...
}
move(Direction.Up); // 类型安全
```

## 注意事项

- **TypeScript 版本**：satisfies 需要 TypeScript 4.9 及以上版本。在旧版本中使用会报语法错误。
- **不能替代类型注解**：satisfies 仅做验证，不改变变量类型。如果需要拓宽类型（例如将对象赋值给更宽泛的变量），仍需使用类型注解。
- **与 as const 的顺序**：`as const satisfies Type` 是正确的顺序。写成 `satisfies Type as const` 会导致语法错误。
- **错误信息更友好**：使用 satisfies 时，如果类型不匹配，TypeScript 会指出具体哪个属性不符合预期，错误信息比类型注解更精确。
- **函数返回值**：satisfies 不能用于函数返回值类型注解，函数返回值仍需使用 `: Type` 语法。

## 进阶用法

### 泛型与 satisfies

```typescript
// 创建类型安全的工厂函数
function createConfig<T extends Record<string, unknown>>(
  config: T satisfies Record<string, unknown>
): T {
  return config;
}

// 或者更实用的版本
function typedConfig<T>(config: T & Record<string, unknown>): T {
  return config;
}

// 使用
const appConfig = createConfig({
  port: 3000,
  host: 'localhost',
  debug: true,
} satisfies Record<string, unknown>);

appConfig.port;  // number
appConfig.host;  // string
appConfig.debug; // boolean
```

### 条件类型与 satisfies

```typescript
// 验证对象的所有值都是同一类型
type HomogeneousRecord<K extends string, V> = Record<K, V>;

const scores = {
  math: 95,
  english: 88,
  science: 92,
} satisfies HomogeneousRecord<string, number>;

// 如果值类型不一致，编译报错
const mixed = {
  math: 95,
  english: 'A', // 错误：string 不能赋值给 number
} satisfies HomogeneousRecord<string, number>;
```

### 运行时验证与 satisfies

```typescript
// 结合 Zod 等运行时验证库
import { z } from 'zod';

const UserSchema = z.object({
  name: z.string(),
  age: z.number(),
  email: z.string().email(),
});

type User = z.infer<typeof UserSchema>;

// 运行时验证 + 编译时类型检查
const userData = {
  name: '张三',
  age: 25,
  email: 'zhangsan@example.com',
} satisfies User;

// 先运行时验证，再 satisfies 编译时检查
const parsed = UserSchema.parse(userData);
```
