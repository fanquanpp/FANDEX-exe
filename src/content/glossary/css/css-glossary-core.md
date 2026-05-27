---
title: "CSS 核心概念名词注释 (Core Concepts Glossary)"
module: "css"
category: "Core Concepts"
description: "CSS 核心概念：选择器/盒模型/布局/定位等 | CSS core: selectors, box model, layout, positioning"
---

## A

| 术语 | 英文 | 释义 |
|------|------|------|
| absolute 定位 | Absolute Positioning | `position: absolute`，相对于最近的已定位祖先元素定位，脱离文档流 |
| align-content | align-content | 多行弹性容器中各行在侧轴方向的对齐方式 |
| align-items | align-items | 弹性容器中所有项目在侧轴方向的对齐方式 |
| align-self | align-self | 单个弹性项目在侧轴方向的对齐方式，覆盖 `align-items` |

## B

| 术语 | 英文 | 释义 |
|------|------|------|
| 盒模型 | Box Model | CSS 布局基础，由 Content、Padding、Border、Margin 四层组成 |
| 标准盒模型 | Standard Box Model | `box-sizing: content-box`，width/height 只含内容区 |
| IE 盒模型 | Border Box Model | `box-sizing: border-box`，width/height 包含内容+内边距+边框 |
| border | border | 边框属性，简写 `border: width style color` |
| BFC | Block Formatting Context | 块级格式化上下文，独立的渲染区域，内部布局不影响外部 |
| 块级元素 | Block-level Element | 独占一行的元素，如 `div`、`p`、`h1`，可设置宽高 |

## C

| 术语 | 英文 | 释义 |
|------|------|------|
| 层叠 | Cascade | 多个样式规则应用于同一元素时的优先级计算机制 |
| 层叠顺序 | Cascade Order | 样式优先级：内联 > ID > 类/属性/伪类 > 标签/伪元素 |
| clear | clear | 清除浮动，`left`/`right`/`both` 指定元素哪侧不允许浮动 |
| 类选择器 | Class Selector | 以 `.` 开头的选择器，匹配具有指定 class 的元素 |
| 包含块 | Containing Block | 定位元素的参考矩形，由最近已定位祖先的 padding 边界构成 |

## D

| 术语 | 英文 | 释义 |
|------|------|------|
| display | display | 定义元素的显示类型：`block`、`inline`、`flex`、`grid`、`none` 等 |
| 文档流 | Normal Flow | 元素默认的布局方式，块级元素垂直排列，行内元素水平排列 |

## E

| 术语 | 英文 | 释义 |
|------|------|------|
| 子代选择器 | Child Selector | `>` 组合器，选择直接子元素 |

## F

| 术语 | 英文 | 释义 |
|------|------|------|
| Flexbox | Flexbox | 一维弹性布局模型，`display: flex` 创建弹性容器 |
| flex-direction | flex-direction | 定义主轴方向：`row`（默认）、`row-reverse`、`column`、`column-reverse` |
| flex-wrap | flex-wrap | 控制项目是否换行：`nowrap`（默认）、`wrap`、`wrap-reverse` |
| flex-flow | flex-flow | `flex-direction` 和 `flex-wrap` 的简写 |
| flex-grow | flex-grow | 项目放大比例，默认 0（不放大），分配剩余空间 |
| flex-shrink | flex-shrink | 项目缩小比例，默认 1（等比缩小），0 不缩小 |
| flex-basis | flex-basis | 项目在主轴上的初始大小，优先于 width/height |
| float | float | 浮动定位，`left`/`right` 使元素脱离文档流，向指定方向浮动 |
| fixed 定位 | Fixed Positioning | `position: fixed`，相对于视口定位，不随滚动移动 |

## G

| 术语 | 英文 | 释义 |
|------|------|------|
| Grid | Grid | 二维网格布局模型，`display: grid` 创建网格容器 |
| grid-template-columns | grid-template-columns | 定义网格的列轨道大小 |
| grid-template-rows | grid-template-rows | 定义网格的行轨道大小 |
| grid-template-areas | grid-template-areas | 使用命名区域定义网格布局 |
| grid-gap | grid-gap | 网格间距的简写属性（已弃用，推荐 `gap`） |
| gap | gap | 行间距和列间距的简写，适用于 Flex 和 Grid |

