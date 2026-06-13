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

// ==================== React (28 files) ====================
addFile(
  'react',
  'React',
  50,
  'JSX深度解析',
  'JSX语法原理与编译过程',
  'intermediate',
  `## 1. JSX 本质

JSX 是 \`React.createElement\` 的语法糖：

\`\`\`jsx
// JSX
const element = <h1 className="title">Hello</h1>;

// 编译后
const element = React.createElement('h1', { className: 'title' }, 'Hello');

// React 17+ 新转换
import { jsx as _jsx } from 'react/jsx-runtime';
const element = _jsx('h1', { className: 'title', children: 'Hello' });
\`\`\`

## 2. JSX 表达式

\`\`\`jsx
// 变量
const name = 'Alice';
const el = <h1>Hello, {name}</h1>;

// 表达式
const el2 = <div>{2 + 2}</div>;

// 条件渲染
const el3 = <div>{isLoggedIn ? <Dashboard /> : <Login />}</div>;

// 列表渲染
const list = items.map(item => <li key={item.id}>{item.name}</li>);
\`\`\`

## 3. JSX 规则

| 规则 | 说明 |
|------|------|
| 单根元素 | 必须有一个根元素（或 Fragment） |
| 闭合标签 | \`<img />\` 必须自闭合 |
| className | 使用 className 而非 class |
| camelCase | 属性使用驼峰命名 |
| 表达式 | 使用 {} 嵌入表达式 |
| key | 列表必须提供 key |
`
);

addFile(
  'react',
  'React',
  51,
  'Fiber架构',
  'React Fiber协调引擎',
  'advanced',
  `## 1. Fiber 概述

Fiber 是 React 16+ 的协调引擎，实现了可中断的异步渲染。

\`\`\`
Fiber 节点结构：
{
  type,        // 组件类型
  key,         // key
  props,       // 属性
  stateNode,   // 实例/DOM节点
  return,      // 父 Fiber
  child,       // 第一个子 Fiber
  sibling,     // 兄弟 Fiber
  alternate,   // 双缓冲对应 Fiber
  effectTag,   // 副作用标记
  ...
}
\`\`\`

## 2. 工作循环

\`\`\`
1. 开始工作循环
2. 执行工作单元（处理 Fiber 节点）
3. 检查是否需要让出主线程
4. 如需要，中断并让出
5. 空闲时继续
6. 所有工作完成后提交
\`\`\`

## 3. 双缓冲机制

\`\`\`
current 树（当前屏幕显示） ↔ workInProgress 树（正在构建）
alternate 指针互指
提交时交换根指针
\`\`\`

## 4. 优先级调度

| 优先级 | 说明 |
|--------|------|
| Immediate | 同步执行 |
| UserBlocking | 用户交互（点击、输入） |
| Normal | 普通更新 |
| Low | 数据获取 |
| Idle | 空闲任务 |
`
);

addFile(
  'react',
  'React',
  52,
  'Concurrent模式',
  '并发渲染与Suspense集成',
  'advanced',
  `## 1. 并发渲染

\`\`\`jsx
// useTransition — 标记非紧急更新
const [isPending, startTransition] = useTransition();

function handleChange(e) {
  // 紧急更新：输入框立即响应
  setInputValue(e.target.value);

  // 非紧急更新：搜索结果可延迟
  startTransition(() => {
    setSearchQuery(e.target.value);
  });
}
\`\`\`

## 2. useDeferredValue

\`\`\`jsx
// 延迟值的更新
const deferredQuery = useDeferredValue(searchQuery);

// deferredQuery 会延迟更新，让紧急更新优先
const results = useMemo(() => search(deferredQuery), [deferredQuery]);
\`\`\`

## 3. Suspense 与并发

\`\`\`jsx
<Suspense fallback={<Loading />}>
  <ConcurrentComponent />
</Suspense>
\`\`\`

## 4. 流式 SSR

\`\`\`jsx
// React 18 流式 SSR
renderToPipeableStream(<App />, {
  onShellReady() { pipe(res); }
});
\`\`\`
`
);

