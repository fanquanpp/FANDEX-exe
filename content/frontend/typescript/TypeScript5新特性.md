---
order: 80
title: TypeScript5新特性
module: typescript
category: TypeScript
difficulty: intermediate
description: 'TypeScript 5.x新特性详解'
author: fanquanpp
updated: '2026-06-14'
related:
  - typescript/类型安全的发布订阅
  - typescript/类型安全的环境变量
  - typescript/工程化配置
  - typescript/satisfies操作符
prerequisites:
  - typescript/语法速查
---

## 1. 装饰器（Stage 3）

```typescript
function logged(originalMethod: any, context: ClassMethodDecoratorContext) {
  return function (this: any, ...args: any[]) {
    console.log(`调用 ${String(context.name)}`);
    return originalMethod.call(this, ...args);
  };
}

class Calculator {
  @logged
  add(a: number, b: number) {
    return a + b;
  }
}
```

## 2. const 类型参数

```typescript
function createRoutes<const T extends readonly string[]>(routes: T) {
  return routes;
}

const routes = createRoutes(['/home', '/about', '/contact']);
// type: readonly ["/home", "/about", "/contact"] — 保留字面量类型
```

## 3. 枚举改进

```typescript
// 所有枚举现在都是联合枚举
enum Color {
  Red,
  Green,
  Blue,
}
// 每个成员都有独立的类型
```

## 4. 模块解析 bundler

```json
{ "compilerOptions": { "moduleResolution": "bundler" } }
```

## 5. 装饰器元数据

```typescript
// emitDecoratorMetadata 现在基于 Stage 3 装饰器
```

## 6. extends 多配置继承

```json
// tsconfig.json
{
  "extends": ["./tsconfig.base.json", "./tsconfig.strict.json"]
}
```

## 7. 其他改进

- `--verbatimModuleSyntax` 替代 `--importsNotUsedAsValues`
- 枚举类型安全增强
- JSDoc `@satisfies` 支持
- 性能优化与包体积减小
