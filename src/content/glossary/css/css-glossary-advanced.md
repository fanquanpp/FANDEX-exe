---
title: "CSS 高级名词注释 (Advanced Glossary)"
module: "css"
category: "Advanced"
description: "CSS 高级：变量/函数/容器查询/层级/逻辑属性等 | CSS advanced: variables, functions, container queries, layers, logical properties"
---

## A

| 术语 | 英文 | 释义 |
|------|------|------|
| @layer | @layer | CSS 层级（Cascade Layers），控制样式表的层叠优先级，先声明的层优先级更低 |
| aspect-ratio | aspect-ratio | 宽高比属性，如 `16 / 9`，自动计算缺失的宽度或高度 |

## B

| 术语 | 英文 | 释义 |
|------|------|------|
| backdrop-filter | backdrop-filter | 元素后方区域的滤镜效果，常用于毛玻璃效果 `backdrop-filter: blur(10px)` |
| block-size | block-size | 逻辑属性，块轴方向尺寸，水平书写模式等同 `height` |
| inline-size | inline-size | 逻辑属性，行内轴方向尺寸，水平书写模式等同 `width` |

## C

| 术语 | 英文 | 释义 |
|------|------|------|
| CSS 变量 | Custom Property | `--var-name` 定义，`var(--var-name)` 引用，运行时可动态修改 |
| calc() | calc() | 计算函数，支持加减乘除混合单位运算，如 `calc(100% - 20px)` |
| clamp() | clamp() | 限制值范围函数，`clamp(min, preferred, max)` |
| 容器查询 | Container Query | `@container` 根据容器尺寸而非视口应用样式，组件级响应式 |
| 容器查询单位 | Container Query Unit | `cqw`（容器宽度 1%）、`cqh`（容器高度 1%）等 |
| content-visibility | content-visibility | 渲染性能优化属性，`auto` 跳过屏幕外内容的渲染 |
| counter() | counter() | CSS 计数器函数，配合 `counter-reset` 和 `counter-increment` 自动编号 |

## D

| 术语 | 英文 | 释义 |
|------|------|------|
| @document | @document | 根据文档 URL 应用样式的规则（仅 Firefox 支持） |

## E

| 术语 | 英文 | 释义 |
|------|------|------|
| env() | env() | 环境变量函数，访问用户代理定义的变量，如 `env(safe-area-inset-top)` |

## F

| 术语 | 英文 | 释义 |
|------|------|------|
| @font-face | @font-face | 自定义字体规则，加载外部字体文件 |
| :has() | :has() | 父选择器（关系型伪类），根据子元素状态选择父元素，如 `div:has(> p)` |
| min() | min() | 取多个值中的最小值，如 `min(100vw, 800px)` |
| max() | max() | 取多个值中的最大值，如 `max(50vw, 300px)` |

## G

| 术语 | 英文 | 释义 |
|------|------|------|
| @supports | @supports | 特性查询，检测浏览器是否支持某 CSS 属性后应用样式 |
| grid-auto-flow | grid-auto-flow | 自动放置算法：`row`（逐行）、`column`（逐列）、`dense`（紧凑填充） |
| grid-auto-rows | grid-auto-rows | 隐式行轨道大小 |
| grid-auto-columns | grid-auto-columns | 隐式列轨道大小 |
| subgrid | subgrid | 子网格，嵌套网格继承父网格的轨道定义 |

## H

| 术语 | 英文 | 释义 |
|------|------|------|
| :is() | :is() | 选择器匹配简化函数，`:is(h1, h2, h3)` 等价于 `h1, h2, h3` |
| :where() | :where() | 与 `:is()` 类似但特异性为 0，便于覆盖 |

## I

| 术语 | 英文 | 释义 |
|------|------|------|
| image-set() | image-set() | 根据设备像素比选择不同分辨率图片 |

## J

| 术语 | 英文 | 释义 |
|------|------|------|
| 逻辑属性 | Logical Property | 不依赖书写方向的属性，如 `margin-block-start` 替代 `margin-top` |
| 逻辑值 | Logical Value | 不依赖书写方向的值，如 `start`/`end` 替代 `left`/`right` |

