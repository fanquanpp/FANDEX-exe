import fs from 'fs';
import path from 'path';

const BASE = 'c:\\Atian\\Project\\Trae\\FANDEX-vue\\src\\content\\docs';

function fm(order, title, module, category, difficulty, description) {
  return `---
order: ${order}
title: '${title}'
module: '${module}'
category: '${category}'
difficulty: '${difficulty}'
description: '${description}'
author: 'fanquanpp'
updated: 2026-06-14
---`;
}

function writeFile(dir, filename, content) {
  const fullPath = path.join(BASE, dir, filename);
  if (fs.existsSync(fullPath)) {
    console.log(`SKIP: ${fullPath}`);
    return 0;
  }
  fs.writeFileSync(fullPath, content, 'utf-8');
  return 1;
}

let total = 0;
function addFile(moduleDir, category, order, title, desc, difficulty, content) {
  const filename = title + '.md';
  const fullContent = fm(order, title, moduleDir, category, difficulty, desc) + '\n\n' + content;
  total += writeFile(moduleDir, filename, fullContent);
}

// ==================== Vue3 (9 files) ====================
addFile(
  'vue3',
  'Vue3',
  50,
  'Teleport与Suspense',
  '传送门与异步组件',
  'intermediate',
  `## 1. Teleport

### 1.1 基本用法

Teleport 允许将组件模板的一部分"传送"到 DOM 中的其他位置：

\`\`\`vue
<template>
  <button @click="showModal = true">打开弹窗</button>

  <Teleport to="body">
    <div v-if="showModal" class="modal">
      <p>这是一个模态框</p>
      <button @click="showModal = false">关闭</button>
    </div>
  </Teleport>
</template>
\`\`\`

### 1.2 to 属性

\`\`\`vue
<!-- 传送到 body -->
<Teleport to="body">

<!-- 传送到指定选择器 -->
<Teleport to="#modals">

<!-- 传送到指定元素 -->
<Teleport :to="targetElement">
\`\`\`

### 1.3 disabled 属性

\`\`\`vue
<!-- 条件性传送 -->
<Teleport to="body" :disabled="isMobile">
  <!-- 移动端不传送，桌面端传送 -->
</Teleport>
\`\`\`

### 1.4 多个 Teleport 共享目标

多个 Teleport 传送到同一目标时，按渲染顺序追加。

## 2. Suspense

### 2.1 基本用法

\`\`\`vue
<template>
  <Suspense>
    <template #default>
      <AsyncComponent />
    </template>
    <template #fallback>
      <LoadingSpinner />
    </template>
  </Suspense>
</template>
\`\`\`

### 2.2 异步组件

\`\`\`javascript
// defineAsyncComponent
const AsyncComp = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
);

// 带 options
const AsyncComp = defineAsyncComponent({
  loader: () => import('./HeavyComponent.vue'),
  loadingComponent: LoadingSpinner,
  errorComponent: ErrorDisplay,
  delay: 200,
  timeout: 3000
});
\`\`\`

### 2.3 异步 setup

\`\`\`vue
<script setup>
// async setup 组件会触发 Suspense
const data = await fetch('/api/data').then(r => r.json());
</script>
\`\`\`

### 2.4 Suspense 事件

\`\`\`vue
<Suspense @pending="onPending" @resolve="onResolve" @fallback="onFallback">
  <AsyncComponent />
</Suspense>
\`\`\`

### 2.5 嵌套 Suspense

\`\`\`vue
<Suspense>
  <Header />
  <Suspense>
    <AsyncContent />
  </Suspense>
</Suspense>
\`\`\`
`
);

