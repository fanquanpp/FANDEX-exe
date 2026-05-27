---
title: "HTML5 API 名词注释 (API Glossary)"
module: "html5"
category: "API"
description: "HTML5 API：Canvas/WebGL/拖放/地理定位/存储等 | HTML5 API: Canvas, WebGL, Drag&Drop, Geolocation, Storage"
---

## A

| 术语 | 英文 | 释义 |
|------|------|------|
| AudioContext | AudioContext | Web Audio API 的核心对象，管理音频图的创建和处理 |
| addColorStop | addColorStop | Canvas 渐变添加颜色停止点方法，`gradient.addColorStop(offset, color)` |

## B

| 术语 | 英文 | 释义 |
|------|------|------|
| Blob | Blob | 二进制大对象，表示不可变的原始数据，`new Blob([data], {type})` |
| bezierCurveTo | bezierCurveTo | Canvas 三次贝塞尔曲线路径方法，需要两个控制点和一个终点 |
| beginPath | beginPath | Canvas 开始新路径，清除之前的路径列表 |

## C

| 术语 | 英文 | 释义 |
|------|------|------|
| Canvas API | Canvas API | 2D 图形绘制接口，通过 `getContext('2d')` 获取绘图上下文 |
| CanvasRenderingContext2D | CanvasRenderingContext2D | Canvas 2D 渲染上下文，提供绑制路径、矩形、文字、图像等方法 |
| clearRect | clearRect | Canvas 清除矩形区域像素 |
| clip | clip | Canvas 裁剪路径，将当前路径设为裁剪区域 |
| createLinearGradient | createLinearGradient | Canvas 创建线性渐变对象 |
| createRadialGradient | createRadialGradient | Canvas 创建径向渐变对象 |
| closePath | closePath | Canvas 闭合路径，从当前点画直线到路径起点 |
| clipboardData | clipboardData | 剪贴板数据对象，`e.clipboardData.getData()`/`setData()` 读写剪贴板 |

## D

| 术语 | 英文 | 释义 |
|------|------|------|
| Drag API | Drag and Drop API | 原生拖放接口，事件：`dragstart`、`drag`、`dragenter`、`dragover`、`drop`、`dragend` |
| DataTransfer | DataTransfer | 拖放数据传递对象，`setData()`/`getData()` 存取拖拽数据 |
| drawImage | drawImage | Canvas 绘制图像方法，支持缩放和裁切 |
| devicePixelRatio | devicePixelRatio | 设备像素比，物理像素与 CSS 像素的比率，高清屏通常为 2 或 3 |

## E

| 术语 | 英文 | 释义 |
|------|------|------|
| event.dataTransfer | event.dataTransfer | 拖放事件中的数据传输对象 |

## F

| 术语 | 英文 | 释义 |
|------|------|------|
| fillRect | fillRect | Canvas 填充矩形 |
| fillText | fillText | Canvas 填充文字 |
| fillStyle | fillStyle | Canvas 填充样式，支持颜色、渐变、图案 |
| FileReader | FileReader | 异步读取 Blob/文件对象的 API，`readAsText`、`readAsDataURL`、`readAsArrayBuffer` |
| FormData | FormData | 构建表单数据的接口，用于 AJAX 文件上传和键值对提交 |
| Fetch API | Fetch API | 基于 Promise 的网络请求接口，替代 XMLHttpRequest，`fetch(url, options)` |

## G

| 术语 | 英文 | 释义 |
|------|------|------|
| Geolocation API | Geolocation API | 地理定位接口，`navigator.geolocation.getCurrentPosition()` 获取位置 |
| getCurrentPosition | getCurrentPosition | 获取当前地理位置，回调接收 `Position` 对象含 `coords.latitude/longitude` |
| getContext | getContext | 获取 Canvas 绘图上下文，`'2d'` 或 `'webgl'`/`'webgl2'` |
| getImageData | getImageData | Canvas 获取像素数据，返回 `ImageData` 对象 |
| globalCompositeOperation | globalCompositeOperation | Canvas 合成操作模式，如 `source-over`、`multiply`、`screen`、`destination-out` |

## I

| 术语 | 英文 | 释义 |
|------|------|------|
| IndexedDB | IndexedDB | 浏览器端 NoSQL 数据库，支持事务、索引、游标，存储大量结构化数据 |
| ImageData | ImageData | Canvas 像素数据对象，`data` 属性为 `Uint8ClampedArray` |
| IntersectionObserver | IntersectionObserver | 异步观察元素与视口交叉状态的 API，用于懒加载和曝光检测 |

## J

| 术语 | 英文 | 释义 |
|------|------|------|
| JSON | JSON | JavaScript 对象表示法，`JSON.parse()` 反序列化、`JSON.stringify()` 序列化 |

## L

