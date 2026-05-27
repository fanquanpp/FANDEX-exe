---
title: "CSS 视觉名词注释 (Visual Glossary)"
module: "css"
category: "Visual"
description: "CSS 视觉：颜色/字体/背景/变换/动画等 | CSS visual: colors, fonts, backgrounds, transforms, animations"
---

## A

| 术语 | 英文 | 释义 |
|------|------|------|
| animation | animation | 动画简写属性：`name duration timing-function delay iteration-count direction fill-mode play-state` |
| animation-delay | animation-delay | 动画延迟开始时间，支持负值（从动画中间开始） |
| animation-direction | animation-direction | 动画方向：`normal`、`reverse`、`alternate`、`alternate-reverse` |
| animation-duration | animation-duration | 动画一个周期的持续时间 |
| animation-fill-mode | animation-fill-mode | 动画执行前后样式状态：`none`、`forwards`、`backwards`、`both` |
| animation-iteration-count | animation-iteration-count | 动画播放次数，`infinite` 无限循环 |
| animation-name | animation-name | 绑定的 `@keyframes` 动画名称 |
| animation-play-state | animation-play-state | 动画播放状态：`running`、`paused` |
| animation-timing-function | animation-timing-function | 动画速度曲线：`ease`、`linear`、`ease-in`、`ease-out`、`ease-in-out`、`cubic-bezier()` |

## B

| 术语 | 英文 | 释义 |
|------|------|------|
| background | background | 背景简写属性，包含 color、image、repeat、position、size 等 |
| background-attachment | background-attachment | 背景滚动方式：`scroll`（默认）、`fixed`、`local` |
| background-clip | background-clip | 背景绘制区域：`border-box`、`padding-box`、`content-box`、`text` |
| background-color | background-color | 背景颜色 |
| background-image | background-image | 背景图片，支持多背景叠加和渐变 |
| background-origin | background-origin | 背景定位区域：`border-box`、`padding-box`、`content-box` |
| background-position | background-position | 背景图片位置，支持关键字、百分比、长度值 |
| background-repeat | background-repeat | 背景重复方式：`repeat`、`no-repeat`、`repeat-x`、`repeat-y` |
| background-size | background-size | 背景图片大小：`cover`（覆盖）、`contain`（包含）、具体尺寸 |
| border-radius | border-radius | 圆角边框，四个值分别对应左上、右上、右下、左下 |
| box-shadow | box-shadow | 盒子阴影：`h-offset v-offset blur spread color inset` |

## C

| 术语 | 英文 | 释义 |
|------|------|------|
| color | color | 前景（文本）颜色，支持关键字、HEX、RGB、HSL 等格式 |
|currentColor | currentColor | CSS 关键字，引用当前元素的 `color` 属性值 |
| 线性渐变 | Linear Gradient | `linear-gradient()` 沿直线方向的颜色渐变 |
| 径向渐变 | Radial Gradient | `radial-gradient()` 从中心向外辐射的颜色渐变 |
| 锥形渐变 | Conic Gradient | `conic-gradient()` 围绕中心点旋转的颜色渐变 |
| cubic-bezier | cubic-bezier() | 贝塞尔曲线函数，自定义动画速度曲线，参数为两个控制点坐标 |

## D

| 术语 | 英文 | 释义 |
|------|------|------|
| 渐变 | Gradient | CSS 渐变是 `<image>` 类型，不是颜色，可用于 `background-image` |

## E

| 术语 | 英文 | 释义 |
|------|------|------|
| filter | filter | 图形滤镜：`blur()`、`brightness()`、`contrast()`、`grayscale()`、`drop-shadow()` 等 |

## F

| 术语 | 英文 | 释义 |
|------|------|------|
| font | font | 字体简写属性：`style variant weight size/line-height family` |
| font-family | font-family | 字体族，可指定多个备选字体，以逗号分隔 |
| font-size | font-size | 字体大小，推荐使用 `rem`、`em`、`px` 单位 |
| font-style | font-style | 字体样式：`normal`、`italic`、`oblique` |
| font-weight | font-weight | 字体粗细：`normal`(400)、`bold`(700) 或 100-900 数值 |
| font-variant | font-variant | 字体变体：`normal`、`small-caps`（小型大写字母） |

## G

