---
order: 65
title: Temporal
module: javascript
category: JavaScript
difficulty: advanced
description: 'TC39 Temporal日期时间API提案'
author: fanquanpp
updated: '2026-06-14'
related:
  - javascript/Web存储API
  - javascript/索引数据库
  - javascript/迭代器帮助器
  - javascript/Promise构造器
prerequisites:
  - javascript/语法速查
---

## 1. Temporal 概述

Temporal 是 TC39 提案中的现代日期时间 API，旨在替代 `Date` 对象。

### Date 的问题

| 问题          | 说明                         |
| ------------- | ---------------------------- |
| 月份从 0 开始 | `new Date(2026, 0, 1)` 是1月 |
| 可变性        | Date 对象是可变的            |
| 时区处理差    | 仅支持 UTC 和本地时区        |
| 缺少类型区分  | 不区分日期、时间、日期时间   |

### Temporal 的类型

| 类型                     | 说明             |
| ------------------------ | ---------------- |
| `Temporal.Now`           | 获取当前时刻     |
| `Temporal.Instant`       | 精确时间点       |
| `Temporal.ZonedDateTime` | 带时区的日期时间 |
| `Temporal.PlainDateTime` | 无时区的日期时间 |
| `Temporal.PlainDate`     | 纯日期           |
| `Temporal.PlainTime`     | 纯时间           |
| `Temporal.Duration`      | 时间段           |

## 2. 基本用法

```javascript
// 当前时间
const now = Temporal.Now.instant();
const today = Temporal.Now.plainDateISO();
const time = Temporal.Now.plainTimeISO();

// 创建
const date = Temporal.PlainDate.from('2026-06-14');
const dt = Temporal.PlainDateTime.from('2026-06-14T10:30:00');

// 属性
console.log(date.year); // 2026
console.log(date.month); // 6
console.log(date.day); // 14
console.log(date.dayOfWeek); // 6
console.log(date.dayOfYear); // 165
console.log(date.daysInMonth); // 30
console.log(date.inLeapYear); // false
```

## 3. 日期运算

```javascript
const date = Temporal.PlainDate.from('2026-06-14');

const nextWeek = date.add({ days: 7 });
const nextMonth = date.add({ months: 1 });

// 计算差值
const duration = date.until(Temporal.PlainDate.from('2026-12-31'));
console.log(duration.toString()); // P6M17D

// 比较
date.equals(otherDate);
Temporal.PlainDate.compare(date1, date2);
```

## 4. 时区处理

```javascript
const zdt = Temporal.ZonedDateTime.from({
  year: 2026,
  month: 6,
  day: 14,
  hour: 10,
  timeZone: 'Asia/Shanghai',
});

// 时区转换
const nyTime = zdt.withTimeZone('America/New_York');
```

## 5. 格式化

```javascript
const date = Temporal.PlainDate.from('2026-06-14');
date.toString(); // '2026-06-14'
date.toLocaleString('zh-CN', { dateStyle: 'full' });
```

> **注意**：Temporal 目前处于 Stage 3 阶段，尚未成为正式标准。可使用 `@js-temporal/polyfill` 提前体验。
