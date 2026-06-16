---
order: 109
title: 'DevEco-Studio调试器'
module: harmonyos
category: 'dev-lang'
difficulty: advanced
description: 'HarmonyOS DevEco Studio调试器详解：断点、变量查看、性能分析。'
author: fanquanpp
updated: '2026-06-14'
related:
  - harmonyos/跨设备调用
  - harmonyos/元服务开发与发布
prerequisites:
  - harmonyos/概述与环境搭建
---

## 1. 断点调试

### 1.1 设置断点

- 在代码行号旁点击设置断点
- 条件断点：右键断点 → Condition
- 日志断点：右键断点 → Log

### 1.2 调试操作

| 操作      | 快捷键   | 说明     |
| --------- | -------- | -------- |
| Step Over | F8       | 单步跳过 |
| Step Into | F7       | 单步进入 |
| Step Out  | Shift+F8 | 跳出函数 |
| Resume    | F9       | 继续运行 |
| Stop      | Ctrl+F2  | 停止调试 |

## 2. 变量查看

- **Variables 面板**：查看当前作用域变量
- **Watches 面板**：添加自定义表达式
- **Evaluate Expression**：Ctrl+F8 执行表达式

## 3. 性能分析

### 3.1 CPU Profiler

```
Run → Profile → 选择设备 → CPU
```

查看函数调用耗时、火焰图。

### 3.2 Memory Profiler

```
Run → Profile → 选择设备 → Memory
```

查看内存分配、对象数量、GC 事件。

### 3.3 HiTrace

```typescript
import hiTraceMeter from '@ohos.hiTraceMeter';

hiTraceMeter.startTrace('myTask', 1);
// ... 执行任务
hiTraceMeter.finishTrace('myTask', 1);
```

## 4. 日志

```typescript
import hilog from '@ohos.hilog';

hilog.info(0x0001, 'MyTag', 'Info message');
hilog.warn(0x0001, 'MyTag', 'Warning message');
hilog.error(0x0001, 'MyTag', 'Error message');
```

在 DevEco Studio 的 Log 面板中查看。