addFile(
  'react',
  'React',
  53,
  'Server-Components',
  'React服务器组件详解',
  'advanced',
  `## 1. 服务器组件概述

\`\`\`jsx
// ServerComponent.server.jsx — 只在服务器运行
async function ServerComponent() {
  const data = await db.query('SELECT * FROM posts');
  return <PostList posts={data} />;
}

// ClientComponent.client.jsx — 在浏览器运行
'use client';
function ClientComponent() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
\`\`\`

## 2. 服务器组件限制

| 限制 | 说明 |
|------|------|
| 不能使用 useState | 无状态 |
| 不能使用 useEffect | 无副作用 |
| 不能使用浏览器 API | 只在服务器运行 |
| 不能使用事件处理 | 无交互 |
| 可以直接访问数据库 | 服务器端能力 |

## 3. 组合模式

\`\`\`jsx
// 服务器组件可以导入客户端组件
import ClientButton from './ClientButton.client';

function ServerPage() {
  const data = await fetchData();
  return (
    <div>
      <h1>{data.title}</h1>
      <ClientButton onClick={handleClick}>Click</ClientButton>
    </div>
  );
}
\`\`\`
`
);

addFile(
  'react',
  'React',
  54,
  'Hooks原理',
  'React Hooks底层实现原理',
  'advanced',
  `## 1. Hooks 链表

Hooks 在 Fiber 上以链表形式存储：

\`\`\`
Fiber.memoizedState → Hook1 → Hook2 → Hook3 → ...
每个 Hook 节点：
{
  memoizedState,  // 当前状态
  queue,          // 更新队列
  next,           // 下一个 Hook
}
\`\`\`

## 2. useState 实现

\`\`\`javascript
function useState(initialState) {
  const hook = mountWorkInProgressHook();
  hook.memoizedState = initialState;
  hook.queue = { pending: null, dispatch: null };
  const dispatch = dispatchSetState.bind(null, currentlyRenderingFiber, hook.queue);
  hook.queue.dispatch = dispatch;
  return [hook.memoizedState, dispatch];
}
\`\`\`

## 3. useEffect 实现

\`\`\`javascript
function useEffect(create, deps) {
  const hook = mountWorkInProgressHook();
  hook.memoizedState = { create, deps, destroy: undefined };
  currentlyRenderingFiber.flags |= PassiveEffect;
}
\`\`\`

## 4. Hooks 规则的原因

- **只在顶层调用**：Hooks 按链表顺序匹配，条件调用会破坏顺序
- **只在函数组件中调用**：需要 Fiber 上下文
`
);

addFile(
  'react',
  'React',
  55,
  '自定义Hooks设计模式',
  '自定义Hook设计原则与模式',
  'intermediate',
  `## 1. 设计原则

- 以 \`use\` 开头
- 只在函数组件或自定义 Hook 中调用
- 封装可复用的有状态逻辑

## 2. 常见模式

\`\`\`jsx
// useToggle
function useToggle(initial = false) {
  const [value, setValue] = useState(initial);
  const toggle = useCallback(() => setValue(v => !v), []);
  return [value, toggle];
}

// useDebounce
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

// useLocalStorage
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);
  return [value, setValue];
}

// useFetch
function useFetch(url) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch(url, { signal: controller.signal })
      .then(r => r.json())
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [url]);

  return { data, error, loading };
}
\`\`\`
`
);

