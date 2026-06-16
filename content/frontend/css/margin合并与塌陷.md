---
order: 53
title: margin合并与塌陷
module: css
category: CSS
difficulty: intermediate
description: margin合并与塌陷
author: fanquanpp
updated: '2026-06-14'
related:
  - css/优先级计算
  - css/样式表引入方式
  - css/定位详解
  - css/浮动与清除
prerequisites:
  - css/概述与基本语法
---

## 1. margin 合并

当两个垂直外边距相遇时，合并为一个，取较大值。

```css
.box1 {
  margin-bottom: 20px;
}
.box2 {
  margin-top: 30px;
}
/* 实际间距：30px（取较大值），而非 50px */
```

### 合并场景

| 场景               | 示例                                |
| ------------------ | ----------------------------------- |
| 相邻兄弟           | 两个 `<p>` 之间                     |
| 父元素与首个子元素 | 父 margin-top 与子 margin-top       |
| 父元素与末尾子元素 | 父 margin-bottom 与子 margin-bottom |
| 空块元素           | 自身的 margin-top 与 margin-bottom  |

### 合并规则

$$
\text{合并后 margin} = \max(margin_1, margin_2)
$$

## 2. margin 塌陷

子元素的 margin-top 传递给父元素。

### 解决方案

| 方案             | CSS                                 | 说明     |
| ---------------- | ----------------------------------- | -------- |
| 父元素加 border  | `border-top: 1px solid transparent` | 触发 BFC |
| 父元素加 padding | `padding-top: 1px`                  | 触发 BFC |
| 父元素 overflow  | `overflow: hidden`                  | 触发 BFC |
| 父元素 display   | `display: flow-root`                | **推荐** |

## 3. BFC（块格式化上下文）

触发条件：`display: flow-root`、`overflow: hidden`、`float`、`position: absolute/fixed`、`display: inline-block/flex/grid`

BFC 作用：阻止 margin 塌陷、包含浮动元素、阻止被浮动元素覆盖。