## H

| 术语 | 英文 | 释义 |
|------|------|------|
| 后代选择器 | Descendant Selector | 空格组合器，选择所有后代元素（不限层级） |

## I

| 术语 | 英文 | 释义 |
|------|------|------|
| ID 选择器 | ID Selector | 以 `#` 开头的选择器，匹配具有指定 id 的元素，优先级最高 |
| 行内元素 | Inline Element | 不独占一行的元素，如 `span`、`a`、`em`，不可设置宽高 |
| 行内块元素 | Inline-block Element | `display: inline-block`，行内排列但可设置宽高 |

## J

| 术语 | 英文 | 释义 |
|------|------|------|
| justify-content | justify-content | 弹性/网格容器中项目在主轴方向的对齐方式 |

## M

| 术语 | 英文 | 释义 |
|------|------|------|
| margin | margin | 外边距，元素与其他元素之间的间距 |
| margin 塌陷 | Margin Collapse | 垂直方向相邻外边距合并为较大值的特性 |
| 媒体查询 | Media Query | `@media` 根据设备特征（宽度、分辨率等）应用不同样式 |

## O

| 术语 | 英文 | 释义 |
|------|------|------|
| order | order | Flex/Grid 项目排序，数值越小越靠前，默认 0 |
| overflow | overflow | 内容溢出处理：`visible`（默认）、`hidden`、`scroll`、`auto` |
| opacity | opacity | 不透明度，0（完全透明）到 1（完全不透明） |

## P

| 术语 | 英文 | 释义 |
|------|------|------|
| padding | padding | 内边距，内容与边框之间的间距 |
| position | position | 定位方式：`static`、`relative`、`absolute`、`fixed`、`sticky` |
| 伪类 | Pseudo-class | 以 `:` 前缀的选择器，匹配元素的特殊状态，如 `:hover`、`:first-child` |
| 伪元素 | Pseudo-element | 以 `::` 前缀的选择器，匹配元素的虚拟子元素，如 `::before`、`::after` |
| 优先级 | Specificity | CSS 选择器权重计算：内联(1000) > ID(100) > 类(10) > 标签(1) |

## R

| 术语 | 英文 | 释义 |
|------|------|------|
| relative 定位 | Relative Positioning | `position: relative`，相对于自身原始位置偏移，不脱离文档流 |
| 响应式设计 | Responsive Design | 通过媒体查询、弹性布局等技术使页面适配不同屏幕尺寸 |

## S

| 术语 | 英文 | 释义 |
|------|------|------|
| 选择器 | Selector | CSS 规则中匹配目标元素的模式 |
| 属性选择器 | Attribute Selector | `[attr]`、`[attr=val]` 等，根据属性匹配元素 |
| sticky 定位 | Sticky Positioning | `position: sticky`，滚动到阈值前为 relative，超过后为 fixed |
| 通用选择器 | Universal Selector | `*` 匹配所有元素 |

## T

| 术语 | 英文 | 释义 |
|------|------|------|
| 通用兄弟选择器 | General Sibling Selector | `~` 组合器，选择后续所有同级元素 |
| 相邻兄弟选择器 | Adjacent Sibling Selector | `+` 组合器，选择紧邻的下一个同级元素 |
| 特异性 | Specificity | 同优先级，衡量选择器匹配精确度的数值 |

## V

| 术语 | 英文 | 释义 |
|------|------|------|
| visibility | visibility | 元素可见性：`visible`、`hidden`（占位但不可见）、`collapse` |
| viewport | viewport | 浏览器可视区域，`vw`/`vh` 单位基于视口尺寸 |

## Z

| 术语 | 英文 | 释义 |
|------|------|------|
| z-index | z-index | 定位元素的堆叠顺序，数值越大越靠前，仅对已定位元素有效 |