addFile(
  'react',
  'React',
  56,
  '状态管理方案对比',
  'Redux、Zustand、Jotai等方案对比',
  'intermediate',
  `## 1. 方案对比

| 方案 | 类型 | 复杂度 | 包体积 | 适用场景 |
|------|------|--------|--------|---------|
| Redux Toolkit | 单一 Store | 中 | ~11KB | 大型应用 |
| Zustand | 单一 Store | 低 | ~1KB | 中小型应用 |
| Jotai | 原子化 | 低 | ~2KB | 细粒度状态 |
| Recoil | 原子化 | 中 | ~20KB | 复杂依赖图 |
| Valtio | 代理式 | 低 | ~3KB | 面向对象风格 |

## 2. Zustand 示例

\`\`\`javascript
import { create } from 'zustand';

const useStore = create((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  reset: () => set({ count: 0 })
}));

function Counter() {
  const { count, increment } = useStore();
  return <button onClick={increment}>{count}</button>;
}
\`\`\`

## 3. Jotai 示例

\`\`\`javascript
import { atom, useAtom } from 'jotai';

const countAtom = atom(0);

function Counter() {
  const [count, setCount] = useAtom(countAtom);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
\`\`\`
`
);

addFile(
  'react',
  'React',
  57,
  'React性能优化',
  'React应用性能优化策略',
  'intermediate',
  `## 1. 避免不必要渲染

\`\`\`jsx
// React.memo
const MyComponent = React.memo(function MyComponent(props) {
  return <div>{props.value}</div>;
});

// useMemo
const expensiveValue = useMemo(() => computeExpensive(a, b), [a, b]);

// useCallback
const handleClick = useCallback(() => doSomething(id), [id]);
\`\`\`

## 2. 代码分割

\`\`\`jsx
const LazyComponent = React.lazy(() => import('./HeavyComponent'));

<Suspense fallback={<Loading />}>
  <LazyComponent />
</Suspense>
\`\`\`

## 3. 虚拟化长列表

\`\`\`jsx
import { FixedSizeList } from 'react-window';

function MyList({ items }) {
  return (
    <FixedSizeList height={600} itemCount={items.length} itemSize={50}>
      {({ index, style }) => (
        <div style={style}>{items[index].name}</div>
      )}
    </FixedSizeList>
  );
}
\`\`\`

## 4. Profiler

\`\`\`jsx
<Profiler id="Panel" onRender={(id, phase, duration) => {
  console.log(\`\${id} \${phase} took \${duration}ms\`);
}}>
  <Panel />
</Profiler>
\`\`\`
`
);

addFile(
  'react',
  'React',
  58,
  'React错误边界',
  '错误边界与异常处理',
  'intermediate',
  `## 1. 错误边界组件

\`\`\`jsx
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <FallbackComponent error={this.state.error} />;
    }
    return this.props.children;
  }
}
\`\`\`

## 2. 使用

\`\`\`jsx
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <MyComponent />
</ErrorBoundary>
\`\`\`

## 3. 限制

- 只捕获子组件的渲染错误
- 不捕获事件处理错误
- 不捕获异步错误
- 不捕获服务端渲染错误
`
);

addFile(
  'react',
  'React',
  59,
  'React表单处理',
  '受控组件与非受控组件',
  'beginner',
  `## 1. 受控组件

\`\`\`jsx
function Form() {
  const [value, setValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input value={value} onChange={e => setValue(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
}
\`\`\`

## 2. 非受控组件

\`\`\`jsx
function Form() {
  const inputRef = useRef();

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(inputRef.current.value);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input ref={inputRef} defaultValue="initial" />
    </form>
  );
}
\`\`\`

## 3. 对比

| 特性 | 受控组件 | 非受控组件 |
|------|---------|-----------|
| 数据源 | React state | DOM |
| 实时验证 | ✅ | ❌ |
| 条件禁用 | ✅ | ❌ |
| 代码量 | 较多 | 较少 |
`
);