| 术语 | 英文 | 释义 |
|------|------|------|
| 光标 | cursor | 鼠标指针样式：`default`、`pointer`、`text`、`move`、自定义 URL |

## H

| 术语 | 英文 | 释义 |
|------|------|------|
| HEX 颜色 | Hex Color | 十六进制颜色值，如 `#ff0000` 或简写 `#f00`，支持 8 位含透明度 `#ff000080` |
| HSL 颜色 | HSL Color | 色相-饱和度-亮度颜色模型，`hsl(0, 100%, 50%)`，直观调整颜色 |
| HSLA 颜色 | HSLA Color | HSL 加透明度通道，`hsla(0, 100%, 50%, 0.5)` |

## K

| 术语 | 英文 | 释义 |
|------|------|------|
| @keyframes | @keyframes | 定义动画关键帧序列，`from`/`to` 或百分比指定各阶段样式 |

## L

| 术语 | 英文 | 释义 |
|------|------|------|
| letter-spacing | letter-spacing | 字符间距，正值增大、负值缩小 |
| line-height | line-height | 行高，影响文本垂直对齐，推荐使用无单位数值（如 1.5） |

## M

| 术语 | 英文 | 释义 |
|------|------|------|
| mix-blend-mode | mix-blend-mode | 元素内容与下层内容的混合模式：`multiply`、`screen`、`overlay` 等 |

## O

| 术语 | 英文 | 释义 |
|------|------|------|
| outline | outline | 轮廓线，不占布局空间，常用于焦点指示，`outline-offset` 控制偏移 |

## P

| 术语 | 英文 | 释义 |
|------|------|------|
| perspective | perspective | 3D 变换的透视距离，值越小透视效果越强 |
| perspective-origin | perspective-origin | 透视消失点位置，默认 `50% 50%`（中心） |

## R

| 术语 | 英文 | 释义 |
|------|------|------|
| RGB 颜色 | RGB Color | 红-绿-蓝颜色模型，`rgb(255, 0, 0)` |
| RGBA 颜色 | RGBA Color | RGB 加透明度通道，`rgba(255, 0, 0, 0.5)` |

## S

| 术语 | 英文 | 释义 |
|------|------|------|
| text-align | text-align | 文本水平对齐：`left`、`right`、`center`、`justify` |
| text-decoration | text-decoration | 文本装饰线：`underline`、`overline`、`line-through`、`none` |
| text-shadow | text-shadow | 文本阴影：`h-offset v-offset blur color` |
| text-transform | text-transform | 文本大小写转换：`uppercase`、`lowercase`、`capitalize` |
| text-overflow | text-overflow | 文本溢出处理：`clip`、`ellipsis`（省略号），需配合 `overflow: hidden` |
| transform | transform | 变换属性：`translate()`、`rotate()`、`scale()`、`skew()`、`matrix()` |
| transform-origin | transform-origin | 变换原点，默认 `50% 50%`（元素中心） |
| transform-style | transform-style | 3D 空间表现：`flat`（2D）、`preserve-3d`（3D） |
| transition | transition | 过渡简写：`property duration timing-function delay` |
| transition-property | transition-property | 参与过渡的 CSS 属性名 |
| transition-duration | transition-duration | 过渡持续时间 |
| transition-timing-function | transition-timing-function | 过渡速度曲线 |
| transition-delay | transition-delay | 过渡延迟时间 |

## W

| 术语 | 英文 | 释义 |
|------|------|------|
| white-space | white-space | 空白处理方式：`normal`、`nowrap`、`pre`、`pre-wrap`、`pre-line` |
| word-break | word-break | 单词断行规则：`normal`、`break-all`、`keep-all` |
| word-spacing | word-spacing | 单词间距 |

## X

| 术语 | 英文 | 释义 |
|------|------|------|
| 线性渐变角度 | Gradient Angle | `linear-gradient(45deg, ...)` 指定渐变方向角度，0deg 从下到上 |

## Y

| 术语 | 英文 | 释义 |
|------|------|------|
| 阴影 | Shadow | `box-shadow`（盒子阴影）和 `text-shadow`（文本阴影） |

## Z

| 术语 | 英文 | 释义 |
|------|------|------|
| 字体回退 | Font Fallback | `font-family` 中指定多个字体，浏览器依次尝试直到找到可用字体 |
