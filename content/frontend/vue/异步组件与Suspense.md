---
order: 105
title: 异步组件与Suspense
module: vue3
category: 'dev-lang'
difficulty: advanced
description: 'Vue 3异步组件defineAsyncComponent与Suspense配合使用。'
author: fanquanpp
updated: '2026-06-14'
related:
  - vue3/Teleport传送门应用
  - vue3/KeepAlive缓存与生命周期
  - vue3/Pinia持久化插件
  - 'vue3/Vue-Router导航守卫'
prerequisites:
  - vue3/语法速查
---

## 1. defineAsyncComponent

### 1.1 基本用法

```javascript
const AsyncComp = defineAsyncComponent(() => import('./components/HeavyComponent.vue'));
```

### 1.2 完整配置

```javascript
const AsyncComp = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200, // 延迟显示 loading
  timeout: 3000, // 超时显示 error
  suspensible: false, // 不与 Suspense 配合
  onError(error, retry, fail, attempts) {
    if (attempts <= 3) retry();
    else fail();
  },
});
```

## 2. Suspense

### 2.1 基本用法

```html
<Suspense>
  <template #default>
    <AsyncComponent />
  </template>
  <template #fallback>
    <LoadingSpinner />
  </template>
</Suspense>
```

### 2.2 配合 async setup

```javascript
// 子组件
export default {
  async setup() {
    const data = await fetchData(); // Suspense 等待此 Promise
    return { data };
  },
};
```

### 2.3 事件处理

```javascript
const suspenseRef = ref();

suspenseRef.value?.onPending();
suspenseRef.value?.onResolve();
suspenseRef.value?.onFallback();
```

> Suspense 仍是实验性功能，API 可能变更。