addFile(
  'react',
  'React',
  60,
  'React与TypeScript',
  'React TypeScript最佳实践',
  'intermediate',
  `## 1. 组件类型

\`\`\`tsx
interface Props {
  name: string;
  age?: number;
  onClick: (id: string) => void;
  children: React.ReactNode;
}

const MyComponent: React.FC<Props> = ({ name, age, onClick, children }) => {
  return <div onClick={() => onClick('1')}>{name} {children}</div>;
};
\`\`\`

## 2. Hook 类型

\`\`\`tsx
const [count, setCount] = useState<number>(0);
const inputRef = useRef<HTMLInputElement>(null);
const theme = useContext<Theme>(ThemeContext);
\`\`\`

## 3. 事件类型

\`\`\`tsx
const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {};
const handleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {};
const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {};
\`\`\`

## 4. 泛型组件

\`\`\`tsx
function List<T>({ items, render }: { items: T[]; render: (item: T) => ReactNode }) {
  return <ul>{items.map(render)}</ul>;
}
\`\`\`
`
);

addFile(
  'react',
  'React',
  61,
  'React测试',
  'React组件测试策略',
  'intermediate',
  `## 1. React Testing Library

\`\`\`javascript
import { render, screen, fireEvent } from '@testing-library/react';
import Counter from './Counter';

test('increments counter', () => {
  render(<Counter />);
  const button = screen.getByRole('button');
  fireEvent.click(button);
  expect(screen.getByText('1')).toBeInTheDocument();
});
\`\`\`

## 2. 异步测试

\`\`\`javascript
import { render, screen, waitFor } from '@testing-library/react';

test('loads data', async () => {
  render(<DataComponent />);
  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
\`\`\`

## 3. Mock

\`\`\`javascript
jest.mock('./api', () => ({
  fetchData: jest.fn().mockResolvedValue({ name: 'Test' })
}));
\`\`\`
`
);

addFile(
  'react',
  'React',
  62,
  'React路由进阶',
  'React Router高级用法',
  'intermediate',
  `## 1. 路由配置

\`\`\`jsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';

const router = createBrowserRouter([
  { path: '/', element: <Layout />, children: [
    { index: true, element: <Home /> },
    { path: 'about', element: <About /> },
    { path: 'users/:id', element: <UserDetail />, loader: userLoader },
    { path: '*', element: <NotFound /> }
  ]}
]);

<RouterProvider router={router} />
\`\`\`

## 2. 数据路由

\`\`\`jsx
// loader — 加载数据
export async function loader({ params }) {
  const user = await getUser(params.id);
  return { user };
}

// action — 处理表单
export async function action({ request }) {
  const formData = await request.formData();
  await updateUser(Object.fromEntries(formData));
  return redirect('/users');
}
\`\`\`

## 3. 导航守卫

\`\`\`jsx
function RequireAuth({ children }) {
  const user = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}
\`\`\`
`
);

addFile(
  'react',
  'React',
  63,
  'React国际化',
  'React i18n实现方案',
  'intermediate',
  `## 1. react-i18next

\`\`\`javascript
import i18n from 'i18next';
import { useTranslation } from 'react-i18next';

i18n.init({
  resources: {
    en: { translation: { title: 'My App', greeting: 'Hello {{name}}' } },
    zh: { translation: { title: '我的应用', greeting: '你好 {{name}}' } }
  },
  lng: 'zh'
});

function App() {
  const { t, i18n } = useTranslation();
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('greeting', { name: 'Alice' })}</p>
      <button onClick={() => i18n.changeLanguage('en')}>English</button>
    </div>
  );
}
\`\`\`
`
);

addFile(
  'react',
  'React',
  64,
  'React动画',
  'React动画实现方案',
  'intermediate',
  `## 1. CSS Transitions

\`\`\`jsx
function FadeIn({ children, show }) {
  return (
    <div className={\`fade \${show ? 'show' : ''}\`}>
      {children}
    </div>
  );
}
\`\`\`

## 2. Framer Motion

\`\`\`jsx
import { motion, AnimatePresence } from 'framer-motion';

function List({ items }) {
  return (
    <AnimatePresence>
      {items.map(item => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          {item.name}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
\`\`\`

## 3. React Transition Group

\`\`\`jsx
import { CSSTransition } from 'react-transition-group';

<CSSTransition in={show} timeout={300} classNames="fade" unmountOnExit>
  <div>Content</div>
</CSSTransition>
\`\`\`
`
);

