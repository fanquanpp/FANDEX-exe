---
title: "HTML5 高级名词注释 (Advanced Glossary)"
module: "html5"
category: "Advanced"
description: "HTML5 高级：Web Components/Service Worker/WebRTC/PWA等 | HTML5 advanced: Web Components, Service Worker, WebRTC, PWA"
---

## A

| 术语 | 英文 | 释义 |
|------|------|------|
| adoptedStyleSheets | adoptedStyleSheets | Shadow DOM 共享样式表机制，`shadowRoot.adoptedStyleSheets = [sheet]` |
| AbortController | AbortController | 中止控制器，配合 Fetch API 取消请求，`controller.abort()` |
| AbortSignal | AbortSignal | 中止信号，`fetch(url, {signal: controller.signal})` 传入请求 |

## B

| 术语 | 英文 | 释义 |
|------|------|------|
| Background Sync | Background Sync | Service Worker 后台同步 API，网络恢复时自动重试失败请求 |
| Broadcast Channel | Broadcast Channel | 同源跨标签页/窗口通信 API，`new BroadcastChannel('name')` |

## C

| 术语 | 英文 | 释义 |
|------|------|------|
| Custom Elements | Custom Elements | Web Components 核心 API，`customElements.define('my-el', MyElement)` 注册自定义元素 |
| customElements.define | customElements.define | 注册自定义元素方法，接受标签名（须含连字符）和类定义 |
| connectedCallback | connectedCallback | 自定义元素生命周期回调，元素插入 DOM 时触发 |
| disconnectedCallback | disconnectedCallback | 自定义元素生命周期回调，元素从 DOM 移除时触发 |
| attributeChangedCallback | attributeChangedCallback | 自定义元素生命周期回调，观察属性变化时触发 |
| adoptedCallback | adoptedCallback | 自定义元素生命周期回调，元素移到新 document 时触发 |
| Cache API | Cache API | Service Worker 缓存接口，`caches.open()`/`cache.match()`/`cache.add()` |
| Content Security Policy | CSP | 内容安全策略，HTTP 头限制资源加载来源，防御 XSS 攻击 |

## D

| 术语 | 英文 | 释义 |
|------|------|------|
| DataChannel | DataChannel | WebRTC 数据通道，支持点对点传输任意数据，类似 WebSocket |
| Dedicated Worker | Dedicated Worker | 专用 Worker，仅被创建它的页面使用 |

## E

| 术语 | 英文 | 释义 |
|------|------|------|
| EventSource | EventSource | Server-Sent Events 客户端接口，`new EventSource(url)` 接收服务端推送 |

## F

| 术语 | 英文 | 释义 |
|------|------|------|
| Fullscreen API | Fullscreen API | 全屏接口，`element.requestFullscreen()` 进入、`document.exitFullscreen()` 退出 |

## G

| 术语 | 英文 | 释义 |
|------|------|------|
| getUserMedia | getUserMedia | 获取媒体设备（摄像头/麦克风），`navigator.mediaDevices.getUserMedia(constraints)` |

## H

| 术语 | 英文 | 释义 |
|------|------|------|
| HTML Template | HTML Template | `<template>` 标签，声明不被渲染的 DOM 模板，`content` 属性获取 DocumentFragment |
| HTML Slot | HTML Slot | `<slot>` 标签，Shadow DOM 中的内容占位符，`name` 属性匹配 `slot` 属性 |

## I

| 术语 | 英文 | 释义 |
|------|------|------|
| ICE | Interactive Connectivity Establishment | WebRTC 连接建立协议，通过 STUN/TURN 服务器收集候选地址 |
| IDBDatabase | IDBDatabase | IndexedDB 数据库连接对象，`indexedDB.open()` 打开/创建数据库 |
| IDBObjectStore | IDBObjectStore | IndexedDB 对象存储（类似表），`db.createObjectStore()` 创建 |
| IDBTransaction | IDBTransaction | IndexedDB 事务对象，保证操作的原子性和一致性 |

## J

| 术语 | 英文 | 释义 |
|------|------|------|
| 构建自定义元素 | Autonomous Custom Element | 独立自定义元素，继承 `HTMLElement` |
| 构建自定义内置元素 | Customized Built-in Element | 扩展内置元素，如 `class MyBtn extends HTMLButtonElement` |

## K

| 术语 | 英文 | 释义 |
|------|------|------|
| manifest.json | Web App Manifest | PWA 配置文件，定义应用名称、图标、启动 URL、显示模式等 |

## L

| 术语 | 英文 | 释义 |
|------|------|------|
| Lifecycle Callbacks | Lifecycle Callbacks | 自定义元素生命周期回调：connected、disconnected、adopted、attributeChanged |

## M

| 术语 | 英文 | 释义 |
|------|------|------|
| MediaRecorder | MediaRecorder | 媒体录制 API，将 MediaStream 录制为音视频文件 |
| MediaSource Extensions | MSE | 媒体源扩展，允许 JS 动态构建媒体流用于 `<video>` 播放 |
| MessageChannel | MessageChannel | 双向消息通道，创建两个互相通信的 MessagePort |
| MutationObserver | MutationObserver | DOM 变动观察器，监听子节点、属性、文本变化 |