addFile(
  'vue3',
  'Vue3',
  51,
  'Provide与Inject',
  '依赖注入与跨层级通信',
  'intermediate',
  `## 1. 基本用法

\`\`\`javascript
// 父组件 - provide
import { provide, ref } from 'vue';

const theme = ref('dark');
provide('theme', theme);
provide('toggleTheme', () => theme.value = theme.value === 'dark' ? 'light' : 'dark');

// 子组件 - inject
import { inject } from 'vue';

const theme = inject('theme', 'light'); // 第二个参数是默认值
const toggleTheme = inject('toggleTheme');
\`\`\`

## 2. 类型安全的 Provide/Inject

\`\`\`typescript
import type { InjectionKey, Ref } from 'vue';

// 定义注入键
export const ThemeKey: InjectionKey<Ref<string>> = Symbol('theme');
export const ToggleThemeKey: InjectionKey<() => void> = Symbol('toggleTheme');

// provide
provide(ThemeKey, theme);
provide(ToggleThemeKey, toggleTheme);

// inject — 自动推断类型
const theme = inject(ThemeKey); // Ref<string> | undefined
\`\`\`

## 3. 使用 Symbol 避免冲突

\`\`\`typescript
// keys.ts
export const UserKey: InjectionKey<User> = Symbol('user');
export const ConfigKey: InjectionKey<AppConfig> = Symbol('config');
\`\`\`

## 4. 响应式注入

\`\`\`javascript
// 提供响应式数据
const state = reactive({ count: 0 });
provide('state', state);

// 只读注入
provide('readonlyState', readonly(state));

// 提供修改方法
provide('increment', () => state.count++);
\`\`\`

## 5. 默认值

\`\`\`javascript
// 静态默认值
const theme = inject('theme', 'light');

// 工厂函数默认值
const config = inject('config', () => createDefaultConfig(), true);
\`\`\`
`
);

addFile(
  'vue3',
  'Vue3',
  52,
  '自定义指令进阶',
  '自定义指令高级用法',
  'intermediate',
  `## 1. 指令钩子

\`\`\`javascript
const myDirective = {
  created(el, binding, vnode) {},
  beforeMount(el, binding) {},
  mounted(el, binding) {},
  beforeUpdate(el, binding) {},
  updated(el, binding) {},
  beforeUnmount(el, binding) {},
  unmounted(el, binding) {}
};
\`\`\`

## 2. 钩子参数

\`\`\`typescript
interface Binding {
  value: any;        // 指令绑定的值
  oldValue: any;     // 前一个值
  arg: string;       // 指令参数 v-my:arg
  modifiers: Record<string, boolean>; // 修饰符 v-my.foo.bar
  instance: ComponentPublicInstance;   // 组件实例
}
\`\`\`

## 3. 实用指令示例

\`\`\`javascript
// v-focus
const vFocus = {
  mounted(el) { el.focus(); }
};

// v-permission
const vPermission = {
  mounted(el, binding) {
    const permissions = usePermissions();
    if (!permissions.has(binding.value)) {
      el.parentNode?.removeChild(el);
    }
  }
};

// v-debounce
const vDebounce = {
  mounted(el, binding) {
    let timer;
    el.addEventListener('input', () => {
      clearTimeout(timer);
      timer = setTimeout(() => binding.value(), binding.arg ? parseInt(binding.arg) : 300);
    });
  }
};

// v-click-outside
const vClickOutside = {
  mounted(el, binding) {
    const handler = (e) => {
      if (!el.contains(e.target)) binding.value(e);
    };
    el._clickOutside = handler;
    document.addEventListener('click', handler);
  },
  unmounted(el) {
    document.removeEventListener('click', el._clickOutside);
  }
};

// v-lazy 图片懒加载
const vLazy = {
  mounted(el, binding) {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.src = binding.value;
        observer.disconnect();
      }
    });
    observer.observe(el);
    el._observer = observer;
  },
  unmounted(el) {
    el._observer?.disconnect();
  }
};
\`\`\`

## 4. 简写形式

\`\`\`javascript
// 当 mounted 和 updated 行为相同时
const vColor = (el, binding) => {
  el.style.color = binding.value;
};
\`\`\`
`
);