addFile(
  'react',
  'React',
  65,
  'React服务端渲染',
  'Next.js SSR/SSG/ISR',
  'intermediate',
  `## 1. Next.js 渲染模式

| 模式 | 说明 | 适用场景 |
|------|------|---------|
| SSR | 每次请求渲染 | 动态内容 |
| SSG | 构建时渲染 | 静态内容 |
| ISR | 增量静态再生 | 周期更新 |
| CSR | 客户端渲染 | 交互密集 |

## 2. App Router (Next.js 13+)

\`\`\`tsx
// app/page.tsx — Server Component
export default async function Page() {
  const data = await fetch('https://api.example.com/data');
  return <div>{data.title}</div>;
}

// app/page.tsx — Client Component
'use client';
import { useState } from 'react';
export default function Page() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
\`\`\`

## 3. 数据获取

\`\`\`tsx
// Server Component 直接 fetch
async function Posts() {
  const posts = await fetch('/api/posts', { cache: 'no-store' });
  return <PostList posts={posts} />;
}

// 静态生成
async function StaticPage() {
  const data = await fetch('/api/data', { next: { revalidate: 3600 } }); // ISR
  return <div>{data}</div>;
}
\`\`\`
`
);

addFile(
  'react',
  'React',
  66,
  'React设计模式',
  'React组件设计模式',
  'intermediate',
  `## 1. Compound Components

\`\`\`jsx
function Tabs({ children }) {
  const [activeIndex, setActiveIndex] = useState(0);
  return React.Children.map(children, (child, i) =>
    React.cloneElement(child, { active: i === activeIndex, onClick: () => setActiveIndex(i) })
  );
}

<Tabs>
  <Tab label="Tab 1">Content 1</Tab>
  <Tab label="Tab 2">Content 2</Tab>
</Tabs>
\`\`\`

## 2. Render Props

\`\`\`jsx
function Mouse({ render }) {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const handler = (e) => setPosition({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  return render(position);
}
\`\`\`

## 3. HOC（高阶组件）

\`\`\`jsx
function withAuth(WrappedComponent) {
  return function AuthComponent(props) {
    const user = useAuth();
    if (!user) return <Navigate to="/login" />;
    return <WrappedComponent {...props} user={user} />;
  };
}
\`\`\`
`
);

addFile(
  'react',
  'React',
  67,
  'React与WebAssembly',
  'React中集成WebAssembly',
  'advanced',
  `## 1. 加载 WASM

\`\`\`javascript
async function loadWasm() {
  const { instance } = await WebAssembly.instantiateStreaming(
    fetch('/module.wasm'),
    { env: { memory: new WebAssembly.Memory({ initial: 256 }) } }
  );
  return instance.exports;
}
\`\`\`

## 2. React 集成

\`\`\`jsx
function WasmComponent() {
  const [wasm, setWasm] = useState(null);

  useEffect(() => {
    loadWasm().then(setWasm);
  }, []);

  if (!wasm) return <div>Loading WASM...</div>;

  return <div>Result: {wasm.compute(42)}</div>;
}
\`\`\`
`
);

addFile(
  'react',
  'React',
  68,
  'React与WebSocket',
  'React中WebSocket实时通信',
  'intermediate',
  `## 1. WebSocket Hook

\`\`\`jsx
function useWebSocket(url) {
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('connecting');

  useEffect(() => {
    const ws = new WebSocket(url);

    ws.onopen = () => setStatus('connected');
    ws.onmessage = (e) => setData(JSON.parse(e.data));
    ws.onclose = () => setStatus('disconnected');
    ws.onerror = () => setStatus('error');

    return () => ws.close();
  }, [url]);

  return { data, status };
}
\`\`\`

## 2. 自动重连

\`\`\`jsx
function useReconnectWebSocket(url, maxRetries = 5) {
  const [ws, setWs] = useState(null);
  const retries = useRef(0);

  const connect = useCallback(() => {
    const socket = new WebSocket(url);
    socket.onclose = () => {
      if (retries.current < maxRetries) {
        retries.current++;
        setTimeout(connect, 1000 * retries.current);
      }
    };
    setWs(socket);
  }, [url, maxRetries]);

  useEffect(() => { connect(); }, [connect]);
  return ws;
}
\`\`\`
`
);

