---
order: 100
title: Stage模型与FA模型区别
module: harmonyos
category: 'dev-lang'
difficulty: advanced
description: 'HarmonyOS Stage模型与FA模型对比详解。'
author: fanquanpp
updated: '2026-06-14'
related:
  - harmonyos/测试与调试
  - harmonyos/国际化与无障碍
  - harmonyos/ArkTS与TypeScript差异
  - harmonyos/ArkUI声明式语法
prerequisites:
  - harmonyos/概述与环境搭建
---

## 1. 两种模型对比

| 特性     | FA 模型        | Stage 模型                 |
| -------- | -------------- | -------------------------- |
| 推荐度   | 旧版（不推荐） | 新版（推荐）               |
| 开发语言 | JS/Java        | ArkTS                      |
| UI 框架  | JS UI          | ArkUI                      |
| 应用模型 | Ability        | UIAbility/ExtensionAbility |
| 生命周期 | Page 生命周期  | UIAbility 生命周期         |
| 窗口管理 | 独立窗口       | 窗口复用                   |
| 多实例   | 不支持         | 支持                       |
| 跨设备   | 有限           | 原生支持                   |

## 2. Stage 模型核心概念

### 2.1 UIAbility

```typescript
@Entry
@Component
struct Index {
  build() {
    Column() {
      Text('Hello HarmonyOS')
    }
  }
}
```

### 2.2 ExtensionAbility

- ServiceExtension：后台服务
- FormExtension：卡片
- ShareExtension：分享

## 3. 迁移建议

- 新项目直接使用 Stage 模型
- FA 模型项目逐步迁移
- HarmonyOS 4.0+ 推荐 Stage 模型