## N

| 术语 | 英文 | 释义 |
|------|------|------|
| Navigation API | Navigation API | 现代路由 API，替代 history API，支持拦截和过渡动画 |

## O

| 术语 | 英文 | 释义 |
|------|------|------|
| observedAttributes | observedAttributes | 自定义元素静态 getter，返回需观察变化的属性名数组 |
| online/offline 事件 | online/offline Event | 网络状态变化事件，`window.addEventListener('online/offline', fn)` |

## P

| 术语 | 英文 | 释义 |
|------|------|------|
| PWA | Progressive Web App | 渐进式 Web 应用，可安装、离线工作、推送通知，体验接近原生应用 |
| Push API | Push API | 推送通知接口，`registration.pushManager.subscribe()` 订阅推送 |
| Payment Request API | Payment Request API | 浏览器原生支付接口，提供标准化支付流程 |
| Permissions API | Permissions API | 权限查询接口，`navigator.permissions.query({name: 'geolocation'})` |
| postMessage | postMessage | 跨源通信方法，`window.postMessage(data, origin)` 发送、`onmessage` 接收 |

## R

| 术语 | 英文 | 释义 |
|------|------|------|
| RTCPeerConnection | RTCPeerConnection | WebRTC 点对点连接对象，管理音视频和数据通道的传输 |
| RTCDataChannel | RTCDataChannel | WebRTC 数据通道，支持可靠/不可靠传输 |
| Registering Service Worker | Service Worker Registration | `navigator.serviceWorker.register('/sw.js')` 注册 Service Worker |
| requestIdleCallback | requestIdleCallback | 浏览器空闲时执行低优先级任务，适合非关键计算 |

## S

| 术语 | 英文 | 释义 |
|------|------|------|
| Shadow DOM | Shadow DOM | Web Components 封装机制，将样式和结构隔离在 Shadow Root 内 |
| Shadow Root | Shadow Root | Shadow DOM 的根节点，`element.attachShadow({mode})` 创建 |
| Shadow Host | Shadow Host | 包含 Shadow Root 的宿主元素 |
| open/closed Shadow DOM | open/closed Shadow DOM | `mode: 'open'` 允许 JS 访问 Shadow Root，`closed` 不允许 |
| Service Worker | Service Worker | 独立线程的代理服务器，拦截请求、管理缓存、处理推送和同步 |
| Service Worker 生命周期 | SW Lifecycle | 注册→安装(install)→激活(activate)→运行→终止 |
| SDP | Session Description Protocol | WebRTC 会话描述协议，描述媒体能力和传输地址 |
| SharedWorker | SharedWorker | 共享 Worker，可被多个同源页面共用 |
| Stream API | Streams API | 流式数据处理接口，ReadableStream 和 WritableStream |

## T

| 术语 | 英文 | 释义 |
|------|------|------|
| Touch Events | Touch Events | 触摸事件：`touchstart`、`touchmove`、`touchend`、`touchcancel` |
| TextEncoder/Decoder | TextEncoder/TextDecoder | 文本编码/解码 API，UTF-8 编码转换 |

## U

| 术语 | 英文 | 释义 |
|------|------|------|
| WebUSB | WebUSB | USB 设备访问 API，允许 Web 应用与 USB 设备通信 |

## V

| 术语 | 英文 | 释义 |
|------|------|------|
| Visibility API | Page Visibility API | 页面可见性 API，`document.visibilityState` 检测页面是否可见 |

## W

| 术语 | 英文 | 释义 |
|------|------|------|
| Web Components | Web Components | Web 组件标准，包含 Custom Elements、Shadow DOM、HTML Templates |
| WebRTC | WebRTC | Web 实时通信，支持浏览器间音视频和数据点对点传输 |
| WebSocket | WebSocket | 全双工持久连接协议，`new WebSocket(url)` 创建，低延迟实时通信 |
| Web Animations API | Web Animations API | 浏览器动画编程接口，`element.animate(keyframes, options)` |
| Web Speech API | Web Speech API | 语音识别和合成接口，`SpeechRecognition` 和 `SpeechSynthesis` |
| Web Bluetooth | Web Bluetooth | 蓝牙设备访问 API，允许 Web 应用与 BLE 设备通信 |
| Web Share API | Web Share API | 系统分享接口，`navigator.share({title, text, url})` 调用系统分享面板 |
| Worklet | Worklet | 轻量级执行环境，如 Paint Worklet、Audio Worklet，在渲染/音频线程运行 |

## X

| 术语 | 英文 | 释义 |
|------|------|------|
| XMLHttpRequest | XHR | 传统异步请求对象，支持 GET/POST、进度事件、超时设置 |

## Y

| 术语 | 英文 | 释义 |
|------|------|------|
| 渲染阻塞 | Render-blocking | 阻塞页面首次渲染的资源，如同步 `<script>` 和 `<link rel="stylesheet">` |

## Z

| 术语 | 英文 | 释义 |
|------|------|------|
| 暂存区 | Staging Area | Service Worker 安装时的缓存准备阶段，`install` 事件中预缓存资源 |