addFile(
  'react',
  'React',
  69,
  'React与GraphQL',
  'React中GraphQL数据获取',
  'intermediate',
  `## 1. Apollo Client

\`\`\`jsx
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://api.example.com/graphql',
  cache: new InMemoryCache()
});

const GET_USERS = gql\`
  query GetUsers {
    users { id name email }
  }
\`;

function Users() {
  const { data, loading, error } = useQuery(GET_USERS);
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error!</div>;
  return data.users.map(user => <div key={user.id}>{user.name}</div>);
}
\`\`\`

## 2. Mutation

\`\`\`jsx
const CREATE_USER = gql\`
  mutation CreateUser($name: String!) {
    createUser(name: $name) { id name }
  }
\`;

function CreateUser() {
  const [createUser, { loading }] = useMutation(CREATE_USER);
  return (
    <button onClick={() => createUser({ variables: { name: 'Alice' } })}>
      {loading ? 'Creating...' : 'Create User'}
    </button>
  );
}
\`\`\`
`
);

addFile(
  'react',
  'React',
  70,
  'React与微前端',
  'React微前端架构',
  'advanced',
  `## 1. Module Federation

\`\`\`javascript
// webpack.config.js (远程应用)
new ModuleFederationPlugin({
  name: 'remoteApp',
  filename: 'remoteEntry.js',
  exposes: { './UserList': './src/UserList' },
  shared: { react: { singleton: true }, 'react-dom': { singleton: true } }
});

// webpack.config.js (宿主应用)
new ModuleFederationPlugin({
  name: 'hostApp',
  remotes: { remoteApp: 'remoteApp@http://localhost:3001/remoteEntry.js' }
});
\`\`\`

## 2. 使用远程组件

\`\`\`jsx
const RemoteUserList = React.lazy(() => import('remoteApp/UserList'));

<Suspense fallback="Loading...">
  <RemoteUserList />
</Suspense>
\`\`\`
`
);

addFile(
  'react',
  'React',
  71,
  'React无障碍',
  'React应用可访问性',
  'intermediate',
  `## 1. ARIA 属性

\`\`\`jsx
function Modal({ isOpen, onClose, children }) {
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <h2 id="modal-title">Modal Title</h2>
      {children}
      <button onClick={onClose} aria-label="关闭对话框">X</button>
    </div>
  );
}
\`\`\`

## 2. 键盘导航

\`\`\`jsx
function Menu({ items }) {
  const [activeIndex, setActiveIndex] = useState(-1);

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown': setActiveIndex(i => (i + 1) % items.length); break;
      case 'ArrowUp': setActiveIndex(i => (i - 1 + items.length) % items.length); break;
      case 'Enter': items[activeIndex]?.onSelect(); break;
    }
  };

  return (
    <ul role="menu" onKeyDown={handleKeyDown}>
      {items.map((item, i) => (
        <li key={i} role="menuitem" aria-selected={i === activeIndex}>{item.label}</li>
      ))}
    </ul>
  );
}
\`\`\`
`
);