| 术语 | 英文 | 释义 |
|------|------|------|
| localStorage | localStorage | 本地持久存储，5MB+ 容量，数据永久保留除非手动清除 |
| lineTo | lineTo | Canvas 从当前点画直线到指定点 |
| lineWidth | lineWidth | Canvas 线条宽度属性 |

## M

| 术语 | 英文 | 释义 |
|------|------|------|
| MediaStream | MediaStream | 媒体流对象，getUserMedia 返回，包含音频/视频轨道 |
| moveTo | moveTo | Canvas 移动画笔到指定点（不画线） |
| measureText | measureText | Canvas 测量文本宽度，返回 `TextMetrics` 对象 |

## N

| 术语 | 英文 | 释义 |
|------|------|------|
| Notification API | Notification API | 浏览器通知接口，`Notification.requestPermission()` 请求权限 |

## O

| 术语 | 英文 | 释义 |
|------|------|------|
| OffscreenCanvas | OffscreenCanvas | 离屏画布，可在 Worker 线程中渲染，提升性能 |

## P

| 术语 | 英文 | 释义 |
|------|------|------|
| putImageData | putImageData | Canvas 将像素数据绘制到画布 |
| Path2D | Path2D | Canvas 路径对象，可缓存和复用路径，支持 SVG 路径字符串 |
| Performance API | Performance API | 性能监控接口，`performance.now()` 高精度时间、`performance.getEntries()` 资源计时 |

## Q

| 术语 | 英文 | 释义 |
|------|------|------|
| quadraticCurveTo | quadraticCurveTo | Canvas 二次贝塞尔曲线方法，一个控制点加终点 |

## R

| 术语 | 英文 | 释义 |
|------|------|------|
| requestAnimationFrame | requestAnimationFrame | 浏览器动画帧回调，与屏幕刷新同步，通常 60fps |
| ResizeObserver | ResizeObserver | 观察元素尺寸变化的 API，回调接收 `ResizeObserverEntry` 数组 |
| restore | restore | Canvas 恢复保存的绘图状态（从状态栈弹出） |
| rotate | rotate | Canvas 旋转当前变换矩阵 |

## S

| 术语 | 英文 | 释义 |
|------|------|------|
| sessionStorage | sessionStorage | 会话存储，数据在标签页关闭后清除，同源同标签页共享 |
| save | save | Canvas 保存当前绘图状态到状态栈 |
| scale | scale | Canvas 缩放当前变换矩阵 |
| strokeRect | strokeRect | Canvas 描边矩形 |
| strokeText | strokeText | Canvas 描边文字 |
| strokeStyle | strokeStyle | Canvas 描边样式 |
| setTransform | setTransform | Canvas 重置并设置变换矩阵 |
| shadowBlur | shadowBlur | Canvas 阴影模糊度 |
| shadowColor | shadowColor | Canvas 阴影颜色 |
| shadowOffsetX/Y | shadowOffsetX/Y | Canvas 阴影偏移量 |

## T

| 术语 | 英文 | 释义 |
|------|------|------|
| translate | translate | Canvas 平移当前变换矩阵 |
| toDataURL | toDataURL | Canvas 导出为 Base64 图片，`canvas.toDataURL('image/png')` |
| toBlob | toBlob | Canvas 导出为 Blob 对象，异步回调 |

## U

| 术语 | 英文 | 释义 |
|------|------|------|
| URL.createObjectURL | URL.createObjectURL | 为 Blob/File 创建临时 URL，须用 `revokeObjectURL` 释放 |
| URL.revokeObjectURL | URL.revokeObjectURL | 释放 createObjectURL 创建的临时 URL |

## V

| 术语 | 英文 | 释义 |
|------|------|------|
| Vibration API | Vibration API | 设备振动接口，`navigator.vibrate(pattern)` 控制振动模式 |

## W

| 术语 | 英文 | 释义 |
|------|------|------|
| WebGL | WebGL | 基于 OpenGL ES 的 3D 图形 API，`getContext('webgl')` 获取上下文 |
| WebGL2 | WebGL2 | WebGL 升级版，基于 OpenGL ES 3.0，支持更多纹理格式和着色器特性 |
| Web Audio API | Web Audio API | 高级音频处理接口，支持音效、分析、空间化等 |
| Web Storage | Web Storage | localStorage 和 sessionStorage 的统称，替代 Cookie 的客户端存储方案 |
| Web Workers | Web Workers | 后台线程执行脚本，不阻塞 UI，通过 `postMessage` 通信 |
| Worker | Worker | Web Worker 实例，`new Worker('script.js')` 创建，`onmessage` 接收消息 |

## X

| 术语 | 英文 | 释义 |
|------|------|------|
| XMLHttpRequest | XMLHttpRequest | 传统 AJAX 请求对象，已被 Fetch API 取代，但仍广泛使用 |