addFile(
  'vue3',
  'Vue3',
  53,
  'Transition与动画',
  'Vue3过渡与动画系统',
  'intermediate',
  `## 1. Transition 组件

\`\`\`vue
<template>
  <Transition name="fade">
    <div v-if="show">内容</div>
  </Transition>
</template>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
\`\`\`

## 2. 过渡类名

| 类名 | 说明 |
|------|------|
| \`v-enter-from\` | 进入起始状态 |
| \`v-enter-active\` | 进入生效状态 |
| \`v-enter-to\` | 进入结束状态 |
| \`v-leave-from\` | 离开起始状态 |
| \`v-leave-active\` | 离开生效状态 |
| \`v-leave-to\` | 离开结束状态 |

## 3. JavaScript 钩子

\`\`\`vue
<Transition
  @before-enter="onBeforeEnter"
  @enter="onEnter"
  @after-enter="onAfterEnter"
  @before-leave="onBeforeLeave"
  @leave="onLeave"
  @after-leave="onAfterLeave"
>
  <div v-if="show">内容</div>
</Transition>
\`\`\`

## 4. TransitionGroup

\`\`\`vue
<TransitionGroup name="list" tag="ul">
  <li v-for="item in items" :key="item.id">{{ item.text }}</li>
</TransitionGroup>

<style>
.list-move, .list-enter-active, .list-leave-active {
  transition: all 0.5s ease;
}
.list-enter-from, .list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
.list-leave-active {
  position: absolute;
}
</style>
\`\`\`

## 5. 自定义过渡

\`\`\`vue
<Transition
  :duration="{ enter: 500, leave: 300 }"
  enter-active-class="animate__animated animate__fadeIn"
  leave-active-class="animate__animated animate__fadeOut"
>
  <div v-if="show">内容</div>
</Transition>
\`\`\`
`
);

addFile(
  'vue3',
  'Vue3',
  54,
  'Vue3编译优化',
  '编译时优化与运行时优化',
  'advanced',
  `## 1. 静态提升

\`\`\`javascript
// 模板中的静态节点会被提升到渲染函数外
const _hoisted_1 = createStaticVNode('<div class="static">静态内容</div>')

function render() {
  return createVNode('div', null, [_hoisted_1, dynamicContent])
}
\`\`\`

## 2. 预字符串化

连续的静态节点会被合并为一个字符串：

\`\`\`javascript
const _hoisted_1 = createStaticVNode('<div><span>a</span><span>b</span></div>', 2)
\`\`\`

## 3. PatchFlag

\`\`\`javascript
// 动态节点标记
createVNode('div', { class: _ctx.className }, null, PatchFlags.CLASS)
// PatchFlags: TEXT=1, CLASS=2, STYLE=4, PROPS=8, ...
\`\`\`

## 4. Block Tree

\`\`\`javascript
// v-if/v-for 会创建 Block，收集动态子节点
// diff 时只遍历动态节点，跳过静态节点
\`\`\`

## 5. 缓存事件处理程序

\`\`\`javascript
// 缓存内联事件处理器
const _cache = getCache()
return createVNode('button', { onClick: _cache[0] || (_cache[0] = $event => count.value++) })
\`\`\`

## 6. Tree Shaking

Vue 3 的运行时支持 Tree Shaking，未使用的 API 不会打包：

\`\`\`javascript
// 只导入需要的 API
import { ref, computed, watch } from 'vue';
// v-model, v-for 等编译器特性按需引入
\`\`\`
`
);

addFile(
  'vue3',
  'Vue3',
  55,
  'Vue3服务端渲染',
  'SSR与Nuxt.js集成',
  'advanced',
  `## 1. SSR 基础

\`\`\`javascript
// server.js
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';

const app = createSSRApp({
  template: '<div>{{ message }}</div>',
  data: () => ({ message: 'Hello SSR' })
});

renderToString(app).then(html => {
  console.log(html); // <div data-server-rendered="true">Hello SSR</div>
});
\`\`\`

## 2. 同构应用

\`\`\`javascript
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
\`\`\`

## 3. 数据预取

\`\`\`javascript
// 使用 asyncData 预取数据
export default {
  async asyncData({ params }) {
    const data = await fetch(\`/api/posts/\${params.id}\`).then(r => r.json());
    return { post: data };
  }
}
\`\`\`

## 4. Nuxt.js

\`\`\`bash
npx nuxi init my-app
cd my-app && npm install && npm run dev
\`\`\`

## 5. SSR 注意事项

| 注意 | 说明 |
|------|------|
| 生命周期 | 只有 beforeCreate 和 created 在 SSR 运行 |
| 平台特定 API | window/document 不可用 |
| 响应式 | SSR 不需要响应式 |
| 全局状态 | 避免单例污染 |
`
);