addFile(
  'react',
  'React',
  72,
  'React与PWA',
  'React渐进式Web应用',
  'intermediate',
  `## 1. Service Worker

\`\`\`javascript
// 注册 Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js');
}
\`\`\`

## 2. Vite PWA 插件

\`\`\`javascript
import { VitePWA } from 'vite-plugin-pwa';

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'My App',
        short_name: 'App',
        icons: [{ src: '/icon.png', sizes: '192x192', type: 'image/png' }]
      },
      workbox: {
        runtimeCaching: [{
          urlPattern: /^https:\\/\\/api\\./i,
          handler: 'NetworkFirst',
          options: { cacheName: 'api-cache', expiration: { maxEntries: 50 } }
        }]
      }
    })
  ]
};
\`\`\`
`
);

addFile(
  'react',
  'React',
  73,
  'React与Canvas',
  'React中Canvas绘图',
  'intermediate',
  `## 1. Canvas 组件

\`\`\`jsx
function Canvas({ draw, width = 800, height = 600 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx) draw(ctx);
  }, [draw]);

  return <canvas ref={canvasRef} width={width} height={height} />;
}
\`\`\`

## 2. 动画

\`\`\`jsx
function AnimatedCanvas() {
  const canvasRef = useRef(null);
  const frameRef = useRef(0);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    let x = 0;

    function animate() {
      ctx.clearRect(0, 0, 800, 600);
      ctx.fillRect(x, 100, 50, 50);
      x = (x + 2) % 800;
      frameRef.current = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return <canvas ref={canvasRef} width={800} height={600} />;
}
\`\`\`
`
);

addFile(
  'react',
  'React',
  74,
  'React与D3',
  'React中D3数据可视化',
  'advanced',
  `## 1. 集成方式

\`\`\`jsx
function BarChart({ data }) {
  const svgRef = useRef(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const x = d3.scaleBand().domain(data.map(d => d.name)).range([0, 500]);
    const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value)]).range([300, 0]);

    svg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.name))
      .attr('y', d => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', d => 300 - y(d.value));
  }, [data]);

  return <svg ref={svgRef} width={500} height={300} />;
}
\`\`\`
`
);

addFile(
  'react',
  'React',
  75,
  'React与Storybook',
  'React组件文档与开发',
  'intermediate',
  `## 1. Story 配置

\`\`\`jsx
// Button.stories.jsx
export default {
  title: 'Components/Button',
  component: Button,
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary'] },
    size: { control: 'radio', options: ['sm', 'md', 'lg'] }
  }
};

export const Primary = { args: { variant: 'primary', children: 'Click me' } };
export const Secondary = { args: { variant: 'secondary', children: 'Click me' } };
export const Large = { args: { size: 'lg', children: 'Large Button' } };
\`\`\`

## 2. 交互测试

\`\`\`jsx
import { within, userEvent } from '@storybook/test';

export const ClickTest = {
  args: { onClick: fn() },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button'));
    await expect(args.onClick).toHaveBeenCalled();
  }
};
\`\`\`
`
);

addFile(
  'react',
  'React',
  76,
  'React与CI-CD',
  'React项目CI/CD实践',
  'intermediate',
  `## 1. GitHub Actions

\`\`\`yaml
name: CI/CD
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci
      - run: npm test
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions: { pages: write, id-token: write }
    environment: { name: github-pages }
    steps:
      - uses: actions/deploy-pages@v4
\`\`\`
`
);

addFile(
  'react',
  'React',
  77,
  'React与Monorepo',
  'React Monorepo架构',
  'advanced',
  `## 1. 项目结构

\`\`\`
monorepo/
├── packages/
│   ├── ui/          # 共享组件库
│   ├── utils/       # 工具函数
│   ├── app-web/     # Web 应用
│   └── app-admin/   # 管理后台
├── package.json
└── pnpm-workspace.yaml
\`\`\`

## 2. pnpm workspace

\`\`\`yaml
# pnpm-workspace.yaml
packages:
  - 'packages/*'
\`\`\`

## 3. 共享组件

\`\`\`json
// packages/app-web/package.json
{
  "dependencies": {
    "@myorg/ui": "workspace:*"
  }
}
\`\`\`
`
);

console.log(`\nDone! Total React files created: ${total}`);
