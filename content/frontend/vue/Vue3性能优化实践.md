---
order: 58
title: Vue3性能优化实践
module: vue3
category: Vue3
difficulty: intermediate
description: Vue3应用性能优化技巧
author: fanquanpp
updated: '2026-06-14'
related:
  - vue3/Vue3测试策略
  - 'vue3/Vue3与Web Components'
  - vue3/响应式系统
  - vue3/自定义Hook
prerequisites:
  - vue3/语法速查
---

## 1. 响应式优化

```javascript
// shallowRef — 只追踪 .value 的变化
const bigList = shallowRef([]);

// shallowReactive — 只追踪第一层属性
const state = shallowReactive({ nested: { count: 0 } });

// markRaw — 跳过响应式转换
const staticData = markRaw(largeObject);

// triggerRef — 手动触发 shallowRef 更新
bigList.value.push(newItem);
triggerRef(bigList);
```

## 2. 虚拟列表

```vue
<template>
  <RecycleScroller :items="items" :item-size="50" key-field="id">
    <template #default="{ item }">
      <div>{{ item.name }}</div>
    </template>
  </RecycleScroller>
</template>
```

## 3. 异步组件

```javascript
const HeavyComponent = defineAsyncComponent(() => import('./HeavyComponent.vue'));
```

## 4. v-once 与 v-memo

```vue
<!-- v-once — 只渲染一次 -->
<div v-once>{{ staticContent }}</div>

<!-- v-memo — 条件性缓存 -->
<div v-memo="[item.id]">{{ item.name }}</div>
```

## 5. 计算属性缓存

```javascript
// computed 自动缓存，依赖不变不重新计算
const filteredList = computed(() => list.value.filter((item) => item.active));
```

## 6. KeepAlive

```vue
<KeepAlive :include="['ComponentA', 'ComponentB']" :max="10">
  <component :is="currentComponent" />
</KeepAlive>
```
