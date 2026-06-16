---
order: 55
title: Vue3服务端渲染
module: vue3
category: Vue3
difficulty: advanced
description: SSR与Nuxt.js集成
author: fanquanpp
updated: '2026-06-14'
related:
  - vue3/Transition与动画
  - vue3/Vue3编译优化
  - vue3/生命周期钩子
  - vue3/Vue3测试策略
prerequisites:
  - vue3/语法速查
---

## 1. SSR 基础

```javascript
// server.js
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';

const app = createSSRApp({
  template: '<div>{{ message }}</div>',
  data: () => ({ message: 'Hello SSR' }),
});

renderToString(app).then((html) => {
  console.log(html); // <div data-server-rendered="true">Hello SSR</div>
});
```

## 2. 同构应用

```javascript
// 共享入口 main.js
import { createSSRApp } from 'vue';
import App from './App.vue';

export function createApp() {
  const app = createSSRApp(App);
  return { app };
}

// 客户端入口 entry-client.js
const { app } = createApp();
app.mount('#app');

// 服务端入口 entry-server.js
const { app } = createApp();
return renderToString(app);
```

## 3. 数据预取

```javascript
// 使用 asyncData 预取数据
export default {
  async asyncData({ params }) {
    const data = await fetch(`/api/posts/${params.id}`).then((r) => r.json());
    return { post: data };
  },
};
```

## 4. Nuxt.js

```bash
npx nuxi init my-app
cd my-app && npm install && npm run dev
```

## 5. SSR 注意事项

| 注意         | 说明                                     |
| ------------ | ---------------------------------------- |
| 生命周期     | 只有 beforeCreate 和 created 在 SSR 运行 |
| 平台特定 API | window/document 不可用                   |
| 响应式       | SSR 不需要响应式                         |
| 全局状态     | 避免单例污染                             |