addFile(
  'vue3',
  'Vue3',
  56,
  'Vue3测试策略',
  '组件测试与组合式函数测试',
  'intermediate',
  `## 1. 测试工具

\`\`\`bash
npm install -D vitest @vue/test-utils
\`\`\`

## 2. 组件测试

\`\`\`javascript
import { mount } from '@vue/test-utils';
import Counter from './Counter.vue';

test('increments counter', async () => {
  const wrapper = mount(Counter);
  expect(wrapper.text()).toContain('0');

  await wrapper.find('button').trigger('click');
  expect(wrapper.text()).toContain('1');
});
\`\`\`

## 3. 组合式函数测试

\`\`\`javascript
import { withSetup } from './test-utils';

test('useCounter', () => {
  const { result } = withSetup(() => useCounter(0));
  expect(result.count.value).toBe(0);
  result.increment();
  expect(result.count.value).toBe(1);
});

// withSetup 辅助函数
function withSetup(composable) {
  let result;
  const app = createApp({
    setup() {
      result = composable();
      return () => {};
    }
  });
  app.mount(document.createElement('div'));
  return { result, app };
}
\`\`\`

## 4. 异步测试

\`\`\`javascript
test('async data', async () => {
  const wrapper = mount(AsyncComponent, {
    global: {
      plugins: [router]
    }
  });

  // 等待异步操作
  await flushPromises();
  expect(wrapper.text()).toContain('loaded data');
});
\`\`\`

## 5. Mock 与 Stub

\`\`\`javascript
const wrapper = mount(Component, {
  global: {
    mocks: { $route: { params: { id: '1' } } },
    stubs: { RouterLink: true, ChildComponent: true }
  }
});
\`\`\`
`
);

addFile(
  'vue3',
  'Vue3',
  57,
  'Vue3与Web Components',
  'Vue组件与Web Components互操作',
  'intermediate',
  `## 1. 定义 Vue Web Component

\`\`\`javascript
import { defineCustomElement } from 'vue';

const MyVueElement = defineCustomElement({
  props: { message: String },
  template: '<span>{{ message }}</span>',
  styles: [\`
    span { color: red; }
  \`]
});

customElements.define('my-vue-element', MyVueElement);
\`\`\`

## 2. 事件

\`\`\`javascript
const MyElement = defineCustomElement({
  emits: ['change'],
  template: \`
    <button @click="$emit('change', value)">
      Click
    </button>
  \`
});
\`\`\`

## 3. 在 Vue 中使用 Web Components

\`\`\`javascript
// vite.config.js
export default {
  compilerOptions: {
    isCustomElement: (tag) => tag.startsWith('my-')
  }
};
\`\`\`

\`\`\`vue
<template>
  <my-custom-element :data="myData" @change="onChange"></my-custom-element>
</template>
\`\`\`

## 4. Shadow DOM 与样式

\`\`\`javascript
// Vue Web Components 使用 Shadow DOM
// 样式隔离，不受外部 CSS 影响
// 可以使用 CSS 自定义属性穿透
\`\`\`
`
);

addFile(
  'vue3',
  'Vue3',
  58,
  'Vue3性能优化实践',
  'Vue3应用性能优化技巧',
  'intermediate',
  `## 1. 响应式优化

\`\`\`javascript
// shallowRef — 只追踪 .value 的变化
const bigList = shallowRef([]);

// shallowReactive — 只追踪第一层属性
const state = shallowReactive({ nested: { count: 0 } });

// markRaw — 跳过响应式转换
const staticData = markRaw(largeObject);

// triggerRef — 手动触发 shallowRef 更新
bigList.value.push(newItem);
triggerRef(bigList);
\`\`\`

## 2. 虚拟列表

\`\`\`vue
<template>
  <RecycleScroller
    :items="items"
    :item-size="50"
    key-field="id"
  >
    <template #default="{ item }">
      <div>{{ item.name }}</div>
    </template>
  </RecycleScroller>
</template>
\`\`\`

## 3. 异步组件

\`\`\`javascript
const HeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
);
\`\`\`

## 4. v-once 与 v-memo

\`\`\`vue
<!-- v-once — 只渲染一次 -->
<div v-once>{{ staticContent }}</div>

<!-- v-memo — 条件性缓存 -->
<div v-memo="[item.id]">{{ item.name }}</div>
\`\`\`

## 5. 计算属性缓存

\`\`\`javascript
// computed 自动缓存，依赖不变不重新计算
const filteredList = computed(() =>
  list.value.filter(item => item.active)
);
\`\`\`

## 6. KeepAlive

\`\`\`vue
<KeepAlive :include="['ComponentA', 'ComponentB']" :max="10">
  <component :is="currentComponent" />
</KeepAlive>
\`\`\`
`
);

console.log(`\nDone! Total Vue3 files created: ${total}`);
