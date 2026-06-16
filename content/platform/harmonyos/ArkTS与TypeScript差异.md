---
order: 101
title: ArkTS与TypeScript差异
module: harmonyos
category: 'dev-lang'
difficulty: advanced
description: 'HarmonyOS ArkTS与TypeScript差异详解。'
author: fanquanpp
updated: '2026-06-14'
related:
  - harmonyos/国际化与无障碍
  - harmonyos/Stage模型与FA模型区别
  - harmonyos/ArkUI声明式语法
  - harmonyos/组件生命周期详解
prerequisites:
  - harmonyos/概述与环境搭建
---

## 1. ArkTS 约束

ArkTS 基于 TypeScript，但增加了以下约束：

### 1.1 禁止使用 any

```typescript
//  不允许
let x: any = 42;

//  使用具体类型
let x: number = 42;
```

### 1.2 禁止运行时类型改变

```typescript
//  不允许
let x: number | string = 42;
x = 'hello'; // 运行时类型改变

//  使用联合类型但保持类型不变
let x: number = 42;
```

### 1.3 禁止使用 eval

```typescript
//  不允许
eval("console.log('hello')");

//  使用正常代码
console.log('hello');
```

## 2. ArkTS 扩展

### 2.1 装饰器

```typescript
@Component
@Entry
struct MyComponent {
  @State message: string = 'Hello'
  @Prop title: string = ''

  build() {
    Text(this.message)
  }
}
```

### 2.2 声明式 UI

```typescript
build() {
  Column() {
    Text('Title')
      .fontSize(24)
      .fontWeight(FontWeight.Bold)

    Button('Click')
      .onClick(() => { this.count++ })
  }
}
```

## 3. 性能优化

ArkTS 通过 AOT 编译和静态类型约束，实现比标准 TypeScript 更好的运行时性能。