## L

| 术语 | 英文 | 释义 |
|------|------|------|
| @layer 顺序 | Layer Order | 层级声明顺序决定优先级，后声明的层优先级更高；未分层的样式优先级最高 |

## M

| 术语 | 英文 | 释义 |
|------|------|------|
| minmax() | minmax() | Grid 轨道尺寸函数，`minmax(200px, 1fr)` 定义最小和最大值 |
| margin-block | margin-block | 逻辑属性，块轴方向外边距 |
| margin-inline | margin-inline | 逻辑属性，行内轴方向外边距 |
| padding-block | padding-block | 逻辑属性，块轴方向内边距 |
| padding-inline | padding-inline | 逻辑属性，行内轴方向内边距 |

## N

| 术语 | 英文 | 释义 |
|------|------|------|
| :not() | :not() | 否定伪类，排除匹配选择器的元素，可接受选择器列表 |

## O

| 术语 | 英文 | 释义 |
|------|------|------|
| object-fit | object-fit | 替换元素内容适应方式：`fill`、`contain`、`cover`、`none`、`scale-down` |
| object-position | object-position | 替换元素内容在框内的对齐位置 |

## P

| 术语 | 英文 | 释义 |
|------|------|------|
| @property | @property | CSS Houdini 自定义属性注册，定义变量类型、初始值和继承性 |
| paint() | paint() | CSS Houdini Paint API，使用 JavaScript 绘制自定义图形 |

## R

| 术语 | 英文 | 释义 |
|------|------|------|
| repeat() | repeat() | Grid 轨道重复函数，`repeat(3, 1fr)` 或 `repeat(auto-fill, minmax(200px, 1fr))` |
| :root | :root | 文档根元素选择器，通常在此定义 CSS 全局变量 |

## S

| 术语 | 英文 | 释义 |
|------|------|------|
| scroll-snap | scroll-snap | 滚动捕捉，`scroll-snap-type` 定义捕捉轴和严格度 |
| scroll-behavior | scroll-behavior | 滚动行为：`auto`（立即）、`smooth`（平滑） |
| scroll-margin | scroll-margin | 滚动捕捉偏移量，调整捕捉位置 |
| scroll-padding | scroll-padding | 滚动容器视口内边距，影响捕捉区域 |
| scrollbar-width | scrollbar-width | 滚动条宽度：`auto`、`thin`、`none` |
| scrollbar-color | scrollbar-color | 滚动条颜色：`thumb-color track-color` |

## T

| 术语 | 英文 | 释义 |
|------|------|------|
| touch-action | touch-action | 控制触摸手势行为：`auto`、`none`、`pan-x`、`pan-y`、`manipulation` |

## U

| 术语 | 英文 | 释义 |
|------|------|------|
| 单位 | Unit | CSS 单位：绝对（px、pt、cm）、相对（em、rem、vw、vh、%、cqw） |
| unset | unset | CSS 全局关键字，继承属性等同 `inherit`，非继承属性等同 `initial` |

## V

| 术语 | 英文 | 释义 |
|------|------|------|
| var() | var() | 引用 CSS 自定义属性的函数，支持默认值 `var(--color, red)` |
| 视口单位 | Viewport Unit | `vw`（视口宽度 1%）、`vh`（视口高度 1%）、`vmin`、`vmax` |

## W

| 术语 | 英文 | 释义 |
|------|------|------|
| will-change | will-change | 性能提示属性，告知浏览器元素将发生的变化，如 `transform`、`opacity` |
| writing-mode | writing-mode | 书写模式：`horizontal-tb`、`vertical-rl`、`vertical-lr` |

## X

| 术语 | 英文 | 释义 |
|------|------|------|
| :nth-child() | :nth-child() | 结构伪类，匹配父元素中第 n 个子元素，支持公式 `An+B` |
| :nth-of-type() | :nth-of-type() | 结构伪类，匹配同类型第 n 个兄弟元素 |
